import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, can, countryScope, audit } from "../../../../lib/auth";
import { q, q1 } from "../../../../lib/db";
import { COUNTRIES, FORM_LABELS, STATUSES, STATUS_VALUES, countryName, type FormId } from "../../../../lib/config";
import { FORMS, allFields } from "../../../../lib/forms";
import { sendMail } from "../../../../lib/mail";

export const dynamic = "force-dynamic";

async function load(id: string, countries: string[] | null) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  return q1<any>(`SELECT s.*, au.name AS assignee FROM submissions s LEFT JOIN admin_users au ON au.id = s.assigned_to WHERE s.id = $1 ${countries ? "AND s.country = ANY($2::text[])" : ""}`, countries ? [id, countries] : [id]);
}

export default async function Detail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const { ok } = await searchParams;
  const s = await load(id, countryScope(u));
  if (!s) notFound();
  const def = FORMS[s.form as FormId];
  const [atts, events, mails, team] = await Promise.all([
    q<any>(`SELECT id, field, filename, mime, size, created_at FROM attachments WHERE submission_id = $1 ORDER BY created_at`, [id]),
    q<any>(`SELECT * FROM submission_events WHERE submission_id = $1 ORDER BY created_at DESC`, [id]),
    q<any>(`SELECT * FROM email_log WHERE submission_id = $1 ORDER BY created_at DESC`, [id]),
    q<any>(`SELECT id, name FROM admin_users WHERE active AND (role = 'super_admin' OR $1 = ANY(countries)) ORDER BY name`, [s.country]),
  ]);
  await audit(u, "submission.view", s.ref);
  const edit = can(u, "edit");

  async function setStatus(fd: FormData) {
    "use server";
    const me = await requireUser("edit");
    const status = String(fd.get("status"));
    if (!STATUS_VALUES.includes(status)) return;
    if (!(await load(id, countryScope(me)))) return;
    await q(`UPDATE submissions SET status = $2, updated_at = now() WHERE id = $1`, [id, status]);
    await q(`INSERT INTO submission_events (submission_id, actor, kind, payload) VALUES ($1,$2,'status',$3::jsonb)`, [id, me.email, JSON.stringify({ status })]);
    revalidatePath(`/admin/soumissions/${id}`);
    redirect(`/admin/soumissions/${id}?ok=statut`);
  }
  async function assign(fd: FormData) {
    "use server";
    const me = await requireUser("edit");
    if (!(await load(id, countryScope(me)))) return;
    const to = String(fd.get("assigned") || "") || null;
    await q(`UPDATE submissions SET assigned_to = $2, updated_at = now() WHERE id = $1`, [id, to]);
    await q(`INSERT INTO submission_events (submission_id, actor, kind, payload) VALUES ($1,$2,'assigned',$3::jsonb)`, [id, me.email, JSON.stringify({ to })]);
    redirect(`/admin/soumissions/${id}?ok=attribution`);
  }
  async function note(fd: FormData) {
    "use server";
    const me = await requireUser("notes");
    const text = String(fd.get("note") ?? "").trim().slice(0, 4000);
    if (!text || !(await load(id, countryScope(me)))) return;
    await q(`INSERT INTO submission_events (submission_id, actor, kind, payload) VALUES ($1,$2,'note',$3::jsonb)`, [id, me.email, JSON.stringify({ text })]);
    redirect(`/admin/soumissions/${id}?ok=note`);
  }
  async function reply(fd: FormData) {
    "use server";
    const me = await requireUser("edit");
    const cur = await load(id, countryScope(me));
    const text = String(fd.get("message") ?? "").trim().slice(0, 5000);
    if (!cur || !text) return;
    const esc = (x: string) => x.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
    const html = `<div style="font-family:Segoe UI,Arial,sans-serif;color:#17283a;max-width:560px;line-height:1.6"><p>Bonjour ${esc(cur.full_name.split(" ")[0])},</p><p>${esc(text).replace(/\n/g, "<br>")}</p><p style="margin-top:24px">${esc(me.name)}<br><strong style="color:#0f3e66">Ngueti &amp; Partners</strong> · ${esc(countryName(cur.country))}</p><p style="color:#6b7c8e;font-size:12px;border-top:1px solid #eef1f5;padding-top:10px">Dossier ${esc(cur.ref)}</p></div>`;
    const sent = await sendMail({ to: cur.email, subject: `Votre dossier ${cur.ref}`, html, text: `${text}\n\n${me.name} — Ngueti & Partners\nDossier ${cur.ref}`, replyTo: process.env[`TEAM_EMAIL_${cur.country}`] || process.env.TEAM_EMAIL_DEFAULT || undefined, kind: "reply", submissionId: id });
    await q(`INSERT INTO submission_events (submission_id, actor, kind, payload) VALUES ($1,$2,'reply',$3::jsonb)`, [id, me.email, JSON.stringify({ text, sent })]);
    if (cur.status === "nouveau") await q(`UPDATE submissions SET status='en_cours', updated_at=now() WHERE id=$1`, [id]);
    redirect(`/admin/soumissions/${id}?ok=${sent ? "reponse" : "reponse_echec"}`);
  }
  async function remove() {
    "use server";
    const me = await requireUser("users");
    const cur = await load(id, null);
    if (!cur) return;
    await audit(me, "submission.delete", cur.ref);
    await q(`DELETE FROM submissions WHERE id = $1`, [id]);
    redirect("/admin/soumissions");
  }

  const labelOf = (name: string) => allFields(def).find((f) => f.name === name)?.label ?? name;
  const data = s.data as Record<string, any>;
  const optLabel = (name: string, v: string) => allFields(def).find((f) => f.name === name)?.options?.find((o) => o.value === v)?.label ?? v;
  const ordered = [
    ...allFields(def).filter((f) => f.type !== "file" && data[f.name] !== undefined).map((f) => f.name),
    ...Object.keys(data).filter((k) => !allFields(def).some((f) => f.name === k) && k !== "parentRef"),
  ];
  const entries: [string, string][] = ordered.map((k) => [k, Array.isArray(data[k]) ? data[k].map((x: string) => optLabel(k, x)).join(", ") : optLabel(k, String(data[k]))]);
  const msgs: Record<string, string> = { statut: "Statut mis à jour.", attribution: "Attribution enregistrée.", note: "Note ajoutée.", reponse: "Réponse envoyée au demandeur.", reponse_echec: "Réponse enregistrée mais l’e-mail n’a pas pu partir (voir le journal d’e-mails)." };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/soumissions" className="text-[14px] font-semibold text-[var(--orange)]">← Soumissions</Link>
          <h1 className="mt-1 text-[26px] font-extrabold text-[var(--navy)]">{s.company || s.full_name} <span className="text-[var(--muted)]">· {s.ref}</span></h1>
          <p className="text-[var(--muted)]">{FORM_LABELS[s.form as FormId]} · {countryName(s.country)} · reçu le {new Date(s.created_at).toLocaleString("fr-FR")}{s.priority === "haute" && <span className="pill pill-danger ml-2">Urgent</span>}</p>
        </div>
        {can(u, "users") && (
          <details className="adm-card !p-3 text-[14px]"><summary className="cursor-pointer font-semibold text-[var(--danger)]">Supprimer (droit à l’effacement)</summary>
            <form action={remove} className="mt-2 grid gap-2"><p>Supprime définitivement la soumission et ses pièces. Action journalisée.</p><button className="btn btn-navy !bg-[var(--danger)]">Confirmer la suppression</button></form></details>
        )}
      </div>
      {ok && msgs[ok] && <p className="rounded-xl bg-[#dcf5e7] p-3 font-semibold text-[#12713f]" role="status">{msgs[ok]}</p>}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid content-start gap-5">
          <section className="adm-card">
            <h2 className="mb-3 text-[17px] font-bold text-[var(--navy)]">Demandeur</h2>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              <div><dt className="text-[12px] font-bold uppercase text-[var(--muted)]">Nom</dt><dd>{s.full_name}</dd></div>
              <div><dt className="text-[12px] font-bold uppercase text-[var(--muted)]">E-mail</dt><dd><a className="underline" href={`mailto:${s.email}`}>{s.email}</a></dd></div>
              <div><dt className="text-[12px] font-bold uppercase text-[var(--muted)]">Téléphone</dt><dd>{s.phone ? <a className="underline" href={`tel:${s.phone}`}>{s.phone}</a> : "—"}</dd></div>
              <div><dt className="text-[12px] font-bold uppercase text-[var(--muted)]">Entreprise</dt><dd>{s.company ?? "—"}</dd></div>
            </dl>
          </section>
          <section className="adm-card">
            <h2 className="mb-3 text-[17px] font-bold text-[var(--navy)]">Réponses</h2>
            <dl className="grid gap-3">
              {entries.map(([k, v]) => (
                <div key={k} className="grid gap-0.5 border-b border-[var(--line)] pb-3 last:border-0 sm:grid-cols-[38%_1fr] sm:gap-4">
                  <dt className="text-[13px] font-semibold text-[var(--muted)]">{labelOf(k)}</dt>
                  <dd className="whitespace-pre-wrap break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="adm-card">
            <h2 className="mb-3 text-[17px] font-bold text-[var(--navy)]">Pièces jointes ({atts.length})</h2>
            {atts.length === 0 && <p className="text-[var(--muted)]">Aucune pièce.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {atts.map((a: any) => (
                <figure key={a.id} className="overflow-hidden rounded-xl border border-[var(--line)]">
                  {a.mime.startsWith("image/") ? (
                    <a href={`/admin/api/attachments/${a.id}`} target="_blank"><img src={`/admin/api/attachments/${a.id}`} alt={a.filename} className="h-48 w-full object-cover" loading="lazy" /></a>
                  ) : a.mime === "application/pdf" ? (
                    <iframe src={`/admin/api/attachments/${a.id}#toolbar=0`} title={a.filename} className="h-48 w-full bg-[var(--mist)]" />
                  ) : (
                    <div className="grid h-48 place-items-center bg-[var(--mist)] text-[40px]">📄</div>
                  )}
                  <figcaption className="flex items-center justify-between gap-2 p-3 text-[13px]">
                    <span className="min-w-0"><strong className="block truncate">{a.filename}</strong><span className="text-[var(--muted)]">{labelOf(a.field ?? "")} · {(a.size / 1024).toFixed(0)} Ko</span></span>
                    <span className="flex shrink-0 gap-2"><a className="btn btn-line !min-h-[34px] !px-3" target="_blank" href={`/admin/api/attachments/${a.id}`}>Ouvrir</a><a className="btn btn-navy !min-h-[34px] !px-3" href={`/admin/api/attachments/${a.id}?dl=1`}>⬇</a></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-5">
          {edit && (
            <section className="adm-card grid gap-4">
              <form action={setStatus} className="grid gap-2"><label className="text-[12px] font-bold uppercase text-[var(--muted)]">Statut</label>
                <div className="flex gap-2"><select name="status" defaultValue={s.status} className="input">{STATUSES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select><button className="btn btn-navy">OK</button></div></form>
              <form action={assign} className="grid gap-2"><label className="text-[12px] font-bold uppercase text-[var(--muted)]">Attribué à</label>
                <div className="flex gap-2"><select name="assigned" defaultValue={s.assigned_to ?? ""} className="input"><option value="">— personne —</option>{team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</select><button className="btn btn-navy">OK</button></div></form>
            </section>
          )}
          {edit && (
            <section className="adm-card">
              <h2 className="mb-2 text-[15px] font-bold text-[var(--navy)]">Répondre au demandeur</h2>
              <form action={reply} className="grid gap-2"><textarea name="message" required rows={5} className="input" placeholder="Votre message (envoyé par e-mail via Resend)…" /><button className="btn btn-sun">Envoyer</button></form>
            </section>
          )}
          {can(u, "notes") && (
            <section className="adm-card">
              <h2 className="mb-2 text-[15px] font-bold text-[var(--navy)]">Note interne</h2>
              <form action={note} className="grid gap-2"><textarea name="note" required rows={3} className="input" placeholder="Visible uniquement par l’équipe" /><button className="btn btn-line">Ajouter</button></form>
            </section>
          )}
          <section className="adm-card">
            <h2 className="mb-3 text-[15px] font-bold text-[var(--navy)]">Historique</h2>
            <ol className="grid gap-3 text-[14px]">
              {events.map((e: any) => (
                <li key={e.id} className="border-l-4 border-[var(--yellow)] pl-3">
                  <span className="text-[12px] text-[var(--muted)]">{new Date(e.created_at).toLocaleString("fr-FR")} · {e.actor}</span><br />
                  <strong>{{ created: "Soumission créée", status: `Statut → ${e.payload.status}`, assigned: "Attribution modifiée", note: "Note", reply: "Réponse envoyée", documents_added: `Pièces ajoutées (${e.payload.ref})`, sync_error: "Erreur de synchronisation" }[e.kind as string] ?? e.kind}</strong>
                  {e.payload.text && <p className="mt-0.5 whitespace-pre-wrap">{e.payload.text}</p>}
                  {e.payload.error && <p className="text-[var(--danger)]">{e.payload.error}</p>}
                </li>
              ))}
            </ol>
          </section>
          <section className="adm-card text-[13px]">
            <h2 className="mb-2 text-[15px] font-bold text-[var(--navy)]">E-mails</h2>
            {mails.length === 0 && <p className="text-[var(--muted)]">Aucun.</p>}
            <ul className="grid gap-2">{mails.map((m: any) => <li key={m.id}><span className={`pill ${m.status === "sent" ? "pill-ok" : m.status === "failed" ? "pill-danger" : "pill-muted"}`}>{m.status}</span> {m.kind} → {m.recipient}{m.error && <span className="block text-[var(--danger)]">{m.error}</span>}</li>)}</ul>
            {Object.keys(s.external ?? {}).length > 0 && <p className="mt-3">{Object.entries(s.external).map(([k, v]) => <a key={k} href={String(v)} target="_blank" className="mr-3 underline">{k}</a>)}</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}
