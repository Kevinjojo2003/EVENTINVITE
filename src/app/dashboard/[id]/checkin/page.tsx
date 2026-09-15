import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Scanner } from "@/components/editor/Scanner";

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { count: total } = await supabase.from("rsvps").select("id", { count: "exact", head: true }).eq("invite_id", id).eq("attending", true);
  const { count: inside } = await supabase.from("rsvps").select("id", { count: "exact", head: true }).eq("invite_id", id).not("checked_in_at", "is", null);
  return <Scanner inviteId={id} expected={total ?? 0} checkedIn={inside ?? 0} />;
}
