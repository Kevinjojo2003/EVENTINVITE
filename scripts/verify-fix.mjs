// One-off: confirms whether 0006 has been applied, testing the exact insert the app does.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({ email: "dev-tester@local.test", password: "dev-tester-local-only-not-real" });
if (signInErr) {
  console.log("sign-in failed:", signInErr.message);
  process.exit(1);
}
const uid = signIn.user.id;

const { data, error } = await anon.from("invites").insert({ owner_id: uid, slug: `verify-${Date.now()}`, event_type: "wedding", config: {} }).select("id").single();
console.log("anon insert:", error ? JSON.stringify(error) : `ok, id=${data.id}`);

if (data) {
  await admin.from("invites").delete().eq("id", data.id);
  console.log("cleaned up");
}
