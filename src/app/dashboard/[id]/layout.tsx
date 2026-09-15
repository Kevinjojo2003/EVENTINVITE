import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function InviteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, slug, event_type").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const tabs = [
    { href: `/dashboard/${id}`, label: "Edit" },
    { href: `/dashboard/${id}/guests`, label: "Guests" },
    { href: `/dashboard/${id}/rsvps`, label: "RSVPs" },
    { href: `/dashboard/${id}/checkin`, label: "Check-in" },
  ];
  return (
    <div>
      <div className="border-b bg-white" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex w-full max-w-7xl items-center gap-1 px-5 sm:px-8">
          <Link href="/dashboard" className="mr-3 py-2.5 text-sm" style={{ color: "var(--ink-2)" }}>
            ← All events
          </Link>
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className="px-3 py-2.5 text-sm hover:underline">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
