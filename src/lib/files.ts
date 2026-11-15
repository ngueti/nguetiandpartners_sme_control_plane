import { createHash } from "node:crypto";
import { ALLOWED_MIME, MAX_FILE_BYTES } from "./config";

/** Vérifie la signature binaire réelle du fichier (et pas seulement le type déclaré). */
export function sniffMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    // Office Open XML (zip) : distingue docx / xlsx par les entrées du zip
    const head = buf.subarray(0, Math.min(buf.length, 4096)).toString("latin1");
    if (head.includes("word/")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (head.includes("xl/")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    return null;
  }
  return null;
}

export function safeFilename(name: string, mime: string): string {
  const ext = ALLOWED_MIME[mime] ?? "bin";
  const base = name.normalize("NFKD").replace(/[^\w.\- ]+/g, "").replace(/\.[a-z0-9]{1,5}$/i, "").trim().slice(0, 80) || "fichier";
  return `${base}.${ext}`;
}

export const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");
export { MAX_FILE_BYTES };
