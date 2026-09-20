import type { Metadata } from "next";
import Link from "next/link";
import { FAITHS, STYLES, TEMPLATES, faithOf, styleOf } from "@/lib/templates";
import { TemplateThumb } from "@/components/landing/TemplateThumb";

export const metadata: Metadata = { title: "Templates", description: "Open any invitation template live, then make it yours." };

const FONTS =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500;600&family=Noto+Sans+Gurmukhi:wght@400;600&family=Noto+Serif+Malayalam:wght@400;500&family=Noto+Serif+Tamil:wght@400;500&family=Noto+Naskh+Arabic:wght@400;500&family=Tiro+Devanagari+Hindi&family=Noto+Serif+Telugu:wght@400;500&family=Noto+Serif+Kannada:wght@400;500&family=Noto+Nastaliq+Urdu:wght@400;500&family=Noto+Serif+Hebrew:wght@400;500&display=swap";

const GROUPS: [string, string][] = [
  ["all", "All"],
  ["wedding", "Weddings"],
  ["engagement", "Betrothals"],
  ["housewarming", "Housewarmings"],
  ["birthday", "Birthdays"],
  ["celebration", "Celebrations"],
  ["corporate", "Corporate"],
];

export default async function Templates({ searchParams }: { searchParams: Promise<{ type?: string; faith?: string; style?: string }> }) {
  const { type = "all", faith = "all", style = "all" } = await searchParams;
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";
  const list = TEMPLATES.filter((t) => (type === "all" || t.group === type) && (faith === "all" || faithOf(t) === faith) && (style === "all" || styleOf(t) === style));
  const q = (t: string, f: string, st: string) => {
    const p = new URLSearchParams();
    if (t !== "all") p.set("type", t);
    if (f !== "all") p.set("faith", f);
    if (st !== "all") p.set("style", st);
    const s2 = p.toString();
    return s2 ? `/templates?${s2}` : "/templates";
  };
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <header className="flex items-center justify-between border-b px-5 py-4 md:px-12 lg:px-[120px]" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <Link href="/" className="m-dis text-[22px]">
          {app}
        </Link>
        <Link href="/login" className="m-btn m-btn-pri m-btn-sm">
          Create invitation
        </Link>
      </header>
      <main className="px-5 py-14 md:px-12 lg:px-[120px] lg:py-20">
        <p className="m-eyebrow">Templates</p>
        <h1 className="m-dis mt-3 max-w-[760px] text-[clamp(2rem,5.5vw,3.4rem)] leading-[1.08]">Open any of them live, then make it yours.</h1>
        <p className="mt-4 max-w-[560px] text-[17px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
          Each one is the real invitation your guests would see, set in its own language and tradition. Open it on your phone, since that is where most guests will.
        </p>

        <nav className="mt-9 flex flex-wrap gap-2" aria-label="Event type">
          {GROUPS.map(([k, label]) => (
            <Link
              key={k}
              href={q(k, faith, style)}
              className="rounded-full px-4 py-2 text-sm"
              style={{ border: `1px solid ${type === k ? "var(--ink)" : "var(--line-2)"}`, background: type === k ? "var(--ink)" : "transparent", color: type === k ? "var(--paper)" : "var(--ink-2)" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <nav className="mt-3 flex flex-wrap gap-2" aria-label="Faith or tradition">
          {["all", ...FAITHS].map((f) => (
            <Link
              key={f}
              href={q(type, f, style)}
              className="rounded-full px-4 py-2 text-sm"
              style={{ border: `1px solid ${faith === f ? "var(--pink)" : "var(--line-2)"}`, background: faith === f ? "var(--pink)" : "transparent", color: faith === f ? "#fff" : "var(--ink-2)" }}
            >
              {f === "all" ? "Every tradition" : f}
            </Link>
          ))}
        </nav>
        <nav className="mt-3 flex flex-wrap gap-2" aria-label="Style">
          {["all", ...STYLES].map((st) => (
            <Link
              key={st}
              href={q(type, faith, st)}
              className="rounded-full px-4 py-2 text-sm"
              style={{ border: `1px solid ${style === st ? "var(--gold-ink)" : "var(--line-2)"}`, background: style === st ? "var(--gold-ink)" : "transparent", color: style === st ? "#fff" : "var(--ink-2)" }}
            >
              {st === "all" ? "Every style" : st}
            </Link>
          ))}
        </nav>
        {list.length === 0 && <p className="mt-10" style={{ color: "var(--ink-2)" }}>Nothing matches that combination yet. Try clearing one filter, or start from scratch.</p>}

        <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((t) => (
            <li key={t.key}>
              <Link href={`/templates/${t.key}`} className="group block">
                <div className="w-fit transition-transform duration-300 group-hover:-translate-y-1" style={{ boxShadow: "var(--shadow)" }}>
                  <TemplateThumb t={t} width={260} />
                </div>
                <p className="m-dis mt-4 text-[22px]">{t.name}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-3)" }}>
                  {t.caption}
                </p>
                <p className="mt-2 text-[15px] leading-[1.55]" style={{ color: "var(--ink-2)" }}>
                  {t.blurb}
                </p>
                <span className="mt-3 inline-block text-sm underline-offset-4 group-hover:underline" style={{ color: "var(--gold-ink)" }}>
                  Open live →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="m-card mt-16 flex flex-wrap items-center justify-between gap-6 p-7" style={{ borderStyle: "dashed", borderColor: "var(--line-2)", background: "transparent" }}>
          <div>
            <p className="m-dis text-[24px]">Prefer a blank page?</p>
            <p className="mt-1 text-[15px]" style={{ color: "var(--ink-2)" }}>
              Start from scratch and choose every colour, font and word yourself.
            </p>
          </div>
          <Link href="/dashboard/new" className="m-btn m-btn-sec">
            Start from scratch
          </Link>
        </div>
      </main>
    </>
  );
}
