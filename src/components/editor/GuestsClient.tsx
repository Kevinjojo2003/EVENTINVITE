"use client";
import { useMemo, useState, useTransition } from "react";
import type { Guest } from "@/lib/types";
import { inviteUrl } from "@/lib/format";
import { addGuests, deleteGuest, markSent, setGuestEvents } from "@/app/dashboard/actions";

type Props = {
  inviteId: string;
  slug: string;
  published: boolean;
  title: string;
  headline: string;
  guests: Guest[];
  replied: Record<string, boolean>;
  schedule: { key: string; title: string }[];
};

export function GuestsClient({ inviteId, slug, published, title, headline, guests, replied, schedule }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bulk, setBulk] = useState("");
  const allKeys = schedule.map((e) => e.key);
  const multi = schedule.length > 1;
  // Ceremonies for guests added next. All ticked means "everything" and is stored as an empty list.
  const [newEvents, setNewEvents] = useState<string[]>(allKeys);
  const eventsToStore = newEvents.length === allKeys.length ? [] : newEvents;
  const invitedTo = (g: Guest) => (g.events && g.events.length ? g.events : allKeys);
  function toggleFor(g: Guest, key: string) {
    const cur = invitedTo(g);
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    if (next.length === 0) return setMsg("A guest needs at least one ceremony.");
    start(async () => {
      const r = await setGuestEvents(inviteId, g.id, next.length === allKeys.length ? [] : next);
      if (r?.error) setMsg(r.error);
    });
  }
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<"all" | "unsent" | "sent" | "replied">("all");
  const [template, setTemplate] = useState(`Hello {name}! ${title} ${headline}. Your personal invitation is here: {link}`);
  const [pending, start] = useTransition();
  const base = inviteUrl(slug);

  const rows = useMemo(() => {
    return guests.filter((g) => {
      if (filter === "unsent") return !g.sent_at;
      if (filter === "sent") return !!g.sent_at;
      if (filter === "replied") return g.id in replied;
      return true;
    });
  }, [guests, filter, replied]);

  const linkFor = (g: Guest) => `${base}/?g=${encodeURIComponent(g.token)}`;
  const messageFor = (g: Guest) => template.replace(/\{name\}/g, g.name).replace(/\{link\}/g, linkFor(g));
  const waFor = (g: Guest) => `https://wa.me/${g.phone ?? ""}?text=${encodeURIComponent(messageFor(g))}`;

  function addOne(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addGuests(inviteId, [{ name, phone, events: eventsToStore }]);
      setMsg(r.error ?? "Added.");
      if (!r.error) {
        setName("");
        setPhone("");
      }
    });
  }
  function addBulk() {
    const rowsIn = bulk
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [n, p = ""] = l.split(/\t|,|;/).map((s) => s.trim());
        return { name: n, phone: p, events: eventsToStore };
      });
    start(async () => {
      const r = await addGuests(inviteId, rowsIn);
      setMsg(r.error ?? `Added ${r.count} guests.`);
      if (!r.error) setBulk("");
    });
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Copied.");
    } catch {
      setMsg(text);
    }
  }

  const counts = {
    total: guests.length,
    sent: guests.filter((g) => g.sent_at).length,
    replied: Object.keys(replied).length,
    yes: Object.values(replied).filter(Boolean).length,
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Guests</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            Each guest gets a personal link with their name on the envelope. Send it on WhatsApp, one tap each.
          </p>
        </div>
        <dl className="flex gap-6 text-sm">
          {[
            ["Invited", counts.total],
            ["Sent", counts.sent],
            ["Replied", counts.replied],
            ["Coming", counts.yes],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
                {k}
              </dt>
              <dd className="text-xl font-medium tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {!published && (
        <p className="mt-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This event is still a draft. Publish it from the Edit tab before sending links, or guests will see a not-found page.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <form onSubmit={addOne} className="card grid gap-3 p-5">
          <p className="font-medium">Add a guest</p>
          <div className="field">
            <label htmlFor="g-name">Name</label>
            <input id="g-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Priya & family" />
          </div>
          <div className="field">
            <label htmlFor="g-phone">WhatsApp number</label>
            <input id="g-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="919876543210" />
          </div>
          {multi && (
            <fieldset className="grid gap-2">
              <legend className="text-xs uppercase tracking-[0.08em]" style={{ color: "var(--ink-2)" }}>
                Invited to
              </legend>
              {schedule.map((e) => (
                <label key={e.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newEvents.includes(e.key)}
                    onChange={(ev) => setNewEvents((cur) => (ev.target.checked ? [...cur, e.key] : cur.filter((k) => k !== e.key)))}
                  />
                  {e.title}
                </label>
              ))}
              <span className="text-xs" style={{ color: "var(--ink-2)" }}>
                These ceremonies also apply to the pasted list. Guests only see the ceremonies they are invited to.
              </span>
            </fieldset>
          )}
          <button type="submit" className="btn-primary w-fit" disabled={pending || (multi && newEvents.length === 0)}>
            Add
          </button>
        </form>
        <div className="card grid gap-3 p-5">
          <p className="font-medium">Paste a list</p>
          <p className="text-xs" style={{ color: "var(--ink-2)" }}>
            One per line: name, number. Straight from a spreadsheet works.
          </p>
          <textarea rows={5} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Priya Menon, 919876543210\nThe Kurians, 447700900123"} className="rounded border px-2 py-1.5 text-sm" style={{ borderColor: "var(--line)" }} />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-secondary w-fit" onClick={addBulk} disabled={pending || !bulk.trim()}>
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
                  // Drop a header row such as "name,phone".
                  const lines = text.split(/\r?\n/).filter((l) => l.trim());
                  if (lines[0] && /^\s*"?(name|guest)/i.test(lines[0])) lines.shift();
                  setBulk(lines.map((l) => l.replace(/"/g, "")).join("\n"));
                  setMsg(`Loaded ${lines.length} rows. Check them below, then press Add all.`);
                }}
              />
            </label>
          </div>
        </div>
        <div className="card grid gap-3 p-5">
          <p className="font-medium">WhatsApp message</p>
          <p className="text-xs" style={{ color: "var(--ink-2)" }}>
            {"{name}"} and {"{link}"} are filled in per guest.
          </p>
          <textarea rows={5} value={template} onChange={(e) => setTemplate(e.target.value)} className="rounded border px-2 py-1.5 text-sm" style={{ borderColor: "var(--line)" }} />
        </div>
      </div>

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {(["all", "unsent", "sent", "replied"] as const).map((f) => (
          <button key={f} type="button" className="btn-secondary" onClick={() => setFilter(f)} style={{ borderColor: filter === f ? "var(--ink)" : "var(--line)" }}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button type="button" className="btn-secondary ml-auto" onClick={() => copy(base)}>
          Copy general link
        </button>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-[0.08em]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Send</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "var(--ink-2)" }}>
                  No guests {filter !== "all" ? "in this view" : "yet"}.
                </td>
              </tr>
            )}
            {rows.map((g) => (
              <tr key={g.id} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3 font-medium">
                  {g.name}
                  {multi && (
                    <span className="mt-1.5 flex flex-wrap gap-1 font-normal">
                      {schedule.map((e) => {
                        const on = invitedTo(g).includes(e.key);
                        return (
                          <button
                            key={e.key}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleFor(g, e.key)}
                            className="rounded-full border px-2 py-0.5 text-xs"
                            style={{ background: on ? "var(--ink)" : "transparent", color: on ? "var(--paper)" : "var(--ink-3)", borderColor: on ? "var(--ink)" : "var(--line-2)" }}
                          >
                            {e.title}
                          </button>
                        );
                      })}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums" style={{ color: "var(--ink-2)" }}>
                  {g.phone ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {g.id in replied ? (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: replied[g.id] ? "#e3f3e6" : "#fbe7e7", color: replied[g.id] ? "#1f6b34" : "#8a2c2c" }}>
                      {replied[g.id] ? "Coming" : "Declined"}
                    </span>
                  ) : g.sent_at ? (
                    <span className="text-xs" style={{ color: "var(--ink-2)" }}>
                      Sent {new Date(g.sent_at).toLocaleDateString("en-IN")}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--ink-2)" }}>
                      Not sent
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {g.phone && (
                      <a
                        href={waFor(g)}
                        target="_blank"
                        rel="noopener"
                        className="btn-primary"
                        onClick={() => start(async () => void (await markSent(inviteId, g.id)))}
                      >
                        WhatsApp
                      </a>
                    )}
                    <button type="button" className="btn-secondary" onClick={() => copy(linkFor(g))}>
                      Copy link
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteGuest(inviteId, g.id)))} aria-label={`Remove ${g.name}`}>
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
