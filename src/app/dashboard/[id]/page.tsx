import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Settings, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { displayTitle, normalizeConfig } from "@/lib/themes";
import { inviteUrl, longDate } from "@/lib/format";
import { EVENT_TYPES, type EventType, type Expense, type Guest, type Rsvp, type Task, type Vendor } from "@/lib/types";
import { NextUpTasks } from "@/components/dashboard/NextUpTasks";

const money = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : `₹${Math.round(n).toLocaleString("en-IN")}`);
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

function Bar({ value, tone = "ink" }: { value: number; tone?: "ink" | "ok" | "err" }) {
  const color = tone === "ok" ? "var(--ok)" : tone === "err" ? "var(--err)" : "var(--ink)";
  return (
    <span className="block h-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
      <span className="block h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </span>
  );
}

export default async function EventOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invites").select("*").eq("id", id).maybeSingle();
  if (!inv) notFound();

  const [guestsRes, rsvpsRes, tasksRes, expensesRes, vendorsRes] = await Promise.all([
    supabase.from("guests").select("*").eq("invite_id", id),
    supabase.from("rsvps").select("*").eq("invite_id", id),
    supabase.from("tasks").select("*").eq("invite_id", id).order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("expenses").select("*").eq("invite_id", id),
    supabase.from("vendors").select("*").eq("invite_id", id),
  ]);
  const guests = (guestsRes.data ?? []) as Guest[];
  const rsvps = (rsvpsRes.data ?? []) as Rsvp[];
  const tasks = (tasksRes.data ?? []) as Task[];
  const expenses = (expensesRes.data ?? []) as Expense[];
  const vendors = (vendorsRes.data ?? []) as Vendor[];

  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  const title = displayTitle(c) || "Untitled event";

  const days = (() => {
    if (!c.event.dateTime) return null;
    const ms = new Date(c.event.dateTime).getTime() - Date.now();
    return Number.isNaN(ms) ? null : Math.ceil(ms / 86_400_000);
  })();

  const repliedIds = new Set(rsvps.map((r) => r.guest_id).filter((x): x is string => !!x));
  const attending = rsvps.filter((r) => r.attending).length;
  const declined = rsvps.filter((r) => !r.attending).length;
  const awaiting = Math.max(0, guests.length - repliedIds.size);
  const guestsPct = pct(repliedIds.size, guests.length);

  const spent = expenses.reduce((s, e) => s + e.paid, 0);
  const committed = Math.max(0, expenses.reduce((s, e) => s + e.quoted, 0) - spent);
  const budgetTotal = expenses.reduce((s, e) => s + Math.max(e.quoted, e.paid), 0) || 1;
  const budgetLeft = Math.max(0, budgetTotal - spent - committed);
  const budgetPct = pct(spent + committed, budgetTotal);

  const tasksDone = tasks.filter((t) => t.done).length;
  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const overdue = tasks.filter((t) => !t.done && t.due_date && t.due_date < today).length;
  const dueSoon = tasks.filter((t) => !t.done && t.due_date && t.due_date >= today && t.due_date <= weekOut).length;
  const tasksPct = pct(tasksDone, tasks.length);
  const nextTasks = tasks.filter((t) => !t.done).slice(0, 5);

  const vendorsConfirmed = vendors.filter((v) => v.status === "Confirmed" || v.status === "Completed").length;
  const vendorsNegotiating = vendors.filter((v) => v.status === "Negotiating").length;
  const vendorsShortlisted = vendors.filter((v) => v.status === "Shortlisted").length;
  const vendorsPct = pct(vendorsConfirmed, vendors.length);

  const sent = guests.filter((g) => g.sent_at).length;
  const invitationPct = guests.length ? pct(sent, guests.length) : inv.published ? 100 : 0;

  const overall = Math.round((guestsPct + tasksPct + budgetPct + vendorsPct + invitationPct) / 5);

  const meals = { veg: 0, nonVeg: 0, other: 0 };
  for (const g of guests) {
    if (!g.meal) continue;
    if (/veg/i.test(g.meal) && !/non/i.test(g.meal)) meals.veg++;
    else if (/non/i.test(g.meal)) meals.nonVeg++;
    else meals.other++;
  }
  const withRoom = guests.filter((g) => g.hotel).length;

  const byCategory = new Map<string, { quoted: number; paid: number }>();
  for (const e of expenses) {
    const cur = byCategory.get(e.category) ?? { quoted: 0, paid: 0 };
    cur.quoted += e.quoted;
    cur.paid += e.paid;
    byCategory.set(e.category, cur);
  }
  const topCategories = [...byCategory.entries()].sort((a, b) => b[1].quoted - a[1].quoted).slice(0, 5);

  const upcoming = c.schedule.filter((s) => s.start).slice(0, 3);

  const cards = [
    { label: "Guests", value: guests.length ? `${repliedIds.size}` : "0", of: guests.length, note: `${attending} attending · ${awaiting} awaiting`, href: "guests", pct: guestsPct },
    { label: "Budget", value: money(spent), of: money(budgetTotal), note: `${money(committed)} committed · ${money(budgetLeft)} left`, href: "budget", pct: budgetPct },
    { label: "Tasks", value: `${tasksDone}`, of: tasks.length, note: `${overdue} overdue · ${dueSoon} due this week`, href: "checklist", pct: tasksPct },
    { label: "Vendors", value: `${vendorsConfirmed}`, of: null, note: `${vendorsNegotiating} negotiating · ${vendorsShortlisted} shortlisted`, href: "vendors", pct: vendorsPct, suffix: "confirmed" },
  ];

  const readiness = [
    { label: "Guests", value: guestsPct },
    { label: "Plan", value: tasksPct },
    { label: "Budget", value: budgetPct },
    { label: "Vendors", value: vendorsPct },
    { label: "Invitation", value: invitationPct },
  ];
  const weakest = readiness.reduce((a, b) => (b.value < a.value ? b : a), readiness[0]);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-9 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a href={inviteUrl(inv.slug)} target="_blank" rel="noopener" className="btn-secondary">
            <Eye size={16} strokeWidth={1.6} aria-hidden="true" />
            Preview invitation
          </a>
          <button type="button" className="btn-secondary" disabled>
            <Share2 size={16} strokeWidth={1.6} aria-hidden="true" />
            Share
          </button>
          <Link href={`/dashboard/${id}/edit`} className="btn-secondary">
            <Settings size={16} strokeWidth={1.6} aria-hidden="true" />
            Event settings
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-eyebrow text-[11px]">
            {EVENT_TYPES[inv.event_type as EventType].label.toUpperCase()} · {c.event.dateTime ? longDate(c.event.dateTime, c.event.timezone, "en-IN").toUpperCase() : "DATE NOT SET"} · {(c.event.city || "").toUpperCase()}
          </p>
          <h1 className="m-dis mt-2 text-[clamp(2.6rem,6vw,4.5rem)] leading-none">{title}</h1>
        </div>
        {days !== null && (
          <div className="text-right">
            <p className="m-dis text-5xl leading-none">{Math.max(0, days)}</p>
            <p className="m-eyebrow mt-1 text-[11px]">Days to go</p>
          </div>
        )}
      </div>

      <div className="mt-8 h-px" style={{ background: "var(--line)" }} />

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border sm:grid-cols-4" style={{ borderColor: "var(--line)", background: "var(--line)" }}>
        {cards.map((card) => (
          <Link key={card.label} href={`/dashboard/${id}/${card.href}`} className="p-5" style={{ background: "var(--surface)" }}>
            <span className="m-eyebrow text-[10.5px]">{card.label}</span>
            <p className="m-dis mt-2 text-[28px] leading-none">
              {card.value}
              {card.of !== null && <span className="text-base" style={{ color: "var(--ink-3)" }}>/{card.of}</span>}
              {card.suffix && <span className="ml-1 text-base font-sans" style={{ color: "var(--ink-3)" }}>{card.suffix}</span>}
            </p>
            <div className="mt-2.5">
              <Bar value={card.pct} />
            </div>
            <p className="mt-2 text-xs leading-snug" style={{ color: "var(--ink-3)" }}>
              {card.note}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-end gap-10 border-t pt-8" style={{ borderColor: "var(--line)" }}>
        <div>
          <p className="m-dis text-6xl leading-none">
            {overall}
            <span className="text-3xl">%</span>
          </p>
          <p className="m-hand mt-2 text-[15px]" style={{ color: "var(--ink-2)" }}>
            {overall >= 80 ? "Almost there." : overall >= 50 ? "You're well on your way." : "Plenty of time yet."}
          </p>
        </div>
        <div className="flex flex-1 flex-wrap gap-6">
          {readiness.map((r) => (
            <div key={r.label} style={{ minWidth: 90 }}>
              <span className="block h-8 w-16 overflow-hidden rounded-[4px]" style={{ background: "var(--paper-2)" }}>
                <span className="block h-full rounded-[4px]" style={{ width: `${r.value}%`, background: "var(--forest)" }} />
              </span>
              <p className="mt-2 text-xs" style={{ color: "var(--ink-3)" }}>
                {r.label}
              </p>
              <p className="text-sm font-medium">{r.value}%</p>
            </div>
          ))}
        </div>
      </div>
      {weakest.value < 60 && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-3)" }}>
          {weakest.label} is behind:{" "}
          {weakest.label === "Guests" && `${awaiting} of ${guests.length} guests haven't replied yet.`}
          {weakest.label === "Plan" && `${overdue + dueSoon} task${overdue + dueSoon === 1 ? "" : "s"} due, ${tasksDone} of ${tasks.length} done.`}
          {weakest.label === "Budget" && `${money(committed)} committed but not yet paid.`}
          {weakest.label === "Vendors" && `${vendorsShortlisted + vendorsNegotiating} vendor${vendorsShortlisted + vendorsNegotiating === 1 ? "" : "s"} not confirmed yet.`}
          {weakest.label === "Invitation" && `${guests.length - sent} of ${guests.length} guests haven't been sent their link yet.`}
        </p>
      )}

      <div className="mt-12 grid gap-10 border-t pt-10 lg:grid-cols-[1fr_1.1fr]" style={{ borderColor: "var(--line)" }}>
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="m-dis text-2xl">Next up</h2>
            <Link href={`/dashboard/${id}/checklist`} className="text-xs" style={{ color: "var(--ink-3)" }}>
              All tasks
            </Link>
          </div>
          <NextUpTasks inviteId={id} tasks={nextTasks} />

          <div className="mt-6 flex items-center gap-4 rounded-[12px] p-4" style={{ background: "var(--paper-2)" }}>
            <div className="h-[76px] w-[54px] shrink-0 rounded-[4px]" style={{ background: c.theme.colors.bg, border: "1px solid var(--line)" }} />
            <div className="min-w-0 flex-1">
              <p className="m-eyebrow text-[10px]">Invitation</p>
              <p className="m-dis mt-1 truncate text-lg">{title}</p>
              <p className="truncate text-xs" style={{ color: "var(--ink-3)" }}>
                {inv.published ? `Published · sent to ${sent} of ${guests.length}` : "Not published yet"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link href={`/dashboard/${id}/edit`} className="btn-secondary">
                Edit design
              </Link>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="m-dis text-2xl">Event snapshot</h2>
            <span className="text-xs" style={{ color: "var(--ink-3)" }}>
              Updated as replies and payments arrive
            </span>
          </div>

          {upcoming.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium">Upcoming schedule</p>
              <ul className="mt-2">
                {upcoming.map((s) => (
                  <li key={s.key} className="flex items-baseline gap-3 py-2 text-sm" style={{ borderTop: "1px solid var(--line)" }}>
                    <span className="w-20 shrink-0" style={{ color: "var(--ink-3)" }}>
                      {new Date(s.start).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{s.title}</span>
                    <span className="shrink-0 text-xs" style={{ color: "var(--ink-3)" }}>
                      {new Date(s.start).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Guest response</p>
              <span className="text-xs" style={{ color: "var(--ink-3)" }}>
                {guests.length} invited · {repliedIds.size} replied
              </span>
            </div>
            <span className="mt-2.5 flex h-2 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
              <span style={{ width: `${pct(attending, guests.length || 1)}%`, background: "var(--forest)" }} />
              <span style={{ width: `${pct(declined, guests.length || 1)}%`, background: "var(--rose-ink)" }} />
            </span>
            <p className="mt-2.5 text-xs" style={{ color: "var(--ink-3)" }}>
              <strong style={{ color: "var(--ink)" }}>{attending}</strong> attending · <strong style={{ color: "var(--ink)" }}>{declined}</strong> declined ·{" "}
              <strong style={{ color: "var(--ink)" }}>{awaiting}</strong> awaiting
            </p>
            {(meals.veg || meals.nonVeg || meals.other) > 0 && (
              <p className="mt-2 text-sm">
                <strong>{meals.veg}</strong> vegetarian, <strong>{meals.nonVeg}</strong> non-veg, <strong>{meals.other}</strong> other · <strong>{withRoom}</strong> have a room on file.
              </p>
            )}
          </div>

          {topCategories.length > 0 && (
            <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Budget breakdown</p>
                <span className="text-xs" style={{ color: "var(--ink-3)" }}>
                  {money(spent)} spent · {money(committed)} committed
                </span>
              </div>
              <ul className="mt-2.5 grid gap-2">
                {topCategories.map(([cat, sum]) => (
                  <li key={cat} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 truncate" style={{ color: "var(--ink-2)" }}>
                      {cat}
                    </span>
                    <span className="flex-1">
                      <Bar value={pct(sum.paid, sum.quoted || 1)} />
                    </span>
                    <span className="w-24 shrink-0 text-right text-xs tabular-nums" style={{ color: "var(--ink-3)" }}>
                      {money(sum.paid)} / {money(sum.quoted)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {vendors.length > 0 && (
            <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Vendor status</p>
                <span className="text-xs" style={{ color: "var(--ink-3)" }}>
                  {vendorsConfirmed} confirmed · {vendorsNegotiating} negotiating · {vendorsShortlisted} shortlisted
                </span>
              </div>
              <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                {vendors.map((v) => (
                  <li key={v.id} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: v.status === "Confirmed" || v.status === "Completed" ? "var(--ok)" : v.status === "Negotiating" ? "var(--warn)" : "var(--ink-3)" }}
                    />
                    <span className="min-w-0 flex-1 truncate">{v.name}</span>
                    <span className="shrink-0 text-xs" style={{ color: "var(--ink-3)" }}>
                      {v.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
