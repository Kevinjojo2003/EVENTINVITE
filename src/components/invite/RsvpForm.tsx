"use client";
import { useState } from "react";
import type { InviteConfig } from "@/lib/types";
import { displayTitle } from "@/lib/themes";
import { language, fill } from "@/lib/i18n";
import { dayLabel, longDate, weekday } from "@/lib/format";
import { Ticket } from "./Ticket";

type Props = {
  config: InviteConfig;
  slug: string;
  guestToken?: string;
  guestName?: string;
  preview?: boolean; // in the dashboard preview nothing is submitted
};

export function RsvpForm({ config, slug, guestToken, guestName, preview }: Props) {
  const { rsvp, schedule } = config;
  const L = config.labels;
  const tz = config.event.timezone;
  const loc = language(config.event.language).locale;
  const [name, setName] = useState(guestName ?? "");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [count, setCount] = useState(rsvp.maxParty > 1 ? "2" : "1");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [picked, setPicked] = useState<Record<string, boolean>>(Object.fromEntries(schedule.map((e) => [e.key, true])));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { ticketCode: string; ticketUrl: string; attending: boolean }>(null);

  const ready = name.trim().length > 1 && (!rsvp.askCompany || attending === "no" || company.trim().length > 0);
  const chosen = schedule.filter((e) => picked[e.key]).map((e) => e.title);
  const counts = Array.from({ length: Math.max(1, Math.min(20, rsvp.maxParty)) }, (_, i) => String(i + 1));
  const title = displayTitle(config);

  const text = [
    `${L.rsvp}: ${title}`,
    `${L.yourName}: ${name.trim()}`,
    attending === "yes" ? `${L.accept} (${count})` : L.decline,
    attending === "yes" && chosen.length && schedule.length > 1 ? `${L.whichDays}: ${chosen.join(", ")}` : "",
    company.trim() ? `${L.company}: ${company.trim()}` : "",
    note.trim() ? `${L.anythingElse}: ${note.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const waHref = rsvp.whatsapp ? `https://wa.me/${rsvp.whatsapp}?text=${encodeURIComponent(text)}` : "";
  const mailHref = rsvp.email ? `mailto:${rsvp.email}?subject=${encodeURIComponent(`${L.rsvp}: ${name.trim() || "Guest"}`)}&body=${encodeURIComponent(text)}` : "";
  const showForm = rsvp.mode !== "whatsapp";
  const showWa = rsvp.mode !== "form" && !!waHref;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    if (preview) {
      setDone({ ticketCode: "PREVIEW01", ticketUrl: "https://example.com/ticket/PREVIEW01", attending: attending === "yes" });
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          guestToken: guestToken || null,
          name: name.trim(),
          email: email.trim() || null,
          company: company.trim() || null,
          attending: attending === "yes",
          partySize: attending === "yes" ? Number(count) : 0,
          events: attending === "yes" ? schedule.filter((s) => picked[s.key]).map((s) => s.key) : [],
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save your reply.");
      setDone({ ticketCode: data.ticketCode, ticketUrl: data.ticketUrl, attending: attending === "yes" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your reply.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const main = schedule[0];
    return (
      <div className="grid gap-6">
        <p className="display text-2xl italic">{done.attending ? L.thanksYes : L.thanksNo}</p>
        {done.attending && rsvp.tickets && (
          <Ticket
            code={done.ticketCode}
            url={done.ticketUrl}
            name={name.trim()}
            eventTitle={config.hosts.subline || title}
            dateLine={longDate(config.event.dateTime, tz, loc) || dayLabel(main?.start ?? "", tz, loc)}
            venue={config.venue.name || main?.place || ""}
            labels={{ admitOne: L.admitOne, showAtDoor: L.showAtDoor, checkedIn: L.checkedIn, when: L.when, where: L.where }}
          />
        )}
      </div>
    );
  }

  return (
    <form className="grid gap-7" onSubmit={submit}>
      <div className="grid gap-2">
        <label htmlFor="rsvp-name" className="eyebrow">
          {L.yourName}
        </label>
        <input id="rsvp-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </div>

      <div className="grid gap-3">
        <span className="eyebrow">{L.willYouJoin}</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={attending === "yes"} onClick={() => setAttending("yes")}>
            {L.accept}
          </button>
          <button type="button" className="chip" aria-pressed={attending === "no"} onClick={() => setAttending("no")}>
            {L.decline}
          </button>
        </div>
      </div>

      {attending === "yes" && rsvp.askCompany && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="rsvp-company" className="eyebrow">
              {L.company}
            </label>
            <input id="rsvp-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="rsvp-email" className="eyebrow">
              {L.email}
            </label>
            <input id="rsvp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
        </div>
      )}

      {attending === "yes" && rsvp.maxParty > 1 && (
        <div className="grid gap-2">
          <span className="eyebrow">{L.howMany}</span>
          <div className="flex flex-wrap gap-2">
            {counts.map((n) => (
              <button key={n} type="button" className="chip tnum" aria-pressed={count === n} onClick={() => setCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {attending === "yes" && schedule.length > 1 && (
        <div className="grid gap-3">
          <span className="eyebrow">{L.whichDays}</span>
          <div className="grid gap-3 sm:grid-cols-3">
            {schedule.map((e) => (
              <label key={e.key} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1.5 h-4 shrink-0"
                  style={{ accentColor: "var(--inv-accent)", width: "1rem" }}
                  checked={!!picked[e.key]}
                  onChange={(ev) => setPicked((p) => ({ ...p, [e.key]: ev.target.checked }))}
                />
                <span className="leading-snug">
                  <span className="block">{e.title}</span>
                  <span className="dim block text-xs">{weekday(e.start, tz, loc)}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <label htmlFor="rsvp-note" className="eyebrow">
          {L.anythingElse}
        </label>
        <textarea id="rsvp-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={L.anythingElsePlaceholder} />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
        {showForm ? (
          <button type="submit" className="btn" disabled={!ready || busy}>
            {busy ? L.sending : rsvp.tickets && attending === "yes" ? L.confirmTicket : L.sendReply}
          </button>
        ) : (
          <a className={`btn ${ready ? "" : "pointer-events-none opacity-50"}`} href={waHref} target="_blank" rel="noopener">
            {L.sendWhatsApp}
          </a>
        )}
        {showForm && showWa && (
          <a href={waHref} target="_blank" rel="noopener" className="dim text-sm underline-offset-4 hover:underline">
            {L.orWhatsApp}
          </a>
        )}
        {!showWa && mailHref && (
          <a href={mailHref} className="dim text-sm underline-offset-4 hover:underline">
            {L.orEmail}
          </a>
        )}
      </div>

      <p className="dim text-sm" aria-live="polite">
        {error ? error : rsvp.deadline ? fill(L.replyBy, { date: rsvp.deadline }) : ""}
      </p>
    </form>
  );
}
