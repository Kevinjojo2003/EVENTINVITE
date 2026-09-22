"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Vendor } from "@/lib/types";
import { VENDOR_CATEGORIES, VENDOR_STATUSES } from "@/lib/types";
import { addVendor } from "@/app/dashboard/actions";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const statusColor: Record<string, string> = {
  Shortlisted: "var(--ink-3)",
  Contacted: "var(--ink-2)",
  Negotiating: "#8a6d1f",
  Confirmed: "#1f6b34",
  Completed: "#1f6b34",
};

export function VendorsClient({ inviteId, vendors }: { inviteId: string; vendors: Vendor[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [compare, setCompare] = useState(false);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [msg, setMsg] = useState("");

  const confirmed = vendors.filter((v) => v.status === "Confirmed" || v.status === "Completed").length;
  const openCount = vendors.length - confirmed;
  const contractsTotal = vendors.reduce((s, v) => s + v.quoted, 0);
  const paidTotal = vendors.reduce((s, v) => s + v.paid, 0);
  const openCategories = [...new Set(vendors.filter((v) => v.status !== "Confirmed" && v.status !== "Completed").map((v) => v.category))];

  const categories = useMemo(() => ["All", ...VENDOR_CATEGORIES.filter((c) => vendors.some((v) => v.category === c))], [vendors]);
  const statuses = useMemo(() => ["All", ...VENDOR_STATUSES.filter((s) => vendors.some((v) => v.status === s))], [vendors]);

  const filtered = vendors.filter((v) => (category === "All" || v.category === category) && (status === "All" || v.status === status));

  const byStatus = useMemo(() => {
    const m = new Map<string, Vendor[]>();
    for (const s of VENDOR_STATUSES) m.set(s, []);
    for (const v of filtered) (m.get(v.status) ?? m.set(v.status, []).get(v.status)!).push(v);
    return [...m.entries()].filter(([, list]) => list.length > 0);
  }, [filtered]);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-9 sm:px-10">
      <p className="m-eyebrow text-[11px]">Vendors</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-dis text-4xl">{vendors.length ? `${confirmed} confirmed, ${openCount} to go.` : "No vendors yet."}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-3)" }}>
            {vendors.length
              ? `Contracts ${money(contractsTotal)} · paid ${money(paidTotal)}${openCategories.length ? ` · ${openCategories.join(", ")} still open` : ""}`
              : "Add your venue, caterer or photographer to get started."}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setCompare((s) => !s)} disabled={vendors.length < 2}>
            Compare quotes
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowAdd((s) => !s)}>
            + Add vendor
          </button>
        </div>
      </div>

      {categories.length > 2 && (
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-b pb-3 text-sm" style={{ borderColor: "var(--line)" }}>
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} style={{ color: category === c ? "var(--ink)" : "var(--ink-3)", fontWeight: category === c ? 500 : 400 }}>
              {c}
            </button>
          ))}
        </div>
      )}

      {statuses.length > 2 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((s) => {
            const inCategory = category === "All" ? vendors : vendors.filter((v) => v.category === category);
            const count = s === "All" ? inCategory.length : inCategory.filter((v) => v.status === s).length;
            return (
              <button
                key={s}
                type="button"
                className="rounded-full px-3.5 py-1.5 text-sm"
                style={{ border: `1px solid ${status === s ? "var(--ink)" : "var(--line-2)"}`, background: status === s ? "var(--ink)" : "transparent", color: status === s ? "var(--paper)" : "var(--ink-2)" }}
                onClick={() => setStatus(s)}
              >
                {s} {count}
              </button>
            );
          })}
        </div>
      )}

      {showAdd && <AddVendorForm inviteId={inviteId} onMessage={setMsg} onDone={() => setShowAdd(false)} />}
      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      {compare && filtered.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-[0.08em]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Quoted</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered]
                .sort((a, b) => a.quoted - b.quoted)
                .map((v) => (
                  <tr key={v.id} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                    <td className="px-4 py-3">{v.name}</td>
                    <td className="px-4 py-3">{v.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(v.quoted)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(v.paid)}</td>
                    <td className="px-4 py-3" style={{ color: statusColor[v.status] }}>
                      {v.status}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 grid gap-8">
        {byStatus.map(([status_, list]) => (
          <div key={status_}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: statusColor[status_] }}>
              {status_} · {list.length}
            </p>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((v) => {
                const pct = v.quoted ? Math.min(100, Math.round((v.paid / v.quoted) * 100)) : 0;
                return (
                  <Link key={v.id} href={`/dashboard/${inviteId}/vendors/${v.id}`} className="card block p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--ink-3)" }}>
                        {v.category}
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: "var(--paper-2)", color: statusColor[v.status] }}>
                        {v.status}
                      </span>
                    </div>
                    <p className="m-dis mt-1 text-lg">{v.name}</p>
                    <p className="mt-0.5 text-sm tabular-nums" style={{ color: "var(--ink-2)" }}>
                      {money(v.quoted)}
                    </p>
                    <span className="mt-3 block h-1.5 overflow-hidden rounded-full" style={{ background: "var(--paper-2)" }}>
                      <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: "var(--ok)" }} />
                    </span>
                    <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "var(--ink-3)" }}>
                      <span>{money(v.paid)} paid</span>
                      <span>{v.due_date ? `Next ${new Date(v.due_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "—"}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {vendors.length === 0 && (
          <p className="card p-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            No vendors yet. Add your venue, caterer or photographer above.
          </p>
        )}
      </div>
    </main>
  );
}

function AddVendorForm({ inviteId, onMessage, onDone }: { inviteId: string; onMessage: (m: string) => void; onDone: () => void }) {
  const [category, setCategory] = useState<string>(VENDOR_CATEGORIES[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addVendor(inviteId, { category, name, contact_phone: phone });
      if (r?.error) return onMessage(r.error);
      setName("");
      setPhone("");
      onDone();
    });
  }

  return (
    <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-4 sm:items-end">
      <div className="field">
        <label htmlFor="v-cat">Category</label>
        <select id="v-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
          {VENDOR_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="v-name">Name</label>
        <input id="v-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Spice Caterers" required />
      </div>
      <div className="field">
        <label htmlFor="v-phone">Phone</label>
        <input id="v-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="919876543210" />
      </div>
      <button type="submit" className="btn-primary" disabled={pending || !name.trim()}>
        Add
      </button>
    </form>
  );
}
