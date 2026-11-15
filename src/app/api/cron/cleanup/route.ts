import { q } from "../../../../lib/db";

export const runtime = "nodejs";

/** Tâche planifiée (Vercel Cron) : supprime les fichiers déposés mais jamais rattachés à une soumission (> 24 h). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Non autorisé", { status: 401 });
  const r = await q<{ id: string }>(`DELETE FROM attachments WHERE submission_id IS NULL AND created_at < now() - interval '24 hours' RETURNING id`);
  return Response.json({ deleted: r.length });
}
