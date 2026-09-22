"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Mail, MoreHorizontal, Users, Home } from "lucide-react";

// Mobile bottom nav: Home / Guests / Plan / Invitation / More, matching the v3 spec exactly.
// Desktop/tablet use the sidebar instead (see layout.tsx).
export function TabBar({ id }: { id: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/dashboard/${id}`, label: "Home", icon: Home },
    { href: `/dashboard/${id}/guests`, label: "Guests", icon: Users },
    { href: `/dashboard/${id}/checklist`, label: "Plan", icon: Calendar },
    { href: `/dashboard/${id}/edit`, label: "Invitation", icon: Mail },
    { href: `/dashboard/${id}/more`, label: "More", icon: MoreHorizontal },
  ];
  return (
    <nav
      aria-label="Event"
      className="fixed inset-x-0 bottom-0 z-40 flex md:hidden"
      style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((t) => {
        const active = t.href === `/dashboard/${id}` ? pathname === t.href : pathname?.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px]"
            style={{ minHeight: 54, color: active ? "var(--ink)" : "var(--ink-3)", fontWeight: active ? 600 : 400 }}
          >
            <Icon size={21} strokeWidth={active ? 1.7 : 1.4} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
