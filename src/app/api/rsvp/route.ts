import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { inviteUrl } from "@/lib/format";

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
  const { data: invite } = await db.from("invites").select("id, published").eq("slug", slug).maybeSingle();
  if (!invite || !invite.published) return NextResponse.json({ error: "This invitation is not live." }, { status: 404 });

  let guestId: string | null = null;
  if (guestToken) {
    const { data: g } = await db.from("guests").select("id").eq("invite_id", invite.id).eq("token", guestToken).maybeSingle();
    guestId = g?.id ?? null;
  }

  // One reply per personal link: a guest who replies twice updates their earlier reply.
  if (guestId) {
    const { data: existing } = await db.from("rsvps").select("id, ticket_code").eq("invite_id", invite.id).eq("guest_id", guestId).maybeSingle();
    if (existing) {
      const { error } = await db
        .from("rsvps")
        .update({ name, email, company, attending, party_size: partySize, events, note })
        .eq("id", existing.id);
      if (error) return NextResponse.json({ error: "Could not save your reply." }, { status: 500 });
      return NextResponse.json({ ok: true, ticketCode: existing.ticket_code, ticketUrl: `${inviteUrl(slug)}/ticket/${existing.ticket_code}` });
    }
  }

  const { data: row, error } = await db
    .from("rsvps")
    .insert({ invite_id: invite.id, guest_id: guestId, name, email, company, attending, party_size: partySize, events, note })
    .select("ticket_code")
    .single();
  if (error || !row) return NextResponse.json({ error: "Could not save your reply." }, { status: 500 });

  return NextResponse.json({ ok: true, ticketCode: row.ticket_code, ticketUrl: `${inviteUrl(slug)}/ticket/${row.ticket_code}` });
}
