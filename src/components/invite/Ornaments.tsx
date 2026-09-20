import type { ReactElement } from "react";

// Original ornaments, drawn as inline SVG. They use currentColor, so they take the
// invitation's accent colour and need no image files or licences.
export type OrnamentKind = "none" | "floral" | "mandala" | "leaves" | "rings" | "paisley" | "garland" | "lanterns" | "arch" | "garden" | "wildflower";

export const ORNAMENTS: { key: OrnamentKind; label: string }[] = [
  { key: "none", label: "None" },
  { key: "floral", label: "Floral" },
  { key: "mandala", label: "Mandala" },
  { key: "leaves", label: "Leaves" },
  { key: "rings", label: "Rings" },
  { key: "paisley", label: "Paisley" },
  { key: "garland", label: "Garland" },
  { key: "lanterns", label: "Lanterns" },
  { key: "arch", label: "Arch" },
  { key: "garden", label: "Garden mandap" },
  { key: "wildflower", label: "Wildflowers" },
];

const svgProps = { fill: "none", stroke: "currentColor", strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

// A petal from radius r outward by length l, half-width w.
const petal = (r: number, w: number, l: number) => `M0 ${-r} C ${w} ${-r - l * 0.35}, ${w} ${-r - l * 0.75}, 0 ${-r - l} C ${-w} ${-r - l * 0.75}, ${-w} ${-r - l * 0.35}, 0 ${-r} Z`;
const ring = (n: number, d: string, opacity = 1) =>
  Array.from({ length: n }, (_, i) => <path key={i} d={d} transform={`rotate(${(i * 360) / n})`} opacity={opacity} />);

export function Mandala({ size = 132 }: { size?: number }) {
  return (
    <svg viewBox="-100 -100 200 200" width={size} height={size} {...svgProps}>
      <circle r="96" opacity=".35" />
      <circle r="91" opacity=".6" />
      {ring(24, petal(56, 9, 30), 0.9)}
      {ring(12, petal(30, 9, 24), 0.8)}
      {ring(8, petal(8, 6, 18))}
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} r="1.6" cx="0" cy="-94" transform={`rotate(${i * 15 + 7.5})`} fill="currentColor" stroke="none" />
      ))}
      <circle r="5" fill="currentColor" />
    </svg>
  );
}

export function Lotus({ size = 120 }: { size?: number }) {
  const one = "M0 0 C 15 -14, 15 -40, 0 -54 C -15 -40, -15 -14, 0 0 Z";
  return (
    <svg viewBox="-70 -64 140 74" width={size} height={size * (74 / 140)} {...svgProps}>
      {[-72, -48, -24, 24, 48, 72].map((a) => (
        <path key={a} d={one} transform={`rotate(${a})`} opacity=".85" />
      ))}
      <path d={one} />
      <path d="M-58 6 C -30 12, 30 12, 58 6" opacity=".6" />
    </svg>
  );
}

export function Rings({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="-50 -40 100 72" width={size} height={size * 0.72} {...svgProps} strokeWidth={1.4}>
      <circle cx="-14" cy="6" r="22" />
      <circle cx="14" cy="6" r="22" />
      <path d="M-14 -22 l4 -6 l-4 -6 l-4 6 z" fill="currentColor" />
      <circle cx="-14" cy="6" r="18" opacity=".4" />
      <circle cx="14" cy="6" r="18" opacity=".4" />
    </svg>
  );
}

export function Paisley({ size = 84 }: { size?: number }) {
  return (
    <svg viewBox="-40 -44 80 88" width={size} height={size * 1.1} {...svgProps}>
      <path d="M0 38 C -28 34 -32 2 -12 -20 C -4 -30 12 -34 18 -24 C 8 -24 4 -18 6 -8 C 8 6 4 22 0 38 Z" transform="rotate(12)" />
      <path d="M-4 26 C -16 22 -16 6 -6 -8" opacity=".6" transform="rotate(12)" />
      {[[-2, 4], [4, 12], [-8, -6], [8, -2]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" transform="rotate(12)" />
      ))}
    </svg>
  );
}

export function LeafSprig({ size = 120 }: { size?: number }) {
  const leaf = "M0 0 C 5 -7, 13 -7, 18 0 C 13 7, 5 7, 0 0 Z";
  return (
    <svg viewBox="-60 -30 120 60" width={size} height={size / 2} {...svgProps}>
      <path d="M0 26 C 0 10, 0 -4, 0 -20" />
      {[8, -2, -12].map((y, i) => (
        <g key={y} transform={`translate(0 ${y})`}>
          <path d={leaf} transform={`rotate(${-38 - i * 4}) scale(${1.15 - i * 0.12})`} />
          <path d={leaf} transform={`scale(-1 1) rotate(${-38 - i * 4}) scale(${1.15 - i * 0.12})`} />
        </g>
      ))}
      <path d={leaf} transform="translate(0 -20) rotate(-90) scale(.9)" />
    </svg>
  );
}

// A strand of marigolds hanging across the top, like the ones over a doorway.
export function Garland({ width = 360 }: { width?: number }) {
  const n = 11;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return { x: 420 * t, y: 6 * (1 - t) ** 2 + 120 * (1 - t) * t + 6 * t ** 2 };
  });
  return (
    <svg viewBox="0 0 420 74" width={width} height={width * (74 / 420)} style={{ maxWidth: "100%" }} {...svgProps}>
      <path d="M0 6 Q210 60 420 6" opacity=".7" />
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y + 9})`}>
          {Array.from({ length: 8 }, (_, k) => (
            <ellipse key={k} cx="0" cy="-5.5" rx="2.8" ry="5.5" transform={`rotate(${k * 45})`} fill="currentColor" fillOpacity={k % 2 ? 0.55 : 0.85} stroke="none" />
          ))}
          <circle r="2.4" fill="none" stroke="currentColor" />
        </g>
      ))}
    </svg>
  );
}

// Three lanterns on strings of different lengths.
export function Lanterns({ width = 300 }: { width?: number }) {
  const lantern = (x: number, drop: number, key: number) => (
    <g key={key} transform={`translate(${x} 0)`}>
      <line x1="0" y1="0" x2="0" y2={drop} />
      <g transform={`translate(0 ${drop})`}>
        <path d="M-6 0 L6 0 L8 5 L-8 5 Z" fill="currentColor" fillOpacity=".5" />
        <path d="M-8 5 C-16 16 -16 34 -8 44 L8 44 C16 34 16 16 8 5 Z" fill="currentColor" fillOpacity=".12" />
        <path d="M0 5 L0 44 M-8 5 C-3 18 -3 32 -8 44 M8 5 C3 18 3 32 8 44" opacity=".7" />
        <path d="M-9 44 L9 44" />
        <line x1="0" y1="44" x2="0" y2="56" />
        <circle cx="0" cy="58" r="2" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 300 120" width={width} height={width * 0.4} style={{ maxWidth: "100%" }} {...svgProps}>
      <line x1="0" y1="1" x2="300" y2="1" opacity=".5" />
      {lantern(60, 22, 0)}
      {lantern(150, 40, 1)}
      {lantern(240, 16, 2)}
    </svg>
  );
}

// A cusped (multifoil) arch, as in a Mughal window, with a small lotus inside.
export function Arch({ size = 120 }: { size?: number }) {
  const lobes = [
    [14, 96], [17, 70], [30, 46], [46, 26], [70, 26], [86, 46], [99, 70], [102, 96],
  ];
  return (
    <svg viewBox="0 0 116 150" width={size} height={size * (150 / 116)} {...svgProps}>
      <path d="M8 148 L8 84 C8 46 38 20 58 4 C78 20 108 46 108 84 L108 148" />
      <path d="M16 148 L16 86 C16 52 42 30 58 16 C74 30 100 52 100 86 L100 148" opacity=".55" />
      {lobes.map(([x, y], i) => (
        <circle key={i} cx={x + (i < 4 ? 0 : 0)} cy={y} r="2.4" fill="currentColor" stroke="none" opacity=".8" />
      ))}
      <g transform="translate(58 116) scale(.55)">
        {[-72, -48, -24, 24, 48, 72].map((a) => (
          <path key={a} d="M0 0 C 15 -14, 15 -40, 0 -54 C -15 -40, -15 -14, 0 0 Z" transform={`rotate(${a})`} opacity=".85" />
        ))}
        <path d="M0 0 C 15 -14, 15 -40, 0 -54 C -15 -40, -15 -14, 0 0 Z" />
      </g>
    </svg>
  );
}

// Flowers and leaves hanging from the top of the page. Blossoms take the accent colour.
export function Vines({ mirror = false }: { mirror?: boolean }) {
  const strands = [
    { x: 16, len: 190, f: 2 },
    { x: 50, len: 290, f: 3 },
    { x: 92, len: 150, f: 2 },
    { x: 130, len: 240, f: 3 },
    { x: 168, len: 120, f: 1 },
  ];
  const leaf = "M0 0 C 4 -6, 11 -6, 15 0 C 11 6, 4 6, 0 0 Z";
  return (
    <svg viewBox="0 0 190 310" width="100%" style={{ transform: mirror ? "scaleX(-1)" : undefined, display: "block" }} fill="none" strokeLinecap="round" aria-hidden="true">
      {strands.map((st, i) => (
        <g key={i}>
          <path d={`M${st.x} 0 C ${st.x + 7} ${st.len * 0.3}, ${st.x - 7} ${st.len * 0.65}, ${st.x} ${st.len}`} stroke="var(--inv-ink-dim)" strokeWidth="1.1" opacity=".7" />
          {Array.from({ length: Math.floor(st.len / 22) }, (_, k) => {
            const y = 14 + k * 22;
            const side = k % 2 ? 1 : -1;
            return <path key={k} d={leaf} transform={`translate(${st.x} ${y}) scale(${side} 1) rotate(${28 + (k % 3) * 8})`} fill="var(--inv-ink-dim)" opacity={0.55 + (k % 3) * 0.1} />;
          })}
          {Array.from({ length: st.f }, (_, k) => {
            const y = st.len - k * (st.len / (st.f + 0.6)) - 4;
            return (
              <g key={k} transform={`translate(${st.x} ${y})`}>
                {Array.from({ length: 5 }, (_, q) => (
                  <ellipse key={q} cx="0" cy="-5" rx="3.6" ry="5.4" transform={`rotate(${q * 72})`} fill="currentColor" opacity={0.75 + (q % 2) * 0.15} />
                ))}
                <circle r="2" fill="var(--inv-bg)" opacity=".85" />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

// A mandap: three pavilions with swagged drapes and flower garlands, drawn to sit at the foot of the hero.
export function Mandap() {
  const DRAPE = "#f4cdd3";
  const DRAPE_LINE = "#d99aa6";
  const bloom = (x: number, y: number, r: number, k: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx="0" cy={-r * 0.6} rx={r * 0.42} ry={r * 0.6} transform={`rotate(${i * 72})`} fill="currentColor" opacity={k % 2 ? 0.95 : 0.78} />
      ))}
      <circle r={r * 0.22} fill="#f6d979" />
    </g>
  );
  const pavilion = (x: number, w: number, h: number, i: number) => {
    const top = 150 - h;
    const cx = x + w / 2;
    const flowers = Array.from({ length: 7 }, (_, k) => {
      const t = k / 6;
      return bloom(x - 2 + (w + 4) * t, top + 14 - Math.sin(Math.PI * t) * 13, 5.2, k);
    });
    const drape = (side: "l" | "r") => {
      const px = side === "l" ? x : x + w;
      const dir = side === "l" ? 1 : -1;
      const tip = px + dir * w * 0.34;
      return (
        <g key={side}>
          <path d={`M${px} ${top + 14} C ${px + dir * 4} ${top + h * 0.45}, ${px - dir * 5} ${top + h * 0.7}, ${px} 150 L${tip} 150 C ${px + dir * w * 0.3} ${top + h * 0.62}, ${px + dir * w * 0.14} ${top + h * 0.34}, ${px + dir * w * 0.06} ${top + 16} Z`} fill={DRAPE} opacity=".92" />
          {[0.14, 0.22, 0.29].map((f, k) => (
            <path key={k} d={`M${px + dir * w * f * 0.4} ${top + 22} C ${px + dir * w * f * 0.5} ${top + h * 0.5}, ${px + dir * w * f * 0.9} ${top + h * 0.72}, ${px + dir * w * f} 148`} stroke={DRAPE_LINE} strokeWidth=".9" opacity=".8" />
          ))}
        </g>
      );
    };
    return (
      <g key={i}>
        <path d={`M${x - 4} 150 L${x + 4} 150 L${x + 3} ${top + 14} L${x - 3} ${top + 14} Z M${x + w - 4} 150 L${x + w + 4} 150 L${x + w + 3} ${top + 14} L${x + w - 3} ${top + 14} Z`} fill="var(--inv-ink-dim)" opacity=".75" />
        <path d={`M${x - 8} ${top + 14} L${x + w + 8} ${top + 14} L${x + w + 4} ${top + 8} L${x - 4} ${top + 8} Z`} fill="var(--inv-ink-dim)" opacity=".85" />
        <path d={`M${x - 4} ${top + 8} Q ${cx} ${top - 22} ${x + w + 4} ${top + 8}`} stroke="var(--inv-ink-dim)" strokeWidth="2" opacity=".8" />
        {drape("l")}
        {drape("r")}
        {flowers}
        <line x1={cx} y1={top + 2} x2={cx} y2={top + 26} stroke="var(--inv-ink-dim)" strokeWidth=".8" opacity=".6" />
        <circle cx={cx} cy={top + 30} r="3" fill="#f6d979" />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 360 160" width="100%" style={{ display: "block", maxWidth: 480 }} fill="none" aria-hidden="true">
      {pavilion(6, 88, 104, 0)}
      {pavilion(266, 88, 104, 1)}
      {pavilion(108, 144, 128, 2)}
      <path d="M0 152 C 60 147, 120 157, 180 151 C 240 145, 300 157, 360 151 L360 160 L0 160 Z" fill="var(--inv-ink-dim)" opacity=".16" />
      {[18, 54, 84, 128, 150, 210, 232, 276, 306, 342].map((x, i) => bloom(x, 154 + (i % 2) * 2, 3 + (i % 3) * 0.8, i))}
    </svg>
  );
}

// ---- Wildflower border ----------------------------------------------------------
// A tall tile of climbing stems, leaves and small flowers in soft colours, drawn once and repeated
// down each side of the page. It joins itself top to bottom, so it can be as long as the page.
const FLOWER_COLORS = ["#e9927a", "#e39ac0", "#7f9fd8", "#e6b84a", "#f4ebdf", "#c66a5a"];

function wildTile(): string {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const leaf = (x: number, y: number, a: number, k: number, fill: string) =>
    `<path d="M0 0 C 3 -5, 9 -5, 13 0 C 9 5, 3 5, 0 0Z" transform="translate(${x} ${y}) rotate(${a}) scale(${k})" fill="${fill}" opacity=".9"/>`;
  const flower = (x: number, y: number, r: number, c: string, petals = 5) =>
    `<g transform="translate(${x} ${y})">${Array.from({ length: petals }, (_, i) => `<ellipse cx="0" cy="${-r * 0.62}" rx="${r * 0.42}" ry="${r * 0.62}" transform="rotate(${(360 / petals) * i})" fill="${c}" opacity=".92" stroke="#00000014" stroke-width=".4"/>`).join("")}<circle r="${r * 0.22}" fill="#f7d774"/></g>`;
  const tiny = (x: number, y: number, c: string) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<circle cx="0" cy="-2.4" r="1.7" fill="${c}" transform="rotate(${a})"/>`).join("")}<circle r=".9" fill="#f7d774"/></g>`;
  const stems = [
    "M26 0 C 6 60, 52 110, 26 170 C 2 230, 52 290, 26 400",
    "M72 0 C 92 70, 44 140, 72 200 C 98 260, 48 330, 72 400",
    "M50 0 C 60 40, 40 90, 52 130 C 64 180, 40 250, 50 320 C 56 350, 46 380, 50 400",
  ];
  const g: string[] = [];
  stems.forEach((d, i) => g.push(`<path d="${d}" fill="none" stroke="${i === 2 ? "#a08a4a" : "#6f9463"}" stroke-width="1.1" stroke-linecap="round" opacity=".85"/>`));
  for (let y = 12; y < 400; y += 19) {
    const side = Math.floor(y / 19) % 2 ? 1 : -1;
    const x = [26, 72, 50][Math.floor(rnd() * 3)] + Math.sin(y / 60) * 10;
    g.push(leaf(x, y, side > 0 ? -30 - rnd() * 30 : 210 + rnd() * 30, 0.9 + rnd() * 0.7, rnd() > 0.35 ? "#7ea56c" : "#a9b66b"));
  }
  const spots: [number, number, number][] = [[24, 34, 8], [74, 64, 10], [30, 118, 9], [66, 168, 7], [22, 214, 10], [76, 248, 8], [34, 296, 9], [70, 336, 10], [30, 372, 7], [52, 150, 6], [50, 268, 6]];
  spots.forEach(([x, y, r], i) => g.push(flower(x, y, r, FLOWER_COLORS[i % FLOWER_COLORS.length], i % 3 === 0 ? 6 : 5)));
  for (let i = 0; i < 14; i++) g.push(tiny(10 + rnd() * 80, 8 + rnd() * 384, rnd() > 0.5 ? "#7f9fd8" : "#f2ecdd"));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 400" width="100" height="400">${g.join("")}</svg>`;
}
const WILD_URL = `url("data:image/svg+xml,${encodeURIComponent(wildTile())}")`;

// One side of the border. The right side is the left one mirrored.
export function WildflowerSide({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-0 top-0 z-[5] w-[15vw] max-w-[118px] ${side === "left" ? "left-0" : "right-0"}`}
      style={{ backgroundImage: WILD_URL, backgroundRepeat: "repeat-y", backgroundSize: "100% auto", transform: side === "right" ? "scaleX(-1)" : undefined }}
    />
  );
}

// An ornate flourish for the top and bottom of the frame: a fleur with curling scrolls.
export function FrameFlourish({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 240 56" width="240" height="56" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" style={{ transform: flip ? "scaleY(-1)" : undefined, maxWidth: "60vw" }} aria-hidden="true">
      <path d="M120 6 C 112 16, 108 24, 120 36 C 132 24, 128 16, 120 6 Z" fill="currentColor" fillOpacity=".25" />
      <path d="M120 36 L120 50" />
      <path d="M108 30 C 96 30, 92 20, 100 16 C 106 13, 111 18, 107 22" />
      <path d="M132 30 C 144 30, 148 20, 140 16 C 134 13, 129 18, 133 22" />
      <path d="M96 34 C 80 38, 70 30, 56 34 C 44 38, 36 34, 24 30" />
      <path d="M144 34 C 160 38, 170 30, 184 34 C 196 38, 204 34, 216 30" />
      <path d="M24 30 C 14 28, 10 20, 16 14 C 20 10, 27 13, 25 18" />
      <path d="M216 30 C 226 28, 230 20, 224 14 C 220 10, 213 13, 215 18" />
      <circle cx="120" cy="44" r="1.8" fill="currentColor" />
    </svg>
  );
}

// A quarter flourish for the corner of the frame. Rotate it for the other three corners.
export function Corner({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} {...svgProps}>
      <path d="M2 2 C 2 30, 14 46, 42 48" />
      <path d="M2 2 C 30 2, 46 14, 48 42" />
      <path d="M2 12 C 2 32, 12 42, 30 44" opacity=".5" />
      <path d="M12 2 C 32 2, 42 12, 44 30" opacity=".5" />
      <path d="M22 22 C 26 16, 34 16, 36 22 C 32 26, 26 26, 22 22 Z" />
      <circle cx="9" cy="9" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// The motif that sits above the names, one per style.
export function Motif({ kind }: { kind: OrnamentKind }): ReactElement | null {
  switch (kind) {
    case "mandala":
      return <Mandala />;
    case "floral":
      return <Lotus />;
    case "rings":
      return <Rings />;
    case "paisley":
      return <Paisley />;
    case "leaves":
      return <LeafSprig />;
    case "garland":
      return <Garland />;
    case "lanterns":
      return <Lanterns />;
    case "arch":
      return <Arch />;
    default:
      return null;
  }
}

// The small divider between sections: a diamond, flanked by a leaf, a dot or a flourish.
export function Divider({ kind }: { kind: OrnamentKind }) {
  const line = <span className="h-px w-16" style={{ background: "color-mix(in srgb, currentColor 35%, transparent)" }} />;
  const mid =
    kind === "leaves" || kind === "floral" || kind === "garden" || kind === "wildflower" ? (
      <svg viewBox="-12 -8 24 16" width="26" height="17" {...svgProps}>
        <path d="M0 0 C 3 -6, 9 -6, 11 0 C 9 6, 3 6, 0 0 Z" />
        <path d="M0 0 C -3 -6, -9 -6, -11 0 C -9 6, -3 6, 0 0 Z" />
      </svg>
    ) : kind === "paisley" ? (
      <svg viewBox="-8 -10 16 20" width="14" height="18" {...svgProps}>
        <path d="M0 9 C -8 8 -9 0 -3 -6 C 0 -9 5 -9 6 -6 C 2 -6 1 -3 2 0 C 3 3 1 6 0 9 Z" />
      </svg>
    ) : (
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "currentColor" }} />
    );
  return (
    <div className="flex items-center justify-center gap-4" aria-hidden="true" style={{ color: "var(--inv-accent)" }}>
      {line}
      {mid}
      {line}
    </div>
  );
}
