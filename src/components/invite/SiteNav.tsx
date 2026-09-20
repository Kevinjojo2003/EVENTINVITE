"use client";
import { useEffect, useState } from "react";

// The menu of a wedding website: names on the left, a sticky bar that opens a list of sections.
export function SiteNav({ title, items }: { title: string; items: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 transition-colors duration-300 sm:px-8"
      style={{ background: solid ? "color-mix(in srgb, var(--inv-bg) 92%, transparent)" : "transparent", backdropFilter: solid ? "blur(8px)" : undefined, color: solid ? "var(--inv-ink)" : "#fff", borderBottom: solid ? "1px solid color-mix(in srgb, var(--inv-accent) 25%, transparent)" : "1px solid transparent" }}
    >
      <a href="#top" className="display text-lg" style={{ opacity: solid ? 1 : 0, transition: "opacity .3s" }}>
        {title}
      </a>
      <nav className="hidden gap-6 text-[0.72rem] uppercase tracking-[0.2em] md:flex" aria-label="Sections">
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} className="hover:underline underline-offset-[6px]">
            {i.label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
        style={{ background: solid ? "transparent" : "rgba(255,255,255,.92)", color: solid ? "var(--inv-ink)" : "#1b1a17" }}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>
      {open && (
        <div className="absolute inset-x-3 top-16 rounded-xl p-2 md:hidden" style={{ background: "var(--inv-bg)", color: "var(--inv-ink)", boxShadow: "0 20px 50px -20px rgba(0,0,0,.5)" }}>
          {items.map((i) => (
            <a key={i.id} href={`#${i.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-3 text-base hover:bg-black/5">
              {i.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
