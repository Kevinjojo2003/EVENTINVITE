"use client";
import { useEffect, useRef } from "react";

type Fly = { x: number; y: number; r: number; vx: number; vy: number; phase: number; speed: number };

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

// `inside` keeps the lights within the page frame instead of drifting over its border.
export function Fireflies({ color, inside = false }: { color: string; inside?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const [cr, cg, cb] = hexToRgb(color);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let flies: Fly[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 26000);
      flies = Array.from({ length: Math.max(18, Math.min(70, count)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.05 - Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flies) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * f.speed + f.phase));
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${0.85 * tw})`);
        g.addColorStop(0.35, `rgba(${cr},${cg},${cb},${0.28 * tw})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 7, 0, Math.PI * 2);
        ctx.fill();
        if (!reduced) {
          f.x += f.vx + Math.sin(t * 0.0004 + f.phase) * 0.12;
          f.y += f.vy;
          if (f.y < -20) {
            f.y = h + 20;
            f.x = Math.random() * w;
          }
          if (f.x < -20) f.x = w + 20;
          if (f.x > w + 20) f.x = -20;
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none fixed inset-0 z-0 ${inside ? "[clip-path:inset(13px)] sm:[clip-path:inset(21px)]" : ""}`} />;
}
