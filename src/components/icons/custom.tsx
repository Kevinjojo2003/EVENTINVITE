import type { ReactNode } from "react";

// Icons that the general icon set does not have, drawn on a 24x24 grid with a 1.6 stroke.
// They use currentColor, so the colour is set from CSS (color: var(--icon-color)).
// Each entry is the inner SVG markup for one icon.
export const CUSTOM: Record<string, ReactNode> = {
  "wedding-rings": (
    <>
      <circle cx="9" cy="15" r="5" />
      <circle cx="15" cy="15" r="5" />
      <path d="M12 3.2l1.8 1.8L12 6.8 10.2 5Z" />
    </>
  ),
  "wedding-couple": (
    <>
      <circle cx="8" cy="7" r="3" />
      <circle cx="16" cy="7" r="3" />
      <path d="M2.5 21v-2.5a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4V21" />
      <path d="M12 21v-2.5a4 4 0 0 1 4-4h1.5a4 4 0 0 1 4 4V21" />
    </>
  ),
  "wedding-bride": (
    <>
      <circle cx="12" cy="7.5" r="3" />
      <path d="M12 3.2c-3.4 0-5.5 2.4-5.5 5.6V12" />
      <path d="M7 21c0-5 2-8 5-8s5 3 5 8" />
    </>
  ),
  "wedding-groom": (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21v-3a6 6 0 0 1 12 0v3" />
      <path d="M12 13.5l-1.4 2.2L12 20l1.4-4.3Z" />
    </>
  ),
  "wedding-bouquet": (
    <>
      <path d="M12 21v-7" />
      <path d="M8.5 21h7" />
      <path d="M12 14c-4 0-6-2.8-6-5.6 0-2.4 2.6-3.2 4.4-1.4L12 5.4l1.6 1.6c1.8-1.8 4.4-1 4.4 1.4 0 2.8-2 5.6-6 5.6Z" />
    </>
  ),
  "wedding-champagne": (
    <>
      <path d="M5 3h5l-.6 6.2a1.9 1.9 0 0 1-3.8 0Z" />
      <path d="M7.5 11v8M5 21h5" />
      <path d="M14 3h5l-.6 6.2a1.9 1.9 0 0 1-3.8 0Z" />
      <path d="M16.5 11v8M14 21h5" />
    </>
  ),
  "wedding-dance": (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 7.5V14" />
      <path d="M12 9.5 7.5 7.5M12 9.5l4.5 2" />
      <path d="M12 14l-3.2 6.5M12 14l3.5 6" />
    </>
  ),
  "ceremony-lamp": (
    <>
      <path d="M3.5 13.5h17c0 3.4-3.8 6-8.5 6s-8.5-2.6-8.5-6Z" />
      <path d="M12 3.5c2.4 2.6 2.6 5 0 7.2-2.6-2.2-2.4-4.6 0-7.2Z" />
    </>
  ),
  "ceremony-temple": (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V11.5M19 21V11.5" />
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M12 5V2.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  "ceremony-mosque": (
    <>
      <path d="M2.5 21h19" />
      <path d="M5 21v-8.5M19 21v-8.5" />
      <path d="M5 12.5c0-4 3-6 7-9 4 3 7 5 7 9" />
      <path d="M12 3.5V1.5" />
      <path d="M9.5 21v-4a2.5 2.5 0 0 1 5 0v4" />
    </>
  ),
  "ceremony-star-crescent": (
    <>
      <path d="M15.5 4a8 8 0 1 0 4.5 13.6A7.2 7.2 0 0 1 15.5 4Z" />
      <path d="M17.5 8.5l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2Z" />
    </>
  ),
  "ceremony-cross": (
    <>
      <path d="M12 3v18" />
      <path d="M6.5 9h11" />
    </>
  ),
  "ceremony-lotus": (
    <>
      <path d="M12 20c-4.2 0-7-3-7-7 3 0 5.2 1.2 7 4 1.8-2.8 4-4 7-4 0 4-2.8 7-7 7Z" />
      <path d="M12 17c-2.2-3-2.2-7 0-11.5 2.2 4.5 2.2 8.5 0 11.5Z" />
    </>
  ),
  "ceremony-ceremony": (
    <>
      <path d="M3.5 8.5h17" />
      <path d="M5.5 8.5V21M18.5 8.5V21" />
      <path d="M3.5 8.5 12 3l8.5 5.5" />
      <path d="M9 12.5h6" />
    </>
  ),
  "ceremony-arch": (
    <>
      <path d="M3 21h18" />
      <path d="M5.5 21V11a6.5 6.5 0 0 1 13 0v10" />
      <path d="M9 21v-9a3 3 0 0 1 6 0v9" />
    </>
  ),
  "ceremony-mandala": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M12 10V4.5" transform={`rotate(${i * 45} 12 12)`} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M12 7.5c1.2 1 1.2 2.4 0 3.2-1.2-.8-1.2-2.2 0-3.2Z" transform={`rotate(${i * 45 + 22.5} 12 12)`} />
      ))}
    </>
  ),
  "ceremony-floral": (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx="12" cy="6.6" rx="2.4" ry="3.6" transform={`rotate(${i * 60} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
  "party-balloon": (
    <>
      <path d="M12 3a5 6 0 0 0-5 6c0 3 2 5 5 6 3-1 5-3 5-6a5 6 0 0 0-5-6Z" />
      <path d="M12 15l-1 2h2l-1-2Z" />
      <path d="M12 17c0 2 2 2 2 4" />
    </>
  ),
  "party-confetti": (
    <>
      <path d="M4 20l4.2-11.5 7.3 7.3Z" />
      <path d="M14 4v2M18.5 8H21M16.5 3.5l1 1M20 13l-1 1M11 6.5l-1-1" />
    </>
  ),
  "party-fireworks": (
    <>
      <circle cx="12" cy="12" r="1.4" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M12 8.6V4" transform={`rotate(${i * 45} 12 12)`} />
      ))}
      <path d="M12 15.4V20" />
    </>
  ),
  "party-dj": (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3.5" y="14" width="4" height="6.5" rx="1.5" />
      <rect x="16.5" y="14" width="4" height="6.5" rx="1.5" />
    </>
  ),
  "baby-bottle": (
    <>
      <path d="M10 3h4v2h-4Z" />
      <path d="M9 5h6l1 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8Z" />
      <path d="M8 12.5h3M8 16h3" />
    </>
  ),
  "baby-pacifier": (
    <>
      <circle cx="12" cy="5.5" r="2.7" />
      <path d="M5.5 11.5h13l-1.2 3.5H6.7Z" />
      <path d="M12 15v3" />
      <circle cx="12" cy="20" r="1.8" />
    </>
  ),
  "baby-stroller": (
    <>
      <path d="M3.5 5.5h2.6l1.6 10.5H18" />
      <path d="M8.5 9.5H19A5.5 5.5 0 0 0 13.5 4v5.5" />
      <circle cx="9" cy="19" r="1.7" />
      <circle cx="17" cy="19" r="1.7" />
    </>
  ),
  "baby-teddy": (
    <>
      <circle cx="12" cy="13" r="6" />
      <circle cx="6.5" cy="7" r="2.2" />
      <circle cx="17.5" cy="7" r="2.2" />
      <path d="M10.5 15.2h3M12 13.4v1.8" />
      <circle cx="9.8" cy="11.4" r=".5" />
      <circle cx="14.2" cy="11.4" r=".5" />
    </>
  ),
  "baby-family": (
    <>
      <circle cx="8" cy="6" r="2.6" />
      <circle cx="16.5" cy="7.5" r="2.2" />
      <circle cx="12.2" cy="14" r="1.7" />
      <path d="M3 20v-2a4 4 0 0 1 4-4h2" />
      <path d="M13 20v-1.5a3.5 3.5 0 0 1 3.5-3.5H18a3.5 3.5 0 0 1 3 3.5V20" />
    </>
  ),
  "corporate-network": (
    <>
      <circle cx="12" cy="5" r="2.3" />
      <circle cx="5" cy="18" r="2.3" />
      <circle cx="19" cy="18" r="2.3" />
      <path d="M12 7.3 6 15.8M12 7.3l6 8.5M7.3 18h9.4" />
    </>
  ),
  "nav-whatsapp": (
    <>
      <path d="M4 20l1.4-4.1A8 8 0 1 1 8.2 18.7Z" />
      <path d="M9 8.8c-.4 1.8.7 3.9 2.4 5.2 1.4 1 2.7 1.3 3.7.7l.6-1.6-2-1-.9.8a3.6 3.6 0 0 1-1.8-1.9l.8-.9-.9-2.1Z" />
    </>
  ),
};

// ---- Decorative SVGs beyond the ones in Ornaments.tsx. Same rule: currentColor, no fixed colours. ----
const sq = (r: number, rot: number) => <rect x={-r} y={-r} width={r * 2} height={r * 2} transform={`rotate(${rot})`} />;

export const DECOR_EXTRA: Record<string, { viewBox: string; body: ReactNode }> = {
  "decor-corner-02": {
    viewBox: "0 0 60 60",
    body: (
      <>
        <path d="M3 57V14a11 11 0 0 1 11-11h43" />
        <path d="M9 57V17a8 8 0 0 1 8-8h40" opacity=".5" />
        <circle cx="14" cy="14" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="3" cy="57" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="57" cy="3" r="1.6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  "decor-divider-02": {
    viewBox: "0 0 240 24",
    body: (
      <>
        <path d="M4 12c14-10 24 10 38 0s24 10 38 0" opacity=".7" />
        <path d="M160 12c14-10 24 10 38 0s24 10 38 0" opacity=".7" />
        <path d="M120 4l6 8-6 8-6-8Z" />
        <circle cx="96" cy="12" r="2" fill="currentColor" stroke="none" />
        <circle cx="144" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  "decor-mandala-02": {
    viewBox: "-100 -100 200 200",
    body: (
      <>
        <circle r="92" opacity=".4" />
        <circle r="70" opacity=".5" />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M0 -70C10 -80 10 -90 0 -98 -10 -90 -10 -80 0 -70Z" transform={`rotate(${i * 22.5})`} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M0 -38C12 -50 12 -62 0 -70 -12 -62 -12 -50 0 -38Z" transform={`rotate(${i * 22.5 + 11.25})`} opacity=".8" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M0 -10C6 -18 6 -26 0 -34 -6 -26 -6 -18 0 -10Z" transform={`rotate(${i * 45})`} />
        ))}
        <circle r="4" fill="currentColor" />
      </>
    ),
  },
  "decor-arch-02": {
    viewBox: "0 0 100 140",
    body: (
      <>
        <path d="M8 138V54a42 42 0 0 1 84 0v84" />
        <path d="M17 138V56a33 33 0 0 1 66 0v82" opacity=".5" />
        <circle cx="50" cy="8" r="2.4" fill="currentColor" stroke="none" />
      </>
    ),
  },
  "decor-wave-01": {
    viewBox: "0 0 240 40",
    body: (
      <>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M0 ${10 + i * 10}c20-12 40 12 60 0s40 12 60 0 40 12 60 0 40 12 60 0`} opacity={1 - i * 0.28} />
        ))}
      </>
    ),
  },
  "decor-line-01": {
    viewBox: "0 0 240 12",
    body: (
      <>
        <path d="M0 6h104M136 6h104" />
        <path d="M0 3h60M180 3h60M0 9h60M180 9h60" opacity=".45" />
        <path d="M120 1l5 5-5 5-5-5Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  "decor-dot-pattern-01": {
    viewBox: "0 0 120 60",
    body: (
      <>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => <circle key={`${r}-${c}`} cx={6 + c * 12 + (r % 2) * 6} cy={6 + r * 12} r="1.6" fill="currentColor" stroke="none" opacity={0.35 + ((r + c) % 3) * 0.25} />),
        )}
      </>
    ),
  },
  "decor-geometric-01": {
    viewBox: "-50 -50 100 100",
    body: (
      <>
        {sq(38, 0)}
        {sq(38, 45)}
        {sq(27, 22.5)}
        {sq(27, 67.5)}
        <circle r="9" />
      </>
    ),
  },
  "decor-islamic-01": {
    viewBox: "-50 -50 100 100",
    body: (
      <>
        <circle r="46" opacity=".45" />
        {sq(32, 0)}
        {sq(32, 45)}
        <path d="M0 -20L6 -6 20 0 6 6 0 20-6 6-20 0-6-6Z" opacity=".7" />
        <circle r="3" fill="currentColor" stroke="none" />
      </>
    ),
  },
  "decor-flower-01": {
    viewBox: "-30 -30 60 60",
    body: (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d="M0 -5C8 -12 8 -22 0 -27 -8 -22 -8 -12 0 -5Z" transform={`rotate(${i * 60})`} />
        ))}
        <circle r="4" />
        <circle r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
  },
};
