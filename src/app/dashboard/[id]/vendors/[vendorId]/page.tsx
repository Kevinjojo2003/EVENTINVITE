import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorDetailClient } from "@/components/dashboard/VendorDetailClient";
import type { Vendor } from "@/lib/types";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string; vendorId: string }> }) {
  const { id, vendorId } = await params;
  const supabase = await createClient();
  const { data: vendor } = await supabase.from("vendors").select("*").eq("id", vendorId).eq("invite_id", id).maybeSingle();
  if (!vendor) notFound();
  return <VendorDetailClient inviteId={id} vendor={vendor as Vendor} />;
}
