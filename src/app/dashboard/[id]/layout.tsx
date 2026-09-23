import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TabBar } from "@/components/dashboard/TabBar";
import { displayTitle, normalizeConfig } from "@/lib/themes";
import { shortDate } from "@/lib/format";
import type { EventType } from "@/lib/types";

export default async function InviteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, event_type, config").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  const title = displayTitle(c) || "Untitled event";
  const dateLabel = shortDate(c.event.dateTime) || "Date not set";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--paper)" }}>
      <Sidebar id={id} title={title} dateLabel={dateLabel} />
      <div className="min-w-0 flex-1 pb-[70px] md:pb-0">{children}</div>
      <TabBar id={id} />
    </div>
  );
}
