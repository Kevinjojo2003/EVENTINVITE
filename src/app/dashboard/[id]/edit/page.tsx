import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Editor } from "@/components/editor/Editor";
import type { Invite } from "@/lib/types";

export default async function EditInvite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("invites").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <Editor invite={data as Invite} />;
}
