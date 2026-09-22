"use client";
import { useState, useTransition } from "react";
import type { TransportItem } from "@/lib/types";
import { addTransportItem, deleteTransportItem } from "@/app/dashboard/actions";

const MODES = ["Vehicle", "Flight", "Train"] as const;

export function TransportClient({ inviteId, rows }: { inviteId: string; rows: TransportItem[] }) {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<string>(MODES[0]);
  const [details, setDetails] = useState("");
  const [guests, setGuests] = useState("");
  const [timeNote, setTimeNote] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addTransportItem(inviteId, { title, mode, details, guests_count: Number(guests) || 0, time_note: timeNote });
      if (r?.error) setMsg(r.error);
      else {
        setTitle("");
        setDetails("");
        setGuests("");
        setTimeNote("");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">Transport</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        Airport pickups, shuttles between venues, anything with a driver.
      </p>

      <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="tr-title">Trip</label>
          <input id="tr-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Airport pickup" required />
        </div>
        <div className="field">
          <label htmlFor="tr-mode">Mode</label>
          <select id="tr-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tr-details">Details</label>
          <input id="tr-details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Tempo Traveller, driver Suresh, 98xxxxxxxx" />
        </div>
        <div className="field">
          <label htmlFor="tr-guests">Guests</label>
          <input id="tr-guests" type="number" min={0} value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="12" />
        </div>
        <div className="field sm:col-span-2">
          <label htmlFor="tr-time">When</label>
          <input id="tr-time" value={timeNote} onChange={(e) => setTimeNote(e.target.value)} placeholder="Flight AI 682, arrival 10:40 AM" />
        </div>
        <button type="submit" className="btn-primary w-fit" disabled={pending || !title.trim()}>
          Add
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <ul className="card mt-6 divide-y" style={{ borderColor: "var(--line)" }}>
        {rows.length === 0 && (
          <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            Nothing arranged yet.
          </li>
        )}
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-4 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">
                {r.title} <span style={{ color: "var(--ink-2)", fontWeight: 400 }}>· {r.mode}</span>
              </span>
              <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                {[r.details, r.time_note, r.guests_count ? `${r.guests_count} guests` : ""].filter(Boolean).join(" · ")}
              </span>
            </span>
            <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteTransportItem(inviteId, r.id)))} aria-label={`Remove ${r.title}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
