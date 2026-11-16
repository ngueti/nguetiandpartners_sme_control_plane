import type { Metadata } from "next";
import Link from "next/link";
import { currentUser, can, logout } from "../../lib/auth";
import { redirect } from "next/navigation";
import { Logo } from "../../components/Logo";
import { ROLE_LABELS } from "../../lib/config";

export const metadata: Metadata = { title: { default: "Back-office", template: "%s · Back-office N&P" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  async function out() {
    "use server";
    await logout();
    redirect("/admin/login");
  }
  return (
    <div className="adm">
      {u && (
        <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/admin" aria-label="Tableau de bord"><Logo className="h-9 w-[110px]" /></Link>
            <nav className="flex flex-1 flex-wrap items-center gap-1 text-[14px] font-semibold text-[var(--navy)]" aria-label="Back-office">
              <Link href="/admin" className="rounded-full px-3 py-2 hover:bg-[var(--mist)]">Tableau de bord</Link>
              <Link href="/admin/soumissions" className="rounded-full px-3 py-2 hover:bg-[var(--mist)]">Soumissions</Link>
              {can(u, "users") && <Link href="/admin/utilisateurs" className="rounded-full px-3 py-2 hover:bg-[var(--mist)]">Équipe</Link>}
              {can(u, "audit") && <Link href="/admin/journal" className="rounded-full px-3 py-2 hover:bg-[var(--mist)]">Journal</Link>}
              {can(u, "audit") && <Link href="/admin/emails" className="rounded-full px-3 py-2 hover:bg-[var(--mist)]">E-mails</Link>}
            </nav>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="text-right leading-tight"><strong className="block text-[var(--navy)]">{u.name}</strong><span className="text-[var(--muted)]">{ROLE_LABELS[u.role]}{u.role !== "super_admin" && ` · ${u.countries.join(", ") || "—"}`}</span></span>
              <Link href="/admin/mot-de-passe" className="font-semibold text-[var(--navy)] underline underline-offset-4">Mot de passe</Link>
              <form action={out}><button className="btn btn-line">Sortir</button></form>
            </div>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-[1400px] px-4 py-6">{children}</div>
    </div>
  );
}
