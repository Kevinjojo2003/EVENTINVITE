import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeConfig } from "@/lib/themes";
import type { EventType, Rsvp } from "@/lib/types";
import { deleteRsvp } from "@/app/dashboard/actions";

export default async function RsvpsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, event_type, config").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  const { data } = await supabase.from("rsvps").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  const rows = (data ?? []) as Rsvp[];
  const yes = rows.filter((r) => r.attending);
  const heads = yes.reduce((n, r) => n + (r.party_size || 1), 0);
  const perEvent = c.schedule.map((e) => ({ title: e.title, n: yes.filter((r) => r.events.includes(e.key)).reduce((n, r) => n + (r.party_size || 1), 0) }));
  const checkedIn = rows.filter((r) => r.checked_in_at).length;

  const csv = [
    ["Name", "Attending", "People", "Events", "Company", "Email", "Note", "Ticket", "Checked in", "Replied at"].join(","),
    ...rows.map((r) =>
      [r.name, r.attending ? "yes" : "no", r.party_size, r.events.join("|"), r.company ?? "", r.email ?? "", (r.note ?? "").replace(/[\r\n,]+/g, " "), r.ticket_code, r.checked_in_at ?? "", r.created_at]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">RSVPs</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            Replies sent through the form on the invitation. WhatsApp replies arrive on your phone.
          </p>
        </div>
        <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`} download="rsvps.csv" className="btn-secondary">
          Download CSV
        </a>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          ["Replies", rows.length],
          ["Coming", yes.length],
          ["Total people", heads],
          [c.rsvp.tickets ? "Checked in" : "Declined", c.rsvp.tickets ? checkedIn : rows.length - yes.length],
        ].map(([k, v]) => (
          <div key={k as string} className="card p-4">
            <dt className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
              {k}
            </dt>
            <dd className="mt-1 text-2xl font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      {perEvent.length > 1 && (
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {perEvent.map((e) => (
            <li key={e.title} className="card px-3 py-2">
              {e.title}: <span className="font-medium tabular-nums">{e.n}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-[0.08em]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Reply</th>
              <th className="px-4 py-3">People</th>
              {c.schedule.length > 1 && <th className="px-4 py-3">Events</th>}
              {c.rsvp.askCompany && <th className="px-4 py-3">Company</th>}
              <th className="px-4 py-3">Note</th>
              {c.rsvp.tickets && <th className="px-4 py-3">Ticket</th>}
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center" style={{ color: "var(--ink-2)" }}>
                  No replies yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b align-top last:border-0" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3 font-medium">
                  {r.name}
                  {r.email && (
                    <span className="block text-xs font-normal" style={{ color: "var(--ink-2)" }}>
                      {r.email}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: r.attending ? "#e3f3e6" : "#fbe7e7", color: r.attending ? "#1f6b34" : "#8a2c2c" }}>
                    {r.attending ? "Coming" : "Declined"}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{r.attending ? r.party_size : "—"}</td>
                {c.schedule.length > 1 && (
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--ink-2)" }}>
                    {c.schedule.filter((e) => r.events.includes(e.key)).map((e) => e.title).join(", ") || "—"}
                  </td>
                )}
                {c.rsvp.askCompany && <td className="px-4 py-3">{r.company ?? "—"}</td>}
                <td className="max-w-xs px-4 py-3 text-xs" style={{ color: "var(--ink-2)" }}>
                  {r.note ?? "—"}
                </td>
                {c.rsvp.tickets && (
                  <td className="px-4 py-3 text-xs tabular-nums">
                    {r.attending ? r.ticket_code : "—"}
                    {r.checked_in_at && <span className="block text-green-800">In · {new Date(r.checked_in_at).toLocaleTimeString("en-IN")}</span>}
                  </td>
                )}
                <td className="px-4 py-3 text-xs" style={{ color: "var(--ink-2)" }}>
                  {new Date(r.created_at).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteRsvp.bind(null, id, r.id)}>
                    <button type="submit" className="btn-secondary" aria-label={`Delete reply from ${r.name}`}>
                      ×
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
