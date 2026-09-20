import type { ReactElement } from "react";
import { Arch, Corner, Divider, FrameFlourish, Garland, Lanterns, LeafSprig, Lotus, Mandala, Paisley, Rings, Vines } from "@/components/invite/Ornaments";
import { DECOR_EXTRA } from "./custom";

// The decorative library: borders, corners, dividers, mandalas, arches, patterns. Everything uses
// currentColor, so a template colours it by setting `color` (or `--icon-color`) on a parent.
// Names are "decor-name-variant". There is deliberately no region-specific pattern here; a pattern
// tied to one culture should be added as an optional asset, not applied by default.
const BUILT: Record<string, () => ReactElement> = {
  "decor-floral-01": () => <Lotus />,
  "decor-floral-02": () => <Garland width={240} />,
  "decor-vine-01": () => (
    <div style={{ width: 120 }}>
      <Vines />
    </div>
  ),
  "decor-corner-01": () => <Corner size={64} />,
  "decor-divider-01": () => <Divider kind="none" />,
  "decor-mandala-01": () => <Mandala size={120} />,
  "decor-arch-01": () => <Arch size={90} />,
  "decor-paisley-01": () => <Paisley />,
  "decor-leaf-01": () => <LeafSprig />,
  "decor-lantern-01": () => <Lanterns width={180} />,
  "decor-flourish-01": () => <FrameFlourish />,
  "decor-rings-01": () => <Rings />,
};

export const DECOR_NAMES = [...Object.keys(BUILT), ...Object.keys(DECOR_EXTRA)].sort();

export function Decor({ name, size = 96 }: { name: string; size?: number }) {
  const built = BUILT[name];
  if (built) return built();
  const x = DECOR_EXTRA[name];
  if (!x) return null;
  const [, , w, h] = x.viewBox.split(" ").map(Number);
  return (
    <svg viewBox={x.viewBox} width={size} height={size * (h / w)} fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--icon-color, currentColor)" }}>
      {x.body}
    </svg>
  );
}
