"use client";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { Guest, Rsvp } from "@/lib/types";
import { inviteUrl } from "@/lib/format";
import { addGuests, deleteGuest, markSent, setGuestEvents, updateGuestDetails } from "@/app/dashboard/actions";

type Props = {
  inviteId: string;
  slug: string;
  published: boolean;
  title: string;
  headline: string;
  guests: Guest[];
  rsvps: Rsvp[];
  schedule: { key: string; title: string }[];
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const tagStyle = (kind: "ok" | "warn" | "err" | "mute") => {
  const map = {
    ok: { background: "#E7ECE3", color: "var(--ok)" },
    warn: { background: "#F2EAD9", color: "var(--warn)" },
    err: { background: "#F3E4E1", color: "var(--err)" },
    mute: { background: "var(--paper-2)", color: "var(--ink-3)" },
  } as const;
  return map[kind];
};

export function GuestsClient({ inviteId, slug, published, title, headline, guests, rsvps, schedule }: Props) {
  const rsvpByGuest = useMemo(() => {
    const m = new Map<string, Rsvp>();
    for (const r of rsvps) if (r.guest_id) m.set(r.guest_id, r);
    return m;
  }, [rsvps]);

  const groups = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of guests) if (g.group_name) m.set(g.group_name, (m.get(g.group_name) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [guests]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const attending = rsvps.filter((r) => r.attending).length;
  const declined = rsvps.filter((r) => !r.attending).length;
  const awaiting = Math.max(0, guests.length - rsvps.length);

  const rows = useMemo(() => {
    return guests.filter((g) => {
      const r = rsvpByGuest.get(g.id);
      if (filter === "attending" && r?.attending !== true) return false;
      if (filter === "awaiting" && r) return false;
      if (filter === "declined" && r?.attending !== false) return false;
      if (!["all", "attending", "awaiting", "declined"].includes(filter) && g.group_name !== filter) return false;
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !(g.phone ?? "").includes(search) && !(g.group_name ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [guests, rsvpByGuest, filter, search]);

  const selected = guests.find((g) => g.id === selectedId) ?? null;
  const selectedRsvp = selected ? rsvpByGuest.get(selected.id) : undefined;

  const base = inviteUrl(slug);
  const linkFor = (g: Guest) => `${base}/?g=${encodeURIComponent(g.token)}`;
  const waFor = (g: Guest, text: string) => `https://wa.me/${g.phone ?? ""}?text=${encodeURIComponent(text)}`;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Copied.");
    } catch {
      setMsg(text);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] gap-8 px-6 py-9 sm:px-10">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="m-dis text-4xl">Guests</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-3)" }}>
              <strong style={{ color: "var(--ink)" }}>{guests.length}</strong> invited · <strong style={{ color: "var(--ink)" }}>{attending}</strong> attending ·{" "}
              <strong style={{ color: "var(--ink)" }}>{awaiting}</strong> awaiting response · <strong style={{ color: "var(--ink)" }}>{declined}</strong> declined
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href={`/dashboard/${inviteId}/communication`} className="btn-secondary">
              Send reminder
            </Link>
            <button type="button" className="btn-secondary" onClick={() => setShowImport((s) => !s)}>
              Import
            </button>
            <button type="button" className="btn-primary" onClick={() => setShowAdd((s) => !s)}>
              + Add guest
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-5 text-sm" style={{ color: "var(--ink-3)" }}>
          <Link href={`/dashboard/${inviteId}/rsvps`} className="underline-offset-4 hover:underline">
            Replies
          </Link>
          <Link href={`/dashboard/${inviteId}/accommodation`} className="underline-offset-4 hover:underline">
            Accommodation
          </Link>
          <Link href={`/dashboard/${inviteId}/transport`} className="underline-offset-4 hover:underline">
            Transport
          </Link>
        </div>

        {!published && (
          <p className="mt-5 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This event is still a draft. Publish it from the Invitation tab before sending links.
          </p>
        )}

        {showAdd && (
          <AddGuestForm
            inviteId={inviteId}
            schedule={schedule}
            onMessage={setMsg}
            onDone={() => setShowAdd(false)}
          />
        )}
        {showImport && <ImportGuests inviteId={inviteId} schedule={schedule} onMessage={setMsg} onDone={() => setShowImport(false)} />}
        {msg && (
          <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
            {msg}
          </p>
        )}

        <div className="mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or group"
            className="w-full rounded-[8px] border px-4 py-2.5 text-sm"
            style={{ borderColor: "var(--line-2)", background: "var(--surface)", minHeight: 44 }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", `All ${guests.length}`],
            ["attending", `Attending ${attending}`],
            ["awaiting", `Awaiting ${awaiting}`],
            ["declined", `Declined ${declined}`],
            ...groups.map(([g, n]) => [g, `${g} ${n}`]),
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="rounded-full px-3.5 py-1.5 text-sm"
              style={{
                border: `1px solid ${filter === key ? "var(--ink)" : "var(--line-2)"}`,
                background: filter === key ? "var(--ink)" : "transparent",
                color: filter === key ? "var(--paper)" : "var(--ink-2)",
              }}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-[12px] border" style={{ borderColor: "var(--line)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Meal</th>
                <th className="px-4 py-3">Stay</th>
                <th className="px-4 py-3">Transport</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center" style={{ color: "var(--ink-3)" }}>
                    No guests {filter !== "all" || search ? "in this view" : "yet"}.
                  </td>
                </tr>
              )}
              {rows.map((g) => {
                const r = rsvpByGuest.get(g.id);
                const tag = r ? (r.attending ? "Attending" : "Declined") : "Awaiting";
                const tone = r ? (r.attending ? "ok" : "err") : "warn";
                return (
                  <tr
                    key={g.id}
                    onClick={() => setSelectedId(g.id)}
                    className="cursor-pointer"
                    style={{ borderTop: "1px solid var(--line)", background: selectedId === g.id ? "var(--paper-2)" : "transparent" }}
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                          style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}
                        >
                          {initials(g.name)}
                        </span>
                        <span className="font-medium">{g.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--ink-2)" }}>
                      {g.group_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium" style={tagStyle(tone)}>
                        {tag}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--ink-2)" }}>
                      {r ? r.party_size : "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--ink-2)" }}>
                      {g.meal || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--ink-2)" }}>
                      {g.hotel || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--ink-2)" }}>
                      {g.transport || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <GuestPanel
          key={selected.id}
          inviteId={inviteId}
          guest={selected}
          rsvp={selectedRsvp ?? null}
          schedule={schedule}
          onClose={() => setSelectedId(null)}
          onCopy={copy}
          linkFor={linkFor}
          waFor={waFor}
          headline={headline}
          title={title}
        />
      )}
    </main>
  );
}

function AddGuestForm({ inviteId, schedule, onMessage, onDone }: { inviteId: string; schedule: { key: string; title: string }[]; onMessage: (m: string) => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const allKeys = schedule.map((e) => e.key);
  const [events, setEvents] = useState<string[]>(allKeys);
  const [pending, start] = useTransition();
  const multi = schedule.length > 1;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addGuests(inviteId, [{ name, phone, events: events.length === allKeys.length ? [] : events }]);
      if (r.error) return onMessage(r.error);
      onMessage("Added. Open the guest to set a group, meal or accommodation.");
      setName("");
      setPhone("");
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="card mt-5 grid gap-3 p-5 sm:grid-cols-2">
      <div className="field">
        <label htmlFor="g-name">Name</label>
        <input id="g-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Priya & family" />
      </div>
      <div className="field">
        <label htmlFor="g-phone">WhatsApp number</label>
        <input id="g-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="919876543210" />
      </div>
      {multi && (
        <fieldset className="sm:col-span-2">
          <legend className="text-xs uppercase tracking-[0.08em]" style={{ color: "var(--ink-3)" }}>
            Invited to
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {schedule.map((e) => (
              <label key={e.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={events.includes(e.key)} onChange={(ev) => setEvents((cur) => (ev.target.checked ? [...cur, e.key] : cur.filter((k) => k !== e.key)))} />
                {e.title}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <button type="submit" className="btn-primary w-fit sm:col-span-2" disabled={pending}>
        Add guest
      </button>
    </form>
  );
}

function ImportGuests({ inviteId, schedule, onMessage, onDone }: { inviteId: string; schedule: { key: string; title: string }[]; onMessage: (m: string) => void; onDone: () => void }) {
  const [bulk, setBulk] = useState("");
  const [pending, start] = useTransition();
  const allKeys = schedule.map((e) => e.key);

  function addBulk() {
    const rows = bulk
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [n, p = ""] = l.split(/\t|,|;/).map((s) => s.trim());
        return { name: n, phone: p, events: [] as string[] };
      });
    start(async () => {
      const r = await addGuests(inviteId, rows);
      onMessage(r.error ?? `Added ${r.count} guests.`);
      if (!r.error) {
        setBulk("");
        onDone();
      }
    });
  }

  return (
    <div className="card mt-5 grid gap-3 p-5">
      <p className="font-medium">Paste a list</p>
      <p className="text-xs" style={{ color: "var(--ink-3)" }}>
        One per line: name, number. Straight from a spreadsheet works.
      </p>
      <textarea
        rows={5}
        value={bulk}
        onChange={(e) => setBulk(e.target.value)}
        placeholder={"Priya Menon, 919876543210\nThe Kurians, 447700900123"}
        className="rounded border px-2 py-1.5 text-sm"
        style={{ borderColor: "var(--line-2)" }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary w-fit" onClick={addBulk} disabled={pending || !bulk.trim()}>
          Add all
        </button>
        <label className="cursor-pointer text-sm underline-offset-4 hover:underline" style={{ color: "var(--ink-2)" }}>
          or load a CSV file
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              const text = await f.text();
              const lines = text.split(/\r?\n/).filter((l) => l.trim());
              if (lines[0] && /^\s*"?(name|guest)/i.test(lines[0])) lines.shift();
              setBulk(lines.map((l) => l.replace(/"/g, "")).join("\n"));
              onMessage(`Loaded ${lines.length} rows. Check them below, then press Add all.`);
            }}
          />
        </label>
      </div>
    </div>
  );
}

function GuestPanel({
  inviteId,
  guest,
  rsvp,
  schedule,
  onClose,
  onCopy,
  linkFor,
  waFor,
  headline,
  title,
}: {
  inviteId: string;
  guest: Guest;
  rsvp: Rsvp | null;
  schedule: { key: string; title: string }[];
  onClose: () => void;
  onCopy: (t: string) => void;
  linkFor: (g: Guest) => string;
  waFor: (g: Guest, text: string) => string;
  headline: string;
  title: string;
}) {
  const [editing, setEditing] = useState(false);
  const [group, setGroup] = useState(guest.group_name ?? "");
  const [meal, setMeal] = useState(guest.meal ?? "");
  const [hotel, setHotel] = useState(guest.hotel ?? "");
  const [transport, setTransport] = useState(guest.transport ?? "");
  const allKeys = schedule.map((e) => e.key);
  const [events, setEvents] = useState<string[]>(guest.events?.length ? guest.events : allKeys);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      await updateGuestDetails(inviteId, guest.id, { group_name: group, meal, hotel, transport });
      if (schedule.length > 1) await setGuestEvents(inviteId, guest.id, events.length === allKeys.length ? [] : events);
      setEditing(false);
    });
  }

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-baseline justify-between gap-4 py-2" style={{ borderTop: "1px solid var(--line)" }}>
      <span className="text-xs" style={{ color: "var(--ink-3)" }}>
        {label}
      </span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );

  return (
    <aside className="fixed inset-0 z-40 overflow-y-auto p-5 lg:static lg:z-auto lg:w-[320px] lg:shrink-0 lg:overflow-visible lg:p-0" style={{ background: "var(--paper)" }}>
      <div className="rounded-[12px] border p-5 lg:sticky lg:top-8" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="flex items-start justify-between">
          <span className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold" style={{ background: "var(--forest)", color: "#F3EFE8" }}>
            {initials(guest.name)}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="text-sm" style={{ color: "var(--ink-3)" }}>
            ×
          </button>
        </div>
        <h2 className="m-dis mt-4 text-2xl">{guest.name}</h2>
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          {guest.group_name || "No group set"}
        </p>
        <span
          className="mt-2 inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium"
          style={tagStyle(rsvp ? (rsvp.attending ? "ok" : "err") : "warn")}
        >
          {rsvp ? (rsvp.attending ? "Attending" : "Declined") : "Awaiting"}
        </span>

        {editing ? (
          <div className="mt-4 grid gap-3">
            <div className="field">
              <label htmlFor="p-group">Group</label>
              <input id="p-group" value={group} onChange={(e) => setGroup(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="p-meal">Meal</label>
              <select id="p-meal" value={meal} onChange={(e) => setMeal(e.target.value)}>
                <option value="">Not set</option>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="p-hotel">Accommodation</label>
              <input id="p-hotel" value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder="Hotel, room" />
            </div>
            <div className="field">
              <label htmlFor="p-transport">Transport</label>
              <input id="p-transport" value={transport} onChange={(e) => setTransport(e.target.value)} placeholder="Pickup details" />
            </div>
            {schedule.length > 1 && (
              <fieldset>
                <legend className="text-xs uppercase tracking-[0.08em]" style={{ color: "var(--ink-3)" }}>
                  Invited to
                </legend>
                <div className="mt-2 grid gap-1.5">
                  {schedule.map((e) => (
                    <label key={e.key} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={events.includes(e.key)} onChange={(ev) => setEvents((cur) => (ev.target.checked ? [...cur, e.key] : cur.filter((k) => k !== e.key)))} />
                      {e.title}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <div className="flex gap-2">
              <button type="button" className="btn-primary" disabled={pending} onClick={save}>
                Save
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {row("Phone", guest.phone || "—")}
            {row("Attending", rsvp ? `${rsvp.party_size} people` : "—")}
            {row("Meal", guest.meal || "—")}
            {row("Accommodation", guest.hotel || "—")}
            {row("Transport", guest.transport || "—")}
            {row("Invitation", guest.sent_at ? `Sent ${new Date(guest.sent_at).toLocaleDateString("en-IN")}` : "Not sent")}
            {rsvp && row("Replied", new Date(rsvp.created_at).toLocaleDateString("en-IN"))}
          </div>
        )}

        {!editing && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
              Edit
            </button>
            {guest.phone && (
              <a
                href={waFor(guest, `Hello ${guest.name}! ${title} ${headline}. Your personal invitation is here: ${linkFor(guest)}`)}
                target="_blank"
                rel="noopener"
                className="btn-primary"
                onClick={() => start(async () => void (await markSent(inviteId, guest.id)))}
              >
                WhatsApp
              </a>
            )}
            <button type="button" className="btn-secondary" onClick={() => onCopy(linkFor(guest))}>
              Copy link
            </button>
            <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteGuest(inviteId, guest.id)))}>
              Remove
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
