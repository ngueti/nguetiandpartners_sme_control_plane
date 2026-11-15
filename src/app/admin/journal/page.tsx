import { requireUser } from "../../../lib/auth";
import { q } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Journal d’audit" };

export default async function Journal() {
  await requireUser("audit");
  const rows = await q<any>(`SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 300`);
  return (
    <div className="grid gap-5">
      <h1 className="text-[26px] font-extrabold text-[var(--navy)]">Journal d’audit</h1>
      <p className="text-[var(--muted)]">Connexions, consultations, téléchargements de pièces et exports (300 derniers événements).</p>
      <div className="adm-card !p-0"><div className="adm-table-wrap">
        <table><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Cible</th><th>Détail</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}><td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString("fr-FR")}</td><td>{r.user_email ?? "—"}</td>
              <td><span className={`pill ${r.action === "login_fail" ? "pill-danger" : r.action.startsWith("export") || r.action.includes("download") ? "pill-warn" : "pill-muted"}`}>{r.action}</span></td>
              <td>{r.target}</td><td className="max-w-[360px] truncate text-[12px] text-[var(--muted)]">{Object.keys(r.meta).length ? JSON.stringify(r.meta) : ""}</td></tr>
          ))}</tbody></table></div></div>
    </div>
  );
}
