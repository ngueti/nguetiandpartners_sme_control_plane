import Link from "next/link";
import { requireUser, countryScope } from "../../lib/auth";
import { q } from "../../lib/db";
import { COUNTRIES, FORM_LABELS, STATUSES, type FormId } from "../../lib/config";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const u = await requireUser();
  const sp = await searchParams;
  const scope = countryScope(u);
  const w = scope ? "WHERE country = ANY($1::text[])" : "";
  const p = scope ? [scope] : [];
  const [byForm, byStatus, byCountry, recent, perDay, att] = await Promise.all([
    q<{ form: FormId; n: number }>(`SELECT form, count(*)::int n FROM submissions ${w} GROUP BY form`, p),
    q<{ status: string; n: number }>(`SELECT status, count(*)::int n FROM submissions ${w} GROUP BY status`, p),
    q<{ country: string; n: number }>(`SELECT country, count(*)::int n FROM submissions ${w} GROUP BY country`, p),
    q(`SELECT id, ref, form, country, full_name, company, status, priority, created_at FROM submissions ${w} ORDER BY created_at DESC LIMIT 8`, p),
    q<{ d: string; n: number }>(`SELECT to_char(date_trunc('day', created_at), 'DD/MM') d, count(*)::int n FROM submissions ${w ? w + " AND" : "WHERE"} created_at > now() - interval '14 days' GROUP BY 1 ORDER BY min(created_at)`, p),
    q<{ n: number; bytes: string }>(`SELECT count(*)::int n, coalesce(sum(a.size),0)::text bytes FROM attachments a ${scope ? "JOIN submissions s ON s.id = a.submission_id WHERE s.country = ANY($1::text[])" : ""}`, p),
  ]);
  const count = (arr: { n: number }[], f: (x: any) => boolean) => arr.filter(f).reduce((a, b) => a + b.n, 0);
  const open = count(byStatus, (x) => x.status === "nouveau" || x.status === "en_cours");
  const urgent = Number((await q<{ n: string }>(`SELECT count(*)::text n FROM submissions ${w ? w + " AND" : "WHERE"} priority = 'haute' AND status IN ('nouveau','en_cours')`, p))[0].n);
  const max = Math.max(1, ...perDay.map((d) => d.n));
  const total = count(byForm, () => true);

  const kpi = (label: string, v: number | string, href: string, tone = "var(--navy)") => (
    <Link href={href} className="adm-card block transition hover:-translate-y-0.5">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[34px] font-extrabold" style={{ color: tone }}>{v}</p>
    </Link>
  );

  return (
    <div className="grid gap-6">
      {sp.refus && <p className="rounded-xl bg-[#fde4e1] p-3 font-semibold text-[#a3281b]">Vous n’avez pas les droits pour cette action.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi("À traiter", open, "/admin/soumissions?status=nouveau", "var(--orange)")}
        {kpi("Réclamations urgentes", urgent, "/admin/soumissions?form=reclamation&priority=haute", urgent ? "var(--danger)" : "var(--navy)")}
        {kpi("Total soumissions", total, "/admin/soumissions")}
        {kpi("Pièces jointes", `${att[0].n} · ${(Number(att[0].bytes) / 1048576).toFixed(1)} Mo`, "/admin/soumissions?files=oui")}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="adm-card lg:col-span-2">
          <h2 className="mb-4 text-[17px] font-bold text-[var(--navy)]">14 derniers jours</h2>
          <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Soumissions par jour">
            {perDay.length === 0 && <p className="text-[var(--muted)]">Aucune donnée.</p>}
            {perDay.map((d) => (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-[var(--navy)]">{d.n}</span>
                <div className="w-full rounded-t-md" style={{ height: `${(d.n / max) * 100}%`, minHeight: 6, background: "var(--sun)" }} />
                <span className="text-[10px] text-[var(--muted)]">{d.d}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="adm-card">
          <h2 className="mb-4 text-[17px] font-bold text-[var(--navy)]">Répartition</h2>
          <ul className="grid gap-2 text-[14px]">
            {byForm.map((x) => <li key={x.form} className="flex justify-between"><Link className="underline" href={`/admin/soumissions?form=${x.form}`}>{FORM_LABELS[x.form]}</Link><strong>{x.n}</strong></li>)}
            <li className="my-1 border-t border-[var(--line)]" />
            {COUNTRIES.map((c) => <li key={c.code} className="flex justify-between"><Link className="underline" href={`/admin/soumissions?country=${c.code}`}>{c.flag} {c.name}</Link><strong>{byCountry.find((b) => b.country === c.code)?.n ?? 0}</strong></li>)}
            <li className="my-1 border-t border-[var(--line)]" />
            {STATUSES.map((s) => <li key={s.value} className="flex justify-between"><Link className="underline" href={`/admin/soumissions?status=${s.value}`}>{s.label}</Link><strong>{byStatus.find((b) => b.status === s.value)?.n ?? 0}</strong></li>)}
          </ul>
        </section>
      </div>
      <section className="adm-card">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-[17px] font-bold text-[var(--navy)]">Dernières soumissions</h2><Link href="/admin/soumissions" className="text-[14px] font-semibold text-[var(--orange)]">Tout voir →</Link></div>
        <div className="adm-table-wrap">
          <table><thead><tr><th>Réf.</th><th>Type</th><th>Pays</th><th>Demandeur</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>{recent.map((r: any) => (
              <tr key={r.id}><td><Link className="font-bold text-[var(--navy)] underline" href={`/admin/soumissions/${r.id}`}>{r.ref}</Link></td><td>{FORM_LABELS[r.form as FormId]}{r.priority === "haute" && <span className="pill pill-danger ml-2">Urgent</span>}</td><td>{r.country}</td><td>{r.company || r.full_name}</td><td><span className="pill pill-info">{STATUSES.find((s) => s.value === r.status)?.label}</span></td><td>{new Date(r.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td></tr>
            ))}</tbody></table>
        </div>
      </section>
    </div>
  );
}
