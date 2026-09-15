import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeConfig, displayTitle, FONT_PAIRS, fontsHref } from "@/lib/themes";
import { language } from "@/lib/i18n";
import { longDate, dayLabel, inviteUrl } from "@/lib/format";
import { Ticket } from "@/components/invite/Ticket";
import type { EventType } from "@/lib/types";

type Params = { params: Promise<{ slug: string; code: string }> };

export default async function TicketPage({ params }: Params) {
  const { slug, code } = await params;
  const db = createAdminClient();
  const { data: inv } = await db.from("invites").select("id, slug, event_type, published, config").eq("slug", slug.toLowerCase()).maybeSingle();
  if (!inv || !inv.published) notFound();
  const { data: r } = await db.from("rsvps").select("name, ticket_code, checked_in_at, attending").eq("invite_id", inv.id).eq("ticket_code", code.toUpperCase()).maybeSingle();
  if (!r || !r.attending) notFound();

  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  const L = c.labels;
  const lang = language(c.event.language);
  const fonts = FONT_PAIRS[c.theme.fonts];
  const vars = {
    "--inv-bg": c.theme.colors.bg,
    "--inv-bg-deep": c.theme.colors.bgDeep,
    "--inv-ink": c.theme.colors.ink,
    "--inv-ink-dim": c.theme.colors.inkDim,
    "--inv-accent": c.theme.colors.accent,
    "--inv-accent-deep": c.theme.colors.accentDeep,
    "--inv-display": fonts.display,
    "--inv-body": fonts.body,
  } as React.CSSProperties;
  const main = c.schedule[0];

  return (
    <div className="inv flex min-h-screen flex-col items-center justify-center gap-8 px-5 py-16" style={vars} dir={lang.dir}>
      <link rel="stylesheet" href={fontsHref(c.theme.fonts) + (lang.script ? `&${lang.script.google}` : "")} />
      <p className="eyebrow">{displayTitle(c)}</p>
      <Ticket
        code={r.ticket_code}
        url={`${inviteUrl(inv.slug)}/ticket/${r.ticket_code}`}
        name={r.name}
        eventTitle={c.hosts.subline || displayTitle(c)}
        dateLine={longDate(c.event.dateTime, c.event.timezone, lang.locale) || dayLabel(main?.start ?? "", c.event.timezone, lang.locale)}
        venue={c.venue.name || main?.place || ""}
        checkedInAt={r.checked_in_at}
        labels={{ admitOne: L.admitOne, showAtDoor: L.showAtDoor, checkedIn: L.checkedIn, when: L.when, where: L.where }}
      />
      <a href={inviteUrl(inv.slug)} className="dim text-sm underline-offset-4 hover:underline">
        {L.backToInvite}
      </a>
    </div>
  );
}
