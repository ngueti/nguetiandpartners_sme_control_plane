import { z } from "zod";
import { COUNTRY_CODES, siteUrl, type FormId } from "./config";
import { FORMS, allFields, coreOf, type Field } from "./forms";
import { q, q1 } from "./db";
import { makeRef } from "./security";
import { ackEmail, sendMail, teamAddress, teamEmail } from "./mail";
import { syncExternal } from "./integrations";

const uuid = z.string().uuid();

function fieldSchema(f: Field): z.ZodTypeAny {
  const optional = !f.required;
  let s: z.ZodTypeAny;
  switch (f.type) {
    case "email":
      s = z.string().trim().toLowerCase().email("E-mail invalide").max(f.maxLength ?? 160);
      break;
    case "tel":
      s = z.string().trim().regex(/^[+()\d\s.\-]{6,30}$/, "Numéro invalide");
      break;
    case "text":
    case "textarea":
      s = z.string().trim().max(f.maxLength ?? 500);
      if (f.required) s = (s as z.ZodString).min(1, "Champ requis");
      break;
    case "select":
    case "radio": {
      const values = f.options!.map((o) => o.value);
      s = f.name === "country" ? z.enum(COUNTRY_CODES) : z.enum(values as [string, ...string[]]);
      break;
    }
    case "multi": {
      const values = new Set(f.options!.map((o) => o.value));
      s = z.array(z.string().refine((v) => values.has(v))).max(20);
      if (f.required) s = (s as z.ZodArray<any>).min(1, "Choisissez au moins une option");
      break;
    }
    case "file":
      s = z.array(uuid).max(f.maxFiles ?? 3);
      if (f.required) s = (s as z.ZodArray<any>).min(1, "Ajoutez au moins un fichier");
      break;
  }
  if (optional) s = z.preprocess((v) => (v === "" || v === null ? undefined : v), s.optional());
  return s;
}

export type SubmitResult = { ok: true; ref: string } | { ok: false; error: string; fields?: Record<string, string> };

export async function submitForm(
  formId: FormId,
  raw: Record<string, unknown>,
  meta: { ipHash: string; userAgent: string },
): Promise<SubmitResult> {
  const form = FORMS[formId];
  // Champs conditionnels masqués : ignorés et jamais requis
  const input: Record<string, unknown> = { ...raw };
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  for (const f of allFields(form)) {
    if (f.showIf && input[f.showIf.field] !== f.showIf.equals) delete input[f.name];
    const sch = fieldSchema(f);
    schemaShape[f.name] = f.showIf ? z.preprocess((v) => (v === "" ? undefined : v), sch.optional()) : sch;
  }
  const parsed = z.object(schemaShape).safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0]);
      const v = input[k];
      fields[k] = v === undefined || v === "" || (Array.isArray(v) && !v.length) ? "Champ requis" : /^(Invalid|Too |Expected|expected)/.test(i.message) ? "Valeur invalide" : i.message;
    }
    return { ok: false, error: "Certains champs sont à corriger.", fields };
  }
  const data = parsed.data as Record<string, any>;
  if (data.consent !== "oui") return { ok: false, error: "Le consentement est requis.", fields: { consent: "Requis" } };
  delete data.consent;

  // Collecte des identifiants de fichiers
  const fileFields = allFields(form).filter((f) => f.type === "file");
  const fileIds: { id: string; field: string }[] = [];
  for (const f of fileFields) for (const id of (data[f.name] as string[] | undefined) ?? []) fileIds.push({ id, field: f.name });

  let country: string = data.country;
  let parentRef: string | null = null;

  if (formId === "documents") {
    const parent = await q1<{ id: string; ref: string; country: string }>(
      `SELECT id, ref, country FROM submissions WHERE upper(ref) = upper($1) AND lower(email) = lower($2) AND form <> 'documents'`,
      [data.reference, data.email],
    );
    if (!parent) return { ok: false, error: "Numéro de dossier ou e-mail incorrect.", fields: { reference: "Introuvable avec cet e-mail" } };
    country = parent.country;
    parentRef = parent.ref;
    data.reference = parent.ref;
    data.country = country;
    data.fullName = (await q1<{ full_name: string }>(`SELECT full_name FROM submissions WHERE id=$1`, [parent.id]))?.full_name ?? "—";
  }

  // Les fichiers doivent exister, être non rattachés et déposés depuis la même origine
  if (fileIds.length) {
    const found = await q<{ id: string }>(
      `SELECT id FROM attachments WHERE id = ANY($1::uuid[]) AND submission_id IS NULL AND ip_hash = $2`,
      [fileIds.map((f) => f.id), meta.ipHash],
    );
    if (found.length !== new Set(fileIds.map((f) => f.id)).size) return { ok: false, error: "Un fichier n’est plus disponible, merci de le renvoyer." };
  }

  const core = coreOf(formId, data);
  const priority = formId === "reclamation" && data.urgency === "haute" ? "haute" : "normale";
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) if (v !== undefined && !fileFields.some((f) => f.name === k)) clean[k] = v;
  if (parentRef) clean.parentRef = parentRef;

  let ref = "";
  let row: { id: string } | null = null;
  for (let i = 0; i < 4 && !row; i++) {
    ref = makeRef(country);
    try {
      row = await q1<{ id: string }>(
        `INSERT INTO submissions (ref, form, country, priority, full_name, email, phone, company, subject, data, ip_hash, user_agent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12) RETURNING id`,
        [ref, formId, country, priority, core.full_name, core.email, core.phone, core.company, core.subject, JSON.stringify(clean), meta.ipHash, meta.userAgent.slice(0, 200)],
      );
    } catch (e: any) {
      if (!/duplicate key/i.test(String(e?.message))) throw e;
    }
  }
  if (!row) return { ok: false, error: "Erreur temporaire, merci de réessayer." };

  for (const f of fileIds) await q(`UPDATE attachments SET submission_id = $1, field = $2 WHERE id = $3 AND submission_id IS NULL`, [row.id, f.field, f.id]);
  await q(`INSERT INTO submission_events (submission_id, actor, kind, payload) VALUES ($1,'public','created',$2::jsonb)`, [row.id, JSON.stringify({ files: fileIds.length })]);
  if (parentRef) {
    const parent = await q1<{ id: string }>(`SELECT id FROM submissions WHERE ref = $1`, [parentRef]);
    if (parent) await q(`INSERT INTO submission_events (submission_id, actor, kind, payload) VALUES ($1,'public','documents_added',$2::jsonb)`, [parent.id, JSON.stringify({ ref, files: fileIds.length })]);
  }

  // E-mails et synchronisations : jamais bloquants pour le demandeur
  const sub = { id: row.id, ref, form: formId, country, full_name: core.full_name, email: core.email, phone: core.phone, company: core.company, subject: core.subject, priority, data: clean, fileCount: fileIds.length };
  await Promise.allSettled([
    (async () => {
      const a = ackEmail(sub);
      await sendMail({ to: core.email, ...a, kind: "ack", submissionId: row!.id });
    })(),
    (async () => {
      const to = teamAddress(country);
      if (!to) return;
      const t = teamEmail(sub, `${siteUrl()}/admin/soumissions/${row!.id}`);
      await sendMail({ to, ...t, replyTo: core.email, kind: "team", submissionId: row!.id });
    })(),
    syncExternal(sub),
  ]);

  return { ok: true, ref };
}
