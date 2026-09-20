"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { defaultConfig, normalizeConfig } from "@/lib/themes";
import { starterFromTemplate, templateByKey } from "@/lib/templates";
import { slugify } from "@/lib/format";
import type { EventType, InviteConfig } from "@/lib/types";

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
