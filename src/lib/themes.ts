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
  sage: {
    label: "Sage garden",
    colors: { bg: "#f1f4ec", bgDeep: "#e1e8d6", ink: "#25301f", inkDim: "#65705a", accent: "#7d9a5f", accentDeep: "#5c7842" },
    fonts: "cormorant-montserrat",
    fireflies: false,
  },
  sunset: {
    label: "Peach sunset",
    colors: { bg: "#fff3ea", bgDeep: "#ffe0cc", ink: "#40241c", inkDim: "#8c6455", accent: "#e2703a", accentDeep: "#b9531f" },
    fonts: "playfair-lato",
    fireflies: false,
  },
  noir: {
    label: "Noir & silver",
    colors: { bg: "#111114", bgDeep: "#08080a", ink: "#f2f2f4", inkDim: "#a5a5ad", accent: "#c9ccd6", accentDeep: "#8d91a1" },
    fonts: "bodoni-jost",
    fireflies: true,
  },
  royal: {
    label: "Royal maroon",
    colors: { bg: "#3a0f1b", bgDeep: "#26070f", ink: "#fbeee0", inkDim: "#d9b9a8", accent: "#e6b54a", accentDeep: "#b98a25" },
    fonts: "cormorant-montserrat",
    fireflies: true,
  },
  saffron: {
    label: "Saffron & cream",
    colors: { bg: "#fff4e2", bgDeep: "#f6e0bd", ink: "#4a2410", inkDim: "#8a6242", accent: "#d47a16", accentDeep: "#a85c0c" },
    fonts: "spectral-mukta",
    fireflies: false,
  },
  lavender: {
    label: "Lavender dusk",
    colors: { bg: "#f4eefb", bgDeep: "#e6dcf3", ink: "#2f2547", inkDim: "#6f6488", accent: "#8a63bd", accentDeep: "#6b4a99" },
    fonts: "lora-inter",
    fireflies: false,
  },
  lagoon: {
    label: "Lagoon & brass",
    colors: { bg: "#e6f2f1", bgDeep: "#cfe6e4", ink: "#12363a", inkDim: "#4f7175", accent: "#b48a34", accentDeep: "#8d6a22" },
    fonts: "cormorant-montserrat",
    fireflies: false,
  },
  nightsky: {
    label: "Night sky",
    colors: { bg: "#0b1233", bgDeep: "#060a22", ink: "#f6efe0", inkDim: "#bcc2e0", accent: "#f0cf85", accentDeep: "#d1a94e" },
    fonts: "greatvibes-lora",
    fireflies: true,
  },
  goldenhour: {
    label: "Golden hour",
    colors: { bg: "#ffe6b8", bgDeep: "#f6c98a", ink: "#4a2410", inkDim: "#7d4e2c", accent: "#b3441a", accentDeep: "#8c3210" },
    fonts: "greatvibes-lora",
    fireflies: false,
  },
  oceandusk: {
    label: "Ocean dusk",
    colors: { bg: "#3a2452", bgDeep: "#22143a", ink: "#fff3e2", inkDim: "#f0cdb8", accent: "#ffd38a", accentDeep: "#f0ae55" },
    fonts: "greatvibes-lora",
    fireflies: false,
  },
  aquawash: {
    label: "Aqua wash",
    colors: { bg: "#fbfefd", bgDeep: "#dff3ef", ink: "#5a5e66", inkDim: "#8b9098", accent: "#2f9c8e", accentDeep: "#1f7a6e" },
    fonts: "greatvibes-lora",
    fireflies: false,
  },
  rosewash: {
    label: "Rose wash",
    colors: { bg: "#fffafb", bgDeep: "#f8e3e8", ink: "#6a5560", inkDim: "#9b8590", accent: "#c8708b", accentDeep: "#a2506c" },
    fonts: "greatvibes-lora",
    fireflies: false,
  },
  lilacwash: {
    label: "Lilac wash",
    colors: { bg: "#fcfaff", bgDeep: "#ebe4f6", ink: "#5b5470", inkDim: "#8d86a3", accent: "#8163b8", accentDeep: "#64489a" },
    fonts: "greatvibes-lora",
    fireflies: false,
  },
  mist: {
    label: "Sage mist",
    colors: { bg: "#e6f0e8", bgDeep: "#d3e5d9", ink: "#24402f", inkDim: "#587263", accent: "#b04a68", accentDeep: "#8c3650" },
    fonts: "greatvibes-lora",
    fireflies: false,
  },
  wild: {
    label: "Wildflower ivory",
    colors: { bg: "#fffdf9", bgDeep: "#f6efe2", ink: "#4a3320", inkDim: "#8a7256", accent: "#b8893a", accentDeep: "#8d6a28" },
    fonts: "greatvibes-lora",
    fireflies: false,
  },
  cathedral: {
    label: "Cathedral cream",
    colors: { bg: "#fbf8f0", bgDeep: "#efe9d8", ink: "#16223d", inkDim: "#5a6580", accent: "#2f3d6e", accentDeep: "#1f2b52" },
    fonts: "playfair-lato",
    fireflies: false,
  },
  anand: {
    label: "Indigo & saffron",
    colors: { bg: "#1a2340", bgDeep: "#101730", ink: "#f4ecd8", inkDim: "#b9bdd0", accent: "#e0a63c", accentDeep: "#b98420" },
    fonts: "cormorant-montserrat",
    fireflies: true,
  },
  terracotta: {
    label: "Terracotta",
    colors: { bg: "#f6ece0", bgDeep: "#ecd9c4", ink: "#5a2318", inkDim: "#8a6152", accent: "#b5462f", accentDeep: "#8f3220" },
    fonts: "fraunces-manrope",
    fireflies: false,
  },
  emerald: {
    label: "Emerald & ivory",
    colors: { bg: "#0b201a", bgDeep: "#06140f", ink: "#f4ecd8", inkDim: "#b7c2b5", accent: "#d9be82", accentDeep: "#b4964f" },
    fonts: "cormorant-montserrat",
    fireflies: true,
  },
  slate: {
    label: "Slate (corporate)",
    colors: { bg: "#f4f5f7", bgDeep: "#e6e9ee", ink: "#14181f", inkDim: "#5b6472", accent: "#1f5eff", accentDeep: "#1443b8" },
    fonts: "italiana-karla",
    fireflies: false,
  },
};

export const FONT_PAIRS: Record<FontPair, { label: string; display: string; body: string; google: string; note?: string }> = {
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
  "newsreader-hanken": {
    label: "Newsreader + Hanken Grotesk",
    note: "A calm text serif with real italics. Reads like a good book.",
    display: '"Newsreader", "Iowan Old Style", Georgia, serif',
    body: '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif',
    google: "family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Hanken+Grotesk:wght@300;400;500",
  },
  "dmserif-manrope": {
    label: "DM Serif Display + Manrope",
    note: "Confident, high-contrast headlines with a clean, modern body.",
    display: '"DM Serif Display", Georgia, serif',
    body: '"Manrope", "Helvetica Neue", Arial, sans-serif',
    google: "family=DM+Serif+Display:ital@0;1&family=Manrope:wght@300;400;500",
  },
  "lora-inter": {
    label: "Lora + Inter",
    note: "Warm and friendly. Works for any event, formal or not.",
    display: '"Lora", Georgia, serif',
    body: '"Inter", "Helvetica Neue", Arial, sans-serif',
    google: "family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500",
  },
  "cinzel-lato": {
    label: "Cinzel + Lato",
    note: "Engraved Roman capitals. Ceremonial and monumental.",
    display: '"Cinzel", "Trajan Pro", Georgia, serif',
    body: '"Lato", "Helvetica Neue", Arial, sans-serif',
    google: "family=Cinzel:wght@400;500&family=Lato:wght@300;400",
  },
  "spectral-mukta": {
    label: "Spectral + Mukta",
    note: "Both carry Indian scripts well. A natural fit for Hindu and Tamil weddings.",
    display: '"Spectral", Georgia, serif',
    body: '"Mukta", "Helvetica Neue", Arial, sans-serif',
    google: "family=Spectral:ital,wght@0,400;0,500;1,400;1,500&family=Mukta:wght@300;400;500",
  },
  "garamond-inter": {
    label: "EB Garamond + Inter",
    note: "Classical and heritage. Small text stays legible.",
    display: '"EB Garamond", Garamond, Georgia, serif',
    body: '"Inter", "Helvetica Neue", Arial, sans-serif',
    google: "family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500",
  },
  "youngserif-figtree": {
    label: "Young Serif + Figtree",
    note: "Soft, warm and a little playful. Good for birthdays and housewarmings.",
    display: '"Young Serif", Georgia, serif',
    body: '"Figtree", "Helvetica Neue", Arial, sans-serif',
    google: "family=Young+Serif&family=Figtree:wght@300;400;500",
  },
  "greatvibes-lora": {
    label: "Great Vibes + Lora",
    note: "Flowing script for the names, a warm serif for everything else. Best with short names.",
    display: '"Great Vibes", "Snell Roundhand", cursive',
    body: '"Lora", Georgia, serif',
    google: "family=Great+Vibes&family=Lora:ital,wght@0,400;0,500;1,400",
  },
  "fraunces-manrope": {
    label: "Fraunces + Manrope",
    display: '"Fraunces", Georgia, serif',
    body: '"Manrope", "Helvetica Neue", Arial, sans-serif',
    google: "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Manrope:wght@300;400;500",
  },
};

// Painted page backgrounds: soft gradients with a little paper grain. Text colours still come from the palette.
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .3 0 0 0 0 .25 0 0 0 0 .2 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
export const BACKGROUNDS: Record<string, { label: string; css: string }> = {
  flat: { label: "Plain", css: "" },
  mist: { label: "Mint mist", css: `${GRAIN}, radial-gradient(70% 40% at 15% 4%, rgba(255,255,255,.55), transparent 70%), linear-gradient(180deg, #cde5da 0%, #e4f0e5 36%, #f4efdf 68%, #f5dfd8 100%)` },
  blush: { label: "Blush", css: `${GRAIN}, radial-gradient(60% 40% at 85% 6%, rgba(255,255,255,.5), transparent 70%), linear-gradient(180deg, #f8dcd8 0%, #fbeae3 45%, #f7efe0 100%)` },
  dusk: { label: "Dusk", css: `${GRAIN}, radial-gradient(70% 40% at 50% 0%, rgba(255,214,150,.35), transparent 70%), linear-gradient(180deg, #2a1738 0%, #5a2545 45%, #8f3d4a 80%, #b9603f 100%)` },
  sage: { label: "Sage", css: `${GRAIN}, linear-gradient(180deg, #dfe8d6 0%, #eef0dc 55%, #f7efdc 100%)` },
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
    hosts: { name1, name2, subline: "", nameTranslit: "" },
    event: { type, tradition: trad?.key ?? "", language, timezone, headline: trad?.headline ?? t.headline, dateTime: "", city: "" },
    labels: labelsFor(language),
    venue: { name: "", line1: "", line2: "", mapsUrl: "", directions: "", stay: "", embedMap: true },
    schedule,
    story: "",
    storyLabel: t.storyLabel,
    photos: [],
    heroPhoto: "",
    credits,
    rsvp: { mode: "both", whatsapp: "", email: "", deadline: "", tickets: t.tickets, askCompany: t.askCompany, maxParty: t.maxParty, askChildren: t.maxParty > 1 },
    theme: { preset: t.preset, colors: preset.colors, fonts: preset.fonts, fireflies: preset.fireflies, frame: false, ornament: "none", background: "flat", dateStyle: "stacked", titleStyle: "default", scene: "none", photo: "none", watercolor: "none", bigAmpersand: false, layout: "invitation" },
    music: { source: "synth", url: "", youtubeId: "", youtubeStart: 0, credit: "" },
    texts: { eyebrow: trad?.eyebrow ?? t.eyebrow, footerNote: "", sealText: "", crest: "", titleLead: "", title: "", titleJoin: "", verse: "", verseSource: "", dateTranslit: "", tagline: "", signature: "" },
    extras: {
      announcement: "",
      livestream: { url: "", label: "Watch live" },
      gift: { title: "Blessings & gifts", note: "", upiId: "", upiName: "" },
      hashtag: "",
      faq: [],
      party: [],
      hotels: [],
      travel: "",
      chapters: [],
      contacts: [],
    },
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
    // QR tickets are a corporate-event feature; every other event type just collects replies.
    rsvp: { ...d.rsvp, ...(r.rsvp ?? {}), tickets: type === "corporate" && (r.rsvp?.tickets ?? d.rsvp.tickets) },
    theme: { ...d.theme, ...(r.theme ?? {}), colors: { ...d.theme.colors, ...(r.theme?.colors ?? {}) } },
    music: { ...d.music, ...(r.music ?? {}) },
    texts: { ...d.texts, ...(r.texts ?? {}) },
    extras: {
      announcement: r.extras?.announcement ?? d.extras.announcement,
      livestream: { ...d.extras.livestream, ...(r.extras?.livestream ?? {}) },
      gift: { ...d.extras.gift, ...(r.extras?.gift ?? {}) },
      hashtag: r.extras?.hashtag ?? d.extras.hashtag,
      faq: Array.isArray(r.extras?.faq) ? r.extras!.faq : d.extras.faq,
      party: Array.isArray(r.extras?.party) ? r.extras!.party : d.extras.party,
      hotels: Array.isArray(r.extras?.hotels) ? r.extras!.hotels : d.extras.hotels,
      travel: r.extras?.travel ?? d.extras.travel,
      chapters: Array.isArray(r.extras?.chapters) ? r.extras!.chapters : d.extras.chapters,
      contacts: Array.isArray(r.extras?.contacts) ? r.extras!.contacts : d.extras.contacts,
    },
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
    embedMap: true,
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
  rsvp: { mode: "both", whatsapp: "919876543210", email: "meera.arjun@example.com", deadline: "20 November 2026", tickets: false, askCompany: false, maxParty: 6, askChildren: true },
};
