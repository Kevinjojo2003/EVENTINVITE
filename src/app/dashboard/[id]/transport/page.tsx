import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransportClient } from "@/components/dashboard/TransportClient";
import type { TransportItem } from "@/lib/types";

export default async function TransportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: rows } = await supabase.from("transport_items").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  return <TransportClient inviteId={id} rows={(rows ?? []) as TransportItem[]} />;
}
