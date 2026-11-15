import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { q, q1 } from "./db";
import { PERMS, type Role } from "./config";
import { ipHash, readToken, signToken, tooMany, verifyPassword } from "./security";

export type AdminUser = { id: string; email: string; name: string; role: Role; countries: string[] };
export const COOKIE = "np_session";

export async function currentUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const tok = readToken<{ uid: string }>(jar.get(COOKIE)?.value);
  if (!tok) return null;
  const u = await q1<AdminUser & { active: boolean }>(`SELECT id, email, name, role, countries, active FROM admin_users WHERE id = $1`, [tok.uid]);
  return u && u.active ? { id: u.id, email: u.email, name: u.name, role: u.role, countries: u.countries } : null;
}

export async function requireUser(perm?: keyof (typeof PERMS)["super_admin"]): Promise<AdminUser> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (perm && !PERMS[u.role][perm]) redirect("/admin?refus=1");
  return u;
}

export const can = (u: AdminUser, perm: keyof (typeof PERMS)["super_admin"]) => PERMS[u.role][perm];

/** Clause SQL de périmètre pays pour un utilisateur (null = aucun filtre). */
export function countryScope(u: AdminUser): string[] | null {
  return u.role === "super_admin" ? null : u.countries;
}

export async function audit(u: { id: string; email: string } | null, action: string, target?: string, meta: Record<string, unknown> = {}) {
  let ip: string | null = null;
  try { ip = ipHash(await headers()); } catch {}
  await q(`INSERT INTO audit_log (user_id, user_email, action, target, meta, ip_hash) VALUES ($1,$2,$3,$4,$5::jsonb,$6)`, [u?.id ?? null, u?.email ?? null, action, target ?? null, JSON.stringify(meta), ip]);
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const h = await headers();
  const ip = ipHash(h);
  if (await tooMany("audit_log", ip, 15, 8, "AND action = 'login_fail'")) return { ok: false, error: "Trop de tentatives. Réessayez dans 15 minutes." };
  const u = await q1<{ id: string; email: string; password_hash: string; active: boolean }>(`SELECT id, email, password_hash, active FROM admin_users WHERE email = $1`, [email.trim().toLowerCase()]);
  const good = u && u.active && (await verifyPassword(password, u.password_hash));
  if (!good) {
    await audit(null, "login_fail", email.slice(0, 80));
    return { ok: false, error: "Identifiants incorrects." };
  }
  const jar = await cookies();
  jar.set(COOKIE, signToken({ uid: u.id }, 60 * 60 * 12), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  await q(`UPDATE admin_users SET last_login = now() WHERE id = $1`, [u.id]);
  await audit(u, "login");
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
