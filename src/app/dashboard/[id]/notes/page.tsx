import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotesClient } from "@/components/dashboard/NotesClient";

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: note } = await supabase.from("event_notes").select("body").eq("invite_id", id).maybeSingle();
  return <NotesClient inviteId={id} initialBody={note?.body ?? ""} />;
}
