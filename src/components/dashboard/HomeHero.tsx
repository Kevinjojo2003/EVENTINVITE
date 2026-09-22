import Link from "next/link";
import { Image as ImageIcon, MailQuestion, Megaphone, Users } from "lucide-react";
import type { Guest, Invite, Rsvp, EventType } from "@/lib/types";
import { displayTitle, normalizeConfig } from "@/lib/themes";
import { inviteUrl, longDate } from "@/lib/format";

// The dashboard's "home screen": one event, how it is doing, and what to do about it. Adapted
// from the design canvas's App-Home board to the existing web dashboard.
export function HomeHero({ invite, guests, rsvps }: { invite: Invite; guests: Guest[]; rsvps: Rsvp[] }) {
  const c = normalizeConfig(invite.config, invite.event_type as EventType);
  const title = displayTitle(c) || "Your event";

  const repliedGuestIds = new Set(rsvps.map((r) => r.guest_id).filter((x): x is string => !!x));
  const repliedCount = Math.min(guests.length, repliedGuestIds.size);
  const unsent = guests.filter((g) => !g.sent_at).length;
  const unreplied = Math.max(0, guests.length - repliedCount);
  const pct = guests.length ? Math.round((repliedCount / guests.length) * 100) : 0;

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
