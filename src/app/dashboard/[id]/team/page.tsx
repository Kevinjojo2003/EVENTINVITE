import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamClient } from "@/components/dashboard/TeamClient";
import type { EventTeamMember } from "@/lib/types";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, owner_id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === inv.owner_id;
  const { data: team } = await supabase.from("event_team").select("*").eq("invite_id", id).order("invited_at", { ascending: false });
  return <TeamClient inviteId={id} isOwner={isOwner} members={(team ?? []) as EventTeamMember[]} />;
}
