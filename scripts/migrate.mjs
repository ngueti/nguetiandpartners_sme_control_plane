import { readFileSync, readdirSync } from "node:fs";
import { connect } from "./_db.mjs";

const db = connect();
const dir = new URL("../migrations/", import.meta.url);
for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  const text = readFileSync(new URL(f, dir), "utf8");
  for (const stmt of text.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) await db.query(stmt);
  console.log("OK", f);
}
await db.end();
