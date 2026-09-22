"use client";
import { useMemo, useState, useTransition } from "react";
import type { Task } from "@/lib/types";
import { addTask, deleteTask, seedChecklist, setTaskDone } from "@/app/dashboard/actions";
import { PlanNav } from "./PlanNav";

const PRIORITY_DOT: Record<Task["priority"], string> = { high: "var(--err)", medium: "var(--warn)", low: "var(--ink-3)" };

export function ChecklistClient({ inviteId, tasks }: { inviteId: string; tasks: Task[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "overdue" | "completed">("all");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const monthOut = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const done = tasks.filter((t) => t.done).length;
  const overdueCount = tasks.filter((t) => !t.done && t.due_date && t.due_date < today).length;

  const filtered = useMemo(() => {
    if (filter === "overdue") return tasks.filter((t) => !t.done && t.due_date && t.due_date < today);
    if (filter === "completed") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter, today]);

  const groups = useMemo(() => {
    const thisWeek: Task[] = [];
    const upcoming: Task[] = [];
    const later: Task[] = [];
    const completed: Task[] = [];
    for (const t of filtered) {
      if (t.done) {
        completed.push(t);
      } else if (t.due_date && t.due_date <= weekOut) {
        thisWeek.push(t);
      } else if (t.due_date && t.due_date <= monthOut) {
        upcoming.push(t);
      } else {
        later.push(t);
      }
    }
    const bySoonest = (a: Task, b: Task) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
    return [
      ["This week", thisWeek.sort(bySoonest)],
      ["Upcoming", upcoming.sort(bySoonest)],
      ["Later", later.sort(bySoonest)],
      ["Completed", completed],
    ] as const;
  }, [filtered, weekOut, monthOut]);

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-9 sm:px-10">
      <p className="m-eyebrow text-[11px]">Plan</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-dis text-4xl">Checklist</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-3)" }}>
            {tasks.length ? `${tasks.length} tasks${overdueCount ? ` · ${overdueCount} overdue` : ""}` : "Nothing here yet."}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowAdd((s) => !s)}>
          + Add task
        </button>
      </div>
      <PlanNav id={inviteId} />

      {tasks.length === 0 ? (
        <button
          type="button"
          className="btn-secondary mt-6"
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
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(["all", "overdue", "completed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="rounded-full px-3.5 py-1.5 text-sm capitalize"
              style={{ border: `1px solid ${filter === f ? "var(--ink)" : "var(--line-2)"}`, background: filter === f ? "var(--ink)" : "transparent", color: filter === f ? "var(--paper)" : "var(--ink-2)" }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? `All ${tasks.length}` : f === "overdue" ? `Overdue ${overdueCount}` : `Completed ${done}`}
            </button>
          ))}
          <span className="ml-auto text-sm tabular-nums" style={{ color: "var(--ink-3)" }}>
            <strong style={{ color: "var(--ink)" }}>{done}</strong> of {tasks.length}
          </span>
        </div>
      )}

      {showAdd && <AddTaskForm inviteId={inviteId} onMessage={setMsg} onDone={() => setShowAdd(false)} />}
      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <div className="mt-6 grid gap-8">
        {groups.map(([label, items]) =>
          items.length === 0 ? null : (
            <div key={label}>
              <h2 className="m-dis text-xl">{label}</h2>
              <ul className="card mt-2.5 divide-y" style={{ borderColor: "var(--line)" }}>
                {items.map((t) => (
                  <TaskRow key={t.id} inviteId={t.invite_id} task={t} today={today} />
                ))}
              </ul>
            </div>
          ),
        )}
      </div>
    </main>
  );
}

function TaskRow({ inviteId, task, today }: { inviteId: string; task: Task; today: string }) {
  const [pending, start] = useTransition();
  const late = !task.done && task.due_date && task.due_date < today;

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={task.done}
        disabled={pending}
        onChange={(e) => start(async () => void (await setTaskDone(inviteId, task.id, e.target.checked)))}
        aria-label={`Mark ${task.title} ${task.done ? "not done" : "done"}`}
        style={{ width: 18, height: 18, accentColor: "var(--ink)" }}
      />
      <span className="min-w-0 flex-1 text-sm" style={{ textDecoration: task.done ? "line-through" : "none", color: task.done ? "var(--ink-3)" : "var(--ink)" }}>
        {task.title}
      </span>
      <span className="hidden w-24 shrink-0 truncate text-xs sm:block" style={{ color: "var(--ink-3)" }}>
        {task.category}
      </span>
      {task.assignee && (
        <span className="hidden shrink-0 text-xs sm:block" style={{ color: "var(--ink-3)" }}>
          {task.assignee}
        </span>
      )}
      <span className="flex shrink-0 items-center gap-1.5 text-xs" style={{ color: "var(--ink-3)" }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_DOT[task.priority] }} aria-hidden="true" />
        {task.due_date ? (
          <span style={{ color: late ? "var(--err)" : "var(--ink-3)" }}>{new Date(task.due_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        ) : (
          "—"
        )}
      </span>
      <button type="button" className="shrink-0 text-sm" style={{ color: "var(--ink-3)" }} onClick={() => start(async () => void (await deleteTask(inviteId, task.id)))} aria-label={`Remove ${task.title}`}>
        ×
      </button>
    </li>
  );
}

function AddTaskForm({ inviteId, onMessage, onDone }: { inviteId: string; onMessage: (m: string) => void; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [due, setDue] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addTask(inviteId, { title, category, due_date: due || null, assignee, priority });
      if (r?.error) return onMessage(r.error);
      setTitle("");
      setDue("");
      setAssignee("");
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="card mt-6 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div className="field lg:col-span-2">
        <label htmlFor="t-title">Task</label>
        <input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Pay photographer" />
      </div>
      <div className="field">
        <label htmlFor="t-cat">Category</label>
        <input id="t-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="General" />
      </div>
      <div className="field">
        <label htmlFor="t-assignee">Person</label>
        <input id="t-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Who's doing it" />
      </div>
      <div className="field">
        <label htmlFor="t-due">Due</label>
        <input id="t-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="t-priority">Priority</label>
        <select id="t-priority" value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <button type="submit" className="btn-primary w-fit" disabled={pending || !title.trim()}>
        Add
      </button>
    </form>
  );
}
