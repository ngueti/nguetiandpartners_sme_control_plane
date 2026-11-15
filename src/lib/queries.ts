import { q } from "./db";
import type { AdminUser } from "./auth";
import { countryScope } from "./auth";

export type Filters = {
  form?: string; country?: string; status?: string; priority?: string; q?: string;
  from?: string; to?: string; files?: string; assigned?: string; page?: number;
};

export const PAGE_SIZE = 25;

export function filtersFrom(sp: Record<string, string | string[] | undefined>): Filters {
  const g = (k: string) => (typeof sp[k] === "string" && sp[k] ? (sp[k] as string) : undefined);
  return { form: g("form"), country: g("country"), status: g("status"), priority: g("priority"), q: g("q"), from: g("from"), to: g("to"), files: g("files"), assigned: g("assigned"), page: Math.max(1, Number(g("page")) || 1) };
}

/** Construit la clause WHERE paramétrée (périmètre pays + filtres). */
export function buildWhere(u: AdminUser, f: Filters, alias = "s") {
  const w: string[] = [];
  const p: unknown[] = [];
  const add = (sql: string, v: unknown) => { p.push(v); w.push(sql.replace("?", `$${p.length}`)); };
  const scope = countryScope(u);
  if (scope) add(`${alias}.country = ANY(?::text[])`, scope);
  if (f.form) add(`${alias}.form = ?`, f.form);
  if (f.country) add(`${alias}.country = ?`, f.country);
  if (f.status) add(`${alias}.status = ?`, f.status);
  if (f.priority) add(`${alias}.priority = ?`, f.priority);
  if (f.from) add(`${alias}.created_at >= ?::date`, f.from);
  if (f.to) add(`${alias}.created_at < (?::date + 1)`, f.to);
  if (f.files === "oui") w.push(`EXISTS (SELECT 1 FROM attachments a WHERE a.submission_id = ${alias}.id)`);
  if (f.files === "non") w.push(`NOT EXISTS (SELECT 1 FROM attachments a WHERE a.submission_id = ${alias}.id)`);
  if (f.assigned === "moi") add(`${alias}.assigned_to = ?::uuid`, u.id);
  if (f.assigned === "aucun") w.push(`${alias}.assigned_to IS NULL`);
  if (f.q) {
    p.push(`%${f.q.replace(/[%_]/g, "\\$&")}%`);
    const n = `$${p.length}`;
    w.push(`(${alias}.ref ILIKE ${n} OR ${alias}.full_name ILIKE ${n} OR ${alias}.email ILIKE ${n} OR ${alias}.company ILIKE ${n} OR ${alias}.subject ILIKE ${n} OR ${alias}.data::text ILIKE ${n})`);
  }
  return { where: w.length ? `WHERE ${w.join(" AND ")}` : "", params: p };
}

export async function listSubmissions(u: AdminUser, f: Filters) {
  const { where, params } = buildWhere(u, f);
  const total = Number((await q<{ n: string }>(`SELECT count(*)::text AS n FROM submissions s ${where}`, params))[0].n);
  const rows = await q(
    `SELECT s.id, s.ref, s.form, s.country, s.status, s.priority, s.full_name, s.email, s.company, s.subject, s.created_at,
            (SELECT count(*) FROM attachments a WHERE a.submission_id = s.id)::int AS files, au.name AS assignee
       FROM submissions s LEFT JOIN admin_users au ON au.id = s.assigned_to ${where}
      ORDER BY (s.priority = 'haute' AND s.status IN ('nouveau','en_cours')) DESC, s.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${((f.page ?? 1) - 1) * PAGE_SIZE}`,
    params,
  );
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
