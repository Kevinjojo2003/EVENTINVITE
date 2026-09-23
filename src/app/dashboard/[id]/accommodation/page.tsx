import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccommodationClient } from "@/components/dashboard/AccommodationClient";
import type { Accommodation } from "@/lib/types";

export default async function AccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: rows } = await supabase.from("accommodations").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  return <AccommodationClient inviteId={id} rows={(rows ?? []) as Accommodation[]} />;
}
