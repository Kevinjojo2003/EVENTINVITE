"use client";
import { useEffect, useState } from "react";

type CountLabels = { days: string; hours: string; minutes: string; seconds: string; today: string };

function parts(target: number, now: number) {
  const d = Math.max(0, target - now);
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d / 3_600_000) % 24),
    minutes: Math.floor((d / 60_000) % 60),
    seconds: Math.floor((d / 1000) % 60),
  };
}

export function Countdown({ to, labels }: { to: string; labels: CountLabels }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!to || Number.isNaN(target)) return null;
  const p = parts(target, now);
  if (target - now <= 0) {
    return <p className="display accent text-2xl italic">{labels.today}</p>;
  }
  const cells: [string, number][] = [
    [labels.days, p.days],
    [labels.hours, p.hours],
    [labels.minutes, p.minutes],
    [labels.seconds, p.seconds],
  ];
  return (
    <div className="grid grid-cols-4 gap-x-3 gap-y-1 sm:gap-x-8" role="timer" aria-live="off">
      {cells.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="display tnum text-[clamp(1.9rem,6vw,3.2rem)] leading-none">{String(value).padStart(2, "0")}</span>
          <span className="eyebrow mt-2" style={{ fontSize: "0.58rem" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
