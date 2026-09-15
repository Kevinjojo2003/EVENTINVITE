import type { FontPair, InviteConfig, ThemeColors, EventType } from "./types";
import { labelsFor } from "./i18n";
import { tradition as findTradition, traditionsFor } from "./traditions";

export const PRESETS: Record<string, { label: string; colors: ThemeColors; fonts: FontPair; fireflies: boolean }> = {
  midnight: {
    label: "Midnight & gold",
    colors: { bg: "#0e2521", bgDeep: "#081a17", ink: "#f3ebdb", inkDim: "#c9bfa9", accent: "#d9be82", accentDeep: "#b4964f" },
    fonts: "bodoni-jost",
    fireflies: true,
  },
  kasavu: {
    label: "Kasavu",
    colors: { bg: "#f6f1e6", bgDeep: "#ece4d2", ink: "#1f2a22", inkDim: "#6b6a5c", accent: "#b8963e", accentDeep: "#8f7226" },
    fonts: "cormorant-montserrat",
    fireflies: false,
  },
  rose: {
    label: "Ivory & rose",
    colors: { bg: "#fbf6f3", bgDeep: "#f3e6e1", ink: "#3a2a2a", inkDim: "#8a7473", accent: "#c98a8a", accentDeep: "#a86b6b" },
    fonts: "playfair-lato",
    fireflies: false,
  },
  dusk: {
    label: "Plum dusk",
    colors: { bg: "#2a1a2e", bgDeep: "#1c1020", ink: "#f4e9e2", inkDim: "#c8b3b8", accent: "#f0b391", accentDeep: "#c98a66" },
    fonts: "fraunces-manrope",
    fireflies: true,
  },
  monsoon: {
    label: "Monsoon indigo",
    colors: { bg: "#131c33", bgDeep: "#0c1224", ink: "#e9ecf5", inkDim: "#aab2c9", accent: "#c9d2e8", accentDeep: "#8e9bc0" },
    fonts: "italiana-karla",
    fireflies: true,
  },
  confetti: {
    label: "Confetti",
    colors: { bg: "#fff8ec", bgDeep: "#ffe9c7", ink: "#2b2340", inkDim: "#6f6785", accent: "#e8553d", accentDeep: "#b93e2b" },
    fonts: "fraunces-manrope",
    fireflies: false,
  },
  slate: {
    label: "Slate (corporate)",
    colors: { bg: "#f4f5f7", bgDeep: "#e6e9ee", ink: "#14181f", inkDim: "#5b6472", accent: "#1f5eff", accentDeep: "#1443b8" },
    fonts: "italiana-karla",
    fireflies: false,
  },
};

export const FONT_PAIRS: Record<FontPair, { label: string; display: string; body: string; google: string }> = {
  "bodoni-jost": {
    label: "Bodoni Moda + Jost",
    display: '"Bodoni Moda", Didot, "Bodoni MT", Georgia, serif',
    body: '"Jost", "Helvetica Neue", Arial, sans-serif',
    google: "family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500&family=Jost:wght@300;400;500",
  },
  "cormorant-montserrat": {
    label: "Cormorant + Montserrat",
    display: '"Cormorant Garamond", Garamond, Georgia, serif',
    body: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
    google: "family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Montserrat:wght@300;400;500",
  },
  "playfair-lato": {
    label: "Playfair + Lato",
    display: '"Playfair Display", Georgia, serif',
    body: '"Lato", "Helvetica Neue", Arial, sans-serif',
    google: "family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400",
  },
  "italiana-karla": {
    label: "Italiana + Karla",
    display: '"Italiana", "Bodoni MT", Georgia, serif',
    body: '"Karla", "Helvetica Neue", Arial, sans-serif',
    google: "family=Italiana&family=Karla:wght@300;400;500",
  },
  "fraunces-manrope": {
    label: "Fraunces + Manrope",
    display: '"Fraunces", Georgia, serif',
    body: '"Manrope", "Helvetica Neue", Arial, sans-serif',
    google: "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Manrope:wght@300;400;500",
  },
};

export function fontsHref(pair: FontPair) {
  return `https://fonts.googleapis.com/css2?${FONT_PAIRS[pair].google}&display=swap`;
}

type TypeDefaults = {
  preset: string;
  headline: string;
  eyebrow: string;
  storyLabel: string;
  schedule: { key: string; title: string }[];
  credits: { label: string; value: string }[];
  tickets: boolean;
  askCompany: boolean;
  maxParty: number;
};

const TYPE_DEFAULTS: Record<EventType, TypeDefaults> = {
  wedding: {
    preset: "midnight",
    headline: "invite you to their wedding",
    eyebrow: "Together with their families",
    storyLabel: "How it started",
    schedule: [
      { key: "mehendi", title: "Mehendi & Haldi" },
      { key: "wedding", title: "The Wedding" },
      { key: "reception", title: "Reception" },
    ],
    credits: [
      { label: "Daughter of", value: "" },
      { label: "Son of", value: "" },
    ],
    tickets: false,
    askCompany: false,
    maxParty: 6,
  },
  engagement: {
    preset: "rose",
    headline: "invite you to their engagement",
    eyebrow: "With the blessings of their families",
    storyLabel: "How it started",
    schedule: [{ key: "engagement", title: "The Engagement" }],
    credits: [
      { label: "Daughter of", value: "" },
      { label: "Son of", value: "" },
    ],
    tickets: false,
    askCompany: false,
    maxParty: 6,
  },
  housewarming: {
    preset: "kasavu",
    headline: "invite you to their new home",
    eyebrow: "A new address",
    storyLabel: "About the house",
    schedule: [
      { key: "pooja", title: "Griha Pravesham" },
      { key: "lunch", title: "Lunch" },
    ],
    credits: [{ label: "Hosted by", value: "" }],
    tickets: false,
    askCompany: false,
    maxParty: 8,
  },
  birthday: {
    preset: "confetti",
    headline: "is turning a year older, and you are invited",
    eyebrow: "Save the date",
    storyLabel: "The plan",
    schedule: [{ key: "party", title: "The Party" }],
    credits: [{ label: "Hosted by", value: "" }],
    tickets: false,
    askCompany: false,
    maxParty: 6,
  },
  corporate: {
    preset: "slate",
    headline: "invites you to",
    eyebrow: "You are invited",
    storyLabel: "About the event",
    schedule: [
      { key: "registration", title: "Registration & coffee" },
      { key: "keynote", title: "Keynote" },
      { key: "networking", title: "Networking dinner" },
    ],
    credits: [{ label: "Organised by", value: "" }],
    tickets: true,
    askCompany: true,
    maxParty: 1,
  },
};

export type ConfigOptions = { tradition?: string; language?: string; timezone?: string };

export function defaultConfig(type: EventType, name1 = "", name2 = "", opts: ConfigOptions = {}): InviteConfig {
  const t = TYPE_DEFAULTS[type];
  const preset = PRESETS[t.preset];
  const language = opts.language || "en";
  const timezone = opts.timezone || "Asia/Kolkata";
  const trad = findTradition(opts.tradition || "") ?? traditionsFor(type)[0];
  const schedule = (trad?.schedule ?? t.schedule).map((s) => ({ key: s.key, title: s.title, start: "", end: "", place: "", dress: "", note: s.note ?? "" }));
  const credits = (trad?.credits ?? t.credits).map((c) => ({ ...c }));
  return {
    hosts: { name1, name2, subline: "" },
    event: { type, tradition: trad?.key ?? "", language, timezone, headline: trad?.headline ?? t.headline, dateTime: "", city: "" },
    labels: labelsFor(language),
    venue: { name: "", line1: "", line2: "", mapsUrl: "", directions: "", stay: "" },
    schedule,
    story: "",
    storyLabel: t.storyLabel,
    photos: [],
    heroPhoto: "",
    credits,
    rsvp: { mode: "both", whatsapp: "", email: "", deadline: "", tickets: t.tickets, askCompany: t.askCompany, maxParty: t.maxParty },
    theme: { preset: t.preset, colors: preset.colors, fonts: preset.fonts, fireflies: preset.fireflies },
    music: { source: "synth", url: "", youtubeId: "", credit: "" },
    texts: { eyebrow: trad?.eyebrow ?? t.eyebrow, footerNote: "", sealText: "" },
  };
}

// Fills any fields a stored config is missing (older rows, partial saves).
export function normalizeConfig(raw: unknown, type: EventType = "wedding"): InviteConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<InviteConfig>;
  const d = defaultConfig(type, "", "", { tradition: r.event?.tradition, language: r.event?.language, timezone: r.event?.timezone });
  return {
    hosts: { ...d.hosts, ...(r.hosts ?? {}) },
    event: { ...d.event, ...(r.event ?? {}), type },
    labels: { ...labelsFor(r.event?.language || "en"), ...(r.labels ?? {}) },
    venue: { ...d.venue, ...(r.venue ?? {}) },
    schedule: Array.isArray(r.schedule) ? r.schedule : d.schedule,
    story: r.story ?? d.story,
    storyLabel: r.storyLabel ?? d.storyLabel,
    photos: Array.isArray(r.photos) ? r.photos : d.photos,
    heroPhoto: r.heroPhoto ?? d.heroPhoto,
    credits: Array.isArray(r.credits) ? r.credits : d.credits,
    rsvp: { ...d.rsvp, ...(r.rsvp ?? {}) },
    theme: { ...d.theme, ...(r.theme ?? {}), colors: { ...d.theme.colors, ...(r.theme?.colors ?? {}) } },
    music: { ...d.music, ...(r.music ?? {}) },
    texts: { ...d.texts, ...(r.texts ?? {}) },
  };
}

export function sealText(c: InviteConfig) {
  if (c.texts.sealText) return c.texts.sealText;
  const a = c.hosts.name1.trim()[0] ?? "";
  const b = c.hosts.name2.trim()[0] ?? "";
  return b ? `${a} & ${b}`.toUpperCase() : a.toUpperCase();
}

export function displayTitle(c: InviteConfig) {
  return c.hosts.name2.trim() ? `${c.hosts.name1} & ${c.hosts.name2}` : c.hosts.name1;
}

export const SAMPLE_CONFIG: InviteConfig = {
  ...defaultConfig("wedding", "Meera", "Arjun", { tradition: "hindu-kerala" }),
  event: { type: "wedding", tradition: "hindu-kerala", language: "en", timezone: "Asia/Kolkata", headline: "invite you to their wedding", dateTime: "2026-12-12T10:30:00+05:30", city: "Kochi" },
  venue: {
    name: "Bolgatty Palace",
    line1: "Mulavukad, Bolgatty Island",
    line2: "Kochi, Kerala 682504",
    mapsUrl: "https://maps.google.com/?q=Bolgatty+Palace+Kochi",
    directions: "Twelve minutes from High Court Junction over the Goshree bridge. Valet parking at the palace gate.",
    stay: "Rooms are held under the wedding name at Bolgatty Palace until 20 November.",
  },
  schedule: [
    { key: "mehendi", title: "Mehendi & Haldi", start: "2026-12-11T16:00:00+05:30", end: "2026-12-11T21:00:00+05:30", place: "Nair residence, Panampilly Nagar", dress: "Yellows and marigold", note: "Turmeric, henna, and far too much food." },
    { key: "wedding", title: "The Wedding", start: "2026-12-12T10:30:00+05:30", end: "2026-12-12T13:00:00+05:30", place: "Bolgatty Palace lawns", dress: "Kasavu and silks", note: "The thalikettu is at 10:30 sharp. Sadya follows on banana leaf." },
    { key: "reception", title: "Reception", start: "2026-12-12T19:00:00+05:30", end: "2026-12-12T23:30:00+05:30", place: "Durbar Hall", dress: "Evening wear", note: "Dinner, a live band, and a dance floor we expect you to use." },
  ],
  story: "We met in the queue for the last Kochi Metro of the night in 2021, argued about which station was actually the last one, and have been mostly agreeing since.",
  credits: [
    { label: "Daughter of", value: "Lakshmi & Suresh Nair" },
    { label: "Son of", value: "Anitha & Ravi Menon" },
  ],
  rsvp: { mode: "both", whatsapp: "919876543210", email: "meera.arjun@example.com", deadline: "20 November 2026", tickets: false, askCompany: false, maxParty: 6 },
};
