import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { q1 } from "./db";

export function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET manquant ou trop court (32 caractères min.)");
  return s;
}

export function clientIp(h: Headers): string {
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "0.0.0.0").trim();
}
export function ipHash(h: Headers): string {
  return createHash("sha256").update(clientIp(h) + secret()).digest("hex").slice(0, 32);
}

/** Génère un numéro de dossier lisible : NP-CI-2611-7K3QX */
export function makeRef(country: string): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const b = randomBytes(5);
  const tail = Array.from(b, (x) => alphabet[x % alphabet.length]).join("");
  const d = new Date();
  const ym = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `NP-${country}-${ym}-${tail}`;
}

/* ---------- Mots de passe (scrypt) ---------- */
export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return Promise.resolve(false);
  return new Promise((resolve) => {
    scrypt(password, Buffer.from(saltHex, "hex"), 64, (err, key) => {
      if (err) return resolve(false);
      const expected = Buffer.from(hashHex, "hex");
      resolve(expected.length === key.length && timingSafeEqual(expected, key));
    });
  });
}
export function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(`scrypt$${salt.toString("hex")}$${key.toString("hex")}`))),
  );
}

/* ---------- Sessions : jeton signé HMAC ---------- */
const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
export function signToken(payload: Record<string, unknown>, ttlSec: number): string {
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec }));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}
export function readToken<T = any>(token?: string | null): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const good = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(good);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.exp > Date.now() / 1000 ? (p as T) : null;
  } catch {
    return null;
  }
}

/* ---------- Limitation de débit (base de données) ---------- */
export async function tooMany(table: "submissions" | "attachments" | "audit_log", ip: string, windowMin: number, max: number, extra = ""): Promise<boolean> {
  const row = await q1<{ n: string }>(
    `SELECT count(*)::text AS n FROM ${table} WHERE ip_hash = $1 AND created_at > now() - ($2 || ' minutes')::interval ${extra}`,
    [ip, String(windowMin)],
  );
  return Number(row?.n ?? 0) >= max;
}
