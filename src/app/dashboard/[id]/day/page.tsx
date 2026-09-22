import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventDayClient } from "@/components/dashboard/EventDayClient";
import { normalizeConfig, displayTitle } from "@/lib/themes";
import type { EventType, Rsvp, TimelineItem, Vendor } from "@/lib/types";

export default async function EventDayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, event_type, config").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const [rsvpsRes, vendorsRes, timelineRes] = await Promise.all([
    supabase.from("rsvps").select("*").eq("invite_id", id).eq("attending", true),
    supabase.from("vendors").select("*").eq("invite_id", id),
    supabase.from("timeline_items").select("*").eq("invite_id", id).order("sort_order", { ascending: true }),
  ]);
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  return (
    <EventDayClient
      inviteId={id}
      title={displayTitle(c)}
      dateTime={c.event.dateTime}
      rsvps={(rsvpsRes.data ?? []) as Rsvp[]}
      vendors={(vendorsRes.data ?? []) as Vendor[]}
      timeline={(timelineRes.data ?? []) as TimelineItem[]}
    />
  );
}
