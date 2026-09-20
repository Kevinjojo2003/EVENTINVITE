import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { Decor, DECOR_NAMES } from "@/components/icons/Decor";
import { ICONS, ICON_CATEGORIES } from "@/components/icons/registry";

export const metadata: Metadata = { title: "Icon library", robots: { index: false } };

const COLOURS: [string, string][] = [
  ["Ink", "#1f1a17"],
  ["Gold", "#b8893a"],
  ["Emerald", "#0f5c4a"],
  ["Oxblood", "#6e1f2f"],
  ["Rose", "#c8708b"],
  ["Indigo", "#2f3d6e"],
];

// A reference sheet of every icon and decorative SVG, in one colour you can change with ?c=hex.
// One asset, any template colour: that is the point of building them with currentColor.
export default async function IconLibrary({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const colour = /^[0-9a-fA-F]{6}$/.test(c ?? "") ? `#${c}` : "#1f1a17";
  const total = Object.keys(ICONS).length;
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="m-eyebrow">Design system</p>
      <h1 className="m-dis mt-3 text-[clamp(2rem,5vw,3rem)] leading-[1.08]">Icon library</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
        {total} icons and {DECOR_NAMES.length} decorative SVGs. Each is named <code>category-name</code>, carries no colour of its own, and takes its colour from CSS, so one file serves every template.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Preview colour">
        {COLOURS.map(([label, hex]) => (
          <Link
            key={hex}
            href={`/icons?c=${hex.slice(1)}`}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
            style={{ border: `1px solid ${colour === hex ? "var(--ink)" : "var(--line-2)"}` }}
          >
            <span className="h-4 w-4 rounded-full" style={{ background: hex }} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>

      <pre className="m-card mt-6 overflow-x-auto p-4 text-sm" style={{ borderRadius: 8 }}>
        {`<Icon name="wedding-rings" />\n.my-template { --icon-color: ${colour}; }`}
      </pre>

      <div style={{ ["--icon-color" as string]: colour, ["--inv-accent" as string]: colour, ["--inv-ink-dim" as string]: colour, ["--inv-bg" as string]: "#fffdf8" }}>
        {ICON_CATEGORIES.map((cat) => {
          const names = Object.keys(ICONS).filter((n) => ICONS[n].category === cat.key);
          return (
            <section key={cat.key} className="mt-12" aria-labelledby={`c-${cat.key}`}>
              <h2 id={`c-${cat.key}`} className="m-dis text-2xl">
                {cat.label} <span className="text-base" style={{ color: "var(--ink-3)" }}>({names.length})</span>
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {names.map((n) => (
                  <li key={n} className="m-card flex flex-col items-center gap-3 px-2 py-5 text-center" style={{ borderRadius: 8 }}>
                    <Icon name={n} size={30} />
                    <span className="text-[13px] font-medium">{ICONS[n].label}</span>
                    <code className="break-all text-[11px]" style={{ color: "var(--ink-3)" }}>
                      {n}
                    </code>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="mt-16" aria-labelledby="c-decor">
          <h2 id="c-decor" className="m-dis text-2xl">
            Decorative <span className="text-base" style={{ color: "var(--ink-3)" }}>({DECOR_NAMES.length})</span>
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {DECOR_NAMES.map((n) => (
              <li key={n} className="m-card flex flex-col items-center gap-4 px-3 py-6 text-center" style={{ borderRadius: 8 }}>
                <span className="flex min-h-[110px] items-center justify-center" style={{ color: colour }}>
                  <Decor name={n} size={96} />
                </span>
                <code className="text-[11px]" style={{ color: "var(--ink-3)" }}>
                  {n}
                </code>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
