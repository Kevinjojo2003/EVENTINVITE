import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsClient } from "@/components/dashboard/DocumentsClient";
import type { EventDocument } from "@/lib/types";

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: docs } = await supabase.from("event_documents").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  return <DocumentsClient inviteId={id} docs={(docs ?? []) as EventDocument[]} />;
}
