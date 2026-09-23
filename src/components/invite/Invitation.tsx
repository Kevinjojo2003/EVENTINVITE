"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InviteConfig } from "@/lib/types";
import { BACKGROUNDS, FONT_PAIRS, displayTitle, fontsHref, sealText } from "@/lib/themes";
import { language, fill } from "@/lib/i18n";
import { calendarUrl, formalDate, formalTime, icsHref, dateParts as dateP, dayLabel, longDate, numericDate, shortDate, timeLabel, tzShort } from "@/lib/format";
import { createMusic, type MusicControl } from "./music";
import { Fireflies } from "./Fireflies";
import { Gate } from "./Gate";
import { Countdown } from "./Countdown";
import { RsvpForm } from "./RsvpForm";
import { eventIcon } from "./eventIcons";
import { Icon } from "@/components/icons/Icon";
import { EVENT_TYPES } from "@/lib/types";
import { Corner, Divider, FrameFlourish, Mandap, Motif, Vines, WildflowerSide } from "./Ornaments";
import { Scene } from "./Scene";
import { SiteNav } from "./SiteNav";
import { PHOTOS } from "@/lib/photos";
import { PhotoBackdrop } from "./PhotoBackdrop";
import { Watercolor } from "./Watercolor";
import { Baby, Bike, Bus, Car, ChevronLeft, ChevronRight, MapPin, Phone, Shirt, TrainFront, UserRound, WineOff, X } from "lucide-react";

type Props = {
  config: InviteConfig;
  slug: string;
  guest?: { name: string; token: string; events?: string[] } | null;
  preview?: boolean;
};

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
      className="hairline fixed bottom-7 right-7 z-40 flex h-11 sm:bottom-10 sm:right-10 items-center gap-3 border px-4 backdrop-blur"
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

// Wording for the small tiles on each ceremony. Falls back to English.
const TILE_WORDS: Record<string, { kids: string; welcome: string; adults: string; dry: string; contact: string; officiant: string }> = {
  en: { kids: "Kids", welcome: "Children are welcome", adults: "Adults only", dry: "No alcohol served", contact: "Contact", officiant: "Officiant" },
  ml: { kids: "കുട്ടികൾ", welcome: "കുട്ടികൾക്ക് സ്വാഗതം", adults: "മുതിർന്നവർക്ക് മാത്രം", dry: "മദ്യം ഉണ്ടാകില്ല", contact: "ബന്ധപ്പെടാൻ", officiant: "Officiant" },
  hi: { kids: "बच्चे", welcome: "बच्चों का स्वागत है", adults: "केवल वयस्कों के लिए", dry: "शराब नहीं परोसी जाएगी", contact: "संपर्क", officiant: "Officiant" },
  ta: { kids: "குழந்தைகள்", welcome: "குழந்தைகளுக்கு வரவேற்பு", adults: "பெரியவர்களுக்கு மட்டும்", dry: "மதுபானம் இல்லை", contact: "தொடர்புக்கு", officiant: "Officiant" },
  ar: { kids: "الأطفال", welcome: "الأطفال مرحب بهم", adults: "للبالغين فقط", dry: "بدون كحول", contact: "للتواصل", officiant: "Officiant" },
  es: { kids: "Niños", welcome: "Niños bienvenidos", adults: "Solo adultos", dry: "Sin alcohol", contact: "Contacto", officiant: "Oficiante" },
  fr: { kids: "Enfants", welcome: "Enfants bienvenus", adults: "Adultes uniquement", dry: "Sans alcool", contact: "Contact", officiant: "Officiant" },
};

function Tile({ icon: Icon, label, children }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} strokeWidth={1.5} className="accent mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="eyebrow" style={{ fontSize: "0.6rem" }}>
          {label}
        </p>
        <div className="mt-1 text-[0.95rem] leading-snug">{children}</div>
      </div>
    </div>
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
  const [zoom, setZoom] = useState<number | null>(null);
  const musicKey = `${c.music.source}|${c.music.url}|${c.music.youtubeId}|${c.music.youtubeStart}`;
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

  const website = c.theme.layout === "website";
  const customPhotoFile = c.theme.photo === "custom" ? c.theme.photoUrl : "";
  const heroImage = c.heroPhoto || customPhotoFile || (c.theme.photo && c.theme.photo !== "none" && c.theme.photo !== "custom" ? PHOTOS[c.theme.photo].file : "");
  const scene = c.theme.scene && c.theme.scene !== "none" ? c.theme.scene : null;
  const photoOn = !website && !scene && c.theme.photo && c.theme.photo !== "none" && (c.theme.photo !== "custom" || !!c.theme.photoUrl);
  const photoBackdrop = !photoOn
    ? null
    : c.theme.photo === "custom"
      ? { file: c.theme.photoUrl, tint: `rgba(${c.theme.photoScrim === "dark" ? "10,8,6" : "255,252,245"}, ${c.theme.photoOpacity / 100})`, position: "center" }
      : { file: PHOTOS[c.theme.photo as Exclude<typeof c.theme.photo, "none" | "custom">].file, tint: PHOTOS[c.theme.photo as Exclude<typeof c.theme.photo, "none" | "custom">].tint, position: PHOTOS[c.theme.photo as Exclude<typeof c.theme.photo, "none" | "custom">].position };
  const wash = !scene && !photoOn && c.theme.watercolor && c.theme.watercolor !== "none" ? c.theme.watercolor : null;
  const bgCss = scene || photoOn || wash ? "" : BACKGROUNDS[c.theme.background]?.css ?? "";
  const garden = c.theme.ornament === "garden";
  const wild = c.theme.ornament === "wildflower";
  const dateParts = dateP(c.event.dateTime, tz, loc);
  const title = displayTitle(c) || "Your names";
  const dateLong = longDate(c.event.dateTime, tz, loc);
  const hasMusic = c.music.source !== "none";
  const invitedKeys = guest?.events && guest.events.length ? new Set(guest.events) : null;
  const schedule = invitedKeys ? c.schedule.filter((e) => invitedKeys.has(e.key)) : c.schedule;
  const mainEvent = schedule[0];
  const dateLine = useMemo(
    () => shortDate(c.event.dateTime, tz, loc) || dayLabel(mainEvent?.start ?? "", tz, loc),
    [c.event.dateTime, mainEvent?.start, tz, loc],
  );
  const visibleCredits = c.credits.filter((k) => k.value);

  return (
    <div className="inv relative" style={{ ...vars, ...(bgCss ? { background: `${bgCss}, ${c.theme.colors.bg}` } : {}) }} dir={lang.dir} lang={c.event.language === "other" ? undefined : c.event.language}>
      <link rel="stylesheet" href={fontHref} />
      {wild && (
        <>
          <WildflowerSide side="left" />
          <WildflowerSide side="right" />
          <div className="pointer-events-none absolute left-0 right-0 top-3 z-[6] flex justify-center sm:top-5" aria-hidden="true" style={{ color: "var(--inv-accent)" }}>
            <FrameFlourish />
          </div>
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-[6] flex justify-center sm:bottom-5" aria-hidden="true" style={{ color: "var(--inv-accent)" }}>
            <FrameFlourish flip />
          </div>
        </>
      )}
      {scene && <Scene kind={scene} />}
      {photoBackdrop && <PhotoBackdrop file={photoBackdrop.file} tint={photoBackdrop.tint} position={photoBackdrop.position} />}
      {wash && <Watercolor kind={wash} />}
      {garden && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 z-20 w-[22vw] max-w-[190px]" aria-hidden="true" style={{ color: "var(--inv-accent)" }}>
            <Vines />
          </div>
          <div className="pointer-events-none absolute right-0 top-0 z-20 w-[22vw] max-w-[190px]" aria-hidden="true" style={{ color: "var(--inv-accent)" }}>
            <Vines mirror />
          </div>
        </>
      )}
      {c.theme.fireflies && <Fireflies color={c.theme.colors.accent} inside={c.theme.frame} />}
      {c.theme.frame && (
        <div className="pointer-events-none fixed inset-3 z-30 sm:inset-5" aria-hidden="true" style={{ border: "1px solid color-mix(in srgb, var(--inv-accent) 45%, transparent)" }} />
      )}
      {c.theme.frame && c.theme.ornament !== "none" && (
        // The flourishes belong to the corners of the whole page, so they sit at the very top and bottom and never cross the text.
        <div className="pointer-events-none absolute inset-3 z-30 sm:inset-5" aria-hidden="true" style={{ color: "var(--inv-accent)" }}>
          <span className="absolute -left-px -top-px"><Corner size={56} /></span>
          <span className="absolute -right-px -top-px" style={{ transform: "scaleX(-1)" }}><Corner size={56} /></span>
          <span className="absolute -bottom-px -left-px" style={{ transform: "scaleY(-1)" }}><Corner size={56} /></span>
          <span className="absolute -bottom-px -right-px" style={{ transform: "scale(-1,-1)" }}><Corner size={56} /></span>
        </div>
      )}
      {!website && (
      <Gate
        key={preview ? "preview" : "live"}
        seal={sealText(c) || "✦"}
        title={title}
        dateLine={dateLine}
        hint={hasMusic ? L.openHint : L.soundHint}
        invitedLabel={guest?.name ? fill(L.forGuest, { name: guest.name }) : L.invited}
        onOpen={start}
      />
      )}
      {website && (
        <SiteNav
          title={displayTitle(c) || "Our wedding"}
          items={[
            ...((c.story || c.extras.chapters.length) ? [{ id: "story", label: c.storyLabel || "Story" }] : []),
            ...(c.extras.hotels.length ? [{ id: "stay", label: L.stay }] : []),
            ...(schedule.length ? [{ id: "schedule", label: "Schedule" }] : []),
            ...(c.extras.travel.trim() ? [{ id: "travel", label: L.travel }] : []),
            ...(c.extras.faq.length ? [{ id: "faq", label: L.faq }] : []),
            ...(c.extras.party.length ? [{ id: "party", label: L.party }] : []),
            ...(c.photos.length ? [{ id: "photos", label: "Moments" }] : []),
            { id: "rsvp", label: "RSVP" },
          ]}
        />
      )}
      {hasMusic && <MusicToggle playing={playing} onToggle={toggle} on={L.musicOn} off={L.musicOff} />}

      <main className={`relative z-10 ${wild ? "px-[15vw] pt-10 sm:px-[min(14vw,130px)]" : c.theme.frame ? "px-3 sm:px-6" : ""}`}>
        {c.extras.announcement.trim() && (
          <div role="status" className="relative z-20 px-5 py-3 text-center text-sm" style={{ background: "var(--inv-accent)", color: "var(--inv-bg-deep)" }}>
            {c.extras.announcement}
          </div>
        )}
        {/* Hero */}
        {website ? (
          <section id="top" className="relative -mx-3 flex min-h-[94vh] items-end overflow-hidden sm:-mx-6">
            {heroImage ? (
              <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
            ) : (
              <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${c.theme.colors.bgDeep}, ${c.theme.colors.accentDeep})` }} />
            )}
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.05) 35%, rgba(0,0,0,.72) 100%)" }} />
            <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 sm:px-10 sm:pb-24" style={{ color: "#fff" }}>
              {c.texts.eyebrow && <p className="eyebrow" style={{ color: "#fff", opacity: 0.85 }}>{c.texts.eyebrow}</p>}
              <h1 className="display mt-3 text-[clamp(3rem,11vw,7.5rem)] font-normal leading-[0.95]" style={{ textWrap: "balance" }}>
                {c.hosts.name2.trim() ? `${c.hosts.name1} & ${c.hosts.name2}` : c.hosts.name1 || "Your names"}
              </h1>
              {c.event.headline && <p className="mt-5 max-w-lg text-lg" style={{ opacity: 0.92 }}>{c.event.headline}</p>}
              <div className="mt-7 grid gap-1 text-lg">
                {dateLong && <p className="display text-[clamp(1.3rem,3vw,1.9rem)]">{dateLong}</p>}
                {(c.venue.name || c.event.city) && <p style={{ opacity: 0.9 }}>{[c.venue.name, c.event.city].filter(Boolean).join(" · ")}</p>}
              </div>
              <a href="#rsvp" className="btn mt-9" style={{ background: "#fff", color: "#1b1a17", borderColor: "#fff" }}>
                {L.rsvp}
              </a>
            </div>
          </section>
        ) : (
        <Section id="top" className="flex flex-col items-center gap-8 pb-24 pt-20 text-center sm:pt-28">
          {c.heroPhoto && (
            <div className="hairline rise h-40 w-40 overflow-hidden rounded-full border-4 sm:h-52 sm:w-52">
              <img src={c.heroPhoto} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          {c.theme.ornament !== "none" && !wild && !garden && (
            <div className="rise accent" aria-hidden="true">
              <Motif kind={c.theme.ornament} />
            </div>
          )}
          {c.texts.verse.trim() && (
            <figure className="rise m-0 max-w-xl">
              <blockquote className="display m-0 text-[clamp(1.1rem,2.2vw,1.4rem)] italic leading-relaxed">{c.texts.verse}</blockquote>
              {c.texts.verseSource.trim() && <figcaption className="eyebrow mt-3">{c.texts.verseSource}</figcaption>}
            </figure>
          )}
          {c.texts.crest.trim() && (
            <p className="display accent rise text-[clamp(1.4rem,3vw,2rem)] leading-none" aria-hidden="true">
              {c.texts.crest}
            </p>
          )}
          {c.theme.titleStyle === "stacked" ? (
            <div className="rise flex flex-col items-center gap-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap" />
              <p className="uppercase tracking-[0.14em] text-[clamp(1.05rem,2.6vw,1.5rem)]">{c.texts.titleLead || L.invited}</p>
              <p className="uppercase tracking-[0.04em] text-[clamp(2.6rem,10vw,5.6rem)] leading-none">{c.texts.title || EVENT_TYPES[c.event.type].label}</p>
              {c.hosts.name2.trim() || c.texts.titleJoin ? <p className="text-[clamp(1.1rem,3vw,1.6rem)]">{c.texts.titleJoin || "of"}</p> : null}
            </div>
          ) : (
            c.texts.eyebrow && <p className="eyebrow rise">{c.texts.eyebrow}</p>
          )}
          <h1 className="rise rise-2 display relative text-[clamp(2.6rem,10vw,7rem)] font-normal italic leading-[0.95]" style={{ textWrap: "balance" }}>
            {c.hosts.name2.trim() ? (
              <>
                {c.hosts.name1}
                {c.theme.bigAmpersand ? (
                  <>
                    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none not-italic" style={{ fontSize: "3.2em", lineHeight: 1, color: "var(--inv-ink-dim)", opacity: 0.3 }}>
                      &amp;
                    </span>
                    <span className="mx-[0.2em]" />
                  </>
                ) : (
                  <span className="display accent mx-[0.15em] not-italic" style={{ fontSize: "0.6em", verticalAlign: "0.12em" }}>
                    &amp;
                  </span>
                )}
                {c.hosts.name2}
              </>
            ) : (
              c.hosts.name1 || "Your name"
            )}
          </h1>
          {c.hosts.nameTranslit.trim() && (
            <p dir="ltr" className="rise dim text-[0.72rem] uppercase tracking-[0.28em]" style={{ marginTop: "-0.3rem" }}>
              {c.hosts.nameTranslit}
            </p>
          )}
          {c.hosts.subline && <p className="rise rise-3 display text-[clamp(1.3rem,3vw,1.9rem)]">{c.hosts.subline}</p>}
          {c.event.headline && c.theme.titleStyle !== "stacked" && <p className="rise rise-3 dim max-w-md text-lg">{c.event.headline}</p>}
          <div className="rise rise-4 flex flex-col items-center gap-2">
            {c.theme.dateStyle === "formal" && c.event.dateTime ? (
              <div dir="ltr" className="grid max-w-md gap-1">
                <p className="display text-[clamp(1.15rem,2.6vw,1.4rem)] leading-snug">{formalDate(c.event.dateTime, tz)}</p>
                <p className="dim text-[clamp(0.95rem,2.2vw,1.1rem)] leading-snug">{formalTime(c.event.dateTime, tz)}</p>
              </div>
            ) : c.theme.dateStyle === "numeric" && c.event.dateTime ? (
              <p dir="ltr" className="display text-[clamp(1.6rem,4.4vw,2.6rem)] tracking-[0.08em]">{numericDate(c.event.dateTime, tz)}</p>
            ) : c.theme.dateStyle === "split" && dateParts ? (
              <div className="flex items-center gap-5" dir="ltr">
                <span className="display text-[clamp(3.2rem,9vw,5rem)] leading-none">{dateParts.day}</span>
                <span className="accent h-[clamp(3rem,8vw,4.4rem)] w-px" style={{ background: "currentColor" }} aria-hidden="true" />
                <span className="flex flex-col items-start text-start">
                  <span className="text-[clamp(1.1rem,3vw,1.5rem)] uppercase tracking-[0.18em]">{dateParts.weekday}</span>
                  <span className="dim text-[clamp(0.95rem,2.4vw,1.2rem)] uppercase tracking-[0.18em]">{dateParts.month}</span>
                </span>
              </div>
            ) : (
              dateLong && <p className="display text-[clamp(1.2rem,3vw,1.6rem)]">{dateLong}</p>
            )}
            {c.texts.dateTranslit.trim() && (
              <p dir="ltr" className="dim text-[0.7rem] uppercase tracking-[0.22em]">
                {c.texts.dateTranslit}
              </p>
            )}
            {(c.venue.name || c.event.city) && (
              <p className="accent text-sm uppercase tracking-[0.22em]">{[c.venue.name, c.event.city].filter(Boolean).join(" · ")}</p>
            )}
            {c.extras.hashtag.trim() && <p className="dim text-sm">{c.extras.hashtag.startsWith("#") ? c.extras.hashtag : `#${c.extras.hashtag}`}</p>}
          </div>
          {c.event.dateTime && (
            <div className="rise rise-5 flex flex-col items-center gap-8 pt-4">
              <Divider kind={c.theme.ornament} />
              <Countdown to={c.event.dateTime} labels={{ days: L.days, hours: L.hours, minutes: L.minutes, seconds: L.seconds, today: L.today }} />
            </div>
          )}
        {garden && (
            <div className="mt-2 flex w-full justify-center" style={{ color: "var(--inv-accent)" }}>
              <Mandap />
            </div>
          )}
        </Section>
        )}

        {/* Story */}
        {(c.story || c.extras.chapters.length > 0) && (
          <Section id="story" className="pb-24">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="eyebrow">{c.storyLabel}</p>
              </div>
              <div className="md:col-span-8">
                {c.story && (
                  <p className="display text-[clamp(1.35rem,2.6vw,1.8rem)] leading-[1.45]" style={{ maxWidth: "34ch" }}>
                    {c.story}
                  </p>
                )}
                {c.extras.chapters.length > 0 && (
                  <ol className="hairline relative mt-12 grid gap-12 border-s ps-8">
                    {c.extras.chapters.map((ch, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -start-[2.55rem] top-1.5 h-3 w-3 rotate-45" style={{ background: "var(--inv-accent)" }} aria-hidden="true" />
                        {ch.date && <p className="eyebrow">{ch.date}</p>}
                        <h3 className="display mt-2 text-[clamp(1.5rem,3vw,2rem)] leading-tight">{ch.title}</h3>
                        {ch.text && <p className="dim mt-3 max-w-[52ch] text-lg leading-relaxed">{ch.text}</p>}
                        {ch.photo && <img src={ch.photo} alt={ch.title} loading="lazy" className="mt-5 block w-full max-w-md" />}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Schedule */}
        {schedule.length > 0 && (
          <Section id="schedule" className="pb-24">
            <div className="hairline mb-10 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
              <h2 className="display text-[clamp(2rem,5vw,3rem)] italic leading-none">{schedule.length > 1 ? L.scheduleMany : L.scheduleOne}</h2>
              <p className="dim text-sm">{fill(L.timesNote, { tz: tzShort(tz, loc) })}</p>
            </div>
            <ol className={`grid gap-x-10 gap-y-12 ${schedule.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {schedule.map((e) => (
                <li key={e.key} className="hairline flex flex-col gap-5 border p-6 sm:p-7">
                  <div className="flex flex-col items-center gap-2 text-center">
                    {(() => {
                      const Guess = eventIcon(e.key, e.title);
                      return (
                        <span className="hairline mb-1 flex h-12 w-12 items-center justify-center rounded-full border" style={{ color: "var(--inv-accent)" }} aria-hidden="true">
                          {e.icon ? <Icon name={e.icon} size={22} strokeWidth={1.4} /> : <Guess size={22} strokeWidth={1.4} />}
                        </span>
                      );
                    })()}
                    <h3 className="display text-[clamp(1.6rem,3vw,2.1rem)] leading-tight">{e.title}</h3>
                    {e.titleSub && (
                      <p dir="ltr" className="dim text-[0.68rem] uppercase tracking-[0.2em]">
                        {e.titleSub}
                      </p>
                    )}
                    <p className="eyebrow">{dayLabel(e.start, tz, loc) || " "}</p>
                    {e.start && (
                      <p className="tnum text-sm">
                        {timeLabel(e.start, tz, loc)}
                        {e.end ? ` ${L.to} ${timeLabel(e.end, tz, loc)}` : ` ${L.onwards}`}
                      </p>
                    )}
                  </div>
                  <span className="hairline mx-auto block h-px w-16 border-t" aria-hidden="true" />
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    {(e.place || c.venue.name) && (
                      <Tile icon={MapPin} label={L.where}>
                        {e.place || c.venue.name}
                      </Tile>
                    )}
                    {(e.dress || e.dressColors?.length) && (
                      <Tile icon={Shirt} label={L.wear}>
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {e.dress}
                          {e.dressColors?.length ? (
                            <span className="flex gap-1.5" aria-hidden="true">
                              {e.dressColors.map((hex) => (
                                <span key={hex} className="h-4 w-4 rounded-full border" style={{ background: hex, borderColor: "color-mix(in srgb, var(--inv-ink) 25%, transparent)" }} />
                              ))}
                            </span>
                          ) : null}
                        </span>
                      </Tile>
                    )}
                    {e.kids && (
                      <Tile icon={Baby} label={(TILE_WORDS[c.event.language] ?? TILE_WORDS.en).kids}>
                        {e.kids === "welcome" ? (TILE_WORDS[c.event.language] ?? TILE_WORDS.en).welcome : (TILE_WORDS[c.event.language] ?? TILE_WORDS.en).adults}
                      </Tile>
                    )}
                    {e.dry && <Tile icon={WineOff} label="·">{(TILE_WORDS[c.event.language] ?? TILE_WORDS.en).dry}</Tile>}
                    {e.officiant && (
                      <Tile icon={UserRound} label={(TILE_WORDS[c.event.language] ?? TILE_WORDS.en).officiant}>
                        {e.officiant}
                      </Tile>
                    )}
                    {e.contactPhone && (
                      <Tile icon={Phone} label={(TILE_WORDS[c.event.language] ?? TILE_WORDS.en).contact}>
                        <a href={`tel:${e.contactPhone.replace(/[^\d+]/g, "")}`} className="tnum underline-offset-4 hover:underline">
                          {e.contactName ? `${e.contactName} · ` : ""}
                          {e.contactPhone}
                        </a>
                      </Tile>
                    )}
                  </div>
                  {e.photos && e.photos.length > 0 && (
                    <div className={`grid gap-2 ${e.photos.length === 1 ? "" : e.photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                      {e.photos.map((u) => (
                        <img key={u} src={u} alt={e.title} loading="lazy" className="block aspect-[4/5] w-full object-cover" />
                      ))}
                    </div>
                  )}
                  {e.note && <p className="dim text-center text-base leading-relaxed">{e.note}</p>}
                  {e.extra && <p className="dim text-center text-sm leading-relaxed">{e.extra}</p>}
                  {e.transport && Object.values(e.transport).some(Boolean) && (
                    <ul className="grid gap-2 text-sm">
                      {(
                        [
                          ["bus", Bus],
                          ["train", TrainFront],
                          ["car", Car],
                          ["auto", Bike],
                        ] as const
                      ).map(([k, Icon]) =>
                        e.transport?.[k] ? (
                          <li key={k} className="flex items-start gap-3">
                            <Icon size={16} strokeWidth={1.6} className="accent mt-0.5 shrink-0" aria-label={k} />
                            <span>{e.transport[k]}</span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  )}
                  {e.mapsUrl && (
                    <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="accent mx-auto w-fit text-[0.68rem] uppercase tracking-[0.26em] underline-offset-[6px] hover:underline">
                      {L.openMaps} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {e.start && (
                    <div className="mt-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                      <a
                        href={calendarUrl(`${e.title}: ${title}`, e.start, e.end, e.place || c.venue.name, e.note)}
                        target="_blank"
                        rel="noopener"
                        className="accent inline-flex w-fit items-center gap-2 text-[0.68rem] uppercase tracking-[0.26em] underline-offset-[6px] hover:underline"
                      >
                        {L.addToCalendar} <span aria-hidden="true">↗</span>
                      </a>
                      <a
                        href={icsHref(`${e.title}: ${title}`, e.start, e.end, e.place || c.venue.name, e.note)}
                        download={`${slug || "invitation"}-${e.key}.ics`}
                        className="dim inline-flex w-fit items-center gap-2 text-[0.68rem] uppercase tracking-[0.26em] underline-offset-[6px] hover:underline"
                      >
                        Apple / Outlook
                      </a>
                    </div>
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
              {c.venue.embedMap && (c.venue.line1 || c.venue.name) && (
                <div className="hairline overflow-hidden border md:col-span-12">
                  <iframe
                    title={c.venue.name}
                    src={`https://www.google.com/maps?q=${encodeURIComponent([c.venue.name, c.venue.line1, c.venue.line2].filter(Boolean).join(", "))}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block h-[320px] w-full border-0 md:h-[380px]"
                  />
                </div>
              )}
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

        {/* Where to stay */}
        {c.extras.hotels.length > 0 && (
          <Section id="stay" className="pb-24">
            <p className="eyebrow mb-3">{L.stay}</p>
            <h2 className="display mb-8 text-[clamp(1.8rem,4vw,2.6rem)] italic leading-none">{L.stayHeading}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {c.extras.hotels.map((h, i) => (
                <li key={i} className="hairline border p-5">
                  <p className="display text-xl">{h.name}</p>
                  {h.note && <p className="dim mt-2 text-sm leading-relaxed">{h.note}</p>}
                  {/^https?:\/\//i.test(h.url) && (
                    <a href={h.url} target="_blank" rel="noopener noreferrer" className="accent mt-3 inline-block text-[0.68rem] uppercase tracking-[0.26em] underline-offset-[6px] hover:underline">
                      {L.viewHotel} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Travel */}
        {c.extras.travel.trim() && (
          <Section id="travel" className="pb-24">
            <p className="eyebrow mb-3">{L.travel}</p>
            <h2 className="display mb-6 text-[clamp(1.8rem,4vw,2.6rem)] italic leading-none">{L.travelHeading}</h2>
            <p className="max-w-2xl whitespace-pre-line leading-relaxed">{c.extras.travel}</p>
          </Section>
        )}

        {/* Q & A */}
        {c.extras.faq.length > 0 && (
          <Section id="faq" className="pb-24">
            <p className="eyebrow mb-3">{L.faq}</p>
            <h2 className="display mb-8 text-[clamp(1.8rem,4vw,2.6rem)] italic leading-none">{L.faqHeading}</h2>
            <div className="hairline border-t">
              {c.extras.faq.map((f, i) => (
                <details key={i} className="hairline group border-b">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="dim max-w-2xl pb-6 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </Section>
        )}

        {/* Wedding party */}
        {c.extras.party.length > 0 && (
          <Section id="party" className="pb-24">
            <p className="eyebrow mb-3">{L.party}</p>
            <h2 className="display mb-10 text-[clamp(1.8rem,4vw,2.6rem)] italic leading-none">{L.partyHeading}</h2>
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {c.extras.party.map((p, i) => (
                <li key={i} className="text-center">
                  <span className="hairline mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border">
                    {p.photo ? <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover" /> : <span className="display accent text-3xl">{p.name.trim()[0] ?? ""}</span>}
                  </span>
                  <p className="display mt-4 text-lg">{p.name}</p>
                  {p.role && <p className="eyebrow mt-1">{p.role}</p>}
                  {p.note && <p className="dim mt-2 text-sm leading-relaxed">{p.note}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Live stream */}
        {/^https?:\/\//i.test(c.extras.livestream.url.trim()) && (
          <Section id="live" className="pb-24">
            <div className="hairline flex flex-col items-center gap-5 border-y py-10 text-center">
              <p className="eyebrow">{c.extras.livestream.label || "Watch live"}</p>
              <a href={c.extras.livestream.url.trim()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                {c.extras.livestream.label || "Watch live"} <span aria-hidden="true">↗</span>
              </a>
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
                  <button type="button" className="block w-full cursor-zoom-in" onClick={() => setZoom(i)} aria-label={`Enlarge photo ${i + 1}`}>
                    <img src={p.url} alt={p.caption || ""} loading="lazy" className="block w-full" />
                  </button>
                  {p.caption && <figcaption className="dim mt-2 text-xs">{p.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </Section>
        )}

        {zoom !== null && c.photos[zoom] && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo"
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "color-mix(in srgb, var(--inv-bg-deep) 94%, transparent)" }}
            onClick={() => setZoom(null)}
            onKeyDown={(ev) => {
              if (ev.key === "Escape") setZoom(null);
              if (ev.key === "ArrowRight") setZoom((z) => (z === null ? z : (z + 1) % c.photos.length));
              if (ev.key === "ArrowLeft") setZoom((z) => (z === null ? z : (z - 1 + c.photos.length) % c.photos.length));
            }}
          >
            <button type="button" className="accent absolute right-4 top-4 p-2" aria-label="Close" onClick={() => setZoom(null)} autoFocus>
              <X size={28} />
            </button>
            {c.photos.length > 1 && (
              <button
                type="button"
                className="accent absolute left-2 top-1/2 -translate-y-1/2 p-2"
                aria-label="Previous photo"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setZoom((z) => (z === null ? z : (z - 1 + c.photos.length) % c.photos.length));
                }}
              >
                <ChevronLeft size={36} />
              </button>
            )}
            <figure className="m-0 max-h-full max-w-full" onClick={(ev) => ev.stopPropagation()}>
              <img src={c.photos[zoom].url} alt={c.photos[zoom].caption || ""} className="max-h-[85vh] max-w-full object-contain" />
              {c.photos[zoom].caption && <figcaption className="dim mt-3 text-center text-sm">{c.photos[zoom].caption}</figcaption>}
            </figure>
            {c.photos.length > 1 && (
              <button
                type="button"
                className="accent absolute right-2 top-1/2 -translate-y-1/2 p-2"
                aria-label="Next photo"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setZoom((z) => (z === null ? z : (z + 1) % c.photos.length));
                }}
              >
                <ChevronRight size={36} />
              </button>
            )}
          </div>
        )}

        {/* Tagline */}
        {c.texts.tagline.trim() && (
          <Section id="tagline" className="pb-24 text-center">
            <p className="display text-[clamp(1.5rem,4vw,2.4rem)] italic">{c.texts.tagline}</p>
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
                events={schedule}
                preview={preview}
              />
            </div>
          </div>
        </Section>

        {/* Contacts */}
        {c.extras.contacts.some((p) => p.phone.trim()) && (
          <Section id="contacts" className="pb-24">
            <div className="hairline flex flex-col items-center gap-5 border-y py-10 text-center">
              <p className="eyebrow">{L.lostCall}</p>
              <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3">
                {c.extras.contacts
                  .filter((p) => p.phone.trim())
                  .map((p, i) => (
                    <li key={p.phone + i}>
                      <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="tnum underline-offset-[6px] hover:underline">
                        <span className="dim">{p.name ? `${p.name} · ` : ""}</span>
                        {p.phone}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </Section>
        )}

        {/* Gifts */}
        {(c.extras.gift.note.trim() || c.extras.gift.upiId.trim()) && (
          <Section id="gifts" className="pb-24">
            <div className="hairline flex flex-col items-center gap-5 border-y py-12 text-center">
              <p className="eyebrow">{c.extras.gift.title || "Blessings & gifts"}</p>
              {c.extras.gift.note.trim() && <p className="display max-w-lg text-[clamp(1.2rem,2.4vw,1.6rem)] leading-snug">{c.extras.gift.note}</p>}
              {/^[\w.-]{2,}@[\w.-]{2,}$/.test(c.extras.gift.upiId.trim()) && (
                <>
                  <p className="tnum text-sm">
                    UPI: <span className="accent">{c.extras.gift.upiId.trim()}</span>
                  </p>
                  <a
                    href={`upi://pay?pa=${encodeURIComponent(c.extras.gift.upiId.trim())}&pn=${encodeURIComponent(c.extras.gift.upiName.trim() || title)}&cu=INR`}
                    className="btn btn-ghost"
                  >
                    {L.payUpi} <span aria-hidden="true">↗</span>
                  </a>
                </>
              )}
            </div>
          </Section>
        )}

        {/* Footer */}
        <footer className="mx-auto w-full max-w-5xl px-5 pb-28 sm:px-8">
          <Divider kind={c.theme.ornament} />
          {c.texts.signature.trim() && <p className="display mt-10 text-center text-lg italic">{c.texts.signature}</p>}
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
          {!preview && (
            <p className="dim mt-4 text-center text-[0.62rem] uppercase tracking-[0.2em] opacity-70">
              Made with {process.env.NEXT_PUBLIC_APP_NAME || "K-Invites"}
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}
