import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Building2, Calendar, FileText, Hotel, MessageSquare, MessagesSquare, QrCode, Radio, Truck, Users2, Wallet } from "lucide-react";

export default async function MorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, event_type").eq("id", id).maybeSingle();
  if (!inv) notFound();

  const items = [
    ...(inv.event_type === "corporate" ? [{ href: `/dashboard/${id}/checkin`, label: "Scan tickets", note: "Check guests in at the door", icon: QrCode }] : []),
    { href: `/dashboard/${id}/rsvps`, label: "Replies", note: "Who's coming, who isn't", icon: MessageSquare },
    { href: `/dashboard/${id}/budget`, label: "Budget", note: "Spent, committed, remaining", icon: Wallet },
    { href: `/dashboard/${id}/vendors`, label: "Vendors", note: "Contacts, quotes, payment status", icon: Building2 },
    { href: `/dashboard/${id}/timeline`, label: "Timeline", note: "The run of show for the day", icon: Calendar },
    { href: `/dashboard/${id}/accommodation`, label: "Accommodation", note: "Hotels, rooms, check-in dates", icon: Hotel },
    { href: `/dashboard/${id}/transport`, label: "Transport", note: "Pickups, shuttles, drivers", icon: Truck },
    { href: `/dashboard/${id}/communication`, label: "Messages", note: "Reminders and updates for guests", icon: MessagesSquare },
    { href: `/dashboard/${id}/documents`, label: "Documents", note: "Contracts, invoices, lists", icon: FileText },
    { href: `/dashboard/${id}/team`, label: "Event team", note: "Let others help manage this event", icon: Users2 },
    { href: `/dashboard/${id}/day`, label: "Event day", note: "Live status on the day itself", icon: Radio },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">More</h1>
      <ul className="card mt-6 divide-y" style={{ borderColor: "var(--line)" }}>
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="flex items-center gap-4 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--paper-2)", color: "var(--gold-ink)" }}>
                <it.icon size={18} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">{it.label}</span>
                <span className="block truncate text-[13px]" style={{ color: "var(--ink-3)" }}>
                  {it.note}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
