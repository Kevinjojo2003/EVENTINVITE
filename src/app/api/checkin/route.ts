import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Owner-only: marks a ticket as checked in. Runs as the signed-in user, so RLS
// guarantees they can only touch RSVPs on their own invites.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const raw = String(body.code || "").trim();
  // Accept a bare code or a full ticket URL.
  const code = (raw.match(/([A-Z0-9]{6,12})\s*$/i)?.[1] ?? raw).toUpperCase();
  const inviteId = String(body.inviteId || "");
  if (!code || !inviteId) return NextResponse.json({ error: "Missing code." }, { status: 400 });

  const { data: r } = await supabase
    .from("rsvps")
    .select("id, name, company, party_size, attending, checked_in_at")
    .eq("invite_id", inviteId)
    .eq("ticket_code", code)
    .maybeSingle();
  if (!r) return NextResponse.json({ error: "No ticket with that code." }, { status: 404 });
  if (!r.attending) return NextResponse.json({ error: `${r.name} replied "not attending".`, rsvp: r }, { status: 409 });
  if (r.checked_in_at) return NextResponse.json({ error: `${r.name} already checked in at ${new Date(r.checked_in_at).toLocaleTimeString("en-IN")}.`, rsvp: r, duplicate: true }, { status: 409 });

  const { data: updated, error } = await supabase.from("rsvps").update({ checked_in_at: new Date().toISOString() }).eq("id", r.id).select("id, name, company, party_size, checked_in_at").single();
  if (error) return NextResponse.json({ error: "Could not check in." }, { status: 500 });
  return NextResponse.json({ ok: true, rsvp: updated });
}
