"use client";
import { useEffect, useState } from "react";

// The hero phone. It first shows a lightweight still of an invitation, so the page is quick on any
// connection. The real, working invitation (fonts, animation, sound) loads only when the visitor
// taps it, or by itself on a fast connection once the page has settled.
export function LivePhone({ src, title }: { src: string; title: string }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    const slow = conn?.saveData || (conn?.effectiveType && conn.effectiveType !== "4g");
    if (slow) return; // wait for a tap
    const t = window.setTimeout(() => setLive(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  if (live) {
    return <iframe src={src} title={title} className="block h-full w-full rounded-[31px] border-0" style={{ background: "#f6f1e6" }} />;
  }
  return (
    <button
      type="button"
      onClick={() => setLive(true)}
      aria-label={`${title}. Tap to open a live one.`}
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[31px] px-6 py-8 text-center"
      style={{ background: "#f8f0dc", color: "#3b2a14", border: 0 }}
    >
      <span className="pointer-events-none absolute inset-[12px]" style={{ border: "1px solid rgba(169,130,47,.4)" }} />
      <span className="relative text-[10px] uppercase tracking-[0.2em]" style={{ color: "#a9822f" }}>
        ഞങ്ങൾ വിവാഹിതരാകുന്നു
      </span>
      <span className="relative mt-4 text-[38px] leading-[1.18]" style={{ fontFamily: "'Noto Serif Malayalam', serif" }}>
        ലക്ഷ്മി
        <span className="block text-[17px]" style={{ color: "#a9822f" }}>
          &amp;
        </span>
        അരുൺ
      </span>
      <span className="my-4 flex items-center gap-2" aria-hidden="true">
        <span className="h-px w-9" style={{ background: "#a9822f" }} />
        <span className="h-[6px] w-[6px] rotate-45" style={{ background: "#a9822f" }} />
        <span className="h-px w-9" style={{ background: "#a9822f" }} />
      </span>
      <span className="relative text-[15px]" style={{ color: "#6b563a" }}>
        2027 ജനുവരി 14
      </span>
      <span className="mt-auto rounded-full px-5 py-2.5 text-[13px] font-semibold" style={{ background: "#3b2a14", color: "#f8f0dc" }}>
        Tap to open a live one
      </span>
    </button>
  );
}
