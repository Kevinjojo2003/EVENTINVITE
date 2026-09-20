import { PRESETS } from "@/lib/themes";
import { language } from "@/lib/i18n";
import { SCENES } from "@/lib/scenes";
import { PHOTOS } from "@/lib/photos";
import { WASHES } from "@/components/invite/Watercolor";
import type { Template } from "@/lib/templates";

// A small card showing a template's colours, script and crest. The real, fully live
// version opens from the template page.
export function TemplateThumb({ t, width = 232 }: { t: Template; width?: number }) {
  const c = PRESETS[t.preset].colors;
  const lang = language(t.language);
  const display = lang.script ? `'${lang.script.family}', 'Bodoni Moda', serif` : "'Bodoni Moda', Didot, serif";
  const s = t.sample;
  const names = s.name2 ? `${s.name1}\n&\n${s.name2}` : s.subline ? `${s.name1}\n${s.subline}` : s.name1;
  const scale = width / 232;
  return (
    <div
      dir={lang.dir}
      className="m-arch relative flex flex-col items-center justify-end overflow-hidden text-center"
      style={{ width, height: 340 * scale, background: t.watercolor && t.watercolor !== "none" ? `radial-gradient(60% 40% at 15% 8%, ${WASHES[t.watercolor].pools[0]}99, transparent 70%), radial-gradient(60% 40% at 90% 95%, ${WASHES[t.watercolor].pools[2]}88, transparent 70%), ${WASHES[t.watercolor].base}` : t.photo && t.photo !== "none" ? `linear-gradient(${PHOTOS[t.photo].tint}, ${PHOTOS[t.photo].tint}), url(${PHOTOS[t.photo].file}) center/cover` : t.scene && t.scene !== "none" ? SCENES[t.scene].sky : c.bg, color: c.ink, border: "1px solid rgba(31,26,23,.14)", padding: `${23 * scale}px ${23 * scale}px ${40 * scale}px` }}
    >
      <div className="pointer-events-none absolute" style={{ inset: 9 * scale, border: `1px solid ${c.accent}66`, borderRadius: "999px 999px 4px 4px" }} />
      {t.crest && (
        <p className="relative" style={{ fontFamily: display, color: c.accent, fontSize: 17 * scale, marginBottom: 10 * scale }}>
          {t.crest}
        </p>
      )}
      <p className="relative whitespace-pre-line" style={{ fontFamily: display, fontSize: (names.length > 22 ? 22 : 32) * scale, lineHeight: 1.2 }}>
        {names}
      </p>
      <span style={{ width: 51 * scale, height: 1, background: c.accent, margin: `${14 * scale}px 0` }} />
      <p dir="ltr" className="relative tracking-[0.12em]" style={{ color: c.inkDim, fontSize: 12 * scale, fontFamily: "'Jost', sans-serif" }}>
        {s.date.split("-").reverse().join("·")}
      </p>
    </div>
  );
}
