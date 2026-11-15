import { redirect } from "next/navigation";
import { requireUser, audit } from "../../../lib/auth";
import { q1, q } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/security";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mot de passe" };

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  await requireUser();
  const sp = await searchParams;

  async function change(fd: FormData) {
    "use server";
    const me = await requireUser();
    const current = String(fd.get("current") ?? "");
    const next = String(fd.get("next") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    const fail = (m: string) => redirect(`/admin/mot-de-passe?e=${encodeURIComponent(m)}`);

    if (next.length < 12) fail("Le nouveau mot de passe doit contenir au moins 12 caractères.");
    if (next !== confirm) fail("La confirmation ne correspond pas.");
    if (next === current) fail("Le nouveau mot de passe doit être différent de l’actuel.");

    const row = await q1<{ password_hash: string }>(`SELECT password_hash FROM admin_users WHERE id = $1`, [me.id]);
    if (!row || !(await verifyPassword(current, row.password_hash))) {
      await audit(me, "password_change_fail");
      fail("Mot de passe actuel incorrect.");
    }
    await q(`UPDATE admin_users SET password_hash = $2 WHERE id = $1`, [me.id, await hashPassword(next)]);
    await audit(me, "password_change");
    redirect("/admin/mot-de-passe?ok=1");
  }

  return (
    <div className="mx-auto mt-6 max-w-[460px]">
      <div className="adm-card !p-7">
        <h1 className="text-[22px] font-bold text-[var(--navy)]">Changer mon mot de passe</h1>
        <p className="mt-1 text-[var(--muted)]">12 caractères minimum. Utilisez un gestionnaire de mots de passe si possible.</p>
        {sp.ok && <p role="status" className="mt-4 rounded-xl bg-[#dcf5e7] p-3 font-semibold text-[#12713f]">Mot de passe mis à jour.</p>}
        {sp.e && <p role="alert" className="mt-4 rounded-xl bg-[#fde4e1] p-3 font-semibold text-[#a3281b]">{sp.e}</p>}
        <form action={change} className="mt-5 grid gap-4">
          <label className="grid gap-1.5 font-semibold text-[var(--navy)]">Mot de passe actuel<input name="current" type="password" required autoComplete="current-password" className="input" /></label>
          <label className="grid gap-1.5 font-semibold text-[var(--navy)]">Nouveau mot de passe<input name="next" type="password" required minLength={12} autoComplete="new-password" className="input" /></label>
          <label className="grid gap-1.5 font-semibold text-[var(--navy)]">Confirmer le nouveau mot de passe<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className="input" /></label>
          <button className="btn btn-navy">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}
