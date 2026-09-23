"use server";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// TEMPORARY, local-testing only: signs in as a fixed test user so the dashboard can be
// exercised without setting up email delivery. Hard-gated on NODE_ENV, which Next.js sets
// from the run command (dev vs. build) — not from any .env file, so this cannot be enabled
// by an environment variable in production. Safe to delete this file once real sign-in
// (Resend SMTP, per docs/SETUP-LOGIN.md) is set up.
const DEV_EMAIL = "dev-tester@local.test";
const DEV_PASSWORD = "dev-tester-local-only-not-real";

export async function devSignIn() {
  if (process.env.NODE_ENV !== "development") return { error: "Dev sign-in is disabled." };

  const admin = createAdminClient();
  const { data: existing } = await admin.auth.admin.listUsers();
  const user = existing.users.find((u) => u.email === DEV_EMAIL);
  if (!user) {
    const { error } = await admin.auth.admin.createUser({ email: DEV_EMAIL, password: DEV_PASSWORD, email_confirm: true, user_metadata: { full_name: "Dev Tester" } });
    if (error) return { error: error.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: DEV_EMAIL, password: DEV_PASSWORD });
  if (error) return { error: error.message };
  redirect("/dashboard");
}
