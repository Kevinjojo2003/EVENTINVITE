import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorsClient } from "@/components/dashboard/VendorsClient";
import type { Vendor } from "@/lib/types";

export default async function VendorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: vendors } = await supabase.from("vendors").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  return <VendorsClient inviteId={id} vendors={(vendors ?? []) as Vendor[]} />;
}
