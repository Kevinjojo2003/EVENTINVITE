"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="m-eyebrow">Something went wrong</p>
      <h1 className="m-dis text-[clamp(2rem,6vw,3.2rem)] leading-[1.1]">That did not load.</h1>
      <p className="text-[17px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
        It is usually a weak connection. Your work is saved automatically, so nothing is lost. Try again.
      </p>
      <button type="button" onClick={reset} className="m-btn m-btn-pri mt-2">
        Try again
      </button>
    </main>
  );
}
