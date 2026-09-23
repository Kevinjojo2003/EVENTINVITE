import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TimelineClient } from "@/components/dashboard/TimelineClient";
import type { TimelineItem } from "@/lib/types";

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: items } = await supabase.from("timeline_items").select("*").eq("invite_id", id).order("sort_order", { ascending: true });
  return <TimelineClient inviteId={id} items={(items ?? []) as TimelineItem[]} />;
}
