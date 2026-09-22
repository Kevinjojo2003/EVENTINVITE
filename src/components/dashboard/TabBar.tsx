"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ListChecks, QrCode, Users, MessageSquare, Wallet } from "lucide-react";

// A bottom tab bar for one event's dashboard pages, shown on phones only (the app design's
// "one app, host mode" navigation). Desktop keeps the horizontal tab row in the layout above.
export function TabBar({ id, corporate }: { id: string; corporate: boolean }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/dashboard/${id}`, label: "Edit", icon: Calendar },
    { href: `/dashboard/${id}/guests`, label: "Guests", icon: Users },
    { href: `/dashboard/${id}/rsvps`, label: "Replies", icon: MessageSquare },
    { href: `/dashboard/${id}/checklist`, label: "Tasks", icon: ListChecks },
    { href: `/dashboard/${id}/budget`, label: "Budget", icon: Wallet },
    ...(corporate ? [{ href: `/dashboard/${id}/checkin`, label: "Scan", icon: QrCode }] : []),
  ];
  return (
    <nav
      aria-label="Event"
      className="fixed inset-x-0 bottom-0 z-40 flex md:hidden"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((t) => {
        const active = t.href === `/dashboard/${id}` ? pathname === t.href : pathname?.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium"
            style={{ minHeight: 54, color: active ? "var(--ink)" : "var(--ink-3)" }}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.6} />
            {t.label}
            <span aria-hidden="true" style={{ width: 4, height: 4, marginTop: -2, borderRadius: 999, background: active ? "var(--gold)" : "transparent" }} />
          </Link>
        );
      })}
    </nav>
  );
}
