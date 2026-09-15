import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { normalizeConfig, displayTitle } from "@/lib/themes";
import { Invitation } from "@/components/invite/Invitation";
import type { EventType } from "@/lib/types";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ g?: string }> };

async function load(slug: string) {
  const db = createAdminClient();
  const { data } = await db.from("invites").select("id, owner_id, slug, event_type, published, config").eq("slug", slug.toLowerCase()).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const inv = await load(slug);
  if (!inv) return { title: "Invitation" };
  const c = normalizeConfig(inv.config, inv.event_type as EventType);
  const title = displayTitle(c) || "Invitation";
  return {
    title,
    description: c.event.headline,
    openGraph: { title, description: c.event.headline, images: c.heroPhoto ? [c.heroPhoto] : c.photos[0] ? [c.photos[0].url] : [] },
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

  let guest: { name: string; token: string } | null = null;
  if (g) {
    const db = createAdminClient();
    const { data } = await db.from("guests").select("name, token").eq("invite_id", inv.id).eq("token", g).maybeSingle();
    guest = data ?? null;
  }

  const config = normalizeConfig(inv.config, inv.event_type as EventType);
  return <Invitation config={config} slug={inv.slug} guest={guest} />;
}
