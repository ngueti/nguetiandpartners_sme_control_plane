import { q1 } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Contrôle d'exploitation : base joignable + variables présentes (jamais leurs valeurs). */
export async function GET() {
  let db = false;
  let tables = 0;
  try {
    const r = await q1<{ n: string }>(`SELECT count(*)::text AS n FROM information_schema.tables WHERE table_schema = 'public'`);
    db = true;
    tables = Number(r?.n ?? 0);
  } catch {}
  return Response.json({
    ok: db,
    db,
    tables,
    env: {
      session: (process.env.SESSION_SECRET ?? "").length >= 32,
      resend: !!process.env.RESEND_API_KEY,
      mailFrom: !!process.env.MAIL_FROM,
      teamEmail: !!(process.env.TEAM_EMAIL_DEFAULT || process.env.TEAM_EMAIL_CM),
      linear: !!process.env.LINEAR_API_KEY,
      notion: !!process.env.NOTION_TOKEN,
    },
  }, { status: db ? 200 : 503 });
}
