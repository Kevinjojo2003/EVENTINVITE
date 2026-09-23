"use client";
import { useMemo, useState, useTransition } from "react";
import type { Rsvp, TimelineItem, Vendor } from "@/lib/types";
import { setCheckedIn, updateVendor } from "@/app/dashboard/actions";

type Props = {
  inviteId: string;
  title: string;
  dateTime: string;
  rsvps: Rsvp[];
  vendors: Vendor[];
  timeline: TimelineItem[];
};

export function EventDayClient({ inviteId, title, dateTime, rsvps, vendors, timeline }: Props) {
  const [filter, setFilter] = useState("");
  const [pending, start] = useTransition();

  const checkedIn = rsvps.filter((r) => r.checked_in_at).length;
  const expected = rsvps.reduce((s, r) => s + Math.max(1, r.party_size), 0);
  const arrivedVendors = vendors.filter((v) => v.arrived).length;

  const now = new Date();
  const next = useMemo(() => {
    return timeline.find((t) => t.starts_at && new Date(t.starts_at) > now) ?? null;
  }, [timeline, now]);
  const current = useMemo(() => {
    const past = timeline.filter((t) => t.starts_at && new Date(t.starts_at) <= now);
    return past.length ? past[past.length - 1] : null;
  }, [timeline, now]);

  const isToday = dateTime ? new Date(dateTime).toDateString() === now.toDateString() : false;

  const rows = rsvps.filter((r) => !filter || r.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: isToday ? "#fbe7e7" : "var(--paper-2)", color: isToday ? "#8a2c2c" : "var(--ink-2)" }}>
          {isToday && <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: "#c23b3b" }} />}
          {isToday ? "Event live today" : "Event day"}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-medium">{title}</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Checked in", `${checkedIn} / ${rsvps.length}`],
          ["Expected people", expected],
          ["Vendors arrived", `${arrivedVendors} / ${vendors.length}`],
          ["Now", current?.title ?? "—"],
        ].map(([k, v]) => (
          <div key={k as string} className="card p-3">
            <p className="text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
              {k}
            </p>
            <p className="mt-1 text-lg font-medium tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      {next && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          Next: <strong style={{ color: "var(--ink)" }}>{next.title}</strong> at {new Date(next.starts_at!).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
        </p>
      )}

      {vendors.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
            Vendors
          </p>
          <ul className="card mt-2 divide-y" style={{ borderColor: "var(--line)" }}>
            {vendors.map((v) => (
              <li key={v.id} className="flex items-center gap-3 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={v.arrived}
                  onChange={(e) => start(async () => void (await updateVendor(inviteId, v.id, { arrived: e.target.checked })))}
                  aria-label={`${v.name} arrived`}
                />
                <span className="min-w-0 flex-1 text-sm">{v.name}</span>
                {!v.arrived && v.status !== "Completed" && (
                  <span className="text-xs" style={{ color: "var(--ink-3)" }}>
                    Not here yet
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
            Guest check-in
          </p>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search a name" className="rounded border px-2 py-1 text-sm" style={{ borderColor: "var(--line)" }} />
        </div>
        <ul className="card mt-2 max-h-96 divide-y overflow-y-auto" style={{ borderColor: "var(--line)" }}>
          {rows.length === 0 && (
            <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
              No guests found.
            </li>
          )}
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
              <input
                type="checkbox"
                checked={!!r.checked_in_at}
                disabled={pending}
                onChange={(e) => start(async () => void (await setCheckedIn(inviteId, r.id, e.target.checked)))}
                aria-label={`${r.name} checked in`}
              />
              <span className="min-w-0 flex-1 text-sm">{r.name}</span>
              <span className="text-xs tabular-nums" style={{ color: "var(--ink-2)" }}>
                {r.party_size} people
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
