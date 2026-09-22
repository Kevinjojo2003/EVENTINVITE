"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { defaultConfig, normalizeConfig } from "@/lib/themes";
import { starterFromTemplate, templateByKey } from "@/lib/templates";
import { slugify } from "@/lib/format";
import { CHECKLIST_DEFAULTS, type EventType, type InviteConfig } from "@/lib/types";

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
  redirect(`/dashboard/${data.id}`);
}

export async function saveConfig(id: string, config: InviteConfig) {
  const { supabase } = await me();
  const clean = normalizeConfig(config, config.event.type);
  const { error } = await supabase.from("invites").update({ config: clean }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${id}`);
  return { ok: true };
}

export async function setPublished(id: string, published: boolean) {
  const { supabase } = await me();
  const { error } = await supabase.from("invites").update({ published }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${id}`);
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

export async function addTask(inviteId: string, input: { title: string; category?: string; due_date?: string | null }) {
  const { supabase } = await me();
  const title = input.title.trim().slice(0, 160);
  if (!title) return { error: "Give the task a name." };
  const { error } = await supabase.from("tasks").insert({ invite_id: inviteId, title, category: input.category?.trim().slice(0, 60) || "General", due_date: input.due_date || null });
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
