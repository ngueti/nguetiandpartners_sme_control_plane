import { neon } from "@neondatabase/serverless";
import pg from "pg";

export function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  if (/neon\.tech/.test(url)) {
    const sql = neon(url);
    return { query: (t, p = []) => sql.query(t, p), end: async () => {} };
  }
  const pool = new pg.Pool({ connectionString: url });
  return { query: async (t, p = []) => (await pool.query(t, p)).rows, end: () => pool.end() };
}
