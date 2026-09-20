// Checks whether sign-in is set up, without printing any secret.
// Run:  node scripts/check-auth.mjs
import { readFileSync } from "node:fs";

const env = {};
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch {
  console.log("✗ .env.local not found. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const ok = (t) => console.log("✓", t);
const bad = (t) => console.log("✗", t);
const warn = (t) => console.log("!", t);
const has = (k) => !!env[k];

console.log("\nEnvironment (names only, values are never shown)");
for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_ROOT_DOMAIN"]) (has(k) ? ok : bad)(`${k} is ${has(k) ? "set" : "missing"}`);
has("NEXT_PUBLIC_CONTACT_EMAIL") ? ok("NEXT_PUBLIC_CONTACT_EMAIL is set") : warn("NEXT_PUBLIC_CONTACT_EMAIL is empty: the Privacy page will say a contact address is coming.");

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) process.exit(1);

console.log("\nSupabase sign-in settings");
try {
  const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const s = await res.json();
  s.external?.email ? ok("Email sign-in is on") : bad("Email sign-in is OFF. Authentication > Providers > Email.");
  if (s.mailer_autoconfirm) warn("Email auto-confirm is on: addresses are not verified.");
  if (s.external?.google) {
    ok("Google sign-in is on");
    env.NEXT_PUBLIC_GOOGLE_AUTH === "1" ? ok("The Google button is shown") : warn("Google is on in Supabase but the button is hidden. Set NEXT_PUBLIC_GOOGLE_AUTH=1 to show it.");
  } else {
    env.NEXT_PUBLIC_GOOGLE_AUTH === "1" ? bad("The Google button is shown but Google is OFF in Supabase. Sign-in with it will fail.") : ok("Google is off and the button is hidden (consistent)");
  }
} catch (e) {
  bad(`Could not reach Supabase: ${e.message}`);
}

console.log("\nDatabase tables");
const service = env.SUPABASE_SERVICE_ROLE_KEY;
if (service) {
  for (const t of ["profiles", "invites", "guests", "rsvps"]) {
    const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=0`, { headers: { apikey: service, Authorization: `Bearer ${service}` } });
    r.ok ? ok(`table ${t} exists`) : bad(`table ${t} is missing. Run supabase/migrations/0001_init.sql.`);
  }
  for (const [t, col, file] of [["guests", "events", "0002_multi_event.sql"], ["rsvps", "responses", "0002_multi_event.sql"]]) {
    const r = await fetch(`${url}/rest/v1/${t}?select=${col}&limit=0`, { headers: { apikey: service, Authorization: `Bearer ${service}` } });
    r.ok ? ok(`${t}.${col} exists`) : bad(`${t}.${col} is missing. Run supabase/migrations/${file}.`);
  }
}

console.log("\nThings this script cannot see (check them in the Supabase dashboard)");
console.log("  - Authentication > URL Configuration: Site URL and the redirect  <your address>/auth/callback");
console.log("  - Authentication > Emails > SMTP: a custom sender (Resend), or the default limit of a few emails an hour applies");
console.log("  - The Resend sending domain is verified, or mail only reaches your own address");
console.log("See docs/SETUP-LOGIN.md for the steps.\n");
