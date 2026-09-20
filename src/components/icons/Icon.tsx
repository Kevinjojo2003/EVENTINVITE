import { CUSTOM } from "./custom";
import { ICONS } from "./registry";

// <Icon name="wedding-rings" /> draws one icon from the library. It never carries its own colour:
// it uses currentColor, and `--icon-color` if you set it, so one icon fits any template.
//
//   .my-template { --icon-color: #b8893a; }   /* gold */
//
// Icons are decorative by default. Pass `label` when an icon stands alone and carries meaning.
export function Icon({ name, size = 20, strokeWidth = 1.6, label, className }: { name: string; size?: number; strokeWidth?: number; label?: string; className?: string }) {
  const def = ICONS[name];
  if (!def) return null;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  const style = { color: "var(--icon-color, currentColor)" };
  if (def.lucide) {
    const L = def.lucide;
    return <L size={size} strokeWidth={strokeWidth} className={className} style={style} {...a11y} />;
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} {...a11y}>
      {CUSTOM[name]}
    </svg>
  );
}
