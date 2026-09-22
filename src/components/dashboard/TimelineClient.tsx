"use client";
import { useMemo, useState, useTransition } from "react";
import type { TimelineItem } from "@/lib/types";
import { addTimelineItem, deleteTimelineItem, reorderTimelineItems, updateTimelineItem } from "@/app/dashboard/actions";
import { fromLocalInput } from "@/lib/format";
import { PlanNav } from "./PlanNav";

// starts_at is a real timestamptz column, so Postgres always hands it back UTC-normalized —
// unlike the JSONB-stored config dates elsewhere, the literal string can't be trusted; convert
// to the event's timezone explicitly instead (fromLocalInput below embeds the right offset
// going in, which is what makes the UTC value correct in the first place).
const TZ = "Asia/Kolkata";
function timeOf(iso: string | null) {
  return iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }) : "";
}
function dayKey(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("sv-SE", { timeZone: TZ }) : "unscheduled";
}

export function TimelineClient({ inviteId, items }: { inviteId: string; items: TimelineItem[] }) {
  const days = useMemo(() => {
    const keys = [...new Set(items.map((i) => dayKey(i.starts_at)))].sort();
    return keys;
  }, [items]);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const day = activeDay ?? days[0] ?? "unscheduled";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const dayItems = items.filter((i) => dayKey(i.starts_at) === day);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  function move(id: string, dir: -1 | 1) {
    const ids = dayItems.map((i) => i.id);
    const idx = ids.indexOf(id);
    const swap = idx + dir;
    if (swap < 0 || swap >= ids.length) return;
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    start(async () => void (await reorderTimelineItems(inviteId, ids)));
  }

  return (
    <main className="mx-auto flex w-full max-w-[1300px] gap-8 px-6 py-9 sm:px-10">
      <div className="min-w-0 flex-1">
        <p className="m-eyebrow text-[11px]">Plan</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-dis text-4xl">Timeline</h1>
          <button type="button" className="btn-primary" onClick={() => setShowAdd((s) => !s)}>
            + Add item
          </button>
        </div>
        <PlanNav id={inviteId} />

        {days.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                className="rounded-full px-3.5 py-1.5 text-sm"
                style={{ border: `1px solid ${day === d ? "var(--ink)" : "var(--line-2)"}`, background: day === d ? "var(--ink)" : "transparent", color: day === d ? "var(--paper)" : "var(--ink-2)" }}
                onClick={() => setActiveDay(d)}
              >
                {d === "unscheduled" ? "No date" : new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </button>
            ))}
          </div>
        )}

        {showAdd && <AddItemForm inviteId={inviteId} day={day !== "unscheduled" ? day : ""} onMessage={setMsg} onDone={() => setShowAdd(false)} />}
        {msg && (
          <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
            {msg}
          </p>
        )}

        <ol className="card mt-6 divide-y" style={{ borderColor: "var(--line)" }}>
          {dayItems.length === 0 && (
            <li className="px-4 py-10 text-center text-sm" style={{ color: "var(--ink-3)" }}>
              Nothing on the timeline yet.
            </li>
          )}
          {dayItems.map((it, i) => (
            <li key={it.id} className="flex items-center gap-3 px-4 py-3" style={{ background: selectedId === it.id ? "var(--paper-2)" : "transparent" }}>
              <span className="flex flex-col" aria-hidden="true">
                <button type="button" disabled={i === 0} onClick={() => move(it.id, -1)} style={{ opacity: i === 0 ? 0.3 : 1, lineHeight: 1, fontSize: 10 }}>
                  ▲
                </button>
                <button type="button" disabled={i === dayItems.length - 1} onClick={() => move(it.id, 1)} style={{ opacity: i === dayItems.length - 1 ? 0.3 : 1, lineHeight: 1, fontSize: 10 }}>
                  ▼
                </button>
              </span>
              <button type="button" className="flex min-w-0 flex-1 items-center gap-4 text-left" onClick={() => setSelectedId(it.id)}>
                <span className="w-14 shrink-0 text-sm tabular-nums" style={{ color: "var(--ink-2)" }}>
                  {timeOf(it.starts_at) || "—"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{it.title}</span>
                  <span className="block truncate text-xs" style={{ color: "var(--ink-3)" }}>
                    {[it.location, it.assignee, it.vendor].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </button>
              <button type="button" className="shrink-0 text-sm" style={{ color: "var(--ink-3)" }} onClick={() => start(async () => void (await deleteTimelineItem(inviteId, it.id)))} aria-label={`Remove ${it.title}`}>
                ×
              </button>
            </li>
          ))}
        </ol>
      </div>

      {selected && <ItemPanel key={selected.id} inviteId={inviteId} item={selected} onClose={() => setSelectedId(null)} />}
    </main>
  );
}

function AddItemForm({ inviteId, day, onMessage, onDone }: { inviteId: string; day: string; onMessage: (m: string) => void; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const d = day || new Date().toISOString().slice(0, 10);
    const starts_at = time ? fromLocalInput(`${d}T${time}`) : null;
    start(async () => {
      const r = await addTimelineItem(inviteId, { title, starts_at, location });
      if (r?.error) return onMessage(r.error);
      setTitle("");
      setTime("");
      setLocation("");
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="card mt-6 grid gap-3 p-5 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
      <div className="field">
        <label htmlFor="tl-time">Time</label>
        <input id="tl-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: 110 }} />
      </div>
      <div className="field">
        <label htmlFor="tl-title">What's happening</label>
        <input id="tl-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bride makeup" required />
      </div>
      <div className="field">
        <label htmlFor="tl-loc">Location</label>
        <input id="tl-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where" />
      </div>
      <button type="submit" className="btn-primary" disabled={pending || !title.trim()}>
        Add
      </button>
    </form>
  );
}

function ItemPanel({ inviteId, item, onClose }: { inviteId: string; item: TimelineItem; onClose: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [time, setTime] = useState(timeOf(item.starts_at));
  const [location, setLocation] = useState(item.location ?? "");
  const [assignee, setAssignee] = useState(item.assignee ?? "");
  const [vendor, setVendor] = useState(item.vendor ?? "");
  const [note, setNote] = useState(item.note ?? "");
  const [onWebsite, setOnWebsite] = useState(item.show_on_website);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const d = dayKey(item.starts_at) !== "unscheduled" ? dayKey(item.starts_at) : new Date().toISOString().slice(0, 10);
      const starts_at = time ? fromLocalInput(`${d}T${time}`) : null;
      await updateTimelineItem(inviteId, item.id, { title, starts_at, location, assignee, vendor, note, show_on_website: onWebsite });
    });
  }

  return (
    <aside className="fixed inset-0 z-40 overflow-y-auto p-5 lg:static lg:z-auto lg:w-[340px] lg:shrink-0 lg:overflow-visible lg:p-0" style={{ background: "var(--paper)" }}>
      <div className="rounded-[12px] border p-5 lg:sticky lg:top-8" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="flex items-start justify-between">
          <p className="m-eyebrow text-[11px]">Selected</p>
          <button type="button" onClick={onClose} aria-label="Close" style={{ color: "var(--ink-3)" }}>
            ×
          </button>
        </div>
        <h2 className="m-dis mt-1 text-2xl">{item.title}</h2>

        <div className="mt-4 grid gap-3">
          <div className="field">
            <label htmlFor="p-title">Title</label>
            <input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-time">Time</label>
            <input id="p-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-location">Location</label>
            <input id="p-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Main lawn" />
          </div>
          <div className="field">
            <label htmlFor="p-assignee">Person in charge</label>
            <input id="p-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-vendor">Vendor</label>
            <input id="p-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-note">Note for the team</label>
            <textarea id="p-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onWebsite} onChange={(e) => setOnWebsite(e.target.checked)} />
            Show on the guest website
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" className="btn-primary" disabled={pending} onClick={save}>
            Save
          </button>
          <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteTimelineItem(inviteId, item.id)))}>
            Delete
          </button>
        </div>
      </div>
    </aside>
  );
}
