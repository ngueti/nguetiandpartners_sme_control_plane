import { redirect } from "next/navigation";
import { currentUser, login } from "../../../lib/auth";
import { Roundel } from "../../../components/Logo";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await currentUser()) redirect("/admin");
  const { e } = await searchParams;
  async function action(fd: FormData) {
    "use server";
    const r = await login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
    if (!r.ok) redirect(`/admin/login?e=${encodeURIComponent(r.error ?? "Erreur")}`);
    redirect("/admin");
  }
  return (
    <div className="mx-auto mt-10 max-w-[420px]">
      <div className="adm-card !p-8 text-center">
        <Roundel className="mx-auto h-20 w-20" />
        <h1 className="mt-4 text-[22px] font-bold text-[var(--navy)]">Espace équipe N&amp;P</h1>
        <p className="mt-1 text-[var(--muted)]">Back-office du SME Control Plane</p>
        <form action={action} className="mt-6 grid gap-4 text-left">
          <label className="grid gap-1.5 font-semibold text-[var(--navy)]">E-mail<input name="email" type="email" required autoComplete="username" className="input" /></label>
          <label className="grid gap-1.5 font-semibold text-[var(--navy)]">Mot de passe<input name="password" type="password" required autoComplete="current-password" className="input" /></label>
          {e && <p role="alert" className="err">{e}</p>}
          <button className="btn btn-navy">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
