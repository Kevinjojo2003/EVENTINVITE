"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Vendor } from "@/lib/types";
import { VENDOR_STATUSES } from "@/lib/types";
import { deleteVendor, updateVendor } from "@/app/dashboard/actions";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function VendorDetailClient({ inviteId, vendor }: { inviteId: string; vendor: Vendor }) {
  const router = useRouter();
  const [name, setName] = useState(vendor.name);
  const [contactName, setContactName] = useState(vendor.contact_name ?? "");
  const [phone, setPhone] = useState(vendor.contact_phone ?? "");
  const [email, setEmail] = useState(vendor.contact_email ?? "");
  const [quoted, setQuoted] = useState(String(vendor.quoted));
  const [paid, setPaid] = useState(String(vendor.paid));
  const [dueDate, setDueDate] = useState(vendor.due_date ?? "");
  const [note, setNote] = useState(vendor.note ?? "");
  const [editingContact, setEditingContact] = useState(false);
  const [pending, start] = useTransition();

  const stepIndex = VENDOR_STATUSES.indexOf(vendor.status);
  const balance = Math.max(0, Number(quoted) - Number(paid));
  const pct = Number(quoted) ? Math.min(100, Math.round((Number(paid) / Number(quoted)) * 100)) : 0;

  function setStatus(s: string) {
    start(async () => void (await updateVendor(inviteId, vendor.id, { status: s })));
  }

  function saveCommercials() {
    start(async () => void (await updateVendor(inviteId, vendor.id, { quoted: Number(quoted) || 0, paid: Number(paid) || 0, due_date: dueDate || null })));
  }

  function saveContact() {
    start(async () => {
      await updateVendor(inviteId, vendor.id, { name, contact_name: contactName, contact_phone: phone, contact_email: email });
      setEditingContact(false);
    });
  }

  function saveNote() {
    start(async () => void (await updateVendor(inviteId, vendor.id, { note })));
  }

  function remove() {
    start(async () => {
      await deleteVendor(inviteId, vendor.id);
      router.push(`/dashboard/${inviteId}/vendors`);
    });
  }

  return (
    <main className="mx-auto w-full max-w-[1000px] px-6 py-9 sm:px-10">
      <Link href={`/dashboard/${inviteId}/vendors`} className="text-sm" style={{ color: "var(--ink-3)" }}>
        ‹ Vendors
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] text-lg font-medium uppercase"
            style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}
            aria-hidden="true"
          >
            {initials(vendor.name)}
          </span>
          <div>
            <p className="m-eyebrow text-[11px]">{vendor.category}</p>
            <h1 className="m-dis text-3xl">{vendor.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {vendor.contact_email && (
            <a href={`mailto:${vendor.contact_email}`} className="btn-secondary">
              Message
            </a>
          )}
          {vendor.contact_phone && (
            <a href={`tel:${vendor.contact_phone}`} className="btn-secondary">
              Call
            </a>
          )}
          <button type="button" className="btn-primary" onClick={saveCommercials} disabled={pending}>
            Record payment
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b pb-5" style={{ borderColor: "var(--line)" }}>
        {VENDOR_STATUSES.map((s, i) => (
          <button key={s} type="button" onClick={() => setStatus(s)} disabled={pending} className="flex items-center gap-2 text-sm" style={{ color: i <= stepIndex ? "var(--ink)" : "var(--ink-3)", fontWeight: s === vendor.status ? 500 : 400 }}>
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
              style={{ border: `1px solid ${i <= stepIndex ? "var(--ink)" : "var(--line-2)"}`, background: i <= stepIndex ? "var(--ink)" : "transparent", color: i <= stepIndex ? "var(--paper)" : "transparent" }}
            >
              ✓
            </span>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="m-dis text-xl">Commercials</h2>
          <dl className="mt-3 grid grid-cols-3 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
                Quoted
              </dt>
              <dd className="mt-1">
                <input type="number" min={0} value={quoted} onChange={(e) => setQuoted(e.target.value)} onBlur={saveCommercials} className="w-full rounded border px-2 py-1 text-lg font-medium tabular-nums" style={{ borderColor: "var(--line)" }} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
                Paid
              </dt>
              <dd className="mt-1">
                <input type="number" min={0} value={paid} onChange={(e) => setPaid(e.target.value)} onBlur={saveCommercials} className="w-full rounded border px-2 py-1 text-lg font-medium tabular-nums" style={{ borderColor: "var(--line)" }} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
                Balance
              </dt>
              <dd className="mt-1 py-1 text-lg font-medium tabular-nums">{money(balance)}</dd>
            </div>
          </dl>
          <span className="mt-4 block h-1.5 overflow-hidden rounded-full" style={{ background: "var(--paper-2)" }}>
            <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: "var(--ok)" }} />
          </span>

          <div className="field mt-4 max-w-[220px]">
            <label htmlFor="v-due">Next payment due</label>
            <input id="v-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} onBlur={saveCommercials} />
          </div>

          <h2 className="m-dis mt-8 text-xl">Notes</h2>
          <textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Anything worth remembering about this vendor…" className="mt-3 w-full rounded-[8px] border p-3 text-sm leading-relaxed" style={{ borderColor: "var(--line-2)", background: "var(--surface)" }} />

          <button type="button" className="btn-secondary mt-8" onClick={remove} disabled={pending}>
            Remove vendor
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="m-dis text-xl">Contact</h2>
            <button type="button" className="text-sm" style={{ color: "var(--ink-3)" }} onClick={() => setEditingContact((s) => !s)}>
              {editingContact ? "Cancel" : "Edit"}
            </button>
          </div>
          {editingContact ? (
            <div className="card mt-3 grid gap-3 p-4">
              <div className="field">
                <label htmlFor="v-name">Vendor name</label>
                <input id="v-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="v-contact">Contact person</label>
                <input id="v-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="v-phone">Phone</label>
                <input id="v-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="v-email">Email</label>
                <input id="v-email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="button" className="btn-primary w-fit" onClick={saveContact} disabled={pending}>
                Save
              </button>
            </div>
          ) : (
            <div className="card mt-3 grid gap-3 p-4 text-sm">
              {vendor.contact_name && <p className="font-medium">{vendor.contact_name}</p>}
              {vendor.contact_phone && (
                <p>
                  {vendor.contact_phone}
                  <a href={`https://wa.me/${vendor.contact_phone}`} target="_blank" rel="noopener" className="ml-2 text-xs" style={{ color: "var(--ink-3)" }}>
                    WhatsApp
                  </a>
                </p>
              )}
              {vendor.contact_email && <p style={{ color: "var(--ink-2)" }}>{vendor.contact_email}</p>}
              {!vendor.contact_name && !vendor.contact_phone && !vendor.contact_email && <p style={{ color: "var(--ink-3)" }}>No contact details yet.</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
