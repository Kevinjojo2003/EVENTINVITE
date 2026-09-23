import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestsClient } from "@/components/editor/GuestsClient";
import { normalizeConfig, displayTitle } from "@/lib/themes";
import type { EventType, Guest, Rsvp } from "@/lib/types";

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, slug, event_type, config, published").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: guests } = await supabase.from("guests").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  const { data: rsvps } = await supabase.from("rsvps").select("*").eq("invite_id", id).not("guest_id", "is", null);
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  return (
    <GuestsClient
      inviteId={id}
      slug={inv.slug}
      published={inv.published}
      title={displayTitle(c)}
      guests={(guests ?? []) as Guest[]}
      rsvps={(rsvps ?? []) as Rsvp[]}
      headline={c.event.headline}
      schedule={c.schedule.map((e) => ({ key: e.key, title: e.title }))}
    />
  );
}
