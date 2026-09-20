import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { normalizeConfig, displayTitle } from "@/lib/themes";
import { Invitation } from "@/components/invite/Invitation";
import type { EventType } from "@/lib/types";
import { inviteUrl } from "@/lib/format";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ g?: string }> };

async function load(slug: string) {
  const db = createAdminClient();
  const { data } = await db.from("invites").select("id, owner_id, slug, event_type, published, config").eq("slug", slug.toLowerCase()).maybeSingle();
  return data;
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { g } = await searchParams;
  const inv = await load(slug);
  if (!inv) return { title: "Invitation", robots: { index: false, follow: false } };
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  const title = displayTitle(c) || "Invitation";

  // A personal link previews as "Exclusive invitation for <guest>" when pasted in WhatsApp.
  let guestName = "";
  if (g && inv.published) {
    const { data } = await createAdminClient().from("guests").select("name").eq("invite_id", inv.id).eq("token", g).maybeSingle();
    guestName = data?.name ?? "";
  }
  if (guestName) {
    const card = `${inviteUrl(inv.slug)}/og?g=${encodeURIComponent(g!)}`;
    return {
      robots: { index: false, follow: false },
      title: `${title} · for ${guestName}`,
      description: `Exclusive invitation for ${guestName}`,
      openGraph: { title: `${title} · Exclusive invitation for ${guestName}`, description: c.event.headline, images: [{ url: card, width: 1200, height: 630 }] },
      twitter: { card: "summary_large_image" },
    };
  }
  return {
    // A wedding page holds a home address, dates and family names: keep it out of search results.
    robots: { index: false, follow: false },
    title,
    description: c.event.headline,
    // With a host photo, use it. Otherwise the generated card in ./og is used.
    openGraph: {
      title,
      description: c.event.headline,
      images: [c.heroPhoto || c.photos[0]?.url || `${inviteUrl(inv.slug)}/og`],
    },
  };
}

export default async function PublicInvite({ params, searchParams }: Params) {
  const { slug } = await params;
  const { g } = await searchParams;
  const inv = await load(slug);
  if (!inv) notFound();

  // Unpublished invites are visible only to their owner (so they can check the real URL).
  if (!inv.published) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== inv.owner_id) notFound();
  }

  let guest: { name: string; token: string; events: string[] } | null = null;
  if (g) {
    const db = createAdminClient();
    const { data } = await db.from("guests").select("*").eq("invite_id", inv.id).eq("token", g).maybeSingle();
    guest = data ? { name: data.name, token: data.token, events: Array.isArray(data.events) ? data.events : [] } : null;
  }

  const config = normalizeConfig(inv.config, inv.event_type as EventType);
  return <Invitation config={config} slug={inv.slug} guest={guest} />;
}
