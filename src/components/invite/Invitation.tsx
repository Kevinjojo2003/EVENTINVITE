"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InviteConfig } from "@/lib/types";
import { FONT_PAIRS, displayTitle, fontsHref, sealText } from "@/lib/themes";
import { language, fill } from "@/lib/i18n";
import { calendarUrl, dayLabel, longDate, shortDate, timeLabel, tzShort } from "@/lib/format";
import { createMusic, type MusicControl } from "./music";
import { Fireflies } from "./Fireflies";
import { Gate } from "./Gate";
import { Countdown } from "./Countdown";
import { RsvpForm } from "./RsvpForm";

type Props = {
  config: InviteConfig;
  slug: string;
  guest?: { name: string; token: string } | null;
  preview?: boolean;
};

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4" aria-hidden="true">
      <span className="h-px w-16" style={{ background: "color-mix(in srgb, var(--inv-accent) 35%, transparent)" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--inv-accent)" }} />
      <span className="h-px w-16" style={{ background: "color-mix(in srgb, var(--inv-accent) 35%, transparent)" }} />
    </div>
  );
}

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-5xl px-5 sm:px-8 ${className}`}>
      {children}
    </section>
  );
}

function MusicToggle({ playing, onToggle, on, off }: { playing: boolean; onToggle: () => void; on: string; off: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={playing ? off : on}
      className="hairline fixed bottom-5 right-5 z-40 flex h-11 items-center gap-3 border px-4 backdrop-blur"
      style={{ background: "color-mix(in srgb, var(--inv-bg-deep) 75%, transparent)", color: "var(--inv-accent)" }}
    >
      <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`bar h-full w-[3px] ${playing ? "" : "paused"}`} style={{ background: "var(--inv-accent)" }} />
        ))}
      </span>
      <span className="text-[0.62rem] uppercase tracking-[0.28em]">{playing ? on : off}</span>
    </button>
  );
}

export function Invitation({ config, slug, guest, preview }: Props) {
  const c = config;
  const L = c.labels;
  const lang = language(c.event.language);
  const tz = c.event.timezone || "Asia/Kolkata";
  const loc = lang.locale;
  const fonts = FONT_PAIRS[c.theme.fonts] ?? FONT_PAIRS["bodoni-jost"];
  // A script font (Malayalam, Devanagari, Arabic...) is added as a fallback so the
  // chosen display face still shows for Latin text.
  const scriptFallback = lang.script ? `, "${lang.script.family}"` : "";
  const vars = {
    "--inv-bg": c.theme.colors.bg,
    "--inv-bg-deep": c.theme.colors.bgDeep,
    "--inv-ink": c.theme.colors.ink,
    "--inv-ink-dim": c.theme.colors.inkDim,
    "--inv-accent": c.theme.colors.accent,
    "--inv-accent-deep": c.theme.colors.accentDeep,
    "--inv-display": fonts.display.replace(/,/, `${scriptFallback},`),
    "--inv-body": fonts.body.replace(/,/, `${scriptFallback},`),
  } as React.CSSProperties;
  const fontHref = fontsHref(c.theme.fonts) + (lang.script ? `&${lang.script.google}` : "");

  // Music control, rebuilt when the source changes (the preview edits it live).
  const music = useRef<MusicControl | null>(null);
  const [playing, setPlaying] = useState(false);
  const musicKey = `${c.music.source}|${c.music.url}|${c.music.youtubeId}`;
  useEffect(() => {
    const wasPlaying = music.current?.playing() ?? false;
    music.current?.destroy();
    music.current = createMusic(c.music);
    if (wasPlaying) music.current.play();
    else setPlaying(false);
    return () => {
      music.current?.destroy();
      music.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicKey]);

  const start = () => {
    if (c.music.source === "none") return;
    music.current?.play();
    setPlaying(true);
  };
  const toggle = () => {
    const m = music.current;
    if (!m) return;
    if (m.playing()) {
      m.pause();
      setPlaying(false);
    } else {
      m.play();
      setPlaying(true);
    }
  };

  const title = displayTitle(c) || "Your names";
  const dateLong = longDate(c.event.dateTime, tz, loc);
  const hasMusic = c.music.source !== "none";
  const mainEvent = c.schedule[0];
  const dateLine = useMemo(
    () => shortDate(c.event.dateTime, tz, loc) || dayLabel(mainEvent?.start ?? "", tz, loc),
    [c.event.dateTime, mainEvent?.start, tz, loc],
  );
  const visibleCredits = c.credits.filter((k) => k.value);

  return (
    <div className="inv relative" style={vars} dir={lang.dir} lang={c.event.language === "other" ? undefined : c.event.language}>
      <link rel="stylesheet" href={fontHref} />
      {c.theme.fireflies && <Fireflies color={c.theme.colors.accent} />}
      <Gate
        key={preview ? "preview" : "live"}
        seal={sealText(c) || "✦"}
        title={title}
        dateLine={dateLine}
        hint={hasMusic ? L.openHint : L.soundHint}
        invitedLabel={guest?.name ? fill(L.forGuest, { name: guest.name }) : L.invited}
        onOpen={start}
      />
      {hasMusic && <MusicToggle playing={playing} onToggle={toggle} on={L.musicOn} off={L.musicOff} />}

      <main className="relative z-10">
        {/* Hero */}
        <Section id="top" className="flex flex-col items-center gap-8 pb-24 pt-20 text-center sm:pt-28">
          {c.heroPhoto && (
            <div className="hairline rise h-40 w-40 overflow-hidden rounded-full border-4 sm:h-52 sm:w-52">
              <img src={c.heroPhoto} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          {c.texts.eyebrow && <p className="eyebrow rise">{c.texts.eyebrow}</p>}
          <h1 className="rise rise-2 display text-[clamp(2.6rem,10vw,7rem)] font-normal italic leading-[0.95]" style={{ textWrap: "balance" }}>
            {c.hosts.name2.trim() ? (
              <>
                {c.hosts.name1}
                <span className="display accent mx-[0.15em] not-italic" style={{ fontSize: "0.6em", verticalAlign: "0.12em" }}>
                  &amp;
                </span>
                {c.hosts.name2}
              </>
            ) : (
              c.hosts.name1 || "Your name"
            )}
          </h1>
          {c.hosts.subline && <p className="rise rise-3 display text-[clamp(1.3rem,3vw,1.9rem)]">{c.hosts.subline}</p>}
          {c.event.headline && <p className="rise rise-3 dim max-w-md text-lg">{c.event.headline}</p>}
          <div className="rise rise-4 flex flex-col items-center gap-2">
            {dateLong && <p className="display text-[clamp(1.2rem,3vw,1.6rem)]">{dateLong}</p>}
            {(c.venue.name || c.event.city) && (
              <p className="accent text-sm uppercase tracking-[0.22em]">{[c.venue.name, c.event.city].filter(Boolean).join(" · ")}</p>
            )}
          </div>
          {c.event.dateTime && (
            <div className="rise rise-5 flex flex-col items-center gap-8 pt-4">
              <Ornament />
              <Countdown to={c.event.dateTime} labels={{ days: L.days, hours: L.hours, minutes: L.minutes, seconds: L.seconds, today: L.today }} />
            </div>
          )}
        </Section>

        {/* Story */}
        {c.story && (
          <Section id="story" className="pb-24">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="eyebrow">{c.storyLabel}</p>
              </div>
              <p className="display text-[clamp(1.35rem,2.6vw,1.8rem)] leading-[1.45] md:col-span-8" style={{ maxWidth: "34ch" }}>
                {c.story}
              </p>
            </div>
          </Section>
        )}

        {/* Schedule */}
        {c.schedule.length > 0 && (
          <Section id="schedule" className="pb-24">
            <div className="hairline mb-10 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
              <h2 className="display text-[clamp(2rem,5vw,3rem)] italic leading-none">{c.schedule.length > 1 ? L.scheduleMany : L.scheduleOne}</h2>
              <p className="dim text-sm">{fill(L.timesNote, { tz: tzShort(tz, loc) })}</p>
            </div>
            <ol className={`grid gap-x-10 gap-y-12 ${c.schedule.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {c.schedule.map((e) => (
                <li key={e.key} className="flex flex-col gap-4">
                  <div>
                    <p className="eyebrow">{dayLabel(e.start, tz, loc) || " "}</p>
                    <h3 className="display mt-2 text-[clamp(1.6rem,3vw,2.1rem)] leading-tight">{e.title}</h3>
                  </div>
                  <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 text-sm">
                    {e.start && (
                      <>
                        <dt className="dim">{L.when}</dt>
                        <dd className="tnum">
                          {timeLabel(e.start, tz, loc)}
                          {e.end ? ` ${L.to} ${timeLabel(e.end, tz, loc)}` : ` ${L.onwards}`}
                        </dd>
                      </>
                    )}
                    {e.place && (
                      <>
                        <dt className="dim">{L.where}</dt>
                        <dd>{e.place}</dd>
                      </>
                    )}
                    {e.dress && (
                      <>
                        <dt className="dim">{L.wear}</dt>
                        <dd>{e.dress}</dd>
                      </>
                    )}
                  </dl>
                  {e.note && <p className="dim text-base leading-relaxed">{e.note}</p>}
                  {e.start && (
                    <a
                      href={calendarUrl(`${e.title}: ${title}`, e.start, e.end, e.place || c.venue.name, e.note)}
                      target="_blank"
                      rel="noopener"
                      className="accent mt-auto inline-flex w-fit items-center gap-2 text-[0.68rem] uppercase tracking-[0.26em] underline-offset-[6px] hover:underline"
                    >
                      {L.addToCalendar} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Venue */}
        {c.venue.name && (
          <Section id="venue" className="pb-24">
            <div className="hairline grid gap-10 border-y py-12 md:grid-cols-12">
              <div className="flex flex-col gap-5 md:col-span-5">
                <p className="eyebrow">{L.venue}</p>
                <h2 className="display text-[clamp(2rem,5vw,3rem)] italic leading-none">{c.venue.name}</h2>
                <address className="dim not-italic leading-relaxed">
                  {c.venue.line1}
                  {c.venue.line1 && c.venue.line2 && <br />}
                  {c.venue.line2}
                </address>
                {c.venue.mapsUrl && (
                  <a href={c.venue.mapsUrl} target="_blank" rel="noopener" className="btn btn-ghost w-fit">
                    {L.openMaps} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
              <div className="grid gap-8 md:col-span-7 md:ps-10">
                {c.venue.directions && (
                  <div>
                    <p className="eyebrow mb-3">{L.gettingThere}</p>
                    <p className="leading-relaxed">{c.venue.directions}</p>
                  </div>
                )}
                {c.venue.stay && (
                  <div>
                    <p className="eyebrow mb-3">{L.stayingOver}</p>
                    <p className="leading-relaxed">{c.venue.stay}</p>
                  </div>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Photos */}
        {c.photos.length > 0 && (
          <Section id="photos" className="pb-24">
            <p className="eyebrow mb-8">{L.moments}</p>
            <div className="columns-2 gap-4 md:columns-3 [&>figure]:mb-4 [&>figure]:break-inside-avoid">
              {c.photos.map((p, i) => (
                <figure key={p.url + i} className="m-0">
                  <img src={p.url} alt={p.caption || ""} loading="lazy" className="block w-full" />
                  {p.caption && <figcaption className="dim mt-2 text-xs">{p.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </Section>
        )}

        {/* RSVP */}
        <Section id="rsvp" className="pb-28">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="flex flex-col gap-4 md:col-span-4">
              <p className="eyebrow">{L.rsvp}</p>
              <h2 className="display text-[clamp(2rem,5vw,3rem)] italic leading-none">{c.rsvp.tickets ? L.rsvpTicketTitle : L.rsvpTitle}</h2>
              <p className="dim leading-relaxed">{c.rsvp.tickets ? L.rsvpTicketNote : L.rsvpNote}</p>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <RsvpForm
                key={`${c.rsvp.mode}|${c.rsvp.tickets}|${c.rsvp.askCompany}|${c.rsvp.maxParty}|${c.event.language}`}
                config={c}
                slug={slug}
                guestToken={guest?.token}
                guestName={guest?.name}
                preview={preview}
              />
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="mx-auto w-full max-w-5xl px-5 pb-28 sm:px-8">
          <Ornament />
          {visibleCredits.length > 0 && (
            <div className={`mt-10 grid gap-8 text-center ${visibleCredits.length > 1 ? "sm:grid-cols-2 sm:text-start" : ""}`}>
              {visibleCredits.map((k, i) => (
                <div key={k.label + i} className={i === visibleCredits.length - 1 && visibleCredits.length > 1 ? "sm:text-end" : ""}>
                  <p className="eyebrow mb-2">{k.label}</p>
                  <p className="display text-xl">{k.value}</p>
                </div>
              ))}
            </div>
          )}
          {(c.music.credit || c.texts.footerNote) && (
            <p className="dim mt-14 text-center text-xs">{[c.music.credit, c.texts.footerNote].filter(Boolean).join(" · ")}</p>
          )}
        </footer>
      </main>
    </div>
  );
}
