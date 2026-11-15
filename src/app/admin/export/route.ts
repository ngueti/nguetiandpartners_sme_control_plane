import { currentUser, can, audit } from "../../../lib/auth";
import { q } from "../../../lib/db";
import { buildWhere, filtersFrom } from "../../../lib/queries";
import { FORMS, allFields } from "../../../lib/forms";
import { FORM_LABELS, STATUSES, countryName, type FormId } from "../../../lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join(" | ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  const safe = /^[=@]|^[+\-](?![\d\s(])/.test(s) ? `'${s}` : s; // neutralise l'injection de formules Excel
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const u = await currentUser();
  if (!u || !can(u, "export")) return new Response("Non autorisé", { status: 403 });
  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const f = filtersFrom(Object.fromEntries(url.searchParams));
  const { where, params } = buildWhere(u, f);
  const rows = await q<any>(
    `SELECT s.*, (SELECT count(*) FROM attachments a WHERE a.submission_id = s.id)::int AS files,
            (SELECT string_agg(a.filename, ' | ') FROM attachments a WHERE a.submission_id = s.id) AS file_names, au.name AS assignee
       FROM submissions s LEFT JOIN admin_users au ON au.id = s.assigned_to ${where} ORDER BY s.created_at DESC LIMIT 20000`,
    params,
  );
  await audit(u, "export", format, { filters: f, rows: rows.length });
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    return new Response(JSON.stringify(rows.map(({ ip_hash, user_agent, ...r }) => r), null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="np-soumissions-${stamp}.json"` },
    });
  }

  const base = ["Référence", "Type", "Pays", "Statut", "Priorité", "Date", "Nom", "E-mail", "Téléphone", "Entreprise", "Sujet", "Attribué à", "Nb pièces", "Pièces"];
  // Colonnes dynamiques : champs du formulaire choisi, sinon union des clés présentes
  let keys: { key: string; label: string }[];
  if (f.form) keys = allFields(FORMS[f.form as FormId]).filter((x) => x.type !== "file" && x.name !== "consent").map((x) => ({ key: x.name, label: x.label.slice(0, 60) }));
  else {
    const set = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r.data)) set.add(k);
    keys = [...set].map((k) => ({ key: k, label: k }));
  }
  const lines = [[...base, ...keys.map((k) => k.label)].map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.ref, FORM_LABELS[r.form as FormId], countryName(r.country), STATUSES.find((s) => s.value === r.status)?.label ?? r.status, r.priority,
        new Date(r.created_at).toISOString(), r.full_name, r.email, r.phone, r.company, r.subject, r.assignee, r.files, r.file_names,
        ...keys.map((k) => r.data[k.key]),
      ].map(cell).join(","),
    );
  }
  return new Response("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="np-soumissions-${stamp}.csv"` },
  });
}
