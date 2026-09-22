"use client";
import { useMemo, useState } from "react";
import type { Guest } from "@/lib/types";
import { inviteUrl } from "@/lib/format";

type Props = {
  inviteId: string;
  slug: string;
  title: string;
  venue: string;
  stay: string;
  guests: Guest[];
  replied: Record<string, boolean>;
};

const PRESETS = (title: string, venue: string, stay: string) => [
  { key: "invite", label: "Invitation", body: `Hello {name}! ${title} would love to have you at their event. Your personal invitation is here: {link}` },
  { key: "reminder", label: "RSVP reminder", body: `Hi {name}, just a gentle reminder to RSVP for ${title}'s event — we'd love to know if you're coming: {link}` },
  { key: "event", label: "Event reminder", body: `Hi {name}, see you soon! A quick reminder that ${title}'s event is coming up. Details here: {link}` },
  { key: "location", label: "Location", body: `Hi {name}, here's the venue for ${title}'s event: ${venue || "(add venue in Edit)"}. Full details: {link}` },
  { key: "stay", label: "Accommodation", body: `Hi {name}, here are the stay details for ${title}'s event: ${stay || "(add stay info in Edit)"}` },
  { key: "thanks", label: "Thank you", body: `Hi {name}, thank you so much for being part of ${title}'s celebration — it meant the world to us!` },
];

export function CommunicationClient({ slug, title, venue, stay, guests, replied }: Props) {
  const presets = useMemo(() => PRESETS(title, venue, stay), [title, venue, stay]);
  const [presetKey, setPresetKey] = useState(presets[0].key);
  const [body, setBody] = useState(presets[0].body);
  const [segment, setSegment] = useState<"all" | "unsent" | "unreplied" | "attending">("all");
  const base = inviteUrl(slug);

  function pick(key: string) {
    setPresetKey(key);
    setBody(presets.find((p) => p.key === key)?.body ?? "");
  }

  const rows = guests.filter((g) => {
    if (segment === "unsent") return !g.sent_at;
    if (segment === "unreplied") return !(g.id in replied);
    if (segment === "attending") return replied[g.id] === true;
    return true;
  });

  const linkFor = (g: Guest) => `${base}/?g=${encodeURIComponent(g.token)}`;
  const messageFor = (g: Guest) => body.replace(/\{name\}/g, g.name).replace(/\{link\}/g, linkFor(g));
  const waFor = (g: Guest) => `https://wa.me/${g.phone ?? ""}?text=${encodeURIComponent(messageFor(g))}`;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">Communication</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        Pick a message, pick who gets it, then send on WhatsApp one tap at a time.
      </p>

      <div className="card mt-6 grid gap-4 p-5">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              className="btn-secondary"
              style={{ borderColor: presetKey === p.key ? "var(--ink)" : "var(--line)" }}
              onClick={() => pick(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="msg-body">Message</label>
          <textarea id="msg-body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} className="rounded border px-2 py-1.5 text-sm" style={{ borderColor: "var(--line)" }} />
          <p className="text-xs" style={{ color: "var(--ink-2)" }}>
            {"{name}"} and {"{link}"} are filled in per guest.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", "unsent", "unreplied", "attending"] as const).map((f) => (
          <button key={f} type="button" className="btn-secondary" onClick={() => setSegment(f)} style={{ borderColor: segment === f ? "var(--ink)" : "var(--line)" }}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm" style={{ color: "var(--ink-2)" }}>
          {rows.length} guest{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="card mt-4 divide-y" style={{ borderColor: "var(--line)" }}>
        {rows.length === 0 && (
          <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            No guests in this view.
          </li>
        )}
        {rows.map((g) => (
          <li key={g.id} className="flex items-center gap-4 px-4 py-3">
            <span className="min-w-0 flex-1 text-sm font-medium">{g.name}</span>
            {g.phone ? (
              <a href={waFor(g)} target="_blank" rel="noopener" className="btn-primary">
                WhatsApp
              </a>
            ) : (
              <span className="text-xs" style={{ color: "var(--ink-3)" }}>
                No number
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
