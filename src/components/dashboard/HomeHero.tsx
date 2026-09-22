import Link from "next/link";
import { Image as ImageIcon, ListChecks, MailQuestion, Megaphone, Radio, Users, Wallet } from "lucide-react";
import type { Expense, Guest, Invite, Rsvp, EventType, Task } from "@/lib/types";
import { displayTitle, normalizeConfig } from "@/lib/themes";
import { inviteUrl, longDate } from "@/lib/format";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// The dashboard's "home screen": one event, how it is doing, and what to do about it. Adapted
// from the design canvas's App-Home board to the existing web dashboard.
export function HomeHero({ invite, guests, rsvps, tasks, expenses }: { invite: Invite; guests: Guest[]; rsvps: Rsvp[]; tasks: Task[]; expenses: Expense[] }) {
  const c = normalizeConfig(invite.config, invite.event_type as EventType);
  const title = displayTitle(c) || "Your event";

  const repliedGuestIds = new Set(rsvps.map((r) => r.guest_id).filter((x): x is string => !!x));
  const repliedCount = Math.min(guests.length, repliedGuestIds.size);
  const unsent = guests.filter((g) => !g.sent_at).length;
  const unreplied = Math.max(0, guests.length - repliedCount);
  const pct = guests.length ? Math.round((repliedCount / guests.length) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const tasksDone = tasks.filter((t) => t.done).length;
  const tasksOverdue = tasks.filter((t) => !t.done && t.due_date && t.due_date < today).length;
  const tasksDueSoon = tasks.filter((t) => !t.done && t.due_date && t.due_date >= today && t.due_date <= weekOut).length;
  const spent = expenses.reduce((s, e) => s + e.paid, 0);
  const quotedSum = expenses.reduce((s, e) => s + e.quoted, 0);
  const dueExpenses = expenses.filter((e) => e.quoted > e.paid).length;

  const days = (() => {
    if (!c.event.dateTime) return null;
    const ms = new Date(c.event.dateTime).getTime() - Date.now();
    if (Number.isNaN(ms)) return null;
    return Math.ceil(ms / 86_400_000);
  })();

  const needs: { icon: typeof Users; text: string; note: string; href: string }[] = [];
  if (!invite.published) needs.push({ icon: Megaphone, text: "This event isn't live yet", note: "Guests see a not-found page until you publish it", href: `/dashboard/${invite.id}` });
  if (guests.length === 0) needs.push({ icon: Users, text: "No guests added yet", note: "Add a few names, or bring in a list from your phone", href: `/dashboard/${invite.id}/guests` });
  else {
    if (unsent > 0) needs.push({ icon: Users, text: `${unsent} invitation${unsent === 1 ? "" : "s"} not sent yet`, note: "Send the personal link on WhatsApp, one tap each", href: `/dashboard/${invite.id}/guests` });
    if (unreplied > 0) needs.push({ icon: MailQuestion, text: `${unreplied} guest${unreplied === 1 ? "" : "s"} have not replied`, note: "A reminder helps closer to the day", href: `/dashboard/${invite.id}/guests` });
  }
  if (!c.heroPhoto && c.photos.length === 0) needs.push({ icon: ImageIcon, text: "Add a photo or two", note: "It is the first thing WhatsApp shows", href: `/dashboard/${invite.id}` });
  if (tasksOverdue > 0) needs.push({ icon: ListChecks, text: `${tasksOverdue} task${tasksOverdue === 1 ? "" : "s"} overdue`, note: "Clear these first, then the rest of the week", href: `/dashboard/${invite.id}/checklist` });
  else if (tasksDueSoon > 0) needs.push({ icon: ListChecks, text: `${tasksDueSoon} task${tasksDueSoon === 1 ? "" : "s"} due this week`, note: "Stay ahead of the checklist", href: `/dashboard/${invite.id}/checklist` });
  if (dueExpenses > 0) needs.push({ icon: Wallet, text: `${dueExpenses} vendor payment${dueExpenses === 1 ? "" : "s"} still due`, note: "Clear balances before the event", href: `/dashboard/${invite.id}/budget` });

  const r = 24;
  const circumference = 2 * Math.PI * r;

  return (
    <section aria-labelledby="home-hero-title">
      {days !== null && (
        <p className="text-sm" style={{ color: "var(--ink-2)" }}>
          {days > 0 ? `${days} day${days === 1 ? "" : "s"} to go` : days === 0 ? "Today is the day" : "This event has passed"}
        </p>
      )}
      <h1 id="home-hero-title" className="mt-1 text-3xl font-medium">
        {title}
      </h1>

      {days !== null && days >= 0 && days <= 1 && (
        <Link
          href={`/dashboard/${invite.id}/day`}
          className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: "#2a1414", color: "#fbe7e7" }}
        >
          <Radio size={18} aria-hidden="true" />
          <span className="text-sm font-medium">{days === 0 ? "It's today — open Event Day mode" : "Tomorrow — check Event Day mode is ready"}</span>
        </Link>
      )}

      <Link href={`/dashboard/${invite.id}`} className="card mt-5 block overflow-hidden" style={{ boxShadow: "0 26px 54px -34px rgba(14,37,33,.35)" }}>
        <div
          className="flex flex-col items-center justify-center gap-1 px-6 py-8 text-center"
          style={{ background: c.theme.colors.bg, color: c.theme.colors.ink }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: c.theme.colors.accent }}>
            {c.texts.eyebrow || " "}
          </p>
          <p className="text-2xl" style={{ fontFamily: "Georgia, serif" }}>
            {title}
          </p>
          {c.event.dateTime && (
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: c.theme.colors.accentDeep }}>
              {longDate(c.event.dateTime, c.event.timezone, "en-IN")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 p-4">
          {guests.length > 0 && (
            <div className="relative shrink-0" style={{ width: 56, height: 56 }} aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="6" />
                <circle
                  cx="28"
                  cy="28"
                  r={r}
                  fill="none"
                  stroke="var(--ok)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                  transform="rotate(-90 28 28)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold">{pct}%</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium">{invite.slug}</p>
            <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
              {guests.length > 0 ? `${repliedCount} of ${guests.length} replied` : "No guests yet"}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: invite.published ? "#e3f3e6" : "var(--paper-2)", color: invite.published ? "#1f6b34" : "var(--ink-2)" }}
          >
            {invite.published ? "Live" : "Draft"}
          </span>
        </div>
      </Link>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Guests replied", value: guests.length ? `${pct}%` : "—", href: `/dashboard/${invite.id}/guests` },
          { label: "Tasks done", value: tasks.length ? `${tasksDone}/${tasks.length}` : "—", href: `/dashboard/${invite.id}/checklist` },
          { label: "Spent", value: quotedSum || spent ? money(spent) : "—", href: `/dashboard/${invite.id}/budget` },
          { label: "Budget left", value: quotedSum ? money(Math.max(0, quotedSum - spent)) : "—", href: `/dashboard/${invite.id}/budget` },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="card p-3">
            <p className="text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>
              {s.label}
            </p>
            <p className="mt-1 text-lg font-medium tabular-nums">{s.value}</p>
          </Link>
        ))}
      </div>

      {needs.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
            Needs you
          </p>
          <ul className="mt-2">
            {needs.map((n) => (
              <li key={n.text} style={{ borderTop: "1px solid var(--line)" }}>
                <Link href={n.href} className="flex items-center gap-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--paper-2)", color: "var(--gold-ink)" }}>
                    <n.icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{n.text}</span>
                    <span className="block truncate text-[13px]" style={{ color: "var(--ink-3)" }}>
                      {n.note}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <a href={inviteUrl(invite.slug)} target="_blank" rel="noopener" className="mt-4 block truncate text-sm underline-offset-4 hover:underline" style={{ color: "var(--ink-2)" }}>
        {inviteUrl(invite.slug).replace(/^https?:\/\//, "")}
      </a>
    </section>
  );
}
