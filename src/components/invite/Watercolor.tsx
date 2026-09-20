// A watercolour wash behind the page, made from blurred, warped colour pools so the edges bleed and
// white paper shows through, like a painted card. Generated in SVG, so it needs no image file.
export type WashKind = "none" | "aqua" | "rose" | "lilac" | "sage" | "gold";

export const WASHES: Record<Exclude<WashKind, "none">, { label: string; base: string; pools: [string, string, string] }> = {
  aqua: { label: "Aqua", base: "#fbfefd", pools: ["#4fbfae", "#8fd6c8", "#2fa392"] },
  rose: { label: "Rose", base: "#fffafb", pools: ["#ee9db2", "#f7c6cf", "#e07f9a"] },
  lilac: { label: "Lilac", base: "#fcfaff", pools: ["#b09be0", "#d3c4ee", "#9279cc"] },
  sage: { label: "Sage", base: "#fbfdf9", pools: ["#8dbb95", "#b9d8bd", "#68a273"] },
  gold: { label: "Gold", base: "#fffdf8", pools: ["#e3bd6f", "#f2dda8", "#cf9f45"] },
};

// [x, y, radius, which pool]: kept to the edges so the middle stays pale for the names.
const POOLS: [number, number, number, number][] = [
  [140, 110, 320, 0], [700, 40, 330, 1], [960, 330, 270, 0], [40, 560, 240, 1], [900, 880, 300, 2],
  [160, 1170, 340, 0], [660, 1310, 360, 1], [470, 1460, 300, 2], [1000, 1180, 250, 0], [520, 20, 200, 2],
];

export function Watercolor({ kind }: { kind: Exclude<WashKind, "none"> }) {
  const w = WASHES[kind];
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ background: w.base }}>
      <svg width="100%" height="100%" viewBox="0 0 1000 1400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="wc-bleed" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="170" />
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="wc-edge" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="9" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="90" />
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <filter id="wc-gap" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="6" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="60" />
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
          <filter id="wc-paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0.07 0" />
          </filter>
        </defs>
        <g filter="url(#wc-bleed)">
          {POOLS.map(([x, y, r, k], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={w.pools[k]} opacity={0.4} />
          ))}
        </g>
        <g filter="url(#wc-edge)">
          {POOLS.filter((_, i) => i % 2 === 0).map(([x, y, r, k], i) => (
            <circle key={i} cx={x + 40} cy={y + 30} r={r * 0.62} fill={w.pools[(k + 1) % 3]} opacity={0.32} />
          ))}
        </g>
        <g filter="url(#wc-gap)" fill={w.base} opacity="0.92">
          <ellipse cx="120" cy="300" rx="60" ry="26" transform="rotate(-24 120 300)" />
          <ellipse cx="240" cy="90" rx="44" ry="20" transform="rotate(18 240 90)" />
          <ellipse cx="820" cy="180" rx="70" ry="24" transform="rotate(30 820 180)" />
          <ellipse cx="900" cy="560" rx="56" ry="22" transform="rotate(-12 900 560)" />
          <ellipse cx="90" cy="960" rx="66" ry="24" transform="rotate(20 90 960)" />
          <ellipse cx="850" cy="1080" rx="60" ry="22" transform="rotate(-30 850 1080)" />
          <ellipse cx="300" cy="1330" rx="52" ry="20" transform="rotate(12 300 1330)" />
          <ellipse cx="720" cy="1240" rx="48" ry="18" transform="rotate(-18 720 1240)" />
        </g>
        <g filter="url(#wc-bleed)">
          <ellipse cx="470" cy="760" rx="440" ry="360" fill={w.base} opacity="0.96" />
        </g>
        <rect width="1000" height="1400" filter="url(#wc-paper)" />
      </svg>
    </div>
  );
}
