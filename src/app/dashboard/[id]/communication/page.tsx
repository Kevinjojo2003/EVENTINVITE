import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommunicationClient } from "@/components/dashboard/CommunicationClient";
import { normalizeConfig, displayTitle } from "@/lib/themes";
import type { EventType, Guest } from "@/lib/types";

export default async function CommunicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, slug, event_type, config").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: guests } = await supabase.from("guests").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  const { data: rsvps } = await supabase.from("rsvps").select("guest_id, attending").eq("invite_id", id).not("guest_id", "is", null);
  const replied = new Map<string, boolean>();
  for (const r of rsvps ?? []) if (r.guest_id) replied.set(r.guest_id, r.attending);
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  return (
    <CommunicationClient
      inviteId={id}
      slug={inv.slug}
      title={displayTitle(c)}
      venue={c.venue.name}
      stay={c.venue.stay}
      guests={(guests ?? []) as Guest[]}
      replied={Object.fromEntries(replied)}
    />
  );
}
