"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PlanNav({ id }: { id: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/dashboard/${id}`, label: "Overview" },
    { href: `/dashboard/${id}/checklist`, label: "Checklist" },
    { href: `/dashboard/${id}/timeline`, label: "Timeline" },
    { href: `/dashboard/${id}/notes`, label: "Notes" },
  ];
  return (
    <div className="mt-5 flex gap-6 border-b" style={{ borderColor: "var(--line)" }}>
      {tabs.map((t) => {
        const on = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="pb-3 text-sm"
            style={{ color: on ? "var(--ink)" : "var(--ink-3)", borderBottom: on ? "1.5px solid var(--ink)" : "1.5px solid transparent", marginBottom: -1, fontWeight: on ? 500 : 400 }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
