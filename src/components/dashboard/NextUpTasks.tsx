"use client";
import { useTransition } from "react";
import Link from "next/link";
import type { Task } from "@/lib/types";
import { setTaskDone } from "@/app/dashboard/actions";

export function NextUpTasks({ inviteId, tasks }: { inviteId: string; tasks: Task[] }) {
  const [pending, start] = useTransition();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ul>
      {tasks.length === 0 && (
        <li className="py-6 text-sm" style={{ color: "var(--ink-3)" }}>
          Nothing due. <Link href={`/dashboard/${inviteId}/checklist`} className="underline underline-offset-4">Add a task</Link>
        </li>
      )}
      {tasks.map((t) => {
        const late = !t.done && t.due_date && t.due_date < today;
        return (
          <li key={t.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: "1px solid var(--line)" }}>
            <input
              type="checkbox"
              checked={t.done}
              disabled={pending}
              onChange={(e) => start(async () => void (await setTaskDone(inviteId, t.id, e.target.checked)))}
              aria-label={`Mark ${t.title} done`}
              style={{ width: 20, height: 20, borderRadius: 5, accentColor: "var(--ink)" }}
            />
            <span className="min-w-0 flex-1 text-[13.5px]" style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--ink-3)" : "var(--ink)" }}>
              {t.title}
            </span>
            {t.due_date && (
              <span className="text-xs" style={{ color: late ? "var(--err)" : "var(--ink-3)" }}>
                {new Date(t.due_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
