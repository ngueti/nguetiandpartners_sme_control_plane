import { NextResponse } from "next/server";
import { q1 } from "../../../lib/db";
import { MAX_FILE_BYTES } from "../../../lib/config";
import { safeFilename, sha256, sniffMime } from "../../../lib/files";
import { ipHash, tooMany } from "../../../lib/security";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Dépôt d’un fichier (≤ 4 Mo) : stocké en base Neon, rattaché ensuite à la soumission. */
export async function POST(req: Request) {
  const ip = ipHash(req.headers);
  if (await tooMany("attachments", ip, 60, 60)) return NextResponse.json({ ok: false, error: "Trop de fichiers envoyés. Réessayez plus tard." }, { status: 429 });

  let file: File | null = null;
  try {
    const fd = await req.formData();
    const f = fd.get("file");
    if (f instanceof File) file = f;
  } catch {}
  if (!file) return NextResponse.json({ ok: false, error: "Aucun fichier reçu." }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ ok: false, error: "Fichier trop lourd (4 Mo maximum)." }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniffMime(buf);
  if (!mime) return NextResponse.json({ ok: false, error: "Format non accepté (PDF, JPG, PNG, WebP, Word, Excel)." }, { status: 415 });

  const name = safeFilename(file.name, mime);
  const row = await q1<{ id: string }>(
    `INSERT INTO attachments (filename, mime, size, sha256, data, ip_hash) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [name, mime, buf.length, sha256(buf), buf, ip],
  );
  return NextResponse.json({ ok: true, id: row!.id, name, size: buf.length, mime });
}
