"use client";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCENES, type SceneKey } from "@/lib/scenes";

// A fixed sky behind the whole invitation. The layers (stars, moon, sun, clouds, petals, birds,
// waves) are drawn in SVG and CSS, and scroll position drives the moon, the sun and the sky itself.
// With "reduce motion" on, it shows the still opening sky.
export function Scene({ kind }: { kind: Exclude<SceneKey, "none"> }) {
  const def = SCENES[kind];
  const root = useRef<HTMLDivElement>(null);
  const fx = def.effects;

  // Stable pseudo-random positions so the server and the browser draw the same sky.
  const stars = useMemo(() => {
    let s = 11;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 90 }, () => ({ x: r() * 100, y: r() * 62, size: 1 + r() * 2.2, delay: r() * 6, dur: 2.5 + r() * 4 }));
  }, []);
  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: (i * 73) % 100, c: def.petal[i % def.petal.length], s: 0.7 + ((i * 37) % 60) / 100 })), [def.petal]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = (sel: string) => el.querySelector<HTMLElement>(sel);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);
    const journey = !!def.skyEnd;

    const ctx = gsap.context(() => {
      const moon = q("[data-moon]");
      const sun = q("[data-sun]");
      const skyB = q("[data-sky-b]");
      const starsEl = q("[data-stars]");
      const birds = q("[data-birds]");

      if (!reduced) {
        if (moon) gsap.fromTo(moon, { yPercent: 140, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 3.4, ease: "power2.out", delay: 0.4 });
        if (sun && !journey) gsap.fromTo(sun, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 2.6, ease: "power2.out", delay: 0.3 });
        el.querySelectorAll<HTMLElement>("[data-petal]").forEach((p) => {
          const h = window.innerHeight;
          gsap.set(p, { y: gsap.utils.random(-80, h * 0.7), rotation: gsap.utils.random(0, 360) });
          gsap.to(p, { y: `+=${h + 120}`, duration: gsap.utils.random(13, 24), ease: "none", repeat: -1, modifiers: { y: gsap.utils.unitize((v: number) => (v % (h + 140)) - 60) } });
          gsap.to(p, { x: `+=${gsap.utils.random(-70, 70)}`, rotation: `+=${gsap.utils.random(120, 320)}`, duration: gsap.utils.random(4, 8), ease: "sine.inOut", yoyo: true, repeat: -1 });
        });
      }

      // Scroll drives the moon's path, the sun's rise and the sky's change.
      const smooth = (a: number, b: number, v: number) => {
        const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
        return t * t * (3 - 2 * t);
      };
      const apply = (p: number) => {
        if (reduced) p = 0;
        if (journey) {
          const t = smooth(0.12, 0.85, p);
          if (skyB) skyB.style.opacity = String(t);
          if (starsEl) starsEl.style.opacity = String(1 - smooth(0.1, 0.6, p));
          if (moon) gsap.set(moon, { y: p * window.innerHeight * 0.75, x: p * -40, opacity: 1 - smooth(0.25, 0.7, p) });
          if (sun) gsap.set(sun, { y: (1 - smooth(0.3, 0.95, p)) * window.innerHeight * 0.85, opacity: smooth(0.28, 0.5, p) });
          if (birds) birds.style.opacity = String(smooth(0.5, 0.75, p));
        } else if (moon) {
          gsap.set(moon, { y: p * window.innerHeight * 0.12 });
        }
      };
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => apply(self.progress) });
      apply(0);
    }, el);
    return () => ctx.revert();
  }, [kind, def.skyEnd]);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: def.sky }}>
      {def.skyEnd && <div data-sky-b className="absolute inset-0" style={{ background: def.skyEnd, opacity: 0 }} />}

      {fx.stars && (
        <div data-stars className="absolute inset-0">
          {stars.map((s, i) => (
            <span key={i} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: 0.5, animation: `scene-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
          ))}
        </div>
      )}

      {fx.moon && (
        <div data-moon className="absolute" style={{ left: "66%", top: "13%", width: 92, height: 92 }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: "drop-shadow(0 0 28px rgba(255,244,205,.55))" }}>
            <defs>
              <radialGradient id="moonfill" cx="38%" cy="34%" r="70%">
                <stop offset="0" stopColor="#fffbe8" />
                <stop offset="1" stopColor="#efe3b4" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#moonfill)" />
            <circle cx="34" cy="38" r="7" fill="#d9cc9c" opacity=".55" />
            <circle cx="60" cy="58" r="10" fill="#d9cc9c" opacity=".45" />
            <circle cx="46" cy="72" r="4.5" fill="#d9cc9c" opacity=".5" />
            <circle cx="68" cy="30" r="3.5" fill="#d9cc9c" opacity=".5" />
          </svg>
        </div>
      )}

      {fx.sun && (
        <div data-sun className="absolute" style={{ left: kind === "golden-hour" ? "70%" : "50%", top: kind === "ocean-dusk" ? "52%" : "20%", width: 170, height: 170, marginLeft: -85, opacity: kind === "sunrise-journey" ? 0 : 1 }}>
          <div className="absolute inset-[-70%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,214,140,.55) 0%, rgba(255,190,110,.22) 38%, transparent 68%)" }} />
          <div className="absolute inset-[14%] rounded-full" style={{ background: "radial-gradient(circle at 40% 36%, #fff6d6 0%, #ffd376 55%, #f9a94b 100%)", boxShadow: "0 0 60px rgba(255,190,90,.7)" }} />
        </div>
      )}

      {Array.from({ length: fx.clouds ?? 0 }, (_, i) => (
        <svg key={i} viewBox="0 0 90 50" className="absolute" style={{ top: `${8 + ((i * 19) % 46)}%`, width: 150 + (i % 3) * 70, left: 0, opacity: 1, animation: `scene-cloud ${70 + i * 23}s linear ${-i * 19}s infinite` }}>
          <path d="M10 42 C-2 42 -2 26 12 26 C13 12 34 9 41 22 C51 11 73 17 70 33 C84 31 88 46 72 46 Z" fill={def.cloud} />
        </svg>
      ))}

      {fx.petals && petals.map((p, i) => (
        <svg key={i} data-petal viewBox="0 0 16 22" width={16 * p.s} height={22 * p.s} className="absolute top-0" style={{ left: `${p.x}%`, opacity: 0.85 }}>
          <path d="M8 0 C 15 6, 16 16, 8 22 C 0 16, 1 6, 8 0 Z" fill={p.c} />
        </svg>
      ))}

      {fx.birds && (
        <div data-birds className="absolute inset-0" style={{ opacity: kind === "sunrise-journey" ? 0 : 1 }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 40 16" width={30 - i * 5} className="absolute" style={{ top: `${18 + i * 7}%`, left: 0, animation: `scene-fly ${34 + i * 9}s linear ${-i * 11}s infinite` }} fill="none" stroke="rgba(30,20,40,.65)" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 10 Q 10 0 20 9 Q 30 0 38 10">
                <animate attributeName="d" dur="0.9s" repeatCount="indefinite" values="M2 10 Q 10 0 20 9 Q 30 0 38 10;M2 6 Q 10 10 20 9 Q 30 10 38 6;M2 10 Q 10 0 20 9 Q 30 0 38 10" />
              </path>
            </svg>
          ))}
        </div>
      )}

      {fx.waves && (
        <div className="absolute inset-x-0 bottom-0 h-[26%]">
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 1200 60" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-[70%] w-[200%]" style={{ bottom: `${i * 9}%`, opacity: 0.32 + i * 0.18, animation: `scene-wave ${16 - i * 3}s linear infinite ${i % 2 ? "reverse" : ""}`, transform: "translateX(0)" }}>
              <path d="M0 30 C 100 6, 200 54, 300 30 S 500 6, 600 30 S 800 54, 900 30 S 1100 6, 1200 30 L1200 60 L0 60 Z" fill={["#5a2a58", "#3d2050", "#1f1440"][i]} />
            </svg>
          ))}
        </div>
      )}

      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.22) 100%)" }} />
    </div>
  );
}
