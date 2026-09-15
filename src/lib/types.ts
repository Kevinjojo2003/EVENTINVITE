// The whole invitation is a pure function of this config. The dashboard edits it,
// the public page renders it, the preview renders a draft of it.
import type { Labels } from "./i18n";
export type { Labels };

export type EventType = "wedding" | "engagement" | "housewarming" | "birthday" | "corporate";

export const EVENT_TYPES: Record<EventType, { label: string; twoNames: boolean; blurb: string }> = {
  wedding: { label: "Wedding", twoNames: true, blurb: "Ceremony, reception, and everything around them." },
  engagement: { label: "Engagement", twoNames: true, blurb: "The ring, the families, one evening." },
  housewarming: { label: "Housewarming", twoNames: false, blurb: "A new home and the people you want in it." },
  birthday: { label: "Birthday", twoNames: false, blurb: "First, fiftieth, or anything between." },
  corporate: { label: "Corporate event", twoNames: false, blurb: "Launches, offsites, conferences. Guests get a QR ticket." },
};

export type ScheduleItem = {
  key: string;
  title: string;
  start: string; // ISO with offset, e.g. 2026-12-12T10:30:00+05:30
  end: string;
  place: string;
  dress: string;
  note: string;
};

export type ThemeColors = {
  bg: string; // page ground
  bgDeep: string; // gate / darker panels
  ink: string; // main text
  inkDim: string; // secondary text
  accent: string; // gold / rose / etc
  accentDeep: string;
};

export type FontPair = "bodoni-jost" | "cormorant-montserrat" | "playfair-lato" | "italiana-karla" | "fraunces-manrope";

export type MusicSource = "none" | "synth" | "upload" | "youtube";

export type Photo = { url: string; caption?: string };

export type Credit = { label: string; value: string }; // "Daughter of" / "Hosted by" / "Organised by"

export type InviteConfig = {
  hosts: {
    name1: string; // the couple's first name, the birthday person, the family, the company
    name2: string; // second partner (weddings/engagements) or empty
    subline: string; // "turns thirty" · "are moving in" · "Annual partner summit"
  };
  event: {
    type: EventType;
    tradition: string; // key from lib/traditions
    language: string; // code from lib/i18n
    timezone: string; // IANA, e.g. Asia/Kolkata
    headline: string; // "invite you to their wedding"
    dateTime: string; // ISO with offset. Countdown target.
    city: string;
  };
  labels: Labels; // every fixed string on the page, editable
  venue: {
    name: string;
    line1: string;
    line2: string;
    mapsUrl: string;
    directions: string;
    stay: string;
  };
  schedule: ScheduleItem[];
  story: string;
  storyLabel: string; // "How it started" · "About the evening"
  photos: Photo[];
  heroPhoto: string; // url or ""
  credits: Credit[];
  rsvp: {
    mode: "form" | "whatsapp" | "both";
    whatsapp: string; // digits with country code
    email: string;
    deadline: string;
    tickets: boolean; // issue a QR ticket on "yes" (default on for corporate)
    askCompany: boolean; // corporate: ask for company and designation
    maxParty: number;
  };
  theme: {
    preset: string;
    colors: ThemeColors;
    fonts: FontPair;
    fireflies: boolean;
  };
  music: {
    source: MusicSource;
    url: string; // for upload
    youtubeId: string;
    credit: string;
  };
  texts: {
    eyebrow: string; // "Together with their families"
    footerNote: string;
    sealText: string; // initials on the wax seal
  };
};

export type Invite = {
  id: string;
  owner_id: string;
  slug: string;
  event_type: EventType;
  published: boolean;
  config: InviteConfig;
  created_at: string;
  updated_at: string;
};

export type Guest = {
  id: string;
  invite_id: string;
  name: string;
  phone: string | null;
  token: string;
  sent_at: string | null;
  created_at: string;
};

export type Rsvp = {
  id: string;
  invite_id: string;
  guest_id: string | null;
  name: string;
  email: string | null;
  company: string | null;
  attending: boolean;
  party_size: number;
  events: string[];
  note: string | null;
  ticket_code: string;
  checked_in_at: string | null;
  created_at: string;
};
