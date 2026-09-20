import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { inviteUrl } from "@/lib/format";
import { normalizeConfig } from "@/lib/themes";
import type { EventReply, EventType } from "@/lib/types";
import { allow, clientIp } from "@/lib/ratelimit";

const HOUR = 60 * 60 * 1000;
const MAX_REPLIES_PER_INVITE = 1500;

// Public endpoint: guests are not signed in, so this runs with the service role and
// checks everything itself.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const slug = String(body.slug || "").toLowerCase();

  // Abuse checks, cheapest first. A bot that fills the hidden field, or submits faster than a person can,
  // gets a quiet success so it learns nothing; a real person who trips a limit gets a clear message.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });
  const startedAt = Number(body.startedAt) || 0;
  if (startedAt && Date.now() - startedAt < 2500) return NextResponse.json({ error: "That was quick. Please check your reply and send it again." }, { status: 429 });
  const ip = clientIp(req);
  if (!allow(`rsvp:${ip}:${slug}`, 8, HOUR) || !allow(`rsvp:${ip}`, 40, HOUR)) {
    return NextResponse.json({ error: "You have sent several replies already. If this is a mistake, please message the hosts directly." }, { status: 429 });
  }

  const name = String(body.name || "").trim().slice(0, 120);
  const attending = body.attending === true;
  const partySize = Math.max(0, Math.min(20, Number(body.partySize) || 0));
  const events = Array.isArray(body.events) ? body.events.map(String).slice(0, 20) : [];
  const note = body.note ? String(body.note).slice(0, 1000) : null;
  const email = body.email ? String(body.email).slice(0, 200) : null;
  const company = body.company ? String(body.company).slice(0, 200) : null;
  const guestToken = body.guestToken ? String(body.guestToken) : null;

  if (!slug || name.length < 2) return NextResponse.json({ error: "Please add your name." }, { status: 400 });

  const db = createAdminClient();
  const { data: invite } = await db.from("invites").select("id, published, event_type, config").eq("slug", slug).maybeSingle();
  if (!invite || !invite.published) return NextResponse.json({ error: "This invitation is not live." }, { status: 404 });

  // Cap the total number of replies an invitation can collect.
  const { count: existingCount } = await db.from("rsvps").select("id", { count: "exact", head: true }).eq("invite_id", invite.id);
  if ((existingCount ?? 0) >= MAX_REPLIES_PER_INVITE) return NextResponse.json({ error: "This invitation is not taking more replies online. Please message the hosts." }, { status: 429 });

  let guestId: string | null = null;
  let guestEvents: string[] = [];
  if (guestToken) {
    const { data: g } = await db.from("guests").select("*").eq("invite_id", invite.id).eq("token", guestToken).maybeSingle();
    guestId = g?.id ?? null;
    guestEvents = Array.isArray(g?.events) ? g.events : [];
  }

  // Per-ceremony answers. Only ceremonies this guest is invited to are accepted, and counts are clamped.
  const cfg = normalizeConfig(invite.config, invite.event_type as EventType);
  const allowed = new Set(cfg.schedule.map((e) => e.key).filter((k) => guestEvents.length === 0 || guestEvents.includes(k)));
  const num = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
  const responses: Record<string, EventReply> = {};
  const raw = body.responses && typeof body.responses === "object" ? (body.responses as Record<string, Record<string, unknown>>) : {};
  for (const key of allowed) {
    const r = raw[key];
    if (!r) continue;
    const yes = attending && r.attending === true;
    responses[key] = yes ? { attending: true, adults: Math.max(1, num(r.adults, 20)), children: num(r.children, 20), infants: num(r.infants, 20) } : { attending: false, adults: 0, children: 0, infants: 0 };
  }
  const hasResponses = Object.keys(responses).length > 0;
  const attendedKeys = hasResponses ? Object.keys(responses).filter((k) => responses[k].attending) : events.filter((k) => allowed.has(k));
  const isAttending = hasResponses ? attendedKeys.length > 0 : attending;
  const people = hasResponses ? Math.max(0, ...attendedKeys.map((k) => responses[k].adults + responses[k].children)) : partySize;
  const record = { name, email, company, attending: isAttending, party_size: Math.min(20, people), events: attendedKeys, note };

  // One reply per personal link: a guest who replies twice updates their earlier reply.
  if (guestId) {
    const { data: existing } = await db.from("rsvps").select("id, ticket_code").eq("invite_id", invite.id).eq("guest_id", guestId).maybeSingle();
    if (existing) {
      let { error } = await db.from("rsvps").update({ ...record, responses }).eq("id", existing.id);
      // Until the multi-event migration has been run the column does not exist: save without it.
      if (error && /responses/.test(error.message)) ({ error } = await db.from("rsvps").update(record).eq("id", existing.id));
      if (error) return NextResponse.json({ error: "Could not save your reply." }, { status: 500 });
      return NextResponse.json({ ok: true, ticketCode: existing.ticket_code, ticketUrl: `${inviteUrl(slug)}/ticket/${existing.ticket_code}` });
    }
  }

  let ins = await db.from("rsvps").insert({ invite_id: invite.id, guest_id: guestId, ...record, responses }).select("ticket_code").single();
  if (ins.error && /responses/.test(ins.error.message)) ins = await db.from("rsvps").insert({ invite_id: invite.id, guest_id: guestId, ...record }).select("ticket_code").single();
  const row = ins.data;
  const error = ins.error;
  if (error || !row) return NextResponse.json({ error: "Could not save your reply." }, { status: 500 });

  return NextResponse.json({ ok: true, ticketCode: row.ticket_code, ticketUrl: `${inviteUrl(slug)}/ticket/${row.ticket_code}` });
}

// A guest withdraws their own reply. The reply's ticket code is the proof: only the person who sent it has it.
export async function DELETE(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const slug = String(body.slug || "").toLowerCase();
  const code = String(body.code || "").toUpperCase();
  if (!slug || !/^[A-Z0-9]{6,16}$/.test(code)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (!allow(`rsvp-del:${clientIp(req)}`, 20, HOUR)) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  const db = createAdminClient();
  const { data: invite } = await db.from("invites").select("id").eq("slug", slug).maybeSingle();
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { error } = await db.from("rsvps").delete().eq("invite_id", invite.id).eq("ticket_code", code);
  if (error) return NextResponse.json({ error: "Could not delete your reply." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
