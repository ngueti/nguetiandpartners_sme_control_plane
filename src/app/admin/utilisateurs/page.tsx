import { redirect } from "next/navigation";
import { requireUser, audit } from "../../../lib/auth";
import { q } from "../../../lib/db";
import { COUNTRIES, ROLES, ROLE_LABELS, type Role } from "../../../lib/config";
import { hashPassword } from "../../../lib/security";

export const dynamic = "force-dynamic";
export const metadata = { title: "Équipe" };

export default async function Users({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const me = await requireUser("users");
  const sp = await searchParams;
  const users = await q<any>(`SELECT id, email, name, role, countries, active, last_login FROM admin_users ORDER BY created_at`);

  async function create(fd: FormData) {
    "use server";
    const admin = await requireUser("users");
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const name = String(fd.get("name") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const role = String(fd.get("role")) as Role;
    const countries = fd.getAll("countries").map(String).filter((c) => COUNTRIES.some((x) => x.code === c));
    if (!/^\S+@\S+\.\S+$/.test(email) || !name || password.length < 12 || !ROLES.includes(role)) redirect("/admin/utilisateurs?e=Champs+invalides+(mot+de+passe+12+caract%C3%A8res+min.)");
    try {
      await q(`INSERT INTO admin_users (email,name,password_hash,role,countries) VALUES ($1,$2,$3,$4,$5)`, [email, name, await hashPassword(password), role, role === "super_admin" ? [] : countries]);
    } catch { redirect("/admin/utilisateurs?e=E-mail+d%C3%A9j%C3%A0+utilis%C3%A9"); }
    await audit(admin, "user.create", email, { role, countries });
    redirect("/admin/utilisateurs?ok=1");
  }
  async function toggle(fd: FormData) {
    "use server";
    const admin = await requireUser("users");
    const id = String(fd.get("id"));
    if (id === admin.id) return;
    await q(`UPDATE admin_users SET active = NOT active WHERE id = $1`, [id]);
    await audit(admin, "user.toggle", id);
    redirect("/admin/utilisateurs?ok=1");
  }
  async function setRole(fd: FormData) {
    "use server";
    const admin = await requireUser("users");
    const id = String(fd.get("id")), role = String(fd.get("role")) as Role;
    const countries = fd.getAll("countries").map(String).filter((c) => COUNTRIES.some((x) => x.code === c));
    if (!ROLES.includes(role) || (id === admin.id && role !== "super_admin")) return;
    await q(`UPDATE admin_users SET role = $2, countries = $3 WHERE id = $1`, [id, role, role === "super_admin" ? [] : countries]);
    await audit(admin, "user.update", id, { role, countries });
    redirect("/admin/utilisateurs?ok=1");
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-[26px] font-extrabold text-[var(--navy)]">Équipe &amp; droits</h1>
      {sp.e && <p role="alert" className="rounded-xl bg-[#fde4e1] p-3 font-semibold text-[#a3281b]">{sp.e}</p>}
      {sp.ok && <p role="status" className="rounded-xl bg-[#dcf5e7] p-3 font-semibold text-[#12713f]">Enregistré.</p>}
      <section className="adm-card !p-0"><div className="adm-table-wrap">
        <table>
          <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle et pays</th><th>Dernière connexion</th><th>Actif</th></tr></thead>
          <tbody>{users.map((x: any) => (
            <tr key={x.id}>
              <td><strong>{x.name}</strong></td><td>{x.email}</td>
              <td>
                <form action={setRole} className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={x.id} />
                  <select name="role" defaultValue={x.role} className="input !w-auto">{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select>
                  {COUNTRIES.map((c) => <label key={c.code} className="flex items-center gap-1 text-[13px]"><input type="checkbox" name="countries" value={c.code} defaultChecked={x.countries.includes(c.code)} />{c.code}</label>)}
                  <button className="btn btn-line">OK</button></form>
              </td>
              <td>{x.last_login ? new Date(x.last_login).toLocaleString("fr-FR") : "—"}</td>
              <td><form action={toggle}><input type="hidden" name="id" value={x.id} /><button className={`pill ${x.active ? "pill-ok" : "pill-muted"}`} disabled={x.id === me.id}>{x.active ? "Actif" : "Désactivé"}</button></form></td>
            </tr>))}</tbody>
        </table></div></section>
      <section className="adm-card">
        <h2 className="mb-4 text-[17px] font-bold text-[var(--navy)]">Ajouter un membre</h2>
        <form action={create} className="grid gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Nom complet" className="input" />
          <input name="email" type="email" required placeholder="E-mail professionnel" className="input" />
          <input name="password" type="password" required minLength={12} placeholder="Mot de passe provisoire (12 car. min.)" className="input" autoComplete="new-password" />
          <select name="role" className="input" defaultValue="agent">{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select>
          <fieldset className="flex items-center gap-4 sm:col-span-2"><legend className="sr-only">Pays</legend>{COUNTRIES.map((c) => <label key={c.code} className="flex items-center gap-2"><input type="checkbox" name="countries" value={c.code} defaultChecked />{c.flag} {c.name}</label>)}</fieldset>
          <button className="btn btn-sun sm:col-span-2">Créer l’accès</button>
        </form>
        <p className="mt-3 text-[13px] text-[var(--muted)]">Super administrateur : tous les pays, gestion de l’équipe, journal. Responsable pays : filtre par pays, exports. Agent : traite les dossiers, sans export. Lecture seule : consultation.</p>
      </section>
    </div>
  );
}
