// One-off: sends a real magic-link email via the now-configured Resend SMTP, to confirm
// the whole path (Supabase -> Resend -> inbox) actually works. Not part of the app.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const email = process.argv[2];
if (!email) {
  console.log("usage: node scripts/test-magic-link.mjs you@example.com");
  process.exit(1);
}

const { error } = await anon.auth.signInWithOtp({ email, options: { emailRedirectTo: "http://localhost:3000/auth/callback?next=%2Fdashboard" } });
console.log(error ? `error: ${error.message}` : "sent — check the inbox (and spam) within a minute");
