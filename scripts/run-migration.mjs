// One-off: runs a migration file directly via the Supabase Management API, using a
// Personal Access Token passed as SUPABASE_ACCESS_TOKEN. Not part of the app.
import { readFileSync } from "node:fs";

const ref = "utmqeyerlwhavqginaka";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const file = process.argv[2];
if (!token || !file) {
  console.log("usage: SUPABASE_ACCESS_TOKEN=... node scripts/run-migration.mjs <path-to-sql>");
  process.exit(1);
}
const sql = readFileSync(file, "utf8");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
console.log("status:", res.status);
console.log(text);
