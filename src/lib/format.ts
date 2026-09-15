// Date helpers. Every formatter takes the event's timezone and the invite's locale so
// a wedding in Dubai written in Malayalam reads right for a guest in Toronto.

function valid(iso: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function longDate(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  return d ? d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }) : "";
}

export function shortDate(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  return d ? d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", timeZone: tz }) : "";
}

export function dayLabel(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  return d ? d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", timeZone: tz }) : "";
}

export function weekday(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  return d ? d.toLocaleDateString(locale, { weekday: "long", timeZone: tz }) : "";
}

export function timeLabel(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  return d ? d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", timeZone: tz }).replace(/\s?(AM|PM)/, (m) => m.toLowerCase()) : "";
}

// Short, readable timezone name: "IST", "GST", "GMT+5:30".
export function tzShort(tz: string, locale = "en-IN") {
  try {
    const parts = new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

// The offset string ("+05:30") for a timezone at a given wall-clock time, so a
// datetime-local value can be stored as a proper ISO string with offset.
export function tzOffset(tz: string, localIso: string) {
  try {
    const guess = new Date(localIso + "Z");
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(guess);
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    const m = raw.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!m) return "+00:00";
    const h = String(Math.abs(Number(m[1]))).padStart(2, "0");
    return `${m[1].startsWith("-") ? "-" : "+"}${h}:${m[2] ?? "00"}`;
  } catch {
    return "+05:30";
  }
}

// "2026-12-12T10:30:00+05:30" -> "2026-12-12T10:30" for <input type=datetime-local>, and back.
export function toLocalInput(iso: string) {
  const m = iso?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}` : "";
}
export function fromLocalInput(v: string, tz = "Asia/Kolkata") {
  return v ? `${v}:00${tzOffset(tz, `${v}:00`)}` : "";
}

export function calendarUrl(title: string, start: string, end: string, location: string, details: string) {
  const toCal = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  if (!valid(start)) return "";
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCal(start)}/${toCal(valid(end) ? end : start)}`,
    location,
    details,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 50)
    .replace(/^-+|-+$/g, "");
}

export function inviteUrl(slug: string) {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const proto = root.startsWith("localhost") ? "http" : "https";
  return `${proto}://${slug}.${root}`;
}
