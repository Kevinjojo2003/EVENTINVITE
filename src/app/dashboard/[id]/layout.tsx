import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TabBar } from "@/components/dashboard/TabBar";

export default async function InviteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, slug, event_type").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const corporate = inv.event_type === "corporate";
  const tabs = [
    { href: `/dashboard/${id}`, label: "Edit" },
    { href: `/dashboard/${id}/guests`, label: "Guests" },
    { href: `/dashboard/${id}/rsvps`, label: "RSVPs" },
    { href: `/dashboard/${id}/checklist`, label: "Checklist" },
    { href: `/dashboard/${id}/budget`, label: "Budget" },
    { href: `/dashboard/${id}/vendors`, label: "Vendors" },
    { href: `/dashboard/${id}/timeline`, label: "Timeline" },
    { href: `/dashboard/${id}/accommodation`, label: "Stay" },
    { href: `/dashboard/${id}/transport`, label: "Transport" },
    { href: `/dashboard/${id}/communication`, label: "Messages" },
    { href: `/dashboard/${id}/documents`, label: "Documents" },
    { href: `/dashboard/${id}/team`, label: "Team" },
    { href: `/dashboard/${id}/day`, label: "Event day" },
    // QR tickets and door check-in exist for corporate events only.
    ...(corporate ? [{ href: `/dashboard/${id}/checkin`, label: "Check-in" }] : []),
  ];
  return (
    <div>
      <div className="border-b bg-white" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-1 px-5 py-1 sm:px-8">
          <Link href="/dashboard" className="mr-3 py-2 text-sm" style={{ color: "var(--ink-2)" }}>
            ← All events
          </Link>
          {/* On a phone the same links live in the bottom tab bar; this row is desktop-only. */}
          <div className="hidden md:flex md:flex-wrap md:gap-1">
            {tabs.map((t) => (
              <Link key={t.href} href={t.href} className="px-3 py-2 text-sm hover:underline">
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="pb-[70px] md:pb-0">{children}</div>
      <TabBar id={id} />
    </div>
  );
}
