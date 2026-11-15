import { randomBytes, scryptSync } from "node:crypto";
import { connect } from "./_db.mjs";

const [email, name, password, role = "super_admin"] = process.argv.slice(2);
if (!process.env.DATABASE_URL || !email || !password) {
  console.error("usage: DATABASE_URL=... node scripts/seed-admin.mjs email nom motdepasse [role]");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = `scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`;
const db = connect();
const countries = role === "super_admin" ? [] : ["CM", "CI", "BJ"];
await db.query(
  `INSERT INTO admin_users (email,name,password_hash,role,countries) VALUES ($1,$2,$3,$4,$5)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, active = true`,
  [email.toLowerCase(), name || email, hash, role, countries],
);
console.log("Admin prêt:", email, role);
await db.end();
