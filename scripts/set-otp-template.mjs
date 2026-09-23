// One-off: sets the branded email-OTP ("magic link") template via the Supabase Management API.
// Not part of the app.
import { readFileSync } from "node:fs";

const ref = "utmqeyerlwhavqginaka";
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.log("usage: SUPABASE_ACCESS_TOKEN=... node scripts/set-otp-template.mjs <path-to-html>");
  process.exit(1);
}
const html = readFileSync(process.argv[2], "utf8");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    mailer_subjects_magic_link: "Your K-Invites sign-in code",
    mailer_templates_magic_link_content: html,
  }),
});
console.log("status:", res.status);
console.log(await res.text());
