"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Calendar, FileText, Home, LayoutGrid, Mail, Settings, Sparkles, Users, Users2, Wallet } from "lucide-react";

const NAV = [
  { key: "overview", icon: Home, label: "Overview", href: (id: string) => `/dashboard/${id}` },
  { key: "checklist", icon: Calendar, label: "Plan", href: (id: string) => `/dashboard/${id}/checklist` },
  { key: "guests", icon: Users, label: "Guests", href: (id: string) => `/dashboard/${id}/guests` },
  { key: "budget", icon: Wallet, label: "Budget", href: (id: string) => `/dashboard/${id}/budget` },
  { key: "vendors", icon: Building2, label: "Vendors", href: (id: string) => `/dashboard/${id}/vendors` },
  { key: "edit", icon: Mail, label: "Invitation", href: (id: string) => `/dashboard/${id}/edit` },
  { key: "day", icon: Sparkles, label: "Event Day", href: (id: string) => `/dashboard/${id}/day` },
];

const SECONDARY = [
  { key: "documents", icon: FileText, label: "Files", href: (id: string) => `/dashboard/${id}/documents` },
  { key: "team", icon: Users2, label: "Team", href: (id: string) => `/dashboard/${id}/team` },
];

export function Sidebar({ id, title, dateLabel }: { id: string; title: string; dateLabel: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === `/dashboard/${id}` ? pathname === href : pathname?.startsWith(href));

  const item = (n: { key: string; icon: typeof Home; label: string; href: (id: string) => string }) => {
    const href = n.href(id);
    const on = isActive(href);
    const Icon = n.icon;
    return (
      <Link
        key={n.key}
        href={href}
        aria-current={on ? "page" : undefined}
        title={n.label}
        className="flex min-h-[38px] items-center gap-3 rounded-[6px] px-3 text-sm xl:px-3"
        style={{ background: on ? "var(--paper-2)" : "transparent", color: on ? "var(--ink)" : "var(--ink-3)", fontWeight: on ? 500 : 400 }}
      >
        <Icon size={17} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
        <span className="hidden xl:inline">{n.label}</span>
      </Link>
    );
  };

  return (
    <aside aria-label="Main" className="hidden shrink-0 flex-col border-r px-2.5 py-[22px] md:flex md:w-[72px] xl:w-[236px] xl:px-4" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
      <Link href="/" className="m-dis px-0 text-xl xl:px-3 xl:text-[23px]" style={{ textAlign: "center" }}>
        <span className="xl:hidden">K</span>
        <span className="hidden xl:inline">{process.env.NEXT_PUBLIC_APP_NAME || "K-Invites"}</span>
      </Link>

      <Link
        href="/dashboard"
        className="mt-[22px] flex min-h-[38px] items-center justify-center gap-3 rounded-[6px] px-3 text-sm xl:justify-start"
        style={{ color: pathname === "/dashboard" ? "var(--ink)" : "var(--ink-3)" }}
      >
        <LayoutGrid size={17} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
        <span className="hidden xl:inline">My Events</span>
      </Link>

      <div className="my-3 hidden h-px xl:block" style={{ background: "var(--line)" }} />
      <div className="my-3 h-px xl:hidden" style={{ background: "var(--line)" }} />

      <div className="hidden xl:block">
        <p className="m-eyebrow px-3 pb-2.5 text-[10px]">Current event</p>
        <Link href={`/dashboard/${id}`} aria-label="Switch event" className="mb-3 flex items-center gap-2.5 rounded-[8px] border px-2.5 py-2" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
          <span className="h-[34px] w-[34px] shrink-0 rounded-[4px]" style={{ background: "linear-gradient(160deg,#cfd8cf,#8fa293)" }} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="m-dis block truncate text-[17px] leading-tight">{title}</span>
            <span className="block truncate text-[11.5px]" style={{ color: "var(--ink-3)" }}>
              {dateLabel}
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5">{NAV.map(item)}</nav>

      <div className="my-3.5 h-px" style={{ background: "var(--line)" }} />
      <div className="flex flex-col gap-0.5">{SECONDARY.map(item)}</div>

      <div className="mt-auto flex flex-col gap-0.5">
        <Link href={`/dashboard/${id}/edit`} className="flex min-h-[38px] items-center justify-center gap-3 rounded-[6px] px-3 text-sm xl:justify-start" style={{ color: "var(--ink-3)" }}>
          <Settings size={17} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
          <span className="hidden xl:inline">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
