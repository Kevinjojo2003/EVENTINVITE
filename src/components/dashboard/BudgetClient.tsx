"use client";
import { useMemo, useState, useTransition } from "react";
import type { Expense } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { addExpense, deleteExpense, updateExpense } from "@/app/dashboard/actions";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function BudgetClient({ inviteId, expenses }: { inviteId: string; expenses: Expense[] }) {
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [vendor, setVendor] = useState("");
  const [quoted, setQuoted] = useState("");
  const [paid, setPaid] = useState("");
  const [due, setDue] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const totals = useMemo(() => {
    const spent = expenses.reduce((s, e) => s + e.paid, 0);
    const quotedSum = expenses.reduce((s, e) => s + e.quoted, 0);
    const committed = Math.max(0, quotedSum - spent);
    return { spent, quotedSum, committed };
  }, [expenses]);

  const byCategory = useMemo(() => {
    const m = new Map<string, { quoted: number; paid: number }>();
    for (const e of expenses) {
      const cur = m.get(e.category) ?? { quoted: 0, paid: 0 };
      cur.quoted += e.quoted;
      cur.paid += e.paid;
      m.set(e.category, cur);
    }
    return [...m.entries()].sort((a, b) => b[1].quoted - a[1].quoted);
  }, [expenses]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addExpense(inviteId, { category, vendor, quoted: Number(quoted) || 0, paid: Number(paid) || 0, due_date: due || null });
      if (r?.error) setMsg(r.error);
      else {
        setVendor("");
        setQuoted("");
        setPaid("");
        setDue("");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">Budget</h1>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Quoted", totals.quotedSum],
          ["Paid", totals.spent],
          ["Committed", totals.committed],
        ].map(([k, v]) => (
          <div key={k as string} className="card p-4">
            <dt className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
              {k}
            </dt>
            <dd className="mt-1 text-lg font-medium tabular-nums">{money(v as number)}</dd>
          </div>
        ))}
      </dl>

      <form onSubmit={add} className="card mt-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
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
        <button type="submit" className="btn-primary" disabled={pending || !vendor.trim()}>
          Add
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      {byCategory.length > 0 && (
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {byCategory.map(([cat, sum]) => {
            const pct = sum.quoted ? Math.min(100, Math.round((sum.paid / sum.quoted) * 100)) : 0;
            return (
              <div key={cat} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate" style={{ color: "var(--ink-2)" }}>
                  {cat}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--paper-2)" }}>
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: "var(--ok)" }} />
                </span>
                <span className="w-20 shrink-0 text-right tabular-nums">{money(sum.quoted)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-[0.08em]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3 text-right">Quoted</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Due</th>
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
                <td className="px-4 py-3 text-right tabular-nums" style={{ color: e.quoted > e.paid ? "#8a2c2c" : "var(--ink-2)" }}>
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
    </main>
  );
}
