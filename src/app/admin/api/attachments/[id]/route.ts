import { currentUser, countryScope, audit, can } from "../../../../../lib/auth";
import { q1 } from "../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || !can(u, "attachments")) return new Response("Non autorisé", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Introuvable", { status: 404 });
  const scope = countryScope(u);
  const a = await q1<{ filename: string; mime: string; data: Buffer; ref: string }>(
    `SELECT a.filename, a.mime, a.data, s.ref FROM attachments a JOIN submissions s ON s.id = a.submission_id WHERE a.id = $1 ${scope ? "AND s.country = ANY($2::text[])" : ""}`,
    scope ? [id, scope] : [id],
  );
  if (!a) return new Response("Introuvable", { status: 404 });
  const dl = new URL(req.url).searchParams.get("dl") === "1";
  if (dl) await audit(u, "attachment.download", a.ref, { file: a.filename });
  const inline = !dl && (a.mime === "application/pdf" || a.mime.startsWith("image/"));
  const data = Buffer.isBuffer(a.data) ? a.data : Buffer.from(String(a.data).replace(/^\\x/, ""), "hex");
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": a.mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(a.filename)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
