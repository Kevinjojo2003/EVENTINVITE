import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPES, type EventType, type Invite } from "@/lib/types";
import { displayTitle, normalizeConfig } from "@/lib/themes";
import { inviteUrl, shortDate } from "@/lib/format";

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data } = await supabase.from("invites").select("*").order("created_at", { ascending: false });
  const invites = (data ?? []) as Invite[];

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Your events</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            Each one gets its own address and guest list.
          </p>
        </div>
        <Link href="/dashboard/new" className="btn-primary">
          New event
        </Link>
      </div>

      {invites.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="text-lg font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            Create your first event. It takes about two minutes to get a preview.
          </p>
          <Link href="/dashboard/new" className="btn-primary mt-6">
            Create an event
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invites.map((inv) => {
            const c = normalizeConfig(inv.config, inv.event_type as EventType);
            return (
              <li key={inv.id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--ink-2)" }}>
                      {EVENT_TYPES[inv.event_type].label}
                    </p>
                    <p className="mt-1 text-lg font-medium">{displayTitle(c) || "Untitled"}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ background: inv.published ? "#e3f3e6" : "var(--paper-2)", color: inv.published ? "#1f6b34" : "var(--ink-2)" }}
                  >
                    {inv.published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--ink-2)" }}>
                  {shortDate(c.event.dateTime) || "Date not set"}
                </p>
                <a href={inviteUrl(inv.slug)} target="_blank" rel="noopener" className="truncate text-sm underline-offset-4 hover:underline">
                  {inviteUrl(inv.slug).replace(/^https?:\/\//, "")}
                </a>
                <div className="mt-auto flex gap-2 pt-2">
                  <Link href={`/dashboard/${inv.id}`} className="btn-primary">
                    Edit
                  </Link>
                  <Link href={`/dashboard/${inv.id}/guests`} className="btn-secondary">
                    Guests
                  </Link>
                  <Link href={`/dashboard/${inv.id}/rsvps`} className="btn-secondary">
                    RSVPs
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
