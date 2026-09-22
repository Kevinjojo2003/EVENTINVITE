// One-off: seeds a realistic event for dev-tester@local.test so the new Overview page can be
// visually verified while migration 0006 (RLS fix) is still pending. Prints the invite id.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data: users } = await admin.auth.admin.listUsers();
const user = users.users.find((u) => u.email === "dev-tester@local.test");
if (!user) {
  console.log("dev-tester not found; sign in via /login first.");
  process.exit(1);
}

const config = {
  hosts: { name1: "Kevin", name2: "Anu", subline: "", nameTranslit: "" },
  event: { type: "wedding", tradition: "hindu-kerala", language: "en", timezone: "Asia/Kolkata", headline: "invite you to their wedding", dateTime: "2027-12-18T16:30:00+05:30", city: "Kochi" },
  labels: {},
  venue: { name: "The Backwater Lawns", line1: "Kumbalangi", line2: "Kochi", mapsUrl: "", directions: "", stay: "", embedMap: false },
  schedule: [
    { key: "mehendi", title: "Mehendi", start: "2027-12-16T17:00:00+05:30", end: "2027-12-16T21:00:00+05:30", place: "Anu's home, Fort Kochi", dress: "", note: "" },
    { key: "wedding", title: "Wedding ceremony", start: "2027-12-18T16:30:00+05:30", end: "2027-12-18T18:30:00+05:30", place: "The Backwater Lawns", dress: "", note: "" },
    { key: "reception", title: "Reception", start: "2027-12-18T19:00:00+05:30", end: "2027-12-18T23:00:00+05:30", place: "Harbour pavilion", dress: "", note: "" },
  ],
  story: "", storyLabel: "", photos: [], heroPhoto: "",
  credits: [], rsvp: { mode: "both", whatsapp: "", email: "", deadline: "", tickets: false, askCompany: false, maxParty: 6, askChildren: false },
  theme: { preset: "midnight", colors: { bg: "#101827", bgDeep: "#0a0f1a", ink: "#f4ecd8", inkDim: "#b8a888", accent: "#d9be82", accentDeep: "#8a6d1f" }, fonts: "newsreader-hanken", fireflies: false, layout: "invitation", watercolor: "none", bigAmpersand: false, photo: "none", scene: "none", background: "flat", dateStyle: "stacked", titleStyle: "default", frame: false, ornament: "none" },
  music: { source: "synth", url: "", youtubeId: "", youtubeStart: 0, credit: "" },
  texts: { eyebrow: "Together with their families", footerNote: "", sealText: "", crest: "", titleLead: "", title: "", titleJoin: "", verse: "", verseSource: "", dateTranslit: "", tagline: "", signature: "" },
  extras: { announcement: "", livestream: { url: "", label: "" }, gift: { title: "", note: "", upiId: "", upiName: "" }, hashtag: "", faq: [], party: [], hotels: [], travel: "", chapters: [], contacts: [] },
};

const { data: invite, error: invErr } = await admin.from("invites").insert({ owner_id: user.id, slug: "kevin-anu", event_type: "wedding", published: true, config }).select("id").single();
if (invErr) {
  console.log("invite insert failed:", invErr.message);
  process.exit(1);
}
const inviteId = invite.id;
console.log("invite:", inviteId);

const guestRows = Array.from({ length: 30 }, (_, i) => ({
  invite_id: inviteId, name: `Guest ${i + 1}`, phone: null, events: [],
  sent_at: i < 24 ? new Date().toISOString() : null,
  group_name: i % 2 ? "Groom's family" : "Bride's family",
  meal: i % 3 === 0 ? "vegetarian" : i % 3 === 1 ? "non-vegetarian" : "other",
  hotel: i < 10 ? "Harbour View Hotel" : null,
  transport: null,
}));
const { data: guests } = await admin.from("guests").insert(guestRows).select("id");
console.log("guests:", guests?.length);

const rsvpRows = guests.slice(0, 20).map((g, i) => ({
  invite_id: inviteId, guest_id: g.id, name: `Guest ${i + 1}`, attending: i < 15, party_size: 2, events: [], responses: {},
}));
await admin.from("rsvps").insert(rsvpRows);
console.log("rsvps:", rsvpRows.length);

const taskRows = [
  { invite_id: inviteId, title: "Finalize catering menu", category: "Catering", due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), done: false },
  { invite_id: inviteId, title: "Send RSVP reminder", category: "Guests", due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), done: false },
  { invite_id: inviteId, title: "Photography payment", category: "Budget", due_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), done: false },
  { invite_id: inviteId, title: "Book venue", category: "6 months before", due_date: null, done: true },
  { invite_id: inviteId, title: "Finalize guest list", category: "6 months before", due_date: null, done: true },
];
await admin.from("tasks").insert(taskRows);
console.log("tasks:", taskRows.length);

const expenseRows = [
  { invite_id: inviteId, category: "Venue", vendor: "The Backwater Lawns", quoted: 200000, paid: 150000 },
  { invite_id: inviteId, category: "Catering", vendor: "Malabar Kitchen", quoted: 140000, paid: 60000 },
  { invite_id: inviteId, category: "Photography", vendor: "Studio Lumiere", quoted: 120000, paid: 60000 },
  { invite_id: inviteId, category: "Decoration", vendor: "Petal & Palm", quoted: 60000, paid: 40000 },
];
await admin.from("expenses").insert(expenseRows);
console.log("expenses:", expenseRows.length);

const vendorRows = [
  { invite_id: inviteId, category: "Photographer", name: "Studio Lumiere", status: "Confirmed", quoted: 120000, paid: 60000 },
  { invite_id: inviteId, category: "Venue", name: "The Backwater Lawns", status: "Confirmed", quoted: 200000, paid: 150000 },
  { invite_id: inviteId, category: "Caterer", name: "Malabar Kitchen", status: "Confirmed", quoted: 140000, paid: 60000 },
  { invite_id: inviteId, category: "Makeup artist", name: "Glow by Tara", status: "Negotiating", quoted: 25000, paid: 0 },
  { invite_id: inviteId, category: "Florist", name: "Bloom Florist", status: "Shortlisted", quoted: 18000, paid: 0 },
];
await admin.from("vendors").insert(vendorRows);
console.log("vendors:", vendorRows.length);

console.log("\nDone. View at /dashboard/" + inviteId);
