import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChecklistClient } from "@/components/dashboard/ChecklistClient";
import type { Task } from "@/lib/types";

export default async function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const { data: tasks } = await supabase.from("tasks").select("*").eq("invite_id", id).order("due_date", { ascending: true, nullsFirst: false });
  return <ChecklistClient inviteId={id} tasks={(tasks ?? []) as Task[]} />;
}
