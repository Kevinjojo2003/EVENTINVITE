"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Result = { ok: boolean; text: string; name?: string; company?: string | null; party?: number; at: number };

// Door check-in. Uses the phone camera to read the QR on a guest's ticket, or a typed
// code. Each scan posts to /api/checkin as the signed-in owner.
export function Scanner({ inviteId, expected, checkedIn }: { inviteId: string; expected: number; checkedIn: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState<"off" | "on" | "denied">("off");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [inside, setInside] = useState(checkedIn);
  const [log, setLog] = useState<Result[]>([]);
  const last = useRef<{ code: string; t: number }>({ code: "", t: 0 });

  async function submit(code: string) {
    const now = Date.now();
    if (last.current.code === code && now - last.current.t < 4000) return; // same QR still in frame
    last.current = { code, t: now };
    setBusy(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, inviteId }) });
      const d = await res.json();
      const r: Result = res.ok
        ? { ok: true, text: `Welcome, ${d.rsvp.name}`, name: d.rsvp.name, company: d.rsvp.company, party: d.rsvp.party_size, at: now }
        : { ok: false, text: d.error || "Not found", name: d.rsvp?.name, at: now };
      if (res.ok) setInside((n) => n + 1);
      setLog((l) => [r, ...l].slice(0, 30));
      if (navigator.vibrate) navigator.vibrate(res.ok ? 80 : [60, 60, 60]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (camera !== "on") return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let alive = true;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      } catch {
        setCamera("denied");
        return;
      }
      const v = video.current;
      if (!v || !alive) return;
      v.srcObject = stream;
      await v.play();
      const cv = canvas.current!;
      const ctx = cv.getContext("2d", { willReadFrequently: true })!;
      const tick = () => {
        if (!alive) return;
        if (v.readyState === v.HAVE_ENOUGH_DATA) {
          cv.width = v.videoWidth;
          cv.height = v.videoHeight;
          ctx.drawImage(v, 0, 0, cv.width, cv.height);
          const img = ctx.getImageData(0, 0, cv.width, cv.height);
          const q = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (q?.data) void submit(q.data);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Check-in</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            Open this on a phone at the door and point it at each guest's QR ticket.
          </p>
        </div>
        <p className="text-sm">
          <span className="text-2xl font-medium tabular-nums">{inside}</span>
          <span style={{ color: "var(--ink-2)" }}> / {expected} in</span>
        </p>
      </div>

      <div className="card mt-6 overflow-hidden">
        {camera === "on" ? (
          <div className="relative bg-black">
            <video ref={video} className="block w-full" playsInline muted />
            <canvas ref={canvas} className="hidden" />
            <div className="pointer-events-none absolute inset-0 m-auto h-48 w-48 rounded border-2 border-white/80" />
            <button type="button" className="btn-secondary absolute bottom-3 right-3" onClick={() => setCamera("off")}>
              Stop
            </button>
          </div>
        ) : (
          <div className="grid place-items-center gap-3 p-10 text-center">
            {camera === "denied" && <p className="text-sm text-red-700">Camera access was refused. Allow it in the browser settings, or type codes below.</p>}
            <button type="button" className="btn-primary" onClick={() => setCamera("on")}>
              Start camera
            </button>
          </div>
        )}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) void submit(manual.trim());
          setManual("");
        }}
      >
        <input value={manual} onChange={(e) => setManual(e.target.value.toUpperCase())} placeholder="Or type the ticket code" className="flex-1 rounded border px-3 py-2 text-sm uppercase tracking-widest" style={{ borderColor: "var(--line)" }} />
        <button type="submit" className="btn-primary" disabled={busy || !manual.trim()}>
          Check in
        </button>
      </form>

      <ul className="mt-6 grid gap-2">
        {log.map((r) => (
          <li key={r.at} className="card flex items-center justify-between px-4 py-3 text-sm" style={{ borderColor: r.ok ? "#9ad0a5" : "#e2a4a4", background: r.ok ? "#f1faf3" : "#fdf3f3" }}>
            <span>
              <span className="font-medium">{r.text}</span>
              {r.ok && (
                <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                  {[r.company, r.party && r.party > 1 ? `${r.party} people` : ""].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
            <span className="text-xs tabular-nums" style={{ color: "var(--ink-2)" }}>
              {new Date(r.at).toLocaleTimeString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
