import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetClient } from "@/components/dashboard/BudgetClient";
import type { Expense } from "@/lib/types";

export default async function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: expenses } = await supabase.from("expenses").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  return <BudgetClient inviteId={id} expenses={(expenses ?? []) as Expense[]} />;
}
