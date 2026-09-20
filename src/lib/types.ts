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
  dressColors?: string[]; // hex swatches shown beside the dress code
  kids?: "welcome" | "adults"; // are children invited
  dry?: boolean; // no alcohol
  contactName?: string; // who to call at this venue
  contactPhone?: string;
  officiant?: string;
  extra?: string; // parking, gift table, anything else
  icon?: string; // an icon from the library ("ceremony-lamp"); blank picks one from the title
  photos?: string[]; // up to three pictures of this ceremony or its venue
  mapsUrl?: string; // this ceremony's own map link, when it is not at the main venue
  transport?: { bus?: string; train?: string; car?: string; auto?: string }; // how to get there
};

export type ThemeColors = {
  bg: string; // page ground
  bgDeep: string; // gate / darker panels
  ink: string; // main text
  inkDim: string; // secondary text
  accent: string; // gold / rose / etc
  accentDeep: string;
};

export type FontPair =
  | "bodoni-jost"
  | "cormorant-montserrat"
  | "playfair-lato"
  | "italiana-karla"
  | "fraunces-manrope"
  | "newsreader-hanken"
  | "dmserif-manrope"
  | "lora-inter"
  | "cinzel-lato"
  | "spectral-mukta"
  | "garamond-inter"
  | "youngserif-figtree"
  | "greatvibes-lora";

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
    embedMap: boolean; // show a map on the page, not just a link
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
    askChildren: boolean; // split each reply into adults / children / infants
  };
  theme: {
    preset: string;
    colors: ThemeColors;
    fonts: FontPair;
    fireflies: boolean;
    layout: "invitation" | "website"; // one invitation page, or a wedding website with a photo hero and a menu
    watercolor: "none" | "aqua" | "rose" | "lilac" | "sage" | "gold"; // a painted watercolour wash behind the page
    bigAmpersand: boolean; // a large soft "&" behind the names
    photo: "none" | "blue-gold" | "green-leaves" | "pink-roses" | "white-paper" | "botanical-paper"; // a photograph behind the page
    scene: "none" | "moonlight" | "sunrise-journey" | "golden-hour" | "garden-day" | "ocean-dusk"; // animated sky behind the page
    background: "flat" | "mist" | "blush" | "dusk" | "sage"; // painted gradient behind the whole page
    dateStyle: "stacked" | "split" | "numeric"; // one line, "17 | SATURDAY / AUGUST 2027" split by a rule, or "26 - 08 - 2027"
    titleStyle: "default" | "stacked"; // "YOU ARE INVITED TO THE / WEDDING / of" above the names
    frame: boolean; // thin inset border around the page, like a printed card
    ornament: "none" | "floral" | "mandala" | "leaves" | "rings" | "paisley" | "garland" | "lanterns" | "arch" | "garden" | "wildflower"; // drawn motif above the names, dividers and frame corners
  };
  music: {
    source: MusicSource;
    url: string; // for upload
    youtubeId: string;
    youtubeStart: number; // seconds into the video to start from
    credit: string;
  };
  texts: {
    eyebrow: string; // "Together with their families"
    footerNote: string;
    sealText: string; // initials on the wax seal
    crest: string; // symbol or phrase above the names: a cross, a khanda, Bismillah...
    titleLead: string; // "You are invited to the"
    title: string; // "Wedding"
    titleJoin: string; // "of"
    verse: string; // an opening verse or blessing, shown above everything
    verseSource: string; // "1 Corinthians 13:4-8", "Rumi"...
  };
  extras: {
    announcement: string; // live update banner at the top, e.g. "Muhurat moved to 10:30"
    livestream: { url: string; label: string };
    gift: { title: string; note: string; upiId: string; upiName: string };
    hashtag: string;
    faq: { q: string; a: string }[]; // questions guests ask
    party: { name: string; role: string; note: string; photo: string }[]; // the wedding party
    hotels: { name: string; note: string; url: string }[]; // where to stay
    travel: string; // getting there: flights, trains, airport pickup
    chapters: { title: string; text: string; date: string; photo: string }[]; // the love story, as a timeline
    contacts: { name: string; phone: string }[]; // "call us if you are lost"
  };
};

// One guest's answer for one ceremony.
export type EventReply = { attending: boolean; adults: number; children: number; infants: number };

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
  events: string[]; // schedule keys this guest is invited to; empty means all
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
  responses: Record<string, EventReply>; // per-event answers and headcounts
  note: string | null;
  ticket_code: string;
  checked_in_at: string | null;
  created_at: string;
};
