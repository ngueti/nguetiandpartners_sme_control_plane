import { Zip, ZipPassThrough } from "fflate";
import { currentUser, can, audit } from "../../../../lib/auth";
import { q } from "../../../../lib/db";
import { buildWhere, filtersFrom } from "../../../../lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Archive ZIP en flux de toutes les pièces jointes correspondant aux filtres (dossier par référence). */
export async function GET(req: Request) {
  const u = await currentUser();
  if (!u || !can(u, "export")) return new Response("Non autorisé", { status: 403 });
  const f = filtersFrom(Object.fromEntries(new URL(req.url).searchParams));
  const { where, params } = buildWhere(u, f);
  const list = await q<{ id: string; ref: string; filename: string; field: string | null }>(
    `SELECT a.id, s.ref, a.filename, a.field FROM attachments a JOIN submissions s ON s.id = a.submission_id ${where.replace("WHERE", "WHERE")} ORDER BY s.created_at DESC, a.created_at LIMIT 2000`,
    params,
  );
  await audit(u, "export.attachments", "zip", { filters: f, files: list.length });
  const enc = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const zip = new Zip((err, chunk, final) => {
        if (err) return controller.error(err);
        controller.enqueue(chunk);
        if (final) controller.close();
      });
      const add = (name: string, data: Uint8Array) => {
        const entry = new ZipPassThrough(name);
        zip.add(entry);
        entry.push(data, true);
      };
      add("manifest.csv", enc.encode("﻿reference,champ,fichier\r\n" + list.map((a) => `${a.ref},${a.field ?? ""},"${a.filename.replace(/"/g, '""')}"`).join("\r\n")));
      const used = new Set<string>();
      for (let i = 0; i < list.length; i += 4) {
        const batch = list.slice(i, i + 4);
        const rows = await q<{ id: string; data: Buffer }>(`SELECT id, data FROM attachments WHERE id = ANY($1::uuid[])`, [batch.map((b) => b.id)]);
        for (const b of batch) {
          const row = rows.find((r) => r.id === b.id);
          if (!row) continue;
          let name = `${b.ref}/${b.field ?? "piece"}-${b.filename}`;
          while (used.has(name)) name = name.replace(/(\.\w+)$/, `-${b.id.slice(0, 4)}$1`);
          used.add(name);
          const data = Buffer.isBuffer(row.data) ? row.data : Buffer.from(String(row.data).replace(/^\\x/, ""), "hex");
          add(name, new Uint8Array(data));
        }
      }
      zip.end();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="np-pieces-${new Date().toISOString().slice(0, 10)}.zip"`, "Cache-Control": "no-store" },
  });
}
