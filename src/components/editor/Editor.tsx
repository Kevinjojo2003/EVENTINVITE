"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Invite, InviteConfig, ScheduleItem, FontPair, MusicSource } from "@/lib/types";
import { EVENT_TYPES } from "@/lib/types";
import { BACKGROUNDS, PRESETS, FONT_PAIRS, normalizeConfig } from "@/lib/themes";
import { LANGUAGES, labelsFor, type Labels } from "@/lib/i18n";
import { TIMEZONES, traditionsFor } from "@/lib/traditions";
import { fromLocalInput, inviteUrl, slugify, toLocalInput } from "@/lib/format";
import { parseYouTubeId } from "@/components/invite/music";
import { saveConfig, setPublished, updateSlug } from "@/app/dashboard/actions";
import { listLibrary, uploadFile, type LibraryTrack } from "./upload";
import { Motif, ORNAMENTS } from "@/components/invite/Ornaments";
import { SCENE_LIST } from "@/lib/scenes";
import { PHOTO_LIST } from "@/lib/photos";
import { WASHES } from "@/components/invite/Watercolor";
import { ICONS } from "@/components/icons/registry";
import { Icon as LibIcon } from "@/components/icons/Icon";

// Ceremony types offered when adding an event, with a line on what each is.
const CEREMONIES: { key: string; title: string; desc: string; kids?: "welcome" | "adults" }[] = [
  { key: "wedding", title: "Wedding ceremony", desc: "The main ceremony", kids: "welcome" },
  { key: "reception", title: "Reception", desc: "Meal, toasts and dancing after", kids: "welcome" },
  { key: "engagement", title: "Engagement", desc: "The ring, the families, one evening", kids: "welcome" },
  { key: "nikah", title: "Nikah", desc: "The religious ceremony", kids: "welcome" },
  { key: "walima", title: "Walima", desc: "Reception and feast", kids: "welcome" },
  { key: "mehendi", title: "Mehendi", desc: "Night before, often ladies-only" },
  { key: "haldi", title: "Haldi", desc: "Morning of, turmeric and family" },
  { key: "sangeet", title: "Sangeet", desc: "Music and dance evening", kids: "welcome" },
  { key: "muhurtham", title: "Muhurtham", desc: "The auspicious moment of the ritual", kids: "welcome" },
  { key: "sadya", title: "Sadya", desc: "The feast on banana leaf", kids: "welcome" },
  { key: "rehearsal", title: "Rehearsal dinner", desc: "Night before, close family", kids: "adults" },
  { key: "farewell", title: "Send-off", desc: "The bride's farewell, family", kids: "welcome" },
  { key: "other", title: "New event", desc: "Any other event, named by you" },
];
const ALL_FONTS_HREF = `https://fonts.googleapis.com/css2?${Object.values(FONT_PAIRS).map((f) => f.google).join("&")}&display=swap`;

type Tab = "basics" | "schedule" | "venue" | "design" | "photos" | "music" | "rsvp" | "extras" | "wording";
const TABS: { key: Tab; label: string }[] = [
  { key: "basics", label: "Basics" },
  { key: "schedule", label: "Schedule" },
  { key: "venue", label: "Venue" },
  { key: "design", label: "Design" },
  { key: "photos", label: "Photos" },
  { key: "music", label: "Music" },
  { key: "rsvp", label: "RSVP" },
  { key: "extras", label: "Extras" },
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
  stay: "Where to stay: heading",
  stayHeading: "Where to stay: title",
  travel: "Travel: heading",
  travelHeading: "Travel: title",
  faq: "Q & A: heading",
  faqHeading: "Q & A: title",
  party: "Wedding party: heading",
  partyHeading: "Wedding party: title",
  viewHotel: "Hotel link text",
  lostCall: "Contacts heading",
  payUpi: "UPI button",
  deleteReply: "Guest: delete my reply",
  replyDeleted: "Guest: reply deleted",
  deleting: "Guest: deleting",
  deleteConfirm: "Guest: delete confirmation",
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

  // What must be filled in before the invitation can go live.
  const checklist: [string, boolean][] = [
    ["Add the name or names", config.hosts.name1.trim().length > 0],
    ["Add at least one ceremony with a start time", config.schedule.some((e) => !!e.start)],
    ["Add the venue", config.venue.name.trim().length > 0 || config.schedule.some((e) => e.place.trim().length > 0)],
  ];
  const missing = checklist.filter(([, ok]) => !ok);

  async function togglePublish() {
    if (!published && missing.length) return;
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
      for (const f of Array.from(files).slice(0, 60)) urls.push(await uploadFile("photos", invite.id, f));
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
              <button type="button" className="btn-primary" onClick={togglePublish} disabled={busy === "publish" || (!published && missing.length > 0)} title={!published && missing.length ? "Finish the checklist below first" : undefined}>
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
          {!published && missing.length > 0 && (
            <div className="mt-3 rounded border px-3 py-2 text-sm" style={{ borderColor: "var(--line-2)", background: "var(--surface)" }}>
              <p className="font-medium">Before you can publish:</p>
              <ul className="mt-1 grid gap-0.5">
                {checklist.map(([label, ok]) => (
                  <li key={label} style={{ color: ok ? "var(--ok)" : "var(--ink-2)" }}>
                    {ok ? "✓" : "○"} {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
              <Field label="Names, translated" hint="A romanized or translated version shown small under the names, for guests who don't read the script — e.g. AMINA & YUSUF under آمنة و يوسف">
                <input value={config.hosts.nameTranslit} onChange={(e) => patch((c) => ({ ...c, hosts: { ...c.hosts, nameTranslit: e.target.value } }))} placeholder="Optional" />
              </Field>
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
              <Field label="Date, translated" hint="A translation of the date shown small underneath, e.g. 'Saturday, 6 March 2027' under an Arabic date">
                <input value={config.texts.dateTranslit} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, dateTranslit: e.target.value } }))} placeholder="Optional" />
              </Field>
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
                  <Field label="Title, translated" hint="Shown small under the ceremony name, e.g. 'Anand Karaj' under ਅਨੰਦ ਕਾਰਜ">
                    <input value={e.titleSub ?? ""} onChange={(ev) => setSchedule(i, "titleSub", ev.target.value)} placeholder="Optional" />
                  </Field>
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
                  <Field label="Icon" hint="Shown above the ceremony's name. Automatic picks one from the title. Religious and cultural icons are optional: choose them only if they fit.">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: "var(--line-2)" }}>
                        {e.icon ? <LibIcon name={e.icon} size={20} /> : <span className="text-xs">Auto</span>}
                      </span>
                      <select value={e.icon ?? ""} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s2, j) => (j === i ? { ...s2, icon: ev.target.value || undefined } : s2)) }))}>
                        <option value="">Automatic</option>
                        {(["wedding", "ceremony", "party", "baby", "corporate", "event"] as const).map((cat) => (
                          <optgroup key={cat} label={cat[0].toUpperCase() + cat.slice(1)}>
                            {Object.entries(ICONS)
                              .filter(([, d]) => d.category === cat)
                              .map(([name, d]) => (
                                <option key={name} value={name}>
                                  {d.label}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </Field>
                  <Field label="Dress code">
                    <input value={e.dress} onChange={(ev) => setSchedule(i, "dress", ev.target.value)} />
                  </Field>
                  <Field label="Dress colours" hint="Optional swatches, as hex codes separated by commas: #c8952a, #7b2333">
                    <input
                      defaultValue={(e.dressColors ?? []).join(", ")}
                      onChange={(ev) => {
                        const list = ev.target.value.split(/[\s,]+/).filter((h) => /^#[0-9a-fA-F]{6}$/.test(h)).slice(0, 8);
                        patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, dressColors: list } : s)) }));
                      }}
                      placeholder="#c8952a, #7b2333"
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Children">
                      <select value={e.kids ?? ""} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, kids: (ev.target.value || undefined) as ScheduleItem["kids"] } : s)) }))}>
                        <option value="">Do not mention</option>
                        <option value="welcome">Children are welcome</option>
                        <option value="adults">Adults only</option>
                      </select>
                    </Field>
                    <Field label="Officiant" hint="Optional">
                      <input value={e.officiant ?? ""} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, officiant: ev.target.value } : s)) }))} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!e.dry} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, dry: ev.target.checked } : s)) }))} />
                    No alcohol at this event
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Venue contact name">
                      <input value={e.contactName ?? ""} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, contactName: ev.target.value } : s)) }))} />
                    </Field>
                    <Field label="Venue contact phone">
                      <input value={e.contactPhone ?? ""} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, contactPhone: ev.target.value } : s)) }))} placeholder="+91 98765 43210" />
                    </Field>
                  </div>
                  <Field label="Photos of this ceremony or venue" hint="Up to three">
                    <div className="flex flex-wrap items-center gap-2">
                      {(e.photos ?? []).map((u) => (
                        <span key={u} className="relative">
                          <img src={u} alt="" className="h-16 w-16 rounded object-cover" />
                          <button
                            type="button"
                            aria-label="Remove photo"
                            className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-black text-xs text-white"
                            onClick={() => patch((c) => ({ ...c, schedule: c.schedule.map((s2, j) => (j === i ? { ...s2, photos: (s2.photos ?? []).filter((x) => x !== u) } : s2)) }))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {(e.photos ?? []).length < 3 && (
                        <input
                          type="file"
                          accept="image/*"
                          disabled={busy === `ev${i}`}
                          onChange={async (ev) => {
                            const f = ev.target.files?.[0];
                            ev.target.value = "";
                            if (!f) return;
                            setBusy(`ev${i}`);
                            try {
                              const u = await uploadFile("photos", invite.id, f);
                              patch((c) => ({ ...c, schedule: c.schedule.map((s2, j) => (j === i ? { ...s2, photos: [...(s2.photos ?? []), u].slice(0, 3) } : s2)) }));
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Upload failed");
                            } finally {
                              setBusy("");
                            }
                          }}
                        />
                      )}
                    </div>
                  </Field>
                  <Field label="Parking, instructions, anything extra">
                    <textarea rows={2} value={e.extra ?? ""} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, extra: ev.target.value } : s)) }))} placeholder="Parking is behind the hall. The gift table is in the foyer." />
                  </Field>
                  <Field label="Note">
                    <textarea rows={2} value={e.note} onChange={(ev) => setSchedule(i, "note", ev.target.value)} />
                  </Field>
                  <Field label="Map link for this event" hint="Only if it is somewhere other than the main venue">
                    <input value={e.mapsUrl ?? ""} onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, mapsUrl: ev.target.value } : s)) }))} placeholder="https://maps.app.goo.gl/..." />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["bus", "By bus"],
                        ["train", "By train"],
                        ["car", "By car"],
                        ["auto", "By auto"],
                      ] as const
                    ).map(([k, lab]) => (
                      <Field key={k} label={lab}>
                        <input
                          value={e.transport?.[k] ?? ""}
                          onChange={(ev) => patch((c) => ({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, transport: { ...s.transport, [k]: ev.target.value } } : s)) }))}
                          placeholder={k === "bus" ? "Bus 222 to Kovalam stop, 5 min walk" : ""}
                        />
                      </Field>
                    ))}
                  </div>
                </div>
              ))}
              <Field label="Add a ceremony" hint="Pick a type and it is added with a sensible name. Rename it any time. Guests only see the ceremonies they are invited to.">
                <select
                  value=""
                  onChange={(ev) => {
                    const t = CEREMONIES.find((x) => x.key === ev.target.value);
                    if (!t) return;
                    patch((c) => ({ ...c, schedule: [...c.schedule, { key: `${t.key}${Date.now() % 100000}`, title: t.title, start: "", end: "", place: "", dress: "", note: "", kids: t.kids }] }));
                  }}
                >
                  <option value="">Choose a ceremony type…</option>
                  {CEREMONIES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.title} — {t.desc}
                    </option>
                  ))}
                </select>
              </Field>
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
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.venue.embedMap} onChange={(e) => patch((c) => ({ ...c, venue: { ...c.venue, embedMap: e.target.checked } }))} />
                Show a map on the page (built from the venue name and address)
              </label>
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
                      onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, preset: k, colors: { ...p.colors }, fonts: p.fonts, fireflies: p.fireflies } }))}
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
              <Field label="Typeface pair" hint="Your names are shown in each pair.">
                <link rel="stylesheet" href={ALL_FONTS_HREF} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.entries(FONT_PAIRS) as [FontPair, (typeof FONT_PAIRS)[FontPair]][]).map(([k, f]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, fonts: k } }))}
                      className="rounded border p-3 text-left"
                      style={{ borderColor: config.theme.fonts === k ? "var(--brand)" : "var(--line)", borderWidth: config.theme.fonts === k ? 2 : 1 }}
                    >
                      <span className="block text-2xl leading-tight" style={{ fontFamily: f.display }}>
                        {[config.hosts.name1, config.hosts.name2].filter(Boolean).join(" & ") || "Meera & Arjun"}
                      </span>
                      <span className="mt-1 block text-sm" style={{ fontFamily: f.body }}>
                        Join us for the celebration
                      </span>
                      <span className="mt-2 block text-xs" style={{ color: "var(--ink-2)" }}>
                        {f.label}
                        {f.note ? `. ${f.note}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.theme.fireflies} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, fireflies: e.target.checked } }))} />
                Drifting lights in the background
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.theme.frame} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, frame: e.target.checked } }))} />
                Thin frame around the page, like a printed card
              </label>
              <Field label="Layout" hint="An invitation is one page opened with an envelope. A wedding website has a full-width photo at the top and a menu (Story, Where to stay, Schedule, Travel, Q & A, Wedding party, Moments). For the website, add a portrait on the Photos tab, or pick a photo background.">
                <select value={config.theme.layout} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, layout: e.target.value as InviteConfig["theme"]["layout"] } }))}>
                  <option value="invitation">Invitation: envelope, then one page</option>
                  <option value="website">Wedding website: photo hero and a menu</option>
                </select>
              </Field>
              <Field label="Animated sky" hint="A moving sky behind the whole page: stars, moon, sun, clouds, petals, birds. Pick colours that read on it (Night sky and Ocean dusk suit light text).">
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, scene: "none" } }))}
                    className="rounded border p-3 text-left text-sm"
                    style={{ borderColor: config.theme.scene === "none" ? "var(--brand)" : "var(--line)", borderWidth: config.theme.scene === "none" ? 2 : 1 }}
                  >
                    <span className="font-medium">No animated sky</span>
                  </button>
                  {SCENE_LIST.map((sc) => (
                    <button
                      key={sc.key}
                      type="button"
                      onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, scene: sc.key } }))}
                      className="overflow-hidden rounded border text-left text-sm"
                      style={{ borderColor: config.theme.scene === sc.key ? "var(--brand)" : "var(--line)", borderWidth: config.theme.scene === sc.key ? 2 : 1 }}
                    >
                      <span className="block h-12" style={{ background: sc.skyEnd ? `${sc.sky}` : sc.sky }} />
                      <span className="block p-2">
                        <span className="block font-medium">{sc.label}</span>
                        <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                          {sc.blurb}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Watercolour wash" hint="A painted watercolour behind the page. Ignored when a photo or animated sky is chosen.">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  <button
                    type="button"
                    onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, watercolor: "none" } }))}
                    className="rounded border p-2 text-xs"
                    style={{ borderColor: config.theme.watercolor === "none" ? "var(--brand)" : "var(--line)", borderWidth: config.theme.watercolor === "none" ? 2 : 1 }}
                  >
                    <span className="mb-1 flex h-10 items-center justify-center rounded" style={{ border: "1px dashed var(--line-2)" }}>—</span>
                    None
                  </button>
                  {(Object.entries(WASHES) as [keyof typeof WASHES, (typeof WASHES)[keyof typeof WASHES]][]).map(([k, w]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, watercolor: k } }))}
                      className="rounded border p-2 text-xs"
                      style={{ borderColor: config.theme.watercolor === k ? "var(--brand)" : "var(--line)", borderWidth: config.theme.watercolor === k ? 2 : 1 }}
                    >
                      <span className="mb-1 block h-10 rounded" style={{ background: `radial-gradient(circle at 25% 30%, ${w.pools[0]}, transparent 70%), radial-gradient(circle at 80% 80%, ${w.pools[2]}, transparent 70%), ${w.base}` }} />
                      {w.label}
                    </button>
                  ))}
                </div>
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.theme.bigAmpersand} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, bigAmpersand: e.target.checked } }))} />
                A large soft "&" behind the two names
              </label>
              <Field label="Photo background" hint="A photograph behind the page. Photos are from Unsplash (free licence); credits are in the project README. It is ignored when an animated sky is on.">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, photo: "none" } }))}
                    className="rounded border p-2 text-xs"
                    style={{ borderColor: config.theme.photo === "none" ? "var(--brand)" : "var(--line)", borderWidth: config.theme.photo === "none" ? 2 : 1 }}
                  >
                    <span className="mb-1 flex h-12 items-center justify-center rounded" style={{ border: "1px dashed var(--line-2)" }}>—</span>
                    No photo
                  </button>
                  {PHOTO_LIST.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, photo: p.key } }))}
                      className="rounded border p-2 text-left text-xs"
                      style={{ borderColor: config.theme.photo === p.key ? "var(--brand)" : "var(--line)", borderWidth: config.theme.photo === p.key ? 2 : 1 }}
                    >
                      <span className="mb-1 block h-12 rounded bg-cover bg-center" style={{ backgroundImage: `url(${p.file})` }} />
                      {p.label}
                      <span className="block" style={{ color: "var(--ink-3)" }}>
                        by {p.credit.name}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Page background" hint="A soft painted gradient with paper grain behind the whole page. Your colours still set the text.">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {Object.entries(BACKGROUNDS).map(([k, b]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, background: k as InviteConfig["theme"]["background"] } }))}
                      className="rounded border p-2 text-xs"
                      style={{ borderColor: config.theme.background === k ? "var(--brand)" : "var(--line)", borderWidth: config.theme.background === k ? 2 : 1 }}
                    >
                      <span className="mb-1 block h-10 rounded" style={{ background: b.css ? `${b.css}, ${config.theme.colors.bg}` : config.theme.colors.bg, border: "1px solid var(--line)" }} />
                      {b.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Headline above the names" hint='"Default" shows the small line and the sentence you set in Basics. "Stacked" shows a large capitals title, like "YOU ARE INVITED TO THE / WEDDING / of".'>
                <select value={config.theme.titleStyle} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, titleStyle: e.target.value as InviteConfig["theme"]["titleStyle"] } }))}>
                  <option value="default">Default</option>
                  <option value="stacked">Stacked capitals</option>
                </select>
              </Field>
              {config.theme.titleStyle === "stacked" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Opening line">
                    <input value={config.texts.titleLead} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, titleLead: e.target.value } }))} placeholder="You are invited to the" />
                  </Field>
                  <Field label="Big word">
                    <input value={config.texts.title} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, title: e.target.value } }))} placeholder="Wedding" />
                  </Field>
                  <Field label="Joining word">
                    <input value={config.texts.titleJoin} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, titleJoin: e.target.value } }))} placeholder="of" />
                  </Field>
                </div>
              )}
              <Field label="Date layout">
                <select value={config.theme.dateStyle} onChange={(e) => patch((c) => ({ ...c, theme: { ...c.theme, dateStyle: e.target.value as InviteConfig["theme"]["dateStyle"] } }))}>
                  <option value="stacked">One line: Saturday, 6 March 2027</option>
                  <option value="split">Split: 17 | Saturday / February 2027</option>
                  <option value="numeric">Numbers: 26 - 08 - 2027</option>
                </select>
              </Field>
              <Field label="Ornament" hint="A drawn motif above the names, matching dividers, and flourishes on the frame corners.">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {ORNAMENTS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => patch((c) => ({ ...c, theme: { ...c.theme, ornament: o.key } }))}
                      className="flex flex-col items-center gap-1 rounded border p-2 text-xs"
                      style={{ borderColor: config.theme.ornament === o.key ? "var(--brand)" : "var(--line)", borderWidth: config.theme.ornament === o.key ? 2 : 1, color: "var(--ink)" }}
                    >
                      <span className="flex h-10 items-center justify-center" style={{ color: "var(--gold-ink)" }}>
                        {o.key === "none" ? "—" : <span className="scale-[0.35]"><Motif kind={o.key} /></span>}
                      </span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Crest above the names" hint="A symbol or short phrase. Pick one or type your own.">
                <div className="flex flex-wrap gap-2">
                  {["", "✦", "✝", "ੴ", "ॐ", "☪", "✡", "❀", "﷽", "بسم الله"].map((g) => (
                    <button
                      key={g || "none"}
                      type="button"
                      className="rounded border px-3 py-1.5 text-sm"
                      style={{ borderColor: config.texts.crest === g ? "var(--brand)" : "var(--line)", minWidth: "2.5rem" }}
                      onClick={() => patch((c) => ({ ...c, texts: { ...c.texts, crest: g } }))}
                    >
                      {g || "None"}
                    </button>
                  ))}
                </div>
                <input value={config.texts.crest} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, crest: e.target.value } }))} placeholder="Or type your own" />
              </Field>
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
              {config.music.source === "youtube" && (
                <Field label="Start at" hint="Minutes and seconds, like 1:25, to skip the intro. If YouTube will not play the video inside a page, the built-in score plays instead.">
                  <input
                    defaultValue={config.music.youtubeStart ? `${Math.floor(config.music.youtubeStart / 60)}:${String(config.music.youtubeStart % 60).padStart(2, "0")}` : ""}
                    onChange={(e) => {
                      const m = e.target.value.trim().match(/^(?:(\d+):)?(\d{1,2})$/);
                      const secs = m ? Number(m[1] || 0) * 60 + Number(m[2]) : 0;
                      patch((c) => ({ ...c, music: { ...c.music, youtubeStart: secs } }));
                    }}
                    placeholder="0:00"
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
              {config.rsvp.maxParty > 1 && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={config.rsvp.askChildren} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, askChildren: e.target.checked } }))} />
                  Ask for adults, children and infants separately (useful for the caterer)
                </label>
              )}
              {config.event.type === "corporate" && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={config.rsvp.tickets} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, tickets: e.target.checked } }))} />
                  Give each "yes" a QR ticket (scan at the door from the Check-in page)
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.rsvp.askCompany} onChange={(e) => patch((c) => ({ ...c, rsvp: { ...c.rsvp, askCompany: e.target.checked } }))} />
                Ask for company and email
              </label>
            </>
          )}

          {tab === "extras" && (
            <>
              <Field label="Opening verse or blessing" hint="Shown above the names. Optional.">
                <textarea rows={3} value={config.texts.verse} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, verse: e.target.value } }))} placeholder="Love is patient, love is kind…" />
              </Field>
              <Field label="Verse source">
                <input value={config.texts.verseSource} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, verseSource: e.target.value } }))} placeholder="1 Corinthians 13:4-8" />
              </Field>
              <Field label="Live update banner" hint="Shown across the top of the invitation. Clear it when the news is old.">
                <input
                  value={config.extras.announcement}
                  onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, announcement: e.target.value } }))}
                  placeholder="Update: the muhurat is now at 10:30 sharp"
                />
              </Field>

              <p className="text-sm font-medium">Your story, chapter by chapter</p>
              <p className="-mt-3 text-xs" style={{ color: "var(--ink-2)" }}>
                How you met, the first date, the proposal. Each chapter can have a photo. They appear as a timeline under the short story on the Basics tab.
              </p>
              {config.extras.chapters.map((ch, i) => (
                <div key={i} className="card grid gap-3 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Chapter title">
                      <input value={ch.title} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, chapters: c.extras.chapters.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) } }))} placeholder="How we met" />
                    </Field>
                    <Field label="When">
                      <input value={ch.date} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, chapters: c.extras.chapters.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) } }))} placeholder="Summer 2019" />
                    </Field>
                  </div>
                  <Field label="The story">
                    <textarea rows={3} value={ch.text} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, chapters: c.extras.chapters.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) } }))} />
                  </Field>
                  <Field label="Photo">
                    <div className="flex items-center gap-3">
                      {ch.photo && <img src={ch.photo} alt="" className="h-16 w-16 rounded object-cover" />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setBusy("chapter");
                          try {
                            const u = await uploadFile("photos", invite.id, f);
                            patch((c) => ({ ...c, extras: { ...c.extras, chapters: c.extras.chapters.map((x, j) => (j === i ? { ...x, photo: u } : x)) } }));
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setBusy("");
                          }
                        }}
                        disabled={busy === "chapter"}
                      />
                    </div>
                  </Field>
                  <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, chapters: c.extras.chapters.filter((_, j) => j !== i) } }))}>
                    Remove chapter
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, chapters: [...c.extras.chapters, { title: "", text: "", date: "", photo: "" }] } }))}>
                Add a chapter
              </button>

              <p className="mt-2 text-sm font-medium">Where to stay</p>
              {config.extras.hotels.map((h, i) => (
                <div key={i} className="card grid gap-2 p-4">
                  <Field label="Hotel">
                    <input value={h.name} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, hotels: c.extras.hotels.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } }))} />
                  </Field>
                  <Field label="Note" hint="Distance, rate, booking code">
                    <input value={h.note} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, hotels: c.extras.hotels.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)) } }))} />
                  </Field>
                  <Field label="Link">
                    <input value={h.url} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, hotels: c.extras.hotels.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) } }))} placeholder="https://" />
                  </Field>
                  <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, hotels: c.extras.hotels.filter((_, j) => j !== i) } }))}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, hotels: [...c.extras.hotels, { name: "", note: "", url: "" }] } }))}>
                Add a hotel
              </button>

              <Field label="Travel" hint="Flights, trains, airport pickup. Line breaks are kept.">
                <textarea rows={4} value={config.extras.travel} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, travel: e.target.value } }))} />
              </Field>

              <p className="mt-2 text-sm font-medium">Q &amp; A</p>
              {config.extras.faq.map((f, i) => (
                <div key={i} className="card grid gap-2 p-4">
                  <Field label="Question">
                    <input value={f.q} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, faq: c.extras.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) } }))} placeholder="Are kids welcome?" />
                  </Field>
                  <Field label="Answer">
                    <textarea rows={3} value={f.a} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, faq: c.extras.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) } }))} />
                  </Field>
                  <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, faq: c.extras.faq.filter((_, j) => j !== i) } }))}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, faq: [...c.extras.faq, { q: "", a: "" }] } }))}>
                Add a question
              </button>

              <p className="mt-2 text-sm font-medium">Wedding party</p>
              {config.extras.party.map((p, i) => (
                <div key={i} className="card grid gap-2 p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Field label="Name">
                      <input value={p.name} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, party: c.extras.party.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } }))} />
                    </Field>
                    <Field label="Role">
                      <input value={p.role} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, party: c.extras.party.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) } }))} placeholder="Best man, sister of the bride…" />
                    </Field>
                  </div>
                  <Field label="A line about them">
                    <input value={p.note} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, party: c.extras.party.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)) } }))} />
                  </Field>
                  <Field label="Photo">
                    <div className="flex items-center gap-3">
                      {p.photo && <img src={p.photo} alt="" className="h-12 w-12 rounded-full object-cover" />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (!f) return;
                          setBusy(`party${i}`);
                          try {
                            const u = await uploadFile("photos", invite.id, f);
                            patch((c) => ({ ...c, extras: { ...c.extras, party: c.extras.party.map((x, j) => (j === i ? { ...x, photo: u } : x)) } }));
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setBusy("");
                          }
                        }}
                        disabled={busy === `party${i}`}
                      />
                    </div>
                  </Field>
                  <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, party: c.extras.party.filter((_, j) => j !== i) } }))}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, party: [...c.extras.party, { name: "", role: "", note: "", photo: "" }] } }))}>
                Add a person
              </button>

              <p className="mt-2 text-sm font-medium">Closing lines</p>
              <Field label="Tagline" hint="A short line shown after the photos, before RSVP, e.g. 'Together, always.'">
                <input value={config.texts.tagline} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, tagline: e.target.value } }))} placeholder="Optional" />
              </Field>
              <Field label="Signature" hint="Shown near the very end, e.g. 'With love, Anna & Joseph'">
                <input value={config.texts.signature} onChange={(e) => patch((c) => ({ ...c, texts: { ...c.texts, signature: e.target.value } }))} placeholder="Optional" />
              </Field>

              <Field label="Hashtag" hint="Shown under the date">
                <input value={config.extras.hashtag} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, hashtag: e.target.value } }))} placeholder="#MeeraWedsArjun" />
              </Field>

              <p className="mt-2 text-sm font-medium">Contacts for guests who get lost</p>
              {config.extras.contacts.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr,1fr,auto] items-end gap-2">
                  <Field label="Name">
                    <input value={p.name} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, contacts: c.extras.contacts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } }))} />
                  </Field>
                  <Field label="Phone">
                    <input value={p.phone} onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, contacts: c.extras.contacts.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)) } }))} placeholder="+91 98765 43210" />
                  </Field>
                  <button type="button" className="btn-secondary" aria-label="Remove contact" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, contacts: c.extras.contacts.filter((_, j) => j !== i) } }))}>
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary w-fit" onClick={() => patch((c) => ({ ...c, extras: { ...c.extras, contacts: [...c.extras.contacts, { name: "", phone: "" }] } }))}>
                Add a contact
              </button>

              <p className="mt-2 text-sm font-medium">Live stream</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Stream link" hint="YouTube, Zoom, or any https link">
                  <input
                    value={config.extras.livestream.url}
                    onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, livestream: { ...c.extras.livestream, url: e.target.value } } }))}
                    placeholder="https://youtube.com/live/..."
                  />
                </Field>
                <Field label="Button text">
                  <input
                    value={config.extras.livestream.label}
                    onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, livestream: { ...c.extras.livestream, label: e.target.value } } }))}
                  />
                </Field>
              </div>

              <p className="mt-2 text-sm font-medium">Gifts</p>
              <Field label="Section title">
                <input
                  value={config.extras.gift.title}
                  onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, gift: { ...c.extras.gift, title: e.target.value } } }))}
                />
              </Field>
              <Field label="Message" hint="Leave both this and the UPI ID empty to hide the section">
                <textarea
                  rows={3}
                  value={config.extras.gift.note}
                  onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, gift: { ...c.extras.gift, note: e.target.value } } }))}
                  placeholder="Your presence is the gift. If you wish to bless us, you can do so here."
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="UPI ID" hint="Guests on a phone get a Pay with UPI button">
                  <input
                    value={config.extras.gift.upiId}
                    onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, gift: { ...c.extras.gift, upiId: e.target.value } } }))}
                    placeholder="name@bank"
                  />
                </Field>
                <Field label="Name on UPI">
                  <input
                    value={config.extras.gift.upiName}
                    onChange={(e) => patch((c) => ({ ...c, extras: { ...c.extras, gift: { ...c.extras.gift, upiName: e.target.value } } }))}
                  />
                </Field>
              </div>
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
