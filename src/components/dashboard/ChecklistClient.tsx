"use client";
import { useMemo, useState, useTransition } from "react";
import type { Task } from "@/lib/types";
import { addTask, deleteTask, seedChecklist, setTaskDone } from "@/app/dashboard/actions";

export function ChecklistClient({ inviteId, tasks }: { inviteId: string; tasks: Task[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [due, setDue] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const groups = useMemo(() => {
    const byCat = new Map<string, Task[]>();
    for (const t of tasks) {
      const key = t.category || "General";
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(t);
    }
    return [...byCat.entries()];
  }, [tasks]);

  const today = new Date().toISOString().slice(0, 10);
  const done = tasks.filter((t) => t.done).length;
  const overdue = tasks.filter((t) => !t.done && t.due_date && t.due_date < today).length;

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addTask(inviteId, { title, category, due_date: due || null });
      if (r?.error) setMsg(r.error);
      else {
        setTitle("");
        setDue("");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Checklist</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            {tasks.length ? `${done} of ${tasks.length} done${overdue ? `, ${overdue} overdue` : ""}` : "Nothing here yet."}
          </p>
        </div>
        {tasks.length === 0 && (
          <button
            type="button"
            className="btn-secondary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await seedChecklist(inviteId);
                if (r?.error) setMsg(r.error);
              })
            }
          >
            Add a starter checklist
          </button>
        )}
      </div>

      <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div className="field">
          <label htmlFor="t-title">Task</label>
          <input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Pay photographer" />
        </div>
        <div className="field">
          <label htmlFor="t-cat">Category</label>
          <input id="t-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="General" style={{ width: 140 }} />
        </div>
        <div className="field">
          <label htmlFor="t-due">Due</label>
          <input id="t-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending || !title.trim()}>
          Add
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <div className="mt-6 grid gap-6">
        {groups.map(([cat, items]) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
              {cat}
            </p>
            <ul className="card mt-2 divide-y" style={{ borderColor: "var(--line)" }}>
              {items.map((t) => {
                const late = !t.done && t.due_date && t.due_date < today;
                return (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: "var(--line)" }}>
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={(e) => start(async () => void (await setTaskDone(inviteId, t.id, e.target.checked)))}
                      aria-label={`Mark ${t.title} ${t.done ? "not done" : "done"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm" style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--ink-3)" : "var(--ink)" }}>
                        {t.title}
                      </span>
                      {t.due_date && (
                        <span className="text-xs" style={{ color: late ? "#8a2c2c" : "var(--ink-2)" }}>
                          {late ? "Overdue: " : "Due "}
                          {new Date(t.due_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </span>
                    <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteTask(inviteId, t.id)))} aria-label={`Remove ${t.title}`}>
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
