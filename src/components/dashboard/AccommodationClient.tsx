"use client";
import { useState, useTransition } from "react";
import type { Accommodation } from "@/lib/types";
import { addAccommodation, deleteAccommodation } from "@/app/dashboard/actions";

export function AccommodationClient({ inviteId, rows }: { inviteId: string; rows: Accommodation[] }) {
  const [hotel, setHotel] = useState("");
  const [rooms, setRooms] = useState("");
  const [guests, setGuests] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const totalRooms = rows.reduce((s, r) => s + r.rooms_booked, 0);
  const totalGuests = rows.reduce((s, r) => s + r.guests_count, 0);

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addAccommodation(inviteId, { hotel_name: hotel, rooms_booked: Number(rooms) || 0, guests_count: Number(guests) || 0, check_in: checkIn || null, check_out: checkOut || null });
      if (r?.error) setMsg(r.error);
      else {
        setHotel("");
        setRooms("");
        setGuests("");
        setCheckIn("");
        setCheckOut("");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">Accommodation</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        {rows.length ? `${totalRooms} rooms across ${rows.length} hotel${rows.length === 1 ? "" : "s"}, ${totalGuests} guests` : "Nothing booked yet."}
      </p>

      <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-5 lg:items-end">
        <div className="field lg:col-span-2">
          <label htmlFor="a-hotel">Hotel</label>
          <input id="a-hotel" value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder="Hotel A" required />
        </div>
        <div className="field">
          <label htmlFor="a-rooms">Rooms</label>
          <input id="a-rooms" type="number" min={0} value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="12" />
        </div>
        <div className="field">
          <label htmlFor="a-guests">Guests</label>
          <input id="a-guests" type="number" min={0} value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="34" />
        </div>
        <button type="submit" className="btn-primary" disabled={pending || !hotel.trim()}>
          Add
        </button>
        <div className="field">
          <label htmlFor="a-in">Check-in</label>
          <input id="a-in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="a-out">Check-out</label>
          <input id="a-out" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </div>
      </form>

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <ul className="card mt-6 divide-y" style={{ borderColor: "var(--line)" }}>
        {rows.length === 0 && (
          <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            No hotels booked yet.
          </li>
        )}
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-4 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{r.hotel_name}</span>
              <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                {r.rooms_booked} rooms · {r.guests_count} guests
                {r.check_in ? ` · ${new Date(r.check_in + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                {r.check_out ? ` – ${new Date(r.check_out + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
              </span>
            </span>
            <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteAccommodation(inviteId, r.id)))} aria-label={`Remove ${r.hotel_name}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
