"use client";
import { useState, useTransition } from "react";
import type { TimelineItem } from "@/lib/types";
import { addTimelineItem, deleteTimelineItem } from "@/app/dashboard/actions";

function timeOf(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(11, 16);
}

export function TimelineClient({ inviteId, items }: { inviteId: string; items: TimelineItem[] }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    const starts_at = time ? new Date(`${today}T${time}:00`).toISOString() : null;
    start(async () => {
      const r = await addTimelineItem(inviteId, { title, starts_at, note });
      if (r?.error) setMsg(r.error);
      else {
        setTitle("");
        setTime("");
        setNote("");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">Timeline</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        The run of show for the day: what's happening, and when. Different from the checklist — this is for the day itself.
      </p>

      <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <div className="field">
          <label htmlFor="tl-time">Time</label>
          <input id="tl-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: 110 }} />
        </div>
        <div className="field">
          <label htmlFor="tl-title">What's happening</label>
          <input id="tl-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bride makeup" required />
        </div>
        <button type="submit" className="btn-primary" disabled={pending || !title.trim()}>
          Add
        </button>
        <div className="field sm:col-span-3">
          <label htmlFor="tl-note">Note (optional)</label>
          <input id="tl-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Who's involved, where" />
        </div>
      </form>

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <ol className="card mt-6 divide-y" style={{ borderColor: "var(--line)" }}>
        {items.length === 0 && (
          <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            Nothing on the timeline yet.
          </li>
        )}
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-4 px-4 py-3">
            <span className="w-14 shrink-0 text-sm tabular-nums" style={{ color: "var(--ink-2)" }}>
              {timeOf(it.starts_at) || "—"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{it.title}</span>
              {it.note && (
                <span className="block truncate text-xs" style={{ color: "var(--ink-2)" }}>
                  {it.note}
                </span>
              )}
            </span>
            <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteTimelineItem(inviteId, it.id)))} aria-label={`Remove ${it.title}`}>
              ×
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}
