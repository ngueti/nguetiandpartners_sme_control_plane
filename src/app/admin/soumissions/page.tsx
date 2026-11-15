import Link from "next/link";
import { requireUser, can } from "../../../lib/auth";
import { filtersFrom, listSubmissions } from "../../../lib/queries";
import { COUNTRIES, FORM_IDS, FORM_LABELS, STATUSES, type FormId } from "../../../lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Soumissions" };

export default async function List({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const u = await requireUser();
  const sp = await searchParams;
  const f = filtersFrom(sp);
  const { rows, total, pages } = await listSubmissions(u, f);
  const qs = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...f, ...over })) if (v !== undefined && v !== "" && k !== "page") p.set(k, String(v));
    if (over.page) p.set("page", String(over.page));
    return p.toString();
  };
  const exportQs = qs({});
  const sel = (name: string, label: string, opts: { v: string; l: string }[], cur?: string) => (
    <label className="grid gap-1 text-[12px] font-bold uppercase tracking-wide text-[var(--muted)]">{label}
      <select name={name} defaultValue={cur ?? ""} className="input"><option value="">Tous</option>{opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select></label>
  );
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-extrabold text-[var(--navy)]">Soumissions <span className="text-[var(--muted)]">({total})</span></h1>
        {can(u, "export") && (
          <div className="flex flex-wrap gap-2">
            <a className="btn btn-navy" href={`/admin/export?format=csv&${exportQs}`}>⬇ CSV</a>
            <a className="btn btn-line" href={`/admin/export?format=json&${exportQs}`}>⬇ JSON</a>
            <a className="btn btn-line" href={`/admin/export/pieces?${exportQs}`}>⬇ Pièces jointes (ZIP)</a>
          </div>
        )}
      </div>
      <form className="adm-card grid gap-3 sm:grid-cols-2 lg:grid-cols-5" method="get">
        <label className="grid gap-1 text-[12px] font-bold uppercase tracking-wide text-[var(--muted)] sm:col-span-2">Recherche
          <input name="q" defaultValue={f.q} placeholder="Nom, e-mail, entreprise, réf., contenu…" className="input" /></label>
        {sel("form", "Type", FORM_IDS.map((x) => ({ v: x, l: FORM_LABELS[x] })), f.form)}
        {sel("country", "Pays", COUNTRIES.map((c) => ({ v: c.code, l: c.name })), f.country)}
        {sel("status", "Statut", STATUSES.map((s) => ({ v: s.value, l: s.label })), f.status)}
        {sel("priority", "Priorité", [{ v: "haute", l: "Urgente" }, { v: "normale", l: "Normale" }], f.priority)}
        {sel("files", "Pièces jointes", [{ v: "oui", l: "Avec" }, { v: "non", l: "Sans" }], f.files)}
        {sel("assigned", "Attribution", [{ v: "moi", l: "À moi" }, { v: "aucun", l: "Non attribué" }], f.assigned)}
        <label className="grid gap-1 text-[12px] font-bold uppercase tracking-wide text-[var(--muted)]">Du<input type="date" name="from" defaultValue={f.from} className="input" /></label>
        <label className="grid gap-1 text-[12px] font-bold uppercase tracking-wide text-[var(--muted)]">Au<input type="date" name="to" defaultValue={f.to} className="input" /></label>
        <div className="flex items-end gap-2"><button className="btn btn-navy">Filtrer</button><Link href="/admin/soumissions" className="btn btn-line">Réinitialiser</Link></div>
      </form>
      <div className="adm-card !p-0">
        <div className="adm-table-wrap">
          <table>
            <thead><tr><th>Réf.</th><th>Type</th><th>Pays</th><th>Demandeur</th><th>Sujet</th><th>Pièces</th><th>Statut</th><th>Attribué</th><th>Date</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={9} className="py-10 text-center text-[var(--muted)]">Aucun résultat.</td></tr>}
              {rows.map((r: any) => (
                <tr key={r.id}>
                  <td><Link className="font-bold text-[var(--navy)] underline" href={`/admin/soumissions/${r.id}`}>{r.ref}</Link></td>
                  <td>{FORM_LABELS[r.form as FormId]}{r.priority === "haute" && <span className="pill pill-danger ml-2">Urgent</span>}</td>
                  <td>{r.country}</td>
                  <td><strong>{r.company || r.full_name}</strong><br /><span className="text-[13px] text-[var(--muted)]">{r.company ? r.full_name + " · " : ""}{r.email}</span></td>
                  <td className="max-w-[240px] truncate">{r.subject}</td>
                  <td>{r.files ? `📎 ${r.files}` : "—"}</td>
                  <td><span className="pill pill-info">{STATUSES.find((s) => s.value === r.status)?.label}</span></td>
                  <td>{r.assignee ?? "—"}</td>
                  <td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          {(f.page ?? 1) > 1 && <Link className="btn btn-line" href={`?${qs({ page: (f.page ?? 1) - 1 })}`}>← Précédent</Link>}
          <span className="text-[var(--muted)]">Page {f.page} / {pages}</span>
          {(f.page ?? 1) < pages && <Link className="btn btn-line" href={`?${qs({ page: (f.page ?? 1) + 1 })}`}>Suivant →</Link>}
        </nav>
      )}
    </div>
  );
}
