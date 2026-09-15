import type { EventType } from "./types";

// Ceremony templates. Picking one seeds the schedule and the credit lines; everything
// stays editable afterwards, so any tradition not listed is a rename away.
export type Tradition = {
  key: string;
  label: string;
  for: EventType[];
  schedule: { key: string; title: string; note?: string }[];
  credits?: { label: string; value: string }[];
  headline?: string;
  eyebrow?: string;
};

export const TRADITIONS: Tradition[] = [
  {
    key: "hindu-kerala",
    label: "Hindu (Kerala)",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "nischayam", title: "Nischayam" },
      { key: "mehendi", title: "Mehendi & Haldi" },
      { key: "wedding", title: "The Wedding", note: "Thalikettu at the muhurtham, sadya to follow." },
      { key: "reception", title: "Reception" },
    ],
    eyebrow: "Together with their families",
  },
  {
    key: "hindu",
    label: "Hindu (North Indian)",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "mehendi", title: "Mehendi" },
      { key: "sangeet", title: "Sangeet" },
      { key: "haldi", title: "Haldi" },
      { key: "wedding", title: "Baraat & Pheras" },
      { key: "reception", title: "Reception" },
    ],
  },
  {
    key: "hindu-tamil",
    label: "Hindu (Tamil)",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "nichayathartham", title: "Nichayathartham" },
      { key: "reception", title: "Reception" },
      { key: "muhurtham", title: "Muhurtham", note: "Kanyadaanam and mangalya dharanam." },
    ],
  },
  {
    key: "muslim",
    label: "Muslim",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "mehndi", title: "Mehndi" },
      { key: "nikah", title: "Nikah" },
      { key: "walima", title: "Walima" },
    ],
    eyebrow: "By the grace of Allah, together with their families",
  },
  {
    key: "christian",
    label: "Christian",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "ceremony", title: "The Ceremony", note: "Holy Matrimony at the church." },
      { key: "reception", title: "Reception" },
    ],
    eyebrow: "Together with their families",
  },
  {
    key: "syrian-christian",
    label: "Christian (Kerala)",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "manthrakodi", title: "Manthrakodi blessing" },
      { key: "ceremony", title: "Holy Matrimony" },
      { key: "reception", title: "Reception" },
    ],
  },
  {
    key: "sikh",
    label: "Sikh",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "kurmai", title: "Kurmai" },
      { key: "mehndi", title: "Mehndi & Sangeet" },
      { key: "anand-karaj", title: "Anand Karaj", note: "At the Gurdwara. Heads covered, please." },
      { key: "reception", title: "Reception" },
    ],
  },
  {
    key: "jain",
    label: "Jain",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "lagna-lekhan", title: "Lagna Lekhan" },
      { key: "mehendi", title: "Mehendi" },
      { key: "wedding", title: "Phere" },
      { key: "reception", title: "Reception" },
    ],
  },
  {
    key: "buddhist",
    label: "Buddhist",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "blessing", title: "Blessing ceremony" },
      { key: "reception", title: "Reception" },
    ],
  },
  {
    key: "jewish",
    label: "Jewish",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "ketubah", title: "Ketubah signing" },
      { key: "chuppah", title: "Chuppah" },
      { key: "reception", title: "Reception" },
    ],
  },
  {
    key: "parsi",
    label: "Parsi",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "madhavsaro", title: "Madhavsaro" },
      { key: "lagan", title: "Lagan" },
      { key: "reception", title: "Reception" },
    ],
  },
  {
    key: "civil",
    label: "Civil / non-religious",
    for: ["wedding", "engagement"],
    schedule: [
      { key: "ceremony", title: "The Ceremony" },
      { key: "reception", title: "Reception" },
    ],
    eyebrow: "Together with their families and friends",
  },
  {
    key: "housewarming-hindu",
    label: "Griha Pravesham",
    for: ["housewarming"],
    schedule: [
      { key: "pooja", title: "Griha Pravesham" },
      { key: "lunch", title: "Lunch" },
    ],
  },
  {
    key: "housewarming",
    label: "House blessing / open house",
    for: ["housewarming"],
    schedule: [
      { key: "blessing", title: "Blessing" },
      { key: "openhouse", title: "Open house" },
    ],
  },
  {
    key: "birthday",
    label: "Birthday party",
    for: ["birthday"],
    schedule: [{ key: "party", title: "The Party" }],
  },
  {
    key: "corporate",
    label: "Corporate programme",
    for: ["corporate"],
    schedule: [
      { key: "registration", title: "Registration & coffee" },
      { key: "keynote", title: "Keynote" },
      { key: "networking", title: "Networking dinner" },
    ],
    credits: [{ label: "Organised by", value: "" }],
  },
];

export function traditionsFor(type: EventType) {
  return TRADITIONS.filter((t) => t.for.includes(type));
}

export function tradition(key: string) {
  return TRADITIONS.find((t) => t.key === key);
}

// A short list of common timezones; the editor also accepts any IANA name.
export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Qatar",
  "Asia/Kuwait",
  "Asia/Muscat",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Colombo",
  "Asia/Dhaka",
  "Asia/Karachi",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "Africa/Nairobi",
  "Africa/Lagos",
];
