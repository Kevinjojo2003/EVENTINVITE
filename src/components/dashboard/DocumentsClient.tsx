"use client";
import { useState, useTransition } from "react";
import type { EventDocument } from "@/lib/types";
import { DOCUMENT_CATEGORIES } from "@/lib/types";
import { addDocument, deleteDocument } from "@/app/dashboard/actions";
import { signedDocumentUrl, uploadDocument } from "@/components/editor/upload";

export function DocumentsClient({ inviteId, docs }: { inviteId: string; docs: EventDocument[] }) {
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();

  const byCategory = new Map<string, EventDocument[]>();
  for (const d of docs) {
    const key = d.category || "Other";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(d);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const { path, name } = await uploadDocument(inviteId, file);
      const r = await addDocument(inviteId, { title: title || name, category, file_url: path, file_name: name });
      if (r?.error) setMsg(r.error);
      else {
        setTitle("");
        setFile(null);
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not upload that file.");
    } finally {
      setBusy(false);
    }
  }

  async function open(path: string) {
    try {
      const url = await signedDocumentUrl(path);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not open that file.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">Documents</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        Contracts, invoices and lists in one place, instead of scattered across chats and email.
      </p>

      <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-3 sm:items-end">
        <div className="field">
          <label htmlFor="d-cat">Category</label>
          <select id="d-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="d-title">Title</label>
          <input id="d-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
        </div>
        <div className="field">
          <label htmlFor="d-file">File</label>
          <input id="d-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <button type="submit" className="btn-primary w-fit sm:col-span-3" disabled={busy || pending || !file}>
          {busy ? "Uploading…" : "Upload"}
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <div className="mt-6 grid gap-6">
        {[...byCategory.entries()].map(([cat, list]) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
              {cat}
            </p>
            <ul className="card mt-2 divide-y" style={{ borderColor: "var(--line)" }}>
              {list.map((d) => (
                <li key={d.id} className="flex items-center gap-4 px-4 py-3">
                  <button type="button" onClick={() => open(d.file_url)} className="min-w-0 flex-1 text-left text-sm underline-offset-4 hover:underline">
                    {d.title}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => start(async () => void (await deleteDocument(inviteId, d.id, d.file_url)))} aria-label={`Remove ${d.title}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {docs.length === 0 && (
          <p className="card p-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            No documents yet.
          </p>
        )}
      </div>
    </main>
  );
}
