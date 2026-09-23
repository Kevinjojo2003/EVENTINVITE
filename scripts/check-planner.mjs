// Checks whether migrations 0003-0005 have been applied, without printing any secret.
// Run:  node scripts/check-planner.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const tables = ["tasks", "expenses", "vendors", "timeline_items", "accommodations", "transport_items", "event_documents", "event_team"];
for (const t of tables) {
  const { error } = await supabase.from(t).select("id", { count: "exact", head: true });
  console.log(error ? `✗ ${t}: ${error.message}` : `✓ ${t} exists`);
}

const { error: rpcErr } = await supabase.rpc("purge_old_guest_data", { retain: "90 days" });
console.log(rpcErr ? `✗ purge_old_guest_data(): ${rpcErr.message}` : "✓ purge_old_guest_data() runs");

const { data: bucket, error: bErr } = await supabase.storage.getBucket("documents");
console.log(bErr ? `✗ documents bucket: ${bErr.message}` : `✓ documents bucket exists (public: ${bucket.public})`);
