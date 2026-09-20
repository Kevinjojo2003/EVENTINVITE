// Date helpers. Every formatter takes the event's timezone and the invite's locale so
// a wedding in Dubai written in Malayalam reads right for a guest in Toronto.

function valid(iso: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Some devices ship without month and weekday names for smaller languages and print "M12" instead.
// For those, fixed names are used on the server and in the browser alike, so the two always agree.
const MANUAL: Record<string, { months: string[]; days: string[] }> = {
  pa: {
    months: ["ਜਨਵਰੀ", "ਫ਼ਰਵਰੀ", "ਮਾਰਚ", "ਅਪ੍ਰੈਲ", "ਮਈ", "ਜੂਨ", "ਜੁਲਾਈ", "ਅਗਸਤ", "ਸਤੰਬਰ", "ਅਕਤੂਬਰ", "ਨਵੰਬਰ", "ਦਸੰਬਰ"],
    days: ["ਐਤਵਾਰ", "ਸੋਮਵਾਰ", "ਮੰਗਲਵਾਰ", "ਬੁੱਧਵਾਰ", "ਵੀਰਵਾਰ", "ਸ਼ੁੱਕਰਵਾਰ", "ਸ਼ਨੀਚਰਵਾਰ"],
  },
};
const manualFor = (locale: string) => MANUAL[locale.toLowerCase().split("-")[0]] ?? null;

// Year, month (0-11), day and weekday (0 = Sunday) of an instant, read in a given timezone.
function ymd(d: Date, tz: string) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric", weekday: "short" }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { y: Number(get("year")), m: Number(get("month")) - 1, d: Number(get("day")), w: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")) };
}

export function longDate(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  if (!d) return "";
  const man = manualFor(locale);
  if (man) {
    const x = ymd(d, tz);
    return `${man.days[x.w]}, ${x.d} ${man.months[x.m]} ${x.y}`;
  }
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz });
}

export function shortDate(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  if (!d) return "";
  const man = manualFor(locale);
  if (man) {
    const x = ymd(d, tz);
    return `${x.d} ${man.months[x.m]} ${x.y}`;
  }
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", timeZone: tz });
}

export function dayLabel(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  if (!d) return "";
  const man = manualFor(locale);
  if (man) {
    const x = ymd(d, tz);
    return `${man.days[x.w]}, ${x.d} ${man.months[x.m]}`;
  }
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", timeZone: tz });
}

export function weekday(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  if (!d) return "";
  const man = manualFor(locale);
  if (man) return man.days[ymd(d, tz).w];
  return d.toLocaleDateString(locale, { weekday: "long", timeZone: tz });
}

// "26 - 08 - 2027": day, month and year in the event's timezone, with a fixed order and no month names.
export function numericDate(iso: string, tz = "Asia/Kolkata") {
  const d = valid(iso);
  if (!d) return "";
  const x = ymd(d, tz);
  return `${String(x.d).padStart(2, "0")} - ${String(x.m + 1).padStart(2, "0")} - ${x.y}`;
}

// The three parts of the split date layout: "17", "Wednesday", "February 2027".
export function dateParts(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  const d = valid(iso);
  if (!d) return null;
  const man = manualFor(locale);
  if (man) {
    const x = ymd(d, tz);
    return { day: String(x.d), weekday: man.days[x.w], month: `${man.months[x.m]} ${x.y}` };
  }
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: tz, ...o }).format(d);
  return { day: f({ day: "numeric" }), weekday: f({ weekday: "long" }), month: f({ month: "long", year: "numeric" }) };
}

// Times and timezone names use a locale with complete data whenever the language is on the fixed-names list.
const safeLocale = (locale: string) => (manualFor(locale) ? "en-IN" : locale);

export function timeLabel(iso: string, tz = "Asia/Kolkata", locale = "en-IN") {
  locale = safeLocale(locale);
  const d = valid(iso);
  return d ? d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", timeZone: tz }).replace(/\s?(AM|PM)/, (m) => m.toLowerCase()) : "";
}

// Short, readable timezone name: "IST", "GST", "GMT+5:30".
export function tzShort(tz: string, locale = "en-IN") {
  locale = safeLocale(locale);
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

// A downloadable .ics file so the event also lands in Apple Calendar and Outlook.
export function icsHref(title: string, start: string, end: string, location: string, details: string) {
  if (!valid(start)) return "";
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, (m) => "\\" + m);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mandapam//Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${stamp(start)}-${Math.abs(hash(title))}@mandapam`,
    // DTSTAMP is required but must not depend on "now", or the server and browser render different links.
    `DTSTAMP:${stamp(start)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(valid(end) ? end : start)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
