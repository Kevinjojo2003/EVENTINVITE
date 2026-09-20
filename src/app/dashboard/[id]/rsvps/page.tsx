import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeConfig } from "@/lib/themes";
import type { EventReply, EventType, Rsvp } from "@/lib/types";
import { deleteRsvp } from "@/app/dashboard/actions";

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csvRow = (cells: unknown[]) => cells.map(csvCell).join(",");
const dataUri = (csv: string) => `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

export default async function RsvpsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("id, event_type, config").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  const { data } = await supabase.from("rsvps").select("*").eq("invite_id", id).order("created_at", { ascending: false });
  const { data: guestRows } = await supabase.from("guests").select("*").eq("invite_id", id);
  const rows = (data ?? []) as Rsvp[];
  const guests = (guestRows ?? []) as { id: string; events?: string[] }[];
  const yes = rows.filter((r) => r.attending);
  const checkedIn = rows.filter((r) => r.checked_in_at).length;

  // One reply's answer for one ceremony. Replies from before the multi-event upgrade have no
  // per-event answers, so they count as "everyone attending" for the ceremonies they picked.
  const answerFor = (r: Rsvp, key: string): EventReply | null => {
    const per = r.responses?.[key];
    if (per) return per;
    if (r.responses && Object.keys(r.responses).length) return null;
    if (!r.attending || !r.events.includes(key)) return { attending: false, adults: 0, children: 0, infants: 0 };
    return { attending: true, adults: r.party_size || 1, children: 0, infants: 0 };
  };

  const repliedGuestIds = new Set(rows.map((r) => r.guest_id).filter(Boolean) as string[]);
  const perEvent = c.schedule.map((e) => {
    let households = 0;
    let adults = 0;
    let children = 0;
    let infants = 0;
    let declined = 0;
    for (const r of rows) {
      const a = answerFor(r, e.key);
      if (!a) continue;
      if (a.attending) {
        households++;
        adults += a.adults;
        children += a.children;
        infants += a.infants;
      } else declined++;
    }
    const invited = guests.filter((g) => !g.events || g.events.length === 0 || g.events.includes(e.key));
    const pending = invited.filter((g) => !repliedGuestIds.has(g.id)).length;
    return { key: e.key, title: e.title, households, adults, children, infants, plates: adults + children, declined, pending };
  });
  const heads = perEvent.length ? Math.max(...perEvent.map((e) => e.adults + e.children + e.infants)) : 0;

  const repliesCsv = [
    csvRow(["Name", "Attending", "Company", "Email", "Note", "Ticket", "Checked in", "Replied at", ...c.schedule.flatMap((e) => [`${e.title} adults`, `${e.title} children`, `${e.title} infants`])]),
    ...rows.map((r) =>
      csvRow([
        r.name,
        r.attending ? "yes" : "no",
        r.company,
        r.email,
        (r.note ?? "").replace(/[\r\n,]+/g, " "),
        r.ticket_code,
        r.checked_in_at,
        r.created_at,
        ...c.schedule.flatMap((e) => {
          const a = answerFor(r, e.key);
          return a?.attending ? [a.adults, a.children, a.infants] : [0, 0, 0];
        }),
      ]),
    ),
  ].join("\n");
  const headcountCsv = [
    csvRow(["Event", "Replies yes", "Adults", "Children", "Infants", "Plates (adults + children)", "Replies no", "Not replied yet"]),
    ...perEvent.map((e) => csvRow([e.title, e.households, e.adults, e.children, e.infants, e.plates, e.declined, e.pending])),
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
        <div className="flex flex-wrap gap-2">
          <a href={dataUri(headcountCsv)} download="headcount.csv" className="btn-secondary">
            Headcount CSV
          </a>
          <a href={dataUri(repliesCsv)} download="rsvps.csv" className="btn-secondary">
            All replies CSV
          </a>
        </div>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          ["Replies", rows.length],
          ["Coming", yes.length],
          ["Most people at one event", heads],
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

      <section className="mt-8" aria-labelledby="headcount">
        <h2 id="headcount" className="text-lg font-medium">
          Headcount by event
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
          What the caterer needs. Plates are adults plus children; infants are counted separately.
        </p>
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-[0.08em]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-right">Adults</th>
                <th className="px-4 py-3 text-right">Children</th>
                <th className="px-4 py-3 text-right">Infants</th>
                <th className="px-4 py-3 text-right">Plates</th>
                <th className="px-4 py-3 text-right">Replied yes</th>
                <th className="px-4 py-3 text-right">Replied no</th>
                <th className="px-4 py-3 text-right">Waiting</th>
              </tr>
            </thead>
            <tbody>
              {perEvent.map((e) => (
                <tr key={e.key} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.adults}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.children}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.infants}</td>
                  <td className="px-4 py-3 text-right text-base font-medium tabular-nums">{e.plates}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.households}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.declined}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
                    {c.schedule
                      .map((e) => ({ e, a: answerFor(r, e.key) }))
                      .filter((x) => x.a?.attending)
                      .map(({ e, a }) => `${e.title} (${a!.adults}${a!.children ? ` + ${a!.children} kids` : ""}${a!.infants ? ` + ${a!.infants} infants` : ""})`)
                      .join(", ") || "—"}
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
