"use client";
import { useMemo, useState, useTransition } from "react";
import type { Vendor } from "@/lib/types";
import { VENDOR_CATEGORIES, VENDOR_STATUSES } from "@/lib/types";
import { addVendor, deleteVendor, updateVendor } from "@/app/dashboard/actions";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const statusColor: Record<string, string> = {
  Shortlisted: "var(--ink-3)",
  Contacted: "var(--ink-2)",
  Negotiating: "#8a6d1f",
  Confirmed: "#1f6b34",
  Completed: "#1f6b34",
};

export function VendorsClient({ inviteId, vendors }: { inviteId: string; vendors: Vendor[] }) {
  const [category, setCategory] = useState<string>(VENDOR_CATEGORIES[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const confirmed = vendors.filter((v) => v.status === "Confirmed" || v.status === "Completed").length;
  const due = vendors.filter((v) => v.quoted > v.paid).length;

  const byStatus = useMemo(() => {
    const m = new Map<string, Vendor[]>();
    for (const s of VENDOR_STATUSES) m.set(s, []);
    for (const v of vendors) (m.get(v.status) ?? m.set(v.status, []).get(v.status)!).push(v);
    return [...m.entries()].filter(([, list]) => list.length > 0);
  }, [vendors]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addVendor(inviteId, { category, name, contact_phone: phone });
      if (r?.error) setMsg(r.error);
      else {
        setName("");
        setPhone("");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Vendors</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            {vendors.length ? `${confirmed} of ${vendors.length} confirmed${due ? `, ${due} with a balance due` : ""}` : "Nothing here yet."}
          </p>
        </div>
      </div>

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

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <div className="mt-6 grid gap-6">
        {byStatus.map(([status, list]) => (
          <div key={status}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: statusColor[status] }}>
              {status} · {list.length}
            </p>
            <ul className="card mt-2 divide-y" style={{ borderColor: "var(--line)" }}>
              {list.map((v) => (
                <li key={v.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-medium">{v.name}</p>
                    <p className="text-xs" style={{ color: "var(--ink-2)" }}>
                      {v.category}
                      {v.contact_phone ? ` · ${v.contact_phone}` : ""}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums" style={{ color: "var(--ink-2)" }}>
                    {money(v.paid)} / {money(v.quoted)}
                  </span>
                  <select
                    aria-label={`Status for ${v.name}`}
                    defaultValue={v.status}
                    className="rounded border px-2 py-1 text-xs"
                    style={{ borderColor: "var(--line)" }}
                    onChange={(e) => start(async () => void (await updateVendor(inviteId, v.id, { status: e.target.value })))}
                  >
                    {VENDOR_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {v.contact_phone && (
                    <a href={`https://wa.me/${v.contact_phone}`} target="_blank" rel="noopener" className="btn-secondary text-xs">
                      WhatsApp
                    </a>
                  )}
                  <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteVendor(inviteId, v.id)))} aria-label={`Remove ${v.name}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
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
