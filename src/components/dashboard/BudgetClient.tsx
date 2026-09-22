"use client";
import { useMemo, useState, useTransition } from "react";
import type { Expense } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { addExpense, deleteExpense, setBudget, updateExpense } from "@/app/dashboard/actions";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function BudgetClient({ inviteId, expenses, totalBudget, categoryBudgets }: { inviteId: string; expenses: Expense[]; totalBudget: number | null; categoryBudgets: Record<string, number> }) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showSetTotal, setShowSetTotal] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  const totals = useMemo(() => {
    const spent = expenses.reduce((s, e) => s + e.paid, 0);
    const quotedSum = expenses.reduce((s, e) => s + e.quoted, 0);
    const committed = Math.max(0, quotedSum - spent);
    const budget = totalBudget ?? 0;
    const remaining = Math.max(0, budget - spent - committed);
    return { spent, quotedSum, committed, budget, remaining };
  }, [expenses, totalBudget]);

  const byCategory = useMemo(() => {
    const m = new Map<string, { budget: number; quoted: number; paid: number }>();
    for (const [cat, b] of Object.entries(categoryBudgets)) m.set(cat, { budget: b, quoted: 0, paid: 0 });
    for (const e of expenses) {
      const cur = m.get(e.category) ?? { budget: 0, quoted: 0, paid: 0 };
      cur.quoted += e.quoted;
      cur.paid += e.paid;
      m.set(e.category, cur);
    }
    return [...m.entries()].sort((a, b) => b[1].budget - a[1].budget || b[1].quoted - a[1].quoted);
  }, [expenses, categoryBudgets]);

  const upcoming = useMemo(
    () =>
      expenses
        .filter((e) => e.due_date && e.due_date >= today && e.quoted > e.paid)
        .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string))
        .slice(0, 5),
    [expenses, today],
  );

  const barPct = totals.budget
    ? { spent: Math.min(100, (totals.spent / totals.budget) * 100), committed: Math.min(100, (totals.committed / totals.budget) * 100) }
    : { spent: 0, committed: 0 };

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-9 sm:px-10">
      <p className="m-eyebrow text-[11px]">Budget</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-dis text-4xl">{totalBudget ? `${money(totals.remaining)} left to plan with.` : "Set a budget to get started."}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-3)" }}>
            {totalBudget ? `${money(totals.budget)} total · ${expenses.length} expense${expenses.length === 1 ? "" : "s"} logged` : "Add a total, then break it down by category."}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setShowSetTotal((s) => !s)}>
            {totalBudget ? "Edit total" : "Set budget"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowAddCategory((s) => !s)}>
            + Add category
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowAddExpense((s) => !s)}>
            + Add expense
          </button>
        </div>
      </div>

      {showSetTotal && <SetTotalForm inviteId={inviteId} current={totalBudget} onDone={() => setShowSetTotal(false)} />}
      {showAddCategory && <AddCategoryForm inviteId={inviteId} categoryBudgets={categoryBudgets} onDone={() => setShowAddCategory(false)} />}
      {showAddExpense && <AddExpenseForm inviteId={inviteId} onMessage={setMsg} onDone={() => setShowAddExpense(false)} />}
      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total budget", totals.budget],
          ["Spent", totals.spent],
          ["Committed", totals.committed],
          ["Remaining", totals.remaining],
        ].map(([k, v]) => (
          <div key={k as string} className="card p-4">
            <dt className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
              {k}
            </dt>
            <dd className="mt-1 text-lg font-medium tabular-nums">{money(v as number)}</dd>
          </div>
        ))}
      </dl>

      {totals.budget > 0 && (
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--paper-2)" }}>
            <span className="block h-full" style={{ width: `${barPct.spent}%`, background: "var(--ink)", float: "left" }} />
            <span
              className="block h-full"
              style={{
                width: `${barPct.committed}%`,
                background: "repeating-linear-gradient(45deg, var(--ink-3), var(--ink-3) 3px, transparent 3px, transparent 6px)",
                float: "left",
              }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs" style={{ color: "var(--ink-3)" }}>
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: "var(--ink)" }} />
              Spent {totals.budget ? Math.round((totals.spent / totals.budget) * 100) : 0}%
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: "var(--ink-3)" }} />
              Committed {totals.budget ? Math.round((totals.committed / totals.budget) * 100) : 0}%
            </span>
            <span>Remaining {totals.budget ? Math.round((totals.remaining / totals.budget) * 100) : 0}%</span>
          </div>
        </div>
      )}

      {byCategory.length > 0 && (
        <div className="mt-10">
          <h2 className="m-dis text-xl">By category</h2>
          <div className="card mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-[0.08em]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Budget</th>
                  <th className="px-4 py-3 text-right">Spent</th>
                  <th className="px-4 py-3 text-right">Committed</th>
                  <th className="px-4 py-3 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map(([cat, sum]) => {
                  const committed = Math.max(0, sum.quoted - sum.paid);
                  const remaining = Math.max(0, sum.budget - sum.paid - committed);
                  const pctSpent = sum.budget ? Math.min(100, (sum.paid / sum.budget) * 100) : 0;
                  const pctCommitted = sum.budget ? Math.min(100, (committed / sum.budget) * 100) : 0;
                  return (
                    <tr key={cat} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                      <td className="px-4 py-3">
                        <span className="block">{cat}</span>
                        {sum.budget > 0 && (
                          <span className="mt-1.5 block h-1.5 w-32 overflow-hidden rounded-full" style={{ background: "var(--paper-2)" }}>
                            <span className="block h-full" style={{ width: `${pctSpent}%`, background: "var(--ink)", float: "left" }} />
                            <span
                              className="block h-full"
                              style={{ width: `${pctCommitted}%`, background: "repeating-linear-gradient(45deg, var(--ink-3), var(--ink-3) 2px, transparent 2px, transparent 4px)", float: "left" }}
                            />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{sum.budget ? money(sum.budget) : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{money(sum.paid)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{committed ? money(committed) : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{sum.budget ? money(remaining) : "—"}</td>
                    </tr>
                  );
                })}
                <tr className="font-medium">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(totals.budget)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(totals.spent)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(totals.committed)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(totals.remaining)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-10">
          <h2 className="m-dis text-xl">Coming up</h2>
          <ul className="card mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-4 py-3">
                <span className="w-16 shrink-0 text-xs tabular-nums" style={{ color: "var(--ink-3)" }}>
                  {new Date(e.due_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{e.vendor || e.category}</span>
                  <span className="block text-xs" style={{ color: "var(--ink-3)" }}>
                    {e.category}
                    {e.vendor ? " · balance due" : ""}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">{money(e.quoted - e.paid)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <h2 className="m-dis text-xl">All expenses</h2>
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-[0.08em]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3 text-right">Quoted</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--ink-2)" }}>
                    No expenses yet.
                  </td>
                </tr>
              )}
              {expenses.map((e) => (
                <tr key={e.id} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3">{e.vendor || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(e.quoted)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <input
                      type="number"
                      min={0}
                      defaultValue={e.paid}
                      className="w-24 rounded border px-2 py-1 text-right"
                      style={{ borderColor: "var(--line)" }}
                      onBlur={(ev) => {
                        const v = Number(ev.target.value) || 0;
                        if (v !== e.paid) start(async () => void (await updateExpense(inviteId, e.id, { paid: v })));
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ color: e.quoted > e.paid ? "var(--err)" : "var(--ink-2)" }}>
                    {money(Math.max(0, e.quoted - e.paid))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteExpense(inviteId, e.id)))} aria-label={`Remove ${e.vendor || e.category}`}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function SetTotalForm({ inviteId, current, onDone }: { inviteId: string; current: number | null; onDone: () => void }) {
  const [value, setValue] = useState(current ? String(current) : "");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await setBudget(inviteId, { total_budget: value ? Number(value) : null });
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="card mt-6 flex flex-wrap items-end gap-3 p-5">
      <div className="field">
        <label htmlFor="total-budget">Total budget</label>
        <input id="total-budget" type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} placeholder="800000" style={{ width: 160 }} autoFocus />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        Save
      </button>
    </form>
  );
}

function AddCategoryForm({ inviteId, categoryBudgets, onDone }: { inviteId: string; categoryBudgets: Record<string, number>; onDone: () => void }) {
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await setBudget(inviteId, { category_budgets: { ...categoryBudgets, [category]: Number(amount) || 0 } });
      setAmount("");
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="card mt-6 flex flex-wrap items-end gap-3 p-5">
      <div className="field">
        <label htmlFor="cat-cat">Category</label>
        <select id="cat-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="cat-amount">Budget</label>
        <input id="cat-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="200000" style={{ width: 140 }} autoFocus />
      </div>
      <button type="submit" className="btn-primary" disabled={pending || !amount}>
        Save
      </button>
    </form>
  );
}

function AddExpenseForm({ inviteId, onMessage, onDone }: { inviteId: string; onMessage: (m: string) => void; onDone: () => void }) {
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [vendor, setVendor] = useState("");
  const [quoted, setQuoted] = useState("");
  const [paid, setPaid] = useState("");
  const [due, setDue] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addExpense(inviteId, { category, vendor, quoted: Number(quoted) || 0, paid: Number(paid) || 0, due_date: due || null });
      if (r?.error) return onMessage(r.error);
      setVendor("");
      setQuoted("");
      setPaid("");
      setDue("");
      onDone();
    });
  }

  return (
    <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <div className="field">
        <label htmlFor="e-cat">Category</label>
        <select id="e-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="e-vendor">Vendor</label>
        <input id="e-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Caterer" />
      </div>
      <div className="field">
        <label htmlFor="e-quoted">Quoted</label>
        <input id="e-quoted" type="number" min={0} value={quoted} onChange={(e) => setQuoted(e.target.value)} placeholder="150000" />
      </div>
      <div className="field">
        <label htmlFor="e-paid">Paid</label>
        <input id="e-paid" type="number" min={0} value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="50000" />
      </div>
      <div className="field">
        <label htmlFor="e-due">Due</label>
        <input id="e-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </div>
      <button type="submit" className="btn-primary" disabled={pending || !vendor.trim()}>
        Add
      </button>
    </form>
  );
}
