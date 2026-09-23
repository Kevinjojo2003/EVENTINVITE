"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveNote } from "@/app/dashboard/actions";
import { PlanNav } from "./PlanNav";

export function NotesClient({ inviteId, initialBody }: { inviteId: string; initialBody: string }) {
  const [body, setBody] = useState(initialBody);
  const [savedAt, setSavedAt] = useState<string>("");
  const [pending, start] = useTransition();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (body === initialBody) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      start(async () => {
        await saveNote(inviteId, body);
        setSavedAt(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));
      });
    }, 900);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-9 sm:px-10">
      <p className="m-eyebrow text-[11px]">Plan</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-dis text-4xl">Notes</h1>
        <span className="text-xs" style={{ color: "var(--ink-3)" }}>
          {pending ? "Saving…" : savedAt ? `Saved ${savedAt}` : ""}
        </span>
      </div>
      <PlanNav id={inviteId} />
      <p className="mt-6 text-sm" style={{ color: "var(--ink-3)" }}>
        A shared scratchpad for anyone helping run this event — seating ideas, things to remember, questions for vendors.
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={20}
        placeholder="Start typing…"
        className="mt-4 w-full rounded-[8px] border p-4 text-sm leading-relaxed"
        style={{ borderColor: "var(--line-2)", background: "var(--surface)", minHeight: 420 }}
      />
    </main>
  );
}
