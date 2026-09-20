"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fades and lifts anything marked data-reveal as it scrolls into view. Skipped entirely for
// people who ask their device for reduced motion.
export function Reveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el, i) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          delay: (i % 3) * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      // The hero phone drifts a little slower than the page.
      const phone = root.current?.querySelector<HTMLElement>("[data-parallax]");
      if (phone) gsap.to(phone, { y: -40, ease: "none", scrollTrigger: { trigger: phone, start: "top 70%", end: "bottom top", scrub: 0.6 } });
    }, root);
    return () => ctx.revert();
  }, []);
  return <div ref={root}>{children}</div>;
}
