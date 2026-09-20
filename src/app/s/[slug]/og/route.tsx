import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeConfig, displayTitle } from "@/lib/themes";
import { longDate } from "@/lib/format";
import { language } from "@/lib/i18n";
import type { EventType } from "@/lib/types";

// The card WhatsApp and social apps show when the link is pasted. With ?g=<guest token> it
// reads "Exclusive invitation for <guest>", so every guest's preview is personal.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = new URL(req.url).searchParams.get("g");
  const db = createAdminClient();
  const { data } = await db.from("invites").select("id, event_type, published, config").eq("slug", slug.toLowerCase()).maybeSingle();
  const c = data?.published ? normalizeConfig(data.config, data.event_type as EventType) : null;

  let guestName = "";
  if (c && g && data) {
    const { data: gr } = await db.from("guests").select("name").eq("invite_id", data.id).eq("token", g).maybeSingle();
    guestName = gr?.name ?? "";
  }

  const colors = c?.theme.colors ?? { bg: "#0e2521", bgDeep: "#081a17", ink: "#f3ebdb", inkDim: "#c9bfa9", accent: "#d9be82", accentDeep: "#b4964f" };
  const title = (c && displayTitle(c)) || "You are invited";
  const date = c ? longDate(c.event.dateTime, c.event.timezone || "Asia/Kolkata", language(c.event.language).locale) : "";
  const where = c ? [c.venue.name, c.event.city].filter(Boolean).join(" · ") : "";
  const headline = c?.event.headline ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(160deg, ${colors.bg}, ${colors.bgDeep})`,
          color: colors.ink,
          fontFamily: "Georgia, serif",
          padding: 60,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", width: 420, height: 2, background: colors.accent, opacity: 0.7 }} />
        {guestName ? (
          <div style={{ display: "flex", fontSize: 26, marginTop: 36, color: colors.accent, letterSpacing: 6, textTransform: "uppercase" }}>{`Exclusive invitation for ${guestName}`}</div>
        ) : null}
        <div style={{ display: "flex", fontSize: title.length > 24 ? 84 : 112, fontStyle: "italic", marginTop: guestName ? 26 : 44, lineHeight: 1.05 }}>{title}</div>
        {headline ? <div style={{ display: "flex", fontSize: 34, marginTop: 22, color: colors.inkDim }}>{headline}</div> : null}
        {date ? <div style={{ display: "flex", fontSize: 40, marginTop: 36, color: colors.accent }}>{date}</div> : null}
        {where ? <div style={{ display: "flex", fontSize: 28, marginTop: 14, color: colors.inkDim, letterSpacing: 4, textTransform: "uppercase" }}>{where}</div> : null}
        <div style={{ display: "flex", width: 420, height: 2, background: colors.accent, opacity: 0.7, marginTop: 44 }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
