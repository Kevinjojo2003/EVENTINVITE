"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { defaultConfig, normalizeConfig } from "@/lib/themes";
import { starterFromTemplate, templateByKey } from "@/lib/templates";
import { slugify } from "@/lib/format";
import { CHECKLIST_DEFAULTS, type EventType, type EventTeamMember, type InviteConfig } from "@/lib/types";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/;
const RESERVED = new Set(["www", "app", "api", "admin", "mail", "preview", "dashboard", "login", "templates", "privacy", "terms"]);

async function me() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createInvite(input: { type: EventType; name1: string; name2: string; slug: string; tradition?: string; language?: string; timezone?: string; template?: string }) {
  const { supabase, user } = await me();
  const slug = slugify(input.slug || [input.name1, input.name2].filter(Boolean).join("-"));
  if (!SLUG_RE.test(slug) || RESERVED.has(slug)) return { error: "Pick a web address with letters, numbers and hyphens, 3 to 50 characters." };
  // Starting from a template keeps its design (colours, crest, frame) and wording; the host's own names replace the sample ones.
  const tpl = input.template ? templateByKey(input.template) : undefined;
  const config = tpl
    ? { ...starterFromTemplate(tpl, input.name1.trim(), input.name2.trim()), event: { ...starterFromTemplate(tpl, "", "").event, timezone: input.timezone || tpl.timezone, language: input.language || tpl.language } }
    : defaultConfig(input.type, input.name1.trim(), input.name2.trim(), { tradition: input.tradition, language: input.language, timezone: input.timezone });
  const eventType: EventType = tpl ? tpl.type : input.type;
  const { data, error } = await supabase
    .from("invites")
    .insert({ owner_id: user.id, slug, event_type: eventType, config })
    .select("id")
    .single();
  if (error) return { error: error.code === "23505" ? "That address is taken. Try another." : error.message };
  redirect(`/dashboard/${data.id}/edit`);
}

export async function saveConfig(id: string, config: InviteConfig) {
  const { supabase } = await me();
  const clean = normalizeConfig(config, config.event.type);
  const { error } = await supabase.from("invites").update({ config: clean }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${id}`);
  revalidatePath(`/dashboard/${id}/edit`);
  return { ok: true };
}

export async function setPublished(id: string, published: boolean) {
  const { supabase } = await me();
  const { error } = await supabase.from("invites").update({ published }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${id}`);
  revalidatePath(`/dashboard/${id}/edit`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateSlug(id: string, raw: string) {
  const { supabase } = await me();
  const slug = slugify(raw);
  if (!SLUG_RE.test(slug) || RESERVED.has(slug)) return { error: "Letters, numbers and hyphens only, 3 to 50 characters." };
  const { error } = await supabase.from("invites").update({ slug }).eq("id", id);
  if (error) return { error: error.code === "23505" ? "That address is taken." : error.message };
  revalidatePath(`/dashboard/${id}`);
  revalidatePath(`/dashboard/${id}/edit`);
  return { ok: true, slug };
}

export async function deleteInvite(id: string) {
  const { supabase } = await me();
  await supabase.from("invites").delete().eq("id", id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function addGuests(inviteId: string, rows: { name: string; phone: string; events?: string[] }[]) {
  const { supabase } = await me();
  const clean = rows
    .map((r) => ({ invite_id: inviteId, name: r.name.trim().slice(0, 120), phone: r.phone.replace(/[^\d]/g, "").slice(0, 15) || null, events: (r.events ?? []).slice(0, 30).map(String) }))
    .filter((r) => r.name.length > 0);
  if (!clean.length) return { error: "Nothing to add." };
  let { error } = await supabase.from("guests").insert(clean);
  // Before the multi-event migration the events column does not exist: add the guests without it.
  if (error && /events/.test(error.message)) ({ error } = await supabase.from("guests").insert(clean.map(({ events: _e, ...rest }) => rest)));
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${inviteId}/guests`);
  return { ok: true, count: clean.length };
}

// Which ceremonies a guest is invited to. An empty list means all of them.
export async function setGuestEvents(inviteId: string, guestId: string, events: string[]) {
  const { supabase } = await me();
  const { error } = await supabase.from("guests").update({ events: events.slice(0, 30).map(String) }).eq("id", guestId).eq("invite_id", inviteId);
  if (error) return { error: /events/.test(error.message) ? "Run supabase/migrations/0002_multi_event.sql in Supabase first." : error.message };
  revalidatePath(`/dashboard/${inviteId}/guests`);
  return { ok: true };
}

export async function deleteGuest(inviteId: string, guestId: string) {
  const { supabase } = await me();
  await supabase.from("guests").delete().eq("id", guestId);
  revalidatePath(`/dashboard/${inviteId}/guests`);
  return { ok: true };
}

export async function markSent(inviteId: string, guestId: string) {
  const { supabase } = await me();
  await supabase.from("guests").update({ sent_at: new Date().toISOString() }).eq("id", guestId);
  revalidatePath(`/dashboard/${inviteId}/guests`);
  return { ok: true };
}

export async function deleteRsvp(inviteId: string, rsvpId: string): Promise<void> {
  const { supabase } = await me();
  await supabase.from("rsvps").delete().eq("id", rsvpId);
  revalidatePath(`/dashboard/${inviteId}/rsvps`);
}

function needsMigration(error: { message: string; code?: string }) {
  // Postgres 42P01 = relation does not exist, 42703 = column does not exist.
  return error.code === "42P01" || error.code === "42703" ? "Run supabase/migrations/0004_planner.sql in Supabase first." : error.message;
}

export async function updateGuestDetails(inviteId: string, guestId: string, fields: { group_name?: string; meal?: string; hotel?: string; transport?: string }) {
  const { supabase } = await me();
  const clean = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, (v ?? "").trim().slice(0, 200) || null]));
  const { error } = await supabase.from("guests").update(clean).eq("id", guestId).eq("invite_id", inviteId);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/guests`);
  return { ok: true };
}

export async function seedChecklist(inviteId: string) {
  const { supabase } = await me();
  const { count } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("invite_id", inviteId);
  if (count && count > 0) return { ok: true, count: 0 };
  const rows = CHECKLIST_DEFAULTS.flatMap((p) => p.items.map((title) => ({ invite_id: inviteId, title, category: p.phase })));
  const { error } = await supabase.from("tasks").insert(rows);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/checklist`);
  return { ok: true, count: rows.length };
}

export async function addTask(inviteId: string, input: { title: string; category?: string; due_date?: string | null; assignee?: string; priority?: string }) {
  const { supabase } = await me();
  const title = input.title.trim().slice(0, 160);
  if (!title) return { error: "Give the task a name." };
  const { error } = await supabase.from("tasks").insert({
    invite_id: inviteId,
    title,
    category: input.category?.trim().slice(0, 60) || "General",
    due_date: input.due_date || null,
    assignee: input.assignee?.trim().slice(0, 80) || null,
    priority: input.priority || "medium",
  });
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/checklist`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setTaskDone(inviteId: string, taskId: string, done: boolean) {
  const { supabase } = await me();
  const { error } = await supabase.from("tasks").update({ done }).eq("id", taskId).eq("invite_id", inviteId);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/checklist`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTask(inviteId: string, taskId: string, fields: Partial<{ title: string; category: string; due_date: string | null; assignee: string; priority: string }>) {
  const { supabase } = await me();
  const clean: Record<string, unknown> = {};
  if (fields.title !== undefined) clean.title = fields.title.trim().slice(0, 160);
  if (fields.category !== undefined) clean.category = fields.category.trim().slice(0, 60) || "General";
  if (fields.due_date !== undefined) clean.due_date = fields.due_date || null;
  if (fields.assignee !== undefined) clean.assignee = fields.assignee.trim().slice(0, 80) || null;
  if (fields.priority !== undefined) clean.priority = fields.priority;
  const { error } = await supabase.from("tasks").update(clean).eq("id", taskId).eq("invite_id", inviteId);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/checklist`);
  return { ok: true };
}

export async function deleteTask(inviteId: string, taskId: string) {
  const { supabase } = await me();
  await supabase.from("tasks").delete().eq("id", taskId).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/checklist`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function addExpense(inviteId: string, input: { category: string; vendor: string; quoted: number; paid: number; due_date?: string | null; note?: string }) {
  const { supabase } = await me();
  const row = {
    invite_id: inviteId,
    category: input.category.trim().slice(0, 60) || "Miscellaneous",
    vendor: input.vendor.trim().slice(0, 120),
    quoted: Math.max(0, Number(input.quoted) || 0),
    paid: Math.max(0, Number(input.paid) || 0),
    due_date: input.due_date || null,
    note: input.note?.trim().slice(0, 400) || null,
  };
  const { error } = await supabase.from("expenses").insert(row);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/budget`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateExpense(inviteId: string, expenseId: string, fields: Partial<{ category: string; vendor: string; quoted: number; paid: number; due_date: string | null; note: string }>) {
  const { supabase } = await me();
  const clean: Record<string, unknown> = {};
  if (fields.category !== undefined) clean.category = fields.category.trim().slice(0, 60);
  if (fields.vendor !== undefined) clean.vendor = fields.vendor.trim().slice(0, 120);
  if (fields.quoted !== undefined) clean.quoted = Math.max(0, Number(fields.quoted) || 0);
  if (fields.paid !== undefined) clean.paid = Math.max(0, Number(fields.paid) || 0);
  if (fields.due_date !== undefined) clean.due_date = fields.due_date || null;
  if (fields.note !== undefined) clean.note = fields.note.trim().slice(0, 400) || null;
  const { error } = await supabase.from("expenses").update(clean).eq("id", expenseId).eq("invite_id", inviteId);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/budget`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteExpense(inviteId: string, expenseId: string) {
  const { supabase } = await me();
  await supabase.from("expenses").delete().eq("id", expenseId).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/budget`);
  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------- vendors ----------
export async function addVendor(inviteId: string, input: { category: string; name: string; contact_name?: string; contact_phone?: string; contact_email?: string; quoted?: number; paid?: number; status?: string; note?: string }) {
  const { supabase } = await me();
  const row = {
    invite_id: inviteId,
    category: input.category.trim().slice(0, 60) || "Other",
    name: input.name.trim().slice(0, 160),
    contact_name: input.contact_name?.trim().slice(0, 120) || null,
    contact_phone: input.contact_phone?.replace(/[^\d+]/g, "").slice(0, 20) || null,
    contact_email: input.contact_email?.trim().slice(0, 160) || null,
    quoted: Math.max(0, Number(input.quoted) || 0),
    paid: Math.max(0, Number(input.paid) || 0),
    status: input.status || "Shortlisted",
    note: input.note?.trim().slice(0, 400) || null,
  };
  if (!row.name) return { error: "Give the vendor a name." };
  const { error } = await supabase.from("vendors").insert(row);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/vendors`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateVendor(inviteId: string, vendorId: string, fields: Partial<{ category: string; name: string; contact_name: string; contact_phone: string; contact_email: string; quoted: number; paid: number; status: string; arrived: boolean; note: string }>) {
  const { supabase } = await me();
  const clean: Record<string, unknown> = {};
  if (fields.category !== undefined) clean.category = fields.category.trim().slice(0, 60);
  if (fields.name !== undefined) clean.name = fields.name.trim().slice(0, 160);
  if (fields.contact_name !== undefined) clean.contact_name = fields.contact_name.trim().slice(0, 120) || null;
  if (fields.contact_phone !== undefined) clean.contact_phone = fields.contact_phone.replace(/[^\d+]/g, "").slice(0, 20) || null;
  if (fields.contact_email !== undefined) clean.contact_email = fields.contact_email.trim().slice(0, 160) || null;
  if (fields.quoted !== undefined) clean.quoted = Math.max(0, Number(fields.quoted) || 0);
  if (fields.paid !== undefined) clean.paid = Math.max(0, Number(fields.paid) || 0);
  if (fields.status !== undefined) clean.status = fields.status;
  if (fields.arrived !== undefined) clean.arrived = fields.arrived;
  if (fields.note !== undefined) clean.note = fields.note.trim().slice(0, 400) || null;
  const { error } = await supabase.from("vendors").update(clean).eq("id", vendorId).eq("invite_id", inviteId);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/vendors`);
  revalidatePath(`/dashboard/${inviteId}/day`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteVendor(inviteId: string, vendorId: string) {
  const { supabase } = await me();
  await supabase.from("vendors").delete().eq("id", vendorId).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/vendors`);
  return { ok: true };
}

// ---------- timeline ----------
export async function addTimelineItem(inviteId: string, input: { title: string; starts_at?: string | null; note?: string; location?: string; assignee?: string; vendor?: string }) {
  const { supabase } = await me();
  const title = input.title.trim().slice(0, 160);
  if (!title) return { error: "Give the moment a name." };
  const { count } = await supabase.from("timeline_items").select("id", { count: "exact", head: true }).eq("invite_id", inviteId);
  const { error } = await supabase.from("timeline_items").insert({
    invite_id: inviteId,
    title,
    starts_at: input.starts_at || null,
    note: input.note?.trim().slice(0, 300) || null,
    location: input.location?.trim().slice(0, 160) || null,
    assignee: input.assignee?.trim().slice(0, 80) || null,
    vendor: input.vendor?.trim().slice(0, 120) || null,
    sort_order: count ?? 0,
  });
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/timeline`);
  revalidatePath(`/dashboard/${inviteId}/day`);
  return { ok: true };
}

export async function updateTimelineItem(
  inviteId: string,
  itemId: string,
  fields: Partial<{ title: string; starts_at: string | null; note: string; location: string; assignee: string; vendor: string; show_on_website: boolean }>,
) {
  const { supabase } = await me();
  const clean: Record<string, unknown> = {};
  if (fields.title !== undefined) clean.title = fields.title.trim().slice(0, 160);
  if (fields.starts_at !== undefined) clean.starts_at = fields.starts_at || null;
  if (fields.note !== undefined) clean.note = fields.note.trim().slice(0, 300) || null;
  if (fields.location !== undefined) clean.location = fields.location.trim().slice(0, 160) || null;
  if (fields.assignee !== undefined) clean.assignee = fields.assignee.trim().slice(0, 80) || null;
  if (fields.vendor !== undefined) clean.vendor = fields.vendor.trim().slice(0, 120) || null;
  if (fields.show_on_website !== undefined) clean.show_on_website = fields.show_on_website;
  const { error } = await supabase.from("timeline_items").update(clean).eq("id", itemId).eq("invite_id", inviteId);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/timeline`);
  revalidatePath(`/dashboard/${inviteId}/day`);
  return { ok: true };
}

export async function reorderTimelineItems(inviteId: string, orderedIds: string[]) {
  const { supabase } = await me();
  await Promise.all(orderedIds.map((id, i) => supabase.from("timeline_items").update({ sort_order: i }).eq("id", id).eq("invite_id", inviteId)));
  revalidatePath(`/dashboard/${inviteId}/timeline`);
  return { ok: true };
}

export async function deleteTimelineItem(inviteId: string, itemId: string) {
  const { supabase } = await me();
  await supabase.from("timeline_items").delete().eq("id", itemId).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/timeline`);
  revalidatePath(`/dashboard/${inviteId}/day`);
  return { ok: true };
}

// ---------- accommodation ----------
export async function addAccommodation(inviteId: string, input: { hotel_name: string; rooms_booked?: number; guests_count?: number; check_in?: string | null; check_out?: string | null; payment_status?: string; note?: string }) {
  const { supabase } = await me();
  const hotel_name = input.hotel_name.trim().slice(0, 160);
  if (!hotel_name) return { error: "Give the hotel a name." };
  const { error } = await supabase.from("accommodations").insert({
    invite_id: inviteId,
    hotel_name,
    rooms_booked: Math.max(0, Number(input.rooms_booked) || 0),
    guests_count: Math.max(0, Number(input.guests_count) || 0),
    check_in: input.check_in || null,
    check_out: input.check_out || null,
    payment_status: input.payment_status || "Pending",
    note: input.note?.trim().slice(0, 400) || null,
  });
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/accommodation`);
  return { ok: true };
}

export async function deleteAccommodation(inviteId: string, id: string) {
  const { supabase } = await me();
  await supabase.from("accommodations").delete().eq("id", id).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/accommodation`);
  return { ok: true };
}

// ---------- transport ----------
export async function addTransportItem(inviteId: string, input: { title: string; mode?: string; details?: string; guests_count?: number; time_note?: string }) {
  const { supabase } = await me();
  const title = input.title.trim().slice(0, 160);
  if (!title) return { error: "Give this trip a name." };
  const { error } = await supabase.from("transport_items").insert({
    invite_id: inviteId,
    title,
    mode: input.mode?.trim().slice(0, 40) || "Vehicle",
    details: input.details?.trim().slice(0, 300) || null,
    guests_count: Math.max(0, Number(input.guests_count) || 0),
    time_note: input.time_note?.trim().slice(0, 120) || null,
  });
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/transport`);
  return { ok: true };
}

export async function deleteTransportItem(inviteId: string, id: string) {
  const { supabase } = await me();
  await supabase.from("transport_items").delete().eq("id", id).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/transport`);
  return { ok: true };
}

// ---------- documents ----------
export async function addDocument(inviteId: string, input: { title: string; category: string; file_url: string; file_name: string }) {
  const { supabase } = await me();
  const title = input.title.trim().slice(0, 160);
  if (!title || !input.file_url) return { error: "Missing file." };
  const { error } = await supabase.from("event_documents").insert({ invite_id: inviteId, title, category: input.category || "Other", file_url: input.file_url, file_name: input.file_name.slice(0, 200) });
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/documents`);
  return { ok: true };
}

export async function deleteDocument(inviteId: string, id: string, path: string) {
  const { supabase } = await me();
  await supabase.storage.from("documents").remove([path]);
  await supabase.from("event_documents").delete().eq("id", id).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/documents`);
  return { ok: true };
}

// ---------- event team ----------
export async function inviteTeamMember(inviteId: string, email: string, role: EventTeamMember["role"]) {
  const { supabase } = await me();
  const clean = email.trim().toLowerCase().slice(0, 200);
  if (!/^\S+@\S+\.\S+$/.test(clean)) return { error: "Enter a valid email." };
  const { error } = await supabase.from("event_team").insert({ invite_id: inviteId, email: clean, role });
  if (error) return { error: error.code === "23505" ? "Already invited." : needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/team`);
  return { ok: true };
}

export async function removeTeamMember(inviteId: string, id: string) {
  const { supabase } = await me();
  await supabase.from("event_team").delete().eq("id", id).eq("invite_id", inviteId);
  revalidatePath(`/dashboard/${inviteId}/team`);
  return { ok: true };
}

// ---------- event day ----------
export async function setCheckedIn(inviteId: string, rsvpId: string, checked: boolean) {
  const { supabase } = await me();
  const { error } = await supabase.from("rsvps").update({ checked_in_at: checked ? new Date().toISOString() : null }).eq("id", rsvpId).eq("invite_id", inviteId);
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/day`);
  return { ok: true };
}

// ---------- plan notes ----------
export async function saveNote(inviteId: string, body: string) {
  const { supabase } = await me();
  const { error } = await supabase.from("event_notes").upsert({ invite_id: inviteId, body: body.slice(0, 20000), updated_at: new Date().toISOString() });
  if (error) return { error: needsMigration(error) };
  revalidatePath(`/dashboard/${inviteId}/notes`);
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
