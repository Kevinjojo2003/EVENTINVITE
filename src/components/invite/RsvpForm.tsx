"use client";
import { useRef, useState } from "react";
import type { EventReply, InviteConfig, ScheduleItem } from "@/lib/types";
import { displayTitle } from "@/lib/themes";
import { language, fill } from "@/lib/i18n";
import { dayLabel, longDate, weekday } from "@/lib/format";
import { Ticket } from "./Ticket";

type Props = {
  config: InviteConfig;
  slug: string;
  guestToken?: string;
  guestName?: string;
  events?: ScheduleItem[]; // the ceremonies this guest is invited to (defaults to all)
  preview?: boolean; // in the dashboard preview nothing is submitted
};

// Headcount wording. Falls back to English for languages without a set.
const COUNT_WORDS: Record<string, { adults: string; children: string; infants: string; yes: string; no: string }> = {
  en: { adults: "Adults", children: "Children", infants: "Infants", yes: "Coming", no: "Not coming" },
  ml: { adults: "മുതിർന്നവർ", children: "കുട്ടികൾ", infants: "ശിശുക്കൾ", yes: "വരും", no: "വരില്ല" },
  hi: { adults: "वयस्क", children: "बच्चे", infants: "शिशु", yes: "आएंगे", no: "नहीं आएंगे" },
  ta: { adults: "பெரியவர்கள்", children: "குழந்தைகள்", infants: "கைக்குழந்தைகள்", yes: "வருவோம்", no: "வர இயலாது" },
  ar: { adults: "البالغون", children: "الأطفال", infants: "الرضع", yes: "سأحضر", no: "لن أحضر" },
  es: { adults: "Adultos", children: "Niños", infants: "Bebés", yes: "Asistiré", no: "No asistiré" },
  fr: { adults: "Adultes", children: "Enfants", infants: "Bébés", yes: "Présent", no: "Absent" },
};

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-1">
        <button type="button" className="chip" aria-label={`${label} minus`} disabled={value <= min} onClick={() => onChange(value - 1)} style={{ minWidth: "2.5rem", opacity: value <= min ? 0.4 : 1 }}>
          -
        </button>
        <span className="tnum w-8 text-center" aria-live="polite">
          {value}
        </span>
        <button type="button" className="chip" aria-label={`${label} plus`} disabled={value >= max} onClick={() => onChange(value + 1)} style={{ minWidth: "2.5rem", opacity: value >= max ? 0.4 : 1 }}>
          +
        </button>
      </span>
    </div>
  );
}

export function RsvpForm({ config, slug, guestToken, guestName, events, preview }: Props) {
  const { rsvp } = config;
  const schedule = events && events.length ? events : config.schedule;
  const L = config.labels;
  const tz = config.event.timezone;
  const loc = language(config.event.language).locale;
  const [name, setName] = useState(guestName ?? "");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const W = COUNT_WORDS[config.event.language] ?? COUNT_WORDS.en;
  const startAdults = rsvp.maxParty > 1 ? 2 : 1;
  const cap = Math.max(1, Math.min(20, rsvp.maxParty));
  const [replies, setReplies] = useState<Record<string, EventReply>>(() =>
    Object.fromEntries(schedule.map((e) => [e.key, { attending: true, adults: startAdults, children: 0, infants: 0 }])),
  );
  const setReply = (key: string, patch: Partial<EventReply>) => setReplies((r) => ({ ...r, [key]: { ...r[key], ...patch } }));
  const multi = schedule.length > 1;
  const going = schedule.filter((e) => replies[e.key]?.attending);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now()); // when the form appeared, so an instant submission can be recognised as a bot
  const [website, setWebsite] = useState(""); // hidden field: only bots fill it in
  const [deleted, setDeleted] = useState<"idle" | "busy" | "done">("idle");
  const [done, setDone] = useState<null | { ticketCode: string; ticketUrl: string; attending: boolean }>(null);

  const ready = name.trim().length > 1 && (!rsvp.askCompany || attending === "no" || company.trim().length > 0) && (attending === "no" || going.length > 0);
  const partyOf = (r: EventReply) => r.adults + r.children;
  const peopleLine = (r: EventReply) =>
    [`${r.adults} ${W.adults.toLowerCase()}`, r.children ? `${r.children} ${W.children.toLowerCase()}` : "", r.infants ? `${r.infants} ${W.infants.toLowerCase()}` : ""].filter(Boolean).join(", ");
  const title = displayTitle(config);

  const text = [
    `${L.rsvp}: ${title}`,
    `${L.yourName}: ${name.trim()}`,
    attending === "yes" ? L.accept : L.decline,
    ...(attending === "yes" ? schedule.map((e) => (replies[e.key]?.attending ? `${multi ? e.title + ": " : ""}${peopleLine(replies[e.key])}` : multi ? `${e.title}: ${W.no}` : "")) : []),
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
          partySize: attending === "yes" ? Math.max(...going.map((e) => partyOf(replies[e.key])), 1) : 0,
          events: attending === "yes" ? going.map((e) => e.key) : [],
          responses: Object.fromEntries(schedule.map((e) => [e.key, attending === "yes" ? replies[e.key] : { attending: false, adults: 0, children: 0, infants: 0 }])),
          note: note.trim() || null,
          website,
          startedAt: startedAt.current,
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
        <p className="display text-2xl italic">{deleted === "done" ? L.replyDeleted : done.attending ? L.thanksYes : L.thanksNo}</p>
        {!preview && deleted !== "done" && (
          <button
            type="button"
            className="dim w-fit text-sm underline underline-offset-4"
            disabled={deleted === "busy"}
            onClick={async () => {
              if (!window.confirm(L.deleteConfirm)) return;
              setDeleted("busy");
              try {
                const res = await fetch("/api/rsvp", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, code: done.ticketCode }) });
                setDeleted(res.ok ? "done" : "idle");
              } catch {
                setDeleted("idle");
              }
            }}
          >
            {deleted === "busy" ? L.deleting : L.deleteReply}
          </button>
        )}
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
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
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

      {attending === "yes" && (
        <div className="grid gap-6">
          {schedule.map((e) => {
            const r = replies[e.key];
            if (!r) return null;
            return (
              <div key={e.key} className="hairline grid gap-4 border-t pt-5 first:border-t-0 first:pt-0">
                {multi && (
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="leading-snug">
                      <span className="display block text-xl">{e.title}</span>
                      <span className="dim block text-xs">{weekday(e.start, tz, loc)}</span>
                    </p>
                    <span className="flex gap-2">
                      <button type="button" className="chip" aria-pressed={r.attending} onClick={() => setReply(e.key, { attending: true })}>
                        {W.yes}
                      </button>
                      <button type="button" className="chip" aria-pressed={!r.attending} onClick={() => setReply(e.key, { attending: false })}>
                        {W.no}
                      </button>
                    </span>
                  </div>
                )}
                {r.attending && cap > 1 && (
                  <div className="grid gap-3">
                    {!multi && <span className="eyebrow">{L.howMany}</span>}
                    <Stepper label={rsvp.askChildren ? W.adults : L.howMany} value={r.adults} min={1} max={cap} onChange={(n) => setReply(e.key, { adults: n })} />
                    {rsvp.askChildren && (
                      <>
                        <Stepper label={W.children} value={r.children} min={0} max={cap} onChange={(n) => setReply(e.key, { children: n })} />
                        <Stepper label={W.infants} value={r.infants} min={0} max={cap} onChange={(n) => setReply(e.key, { infants: n })} />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
