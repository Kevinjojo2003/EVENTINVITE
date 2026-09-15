"use client";
import { useState } from "react";

type Props = {
  seal: string;
  title: string;
  dateLine: string;
  hint: string;
  invitedLabel: string;
  onOpen: () => void;
};

// A sealed envelope over the page. Tapping the seal is the one user gesture browsers
// need before audio may start, so the reveal and the music begin together.
export function Gate({ seal, title, dateLine, hint, invitedLabel, onOpen }: Props) {
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);
  if (gone) return null;

  const open = () => {
    if (opening) return;
    setOpening(true);
    onOpen();
    window.setTimeout(() => setGone(true), 1700);
  };

  return (
    <div
      className={`gate fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-4 ${opening ? "leaving" : ""}`}
      style={{ background: "radial-gradient(120% 90% at 50% 100%, color-mix(in srgb, var(--inv-bg) 70%, var(--inv-accent) 8%) 0%, var(--inv-bg-deep) 70%)" }}
    >
      <p className="eyebrow rise text-center">{invitedLabel}</p>

      <button
        type="button"
        onClick={open}
        aria-label="Open the invitation and start the music"
        className={`envelope group relative w-[min(88vw,420px)] outline-none ${opening ? "opening" : ""}`}
        style={{ aspectRatio: "10 / 7" }}
      >
        <div className="absolute inset-x-[7%] top-[6%] h-[80%] rounded-sm" style={{ background: "var(--inv-ink)", boxShadow: "0 -6px 30px rgba(0,0,0,0.35)" }}>
          <div className="mt-[10%] px-6 text-center">
            <div className="display text-[clamp(1.3rem,4.6vw,2rem)] italic" style={{ color: "var(--inv-bg)" }}>
              {title}
            </div>
            <div className="mt-2 text-[0.62rem] uppercase tracking-[0.3em]" style={{ color: "var(--inv-accent-deep)" }}>
              {dateLine}
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            background: "linear-gradient(180deg, color-mix(in srgb, var(--inv-bg-deep) 70%, var(--inv-accent) 12%) 0%, var(--inv-bg-deep) 100%)",
            clipPath: "polygon(0 0, 50% 46%, 100% 0, 100% 100%, 0 100%)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          }}
        />
        <div className="hairline absolute inset-x-0 bottom-0 h-[62%] border border-t-0" />
        <div
          className="envelope-flap absolute inset-x-0 top-[38%] h-[46%]"
          style={{
            background: "linear-gradient(180deg, color-mix(in srgb, var(--inv-bg-deep) 60%, var(--inv-accent) 18%) 0%, var(--inv-bg-deep) 100%)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.35))",
          }}
        />
        <div
          className="seal absolute left-1/2 top-[62%] flex aspect-square w-[19%] -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap rounded-full transition-transform duration-300 group-hover:scale-105"
          style={{
            background: "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--inv-accent) 70%, white) 0%, var(--inv-accent) 40%, var(--inv-accent-deep) 100%)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.45), inset 0 0 0 3px rgba(0,0,0,0.18)",
            color: "var(--inv-bg-deep)",
          }}
        >
          <span className="display text-[clamp(0.85rem,2.6vw,1.2rem)] font-medium tracking-wider">{seal}</span>
        </div>
      </button>

      <p className="rise rise-2 dim text-center text-sm">{hint}</p>
    </div>
  );
}
