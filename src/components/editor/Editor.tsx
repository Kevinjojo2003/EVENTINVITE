"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Invite, InviteConfig, ScheduleItem, FontPair, MusicSource } from "@/lib/types";
import { EVENT_TYPES } from "@/lib/types";
import { PRESETS, FONT_PAIRS, normalizeConfig } from "@/lib/themes";
import { LANGUAGES, labelsFor, type Labels } from "@/lib/i18n";
import { TIMEZONES, traditionsFor } from "@/lib/traditions";
import { fromLocalInput, inviteUrl, slugify, toLocalInput } from "@/lib/format";
import { parseYouTubeId } from "@/components/invite/music";
import { saveConfig, setPublished, updateSlug } from "@/app/dashboard/actions";
import { listLibrary, uploadFile, type LibraryTrack } from "./upload";

type Tab = "basics" | "schedule" | "venue" | "design" | "photos" | "music" | "rsvp" | "wording";
const TABS: { key: Tab; label: string }[] = [
  { key: "basics", label: "Basics" },
  { key: "schedule", label: "Schedule" },
  { key: "venue", label: "Venue" },
  { key: "design", label: "Design" },
  { key: "photos", label: "Photos" },
  { key: "music", label: "Music" },
  { key: "rsvp", label: "RSVP" },
  { key: "wording", label: "Wording" },
];

const LABEL_NAMES: Partial<Record<keyof Labels, string>> = {
  invited: "Envelope: 'You are invited'",
  forGuest: "Envelope: personal line ({name})",
  openHint: "Envelope: hint with music",
  soundHint: "Envelope: hint without music",
  musicOn: "Music button: on",
  musicOff: "Music button: off",
  days: "Countdown: days",
  hours: "Countdown: hours",
  minutes: "Countdown: minutes",
  seconds: "Countdown: seconds",
  today: "Countdown: on the day",
  scheduleMany: "Schedule heading (several events)",
  scheduleOne: "Schedule heading (one event)",
  timesNote: "Timezone note ({tz})",
  when: "When",
  where: "Where",
  wear: "Wear",
  onwards: "'onwards'",
  to: "'to' (between times)",
  addToCalendar: "Add to calendar",
  venue: "Venue heading",
  openMaps: "Open in Maps",
  gettingThere: "Getting there",
  stayingOver: "Staying over",
  moments: "Photos heading",
  rsvp: "RSVP eyebrow",
  rsvpTitle: "RSVP title",
  rsvpTicketTitle: "RSVP title (tickets)",
  rsvpNote: "RSVP note",
  rsvpTicketNote: "RSVP note (tickets)",
  yourName: "Your name",
  willYouJoin: "Will you join us?",
  accept: "Accept",
  decline: "Decline",
  company: "Company",
  email: "Email",
  howMany: "How many",
  whichDays: "Which days",
  anythingElse: "Anything we should know",
  anythingElsePlaceholder: "Note placeholder",
  sendReply: "Send button",
  confirmTicket: "Send button (tickets)",
  sending: "Sending",
  sendWhatsApp: "WhatsApp button",
  orWhatsApp: "'or reply on WhatsApp'",
  orEmail: "'or send by email'",
  replyBy: "Reply-by line ({date})",
  thanksYes: "Thanks (attending)",
  thanksNo: "Thanks (not attending)",
  admitOne: "Ticket: Admit one",
  showAtDoor: "Ticket: show at the door",
  checkedIn: "Ticket: checked in",
  backToInvite: "Ticket: back link",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      {children}
      {hint && (
        <span className="text-xs" style={{ color: "var(--ink-2)" }}>
          {hint}
        </span>
      )}
    </div>
  );
}

export function Editor({ invite }: { invite: Invite }) {
  const [config, setConfig] = useState<InviteConfig>(() => normalizeConfig(invite.config, invite.event_type));
  const [tab, setTab] = useState<Tab>("basics");
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [status, setStatus] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [published, setPub] = useState(invite.published);
  const [slug, setSlug] = useState(invite.slug);
  const [slugDraft, setSlugDraft] = useState(invite.slug);
  const [slugMsg, setSlugMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [library, setLibrary] = useState<LibraryTrack[] | null>(null);
  const [ytInput, setYtInput] = useState(config.music.youtubeId);
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const dirtyRef = useRef(false);
  const url = inviteUrl(slug);
  const two = EVENT_TYPES[config.event.type].twoNames;

  // ---- live preview ----
  const post = useCallback(
    (c: InviteConfig) => {
      frame.current?.contentWindow?.postMessage({ type: "invite-config", config: c, slug }, window.location.origin);
    },
    [slug],
  );
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "preview-ready") {
        ready.current = true;
        post(config);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (ready.current) post(config);
  }, [config, post]);

  // ---- autosave ----
  const patch = useCallback((fn: (c: InviteConfig) => InviteConfig) => {
    setConfig((c) => fn(structuredClone(c)));
    dirtyRef.current = true;
    setStatus("dirty");
  }, []);
  useEffect(() => {
    if (!dirtyRef.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      dirtyRef.current = false;
      setStatus("saving");
      const r = await saveConfig(invite.id, config);
      setStatus(r?.error ? "error" : dirtyRef.current ? "dirty" : "saved");
    }, 1200);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [config, invite.id]);

  async function saveNow() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    dirtyRef.current = false;
    setStatus("saving");
    const r = await saveConfig(invite.id, config);
    setStatus(r?.error ? "error" : "saved");
  }

  async function togglePublish() {
    setBusy("publish");
    await saveNow();
    const r = await setPublished(invite.id, !published);
    if (!r?.error) setPub(!published);
    setBusy("");
  }

  async function changeSlug() {
    setSlugMsg("");
    const r = await updateSlug(invite.id, slugDraft);
    if (r?.error) setSlugMsg(r.error);
    else if (r?.slug) {
      setSlug(r.slug);
      setSlugDraft(r.slug);
      setSlugMsg("Address updated.");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setSlugMsg("Link copied.");
    } catch {
      setSlugMsg(url);
    }
  }

  // ---- uploads ----
  async function onPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy("photos");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 20)) urls.push(await uploadFile("photos", invite.id, f));
      patch((c) => ({ ...c, photos: [...c.photos, ...urls.map((u) => ({ url: u }))] }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  }
  async function onHero(files: FileList | null) {
    if (!files?.[0]) return;
    setBusy("hero");
    try {
      const u = await uploadFile("photos", invite.id, files[0]);
      patch((c) => ({ ...c, heroPhoto: u }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  }
  async function onMusic(files: FileList | null) {
    if (!files?.[0]) return;
    if (files[0].size > 20 * 1024 * 1024) return alert("Keep the track under 20 MB.");
    setBusy("music");
    try {
      const u = await uploadFile("music", invite.id, files[0]);
      patch((c) => ({ ...c, music: { ...c.music, source: "upload", url: u, credit: c.music.credit || files[0].name.replace(/\.[a-z0-9]+$/i, "") } }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  }
  useEffect(() => {
    if (tab === "music" && library === null) listLibrary().then(setLibrary).catch(() => setLibrary([]));
  }, [tab, library]);

  const traditions = useMemo(() => traditionsFor(config.event.type), [config.event.type]);
  const tz = config.event.timezone;

  const setSchedule = (i: number, k: keyof ScheduleItem, v: string) =>
    patch((c) => {
      c.schedule[i] = { ...c.schedule[i], [k]: v };
      return c;
    });

  return (
    <div className="grid min-h-[calc(100vh-57px)] lg:grid-cols-[minmax(380px,520px)_1fr]">
      {/* ---------- left: controls ---------- */}
      <div className="border-r bg-white" style={{ borderColor: "var(--line)" }}>
        <div className="sticky top-0 z-10 border-b bg-white px-5 py-3" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{[config.hosts.name1, config.hosts.name2].filter(Boolean).join(" & ") || "Untitled"}</p>
              <p className="text-xs" style={{ color: "var(--ink-2)" }}>
                {status === "saved" && "All changes saved"}
                {status === "dirty" && "Unsaved changes"}
                {status === "saving" && "Saving"}
                {status === "error" && "Could not save. Check your connection."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary" onClick={saveNow} disabled={status === "saving"}>
                Save
              </button>
              <button type="button" className="btn-primary" onClick={togglePublish} disabled={busy === "publish"}>
                {published ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: published ? "#e3f3e6" : "var(--paper-2)", color: published ? "#1f6b34" : "var(--ink-2)" }}>
              {published ? "Live" : "Draft"}
            </span>
            <a href={url} target="_blank" rel="noopener" className="truncate underline-offset-4 hover:underline">
              {url.replace(/^https?:\/\//, "")}
            </a>
            <button type="button" onClick={copyLink} className="underline-offset-4 hover:underline" style={{ color: "var(--ink-2)" }}>
              Copy
            </button>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="whitespace-nowrap rounded px-3 py-1.5 text-sm"
                style={{ background: tab === t.key ? "var(--brand)" : "transparent", color: tab === t.key ? "#fff" : "var(--ink)" }}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid gap-5 px-5 py-6">
          {tab === "basics" && (
            <>
              <div className={`grid gap-4 ${two ? "sm:grid-cols-2" : ""}`}>
                <Field label={two ? "Partner one" : "Name / host"}>
                  <input value={config.hosts.name1} onChange={(e) => patch((c) => ({ ...c, hosts: { ...c.hosts, name1: e.target.value } }))} />
                </Field>
                {two && (
                  <Field label="Partner two">
                    <input value={config.hosts.name2} onChange={(e) => patch((c) => ({ ...c, hosts: { ...c.hosts, name2: e.target.value } }))} />
                  </Field>
                )}
              </div>
              <Field label="Subline" hint={config.event.type === "birthday" ? "e.g. turns thirty" : config.event.type === "corporate" ? "e.g. Annual Partner Summit 2026" : "Optional line under the names"}>
                <input value={config.hosts.subline} onChange={(e) => patch((c) => ({ ...c, hosts: { ...c.hosts, subline: e.target.value } }))} />
              </Field>
              <Field label="Opening line" hint="Small text above the names">
                <input value={config.texts.eyebrow} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, eyebrow: e.target.value } }))} />
              </Field>
              <Field label="Headline" hint="Under the names">
                <input value={config.event.headline} onChange={(e) => patch((c) => ({ ...c, event: { ...c.event, headline: e.target.value } }))} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Main date & time" hint="Drives the countdown">
                  <input type="datetime-local" value={toLocalInput(config.event.dateTime)} onChange={(e) => patch((c) => ({ ...c, event: { ...c.event, dateTime: fromLocalInput(e.target.value, tz) } }))} />
                </Field>
                <Field label="Timezone">
                  <input list="tz-list" value={tz} onChange={(e) => patch((c) => ({ ...c, event: { ...c.event, timezone: e.target.value } }))} />
                  <datalist id="tz-list">
                    {TIMEZONES.map((z) => (
                      <option key={z} value={z} />
                    ))}
                  </datalist>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City">
                  <input value={config.event.city} onChange={(e) => patch((c) => ({ ...c, event: { ...c.event, city: e.target.value } }))} />
                </Field>
                <Field label="Language" hint="Resets the wording to that language">
                  <select
                    value={config.event.language}
                    onChange={(e) => {
                      const code = e.target.value;
                      patch((c) => ({ ...c, event: { ...c.event, language: code }, labels: labelsFor(code) }));
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {traditions.length > 1 && (
                <Field label="Tradition" hint="Changing this replaces the schedule with that tradition's ceremonies">
                  <select
                    value={config.event.tradition}
                    onChange={(e) => {
                      const t = traditions.find((x) => x.key === e.target.value);
                      if (!t) return;
                      patch((c) => ({
                        ...c,
                        event: { ...c.event, tradition: t.key },
                        schedule: t.schedule.map((s) => ({ key: s.key, title: s.title, start: "", end: "", place: "", dress: "", note: s.note ?? "" })),
                        texts: { ...c.texts, eyebrow: t.eyebrow ?? c.texts.eyebrow },
                      }));
                    }}
                  >
                    {traditions.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label={config.storyLabel || "Story"} hint="A few lines in your own words">
                <input value={config.storyLabel} onChange={(e) => patch((c) => ({ ...c, storyLabel: e.target.value }))} placeholder="Section label" />
                <textarea rows={4} value={config.story} onChange={(e) => patch((c) => ({ ...c, story: e.target.value }))} />
              </Field>
              <Field label="Family / organiser lines" hint="Shown at the bottom">
                <div className="grid gap-2">
                  {config.credits.map((k, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                      <input value={k.label} placeholder="Daughter of" onChange={(e) => patch((c) => { c.credits[i].label = e.target.value; return c; })} />
                      <input value={k.value} placeholder="Names" onChange={(e) => patch((c) => { c.credits[i].value = e.target.value; return c; })} />
                      <button type="button" className="btn-secondary" onClick={() => patch((c) => ({ ...c, credits: c.credits.filter((_, j) => j !== i) }))}>
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, credits: [...c.credits, { label: "", value: "" }] }))}>
                    Add a line
                  </button>
                </div>
              </Field>
              <Field label="Footer note">
                <input value={config.texts.footerNote} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, footerNote: e.target.value } }))} placeholder="No gifts, please. Your presence is the present." />
              </Field>
              <div className="card grid gap-2 p-4">
                <span className="label text-xs font-medium uppercase tracking-[0.08em]" style={{ color: "var(--ink-2)" }}>
                  Web address
                </span>
                <div className="flex items-center gap-2">
                  <input value={slugDraft} onChange={(e) => setSlugDraft(slugify(e.target.value))} className="flex-1 rounded border px-2 py-1.5 text-sm" style={{ borderColor: "var(--line)" }} />
                  <button type="button" className="btn-secondary" onClick={changeSlug} disabled={slugDraft === slug}>
                    Change
                  </button>
                </div>
                {slugMsg && (
                  <p className="text-xs" style={{ color: "var(--ink-2)" }}>
                    {slugMsg}
                  </p>
                )}
              </div>
            </>
          )}

          {tab === "schedule" && (
            <>
              {config.schedule.map((e, i) => (
                <div key={i} className="card grid gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <input className="text-base font-medium" value={e.title} onChange={(ev) => setSchedule(i, "title", ev.target.value)} placeholder="Event name" />
                    <div className="flex gap-1">
                      <button type="button" className="btn-secondary" disabled={i === 0} onClick={() => patch((c) => { const s = c.schedule; [s[i - 1], s[i]] = [s[i], s[i - 1]]; return c; })}>↑</button>
                      <button type="button" className="btn-secondary" disabled={i === config.schedule.length - 1} onClick={() => patch((c) => { const s = c.schedule; [s[i + 1], s[i]] = [s[i], s[i + 1]]; return c; })}>↓</button>
                      <button type="button" className="btn-secondary" onClick={() => patch((c) => ({ ...c, schedule: c.schedule.filter((_, j) => j !== i) }))}>×</button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Starts">
                      <input type="datetime-local" value={toLocalInput(e.start)} onChange={(ev) => setSchedule(i, "start", fromLocalInput(ev.target.value, tz))} />
                    </Field>
                    <Field label="Ends">
                      <input type="datetime-local" value={toLocalInput(e.end)} onChange={(ev) => setSchedule(i, "end", fromLocalInput(ev.target.value, tz))} />
                    </Field>
                  </div>
                  <Field label="Place">
                    <input value={e.place} onChange={(ev) => setSchedule(i, "place", ev.target.value)} />
                  </Field>
                  <Field label="Dress code">
                    <input value={e.dress} onChange={(ev) => setSchedule(i, "dress", ev.target.value)} />
                  </Field>
                  <Field label="Note">
                    <textarea rows={2} value={e.note} onChange={(ev) => setSchedule(i, "note", ev.target.value)} />
                  </Field>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary w-fit"
                onClick={() => patch((c) => ({ ...c, schedule: [...c.schedule, { key: `e${Date.now()}`, title: "New event", start: "", end: "", place: "", dress: "", note: "" }] }))}
              >
                Add an event
              </button>
            </>
          )}

          {tab === "venue" && (
            <>
              <Field label="Venue name">
                <input value={config.venue.name} onChange={(e) => patch((c) => ({ ...c, venue: { ...c.venue, name: e.target.value } }))} />
              </Field>
              <Field label="Address line 1">
                <input value={config.venue.line1} onChange={(e) => patch((c) => ({ ...c, venue: { ...c.venue, line1: e.target.value } }))} />
              </Field>
              <Field label="Address line 2">
                <input value={config.venue.line2} onChange={(e) => patch((c) => ({ ...c, venue: { ...c.venue, line2: e.target.value } }))} />
              </Field>
              <Field label="Google Maps link" hint="Share → Copy link in Google Maps">
                <input value={config.venue.mapsUrl} onChange={(e) => patch((c) => ({ ...c, venue: { ...c.venue, mapsUrl: e.target.value } }))} placeholder="https://maps.app.goo.gl/..." />
              </Field>
              <Field label="Getting there">
                <textarea rows={3} value={config.venue.directions} onChange={(e) => patch((c) => ({ ...c, venue: { ...c.venue, directions: e.target.value } }))} />
              </Field>
              <Field label="Staying over">
                <textarea rows={3} value={config.venue.stay} onChange={(e) => patch((c) => ({ ...c, venue: { ...c.venue, stay: e.target.value } }))} />
              </Field>
            </>
          )}

          {tab === "design" && (
            <>
              <Field label="Preset">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRESETS).map(([k, p]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => patch((c) => ({ ...c, theme: { preset: k, colors: { ...p.colors }, fonts: p.fonts, fireflies: p.fireflies } }))}
                      className="flex items-center gap-3 rounded border p-2 text-left text-sm"
                      style={{ borderColor: config.theme.preset === k ? "var(--brand)" : "var(--line)" }}
                    >
                      <span className="flex h-8 w-12 shrink-0 overflow-hidden rounded" aria-hidden="true">
                        <span className="h-full w-1/2" style={{ background: p.colors.bg }} />
                        <span className="h-full w-1/4" style={{ background: p.colors.accent }} />
                        <span className="h-full w-1/4" style={{ background: p.colors.ink }} />
                      </span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Colours" hint="Any change makes this a custom theme">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(
                    [
                      ["bg", "Background"],
                      ["bgDeep", "Envelope"],
                      ["ink", "Text"],
                      ["inkDim", "Muted text"],
                      ["accent", "Accent"],
                      ["accentDeep", "Accent dark"],
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k} className="flex items-center gap-2 text-sm">
                      <input type="color" value={config.theme.colors[k]} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, preset: "custom", colors: { ...c.theme.colors, [k]: e.target.value } } }))} />
                      {label}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Typeface pair">
                <select value={config.theme.fonts} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, fonts: e.target.value as FontPair } }))}>
                  {Object.entries(FONT_PAIRS).map(([k, f]) => (
                    <option key={k} value={k}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.theme.fireflies} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, fireflies: e.target.checked } }))} />
                Drifting lights in the background
              </label>
              <Field label="Seal initials" hint="Leave blank to use the first letters of the names">
                <input value={config.texts.sealText} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, sealText: e.target.value } }))} placeholder="M & A" />
              </Field>
            </>
          )}

          {tab === "photos" && (
            <>
              <Field label="Portrait" hint="A round photo above the names. Optional.">
                <div className="flex items-center gap-3">
                  {config.heroPhoto && <img src={config.heroPhoto} alt="" className="h-16 w-16 rounded-full object-cover" />}
                  <input type="file" accept="image/*" onChange={(e) => onHero(e.target.files)} disabled={busy === "hero"} />
                  {config.heroPhoto && (
                    <button type="button" className="btn-secondary" onClick={() => patch((c) => ({ ...c, heroPhoto: "" }))}>
                      Remove
                    </button>
                  )}
                </div>
              </Field>
              <Field label="Gallery" hint="Up to 20 photos, 10 MB each. They appear in a 'Moments' section.">
                <input type="file" accept="image/*" multiple onChange={(e) => onPhotos(e.target.files)} disabled={busy === "photos"} />
                {busy === "photos" && <span className="text-xs">Uploading</span>}
              </Field>
              <ul className="grid grid-cols-3 gap-2">
                {config.photos.map((p, i) => (
                  <li key={p.url} className="relative">
                    <img src={p.url} alt="" className="aspect-square w-full rounded object-cover" />
                    <input className="mt-1 w-full rounded border px-1 py-0.5 text-xs" style={{ borderColor: "var(--line)" }} placeholder="Caption" value={p.caption ?? ""} onChange={(e) => patch((c) => { c.photos[i].caption = e.target.value; return c; })} />
                    <button type="button" className="absolute right-1 top-1 rounded bg-white/90 px-1.5 text-xs" onClick={() => patch((c) => ({ ...c, photos: c.photos.filter((_, j) => j !== i) }))}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === "music" && (
            <>
              <Field label="Source">
                <div className="grid gap-2">
                  {(
                    [
                      ["synth", "Built-in ambient score", "A soft generated piece. No file needed."],
                      ["upload", "My own track", "MP3 or M4A up to 20 MB. Your own recording, a track you own, or one from the library below."],
                      ["youtube", "YouTube", "Paste any YouTube link. Plays inside the invite after the envelope opens."],
                      ["none", "No music", ""],
                    ] as [MusicSource, string, string][]
                  ).map(([k, label, hint]) => (
                    <label key={k} className="card flex cursor-pointer items-start gap-3 p-3" style={{ borderColor: config.music.source === k ? "var(--brand)" : "var(--line)" }}>
                      <input type="radio" name="music" checked={config.music.source === k} onChange={() => patch((c) => ({ ...c, music: { ...c.music, source: k } }))} className="mt-1" />
                      <span>
                        <span className="block text-sm font-medium">{label}</span>
                        {hint && (
                          <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                            {hint}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
              {config.music.source === "upload" && (
                <>
                  <Field label="Upload a track">
                    <input type="file" accept="audio/*" onChange={(e) => onMusic(e.target.files)} disabled={busy === "music"} />
                    {busy === "music" && <span className="text-xs">Uploading</span>}
                    {config.music.url && <audio controls src={config.music.url} className="mt-2 w-full" />}
                  </Field>
                  <Field label="Or pick from the library" hint="Royalty-free tracks added by the site owner">
                    {library === null ? (
                      <span className="text-xs">Loading</span>
                    ) : library.length === 0 ? (
                      <span className="text-xs" style={{ color: "var(--ink-2)" }}>
                        No library tracks yet.
                      </span>
                    ) : (
                      <ul className="grid gap-1">
                        {library.map((t) => (
                          <li key={t.url}>
                            <button type="button" className="w-full rounded border px-3 py-2 text-left text-sm" style={{ borderColor: config.music.url === t.url ? "var(--brand)" : "var(--line)" }} onClick={() => patch((c) => ({ ...c, music: { ...c.music, source: "upload", url: t.url, credit: t.name } }))}>
                              {t.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Field>
                </>
              )}
              {config.music.source === "youtube" && (
                <Field label="YouTube link" hint={config.music.youtubeId ? `Video id: ${config.music.youtubeId}` : "Paste the full link"}>
                  <input
                    value={ytInput}
                    onChange={(e) => {
                      setYtInput(e.target.value);
                      const id = parseYouTubeId(e.target.value);
                      if (id) patch((c) => ({ ...c, music: { ...c.music, youtubeId: id } }));
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </Field>
              )}
              <Field label="Credit line" hint="Shown in the footer, e.g. the song and artist">
                <input value={config.music.credit} onChange={(e) => patch((c) => ({ ...c, music: { ...c.music, credit: e.target.value } }))} />
              </Field>
            </>
          )}

          {tab === "rsvp" && (
            <>
              <Field label="How guests reply">
                <select value={config.rsvp.mode} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, mode: e.target.value as InviteConfig["rsvp"]["mode"] } }))}>
                  <option value="both">Form on the page, with a WhatsApp option</option>
                  <option value="form">Form on the page only (replies land in your dashboard)</option>
                  <option value="whatsapp">WhatsApp message only</option>
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="WhatsApp number" hint="With country code, digits only">
                  <input value={config.rsvp.whatsapp} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, whatsapp: e.target.value.replace(/[^\d]/g, "") } }))} placeholder="919876543210" />
                </Field>
                <Field label="Email for replies">
                  <input value={config.rsvp.email} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, email: e.target.value } }))} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Reply by" hint="Free text, shown to guests">
                  <input value={config.rsvp.deadline} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, deadline: e.target.value } }))} placeholder="20 November 2026" />
                </Field>
                <Field label="Max people per reply">
                  <input type="number" min={1} max={20} value={config.rsvp.maxParty} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, maxParty: Math.max(1, Math.min(20, Number(e.target.value) || 1)) } }))} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.rsvp.tickets} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, tickets: e.target.checked } }))} />
                Give each "yes" a QR ticket (scan at the door from the Check-in page)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.rsvp.askCompany} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, askCompany: e.target.checked } }))} />
                Ask for company and email
              </label>
            </>
          )}

          {tab === "wording" && (
            <>
              <p className="text-sm" style={{ color: "var(--ink-2)" }}>
                Every fixed phrase on the invitation. Write them in any language. Words in curly braces are filled in automatically.
              </p>
              <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, labels: labelsFor(c.event.language) }))}>
                Reset to {LANGUAGES.find((l) => l.code === config.event.language)?.label ?? "defaults"}
              </button>
              {(Object.keys(LABEL_NAMES) as (keyof Labels)[]).map((k) => (
                <Field key={k} label={LABEL_NAMES[k] ?? k}>
                  <input value={config.labels[k]} onChange={(e) => patch((c) => ({ ...c, labels: { ...c.labels, [k]: e.target.value } }))} />
                </Field>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ---------- right: live preview ---------- */}
      <div className="flex flex-col" style={{ background: "var(--paper-2)" }}>
        <div className="flex items-center justify-between px-5 py-3 text-sm">
          <span style={{ color: "var(--ink-2)" }}>Live preview. Tap the seal to test the music.</span>
          <div className="flex gap-1">
            <button type="button" className="btn-secondary" onClick={() => setDevice("phone")} style={{ borderColor: device === "phone" ? "var(--ink)" : "var(--line)" }}>
              Phone
            </button>
            <button type="button" className="btn-secondary" onClick={() => setDevice("desktop")} style={{ borderColor: device === "desktop" ? "var(--ink)" : "var(--line)" }}>
              Desktop
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-start justify-center px-5 pb-8">
          <iframe
            ref={frame}
            title="Invitation preview"
            src="/preview"
            className="rounded-xl border bg-black shadow-xl"
            style={{
              borderColor: "var(--line)",
              width: device === "phone" ? 390 : "100%",
              height: device === "phone" ? 780 : "calc(100vh - 130px)",
              maxWidth: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
