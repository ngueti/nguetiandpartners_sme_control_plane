import { neon } from "@neondatabase/serverless";
import pg from "pg";

type Row = Record<string, any>;
type Runner = (text: string, params?: unknown[]) => Promise<Row[]>;

let runner: Runner | null = null;

function make(): Runner {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  if (/neon\.tech/.test(url)) {
    const sql = neon(url);
    return (t, p = []) => sql.query(t, p as any[]) as Promise<Row[]>;
  }
  // Postgres local / hors Neon (développement, tests)
  const g = globalThis as any;
  const pool: pg.Pool = (g.__npPool ??= new pg.Pool({ connectionString: url, max: 5 }));
  return async (t, p = []) => (await pool.query(t, p as any[])).rows;
}

/** Exécute une requête paramétrée ($1, $2…) et renvoie les lignes. */
export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  runner ??= make();
  return (await runner(text, params)) as T[];
}

export async function q1<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await q<T>(text, params))[0] ?? null;
}
