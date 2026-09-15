"use client";
import { useEffect, useState } from "react";
import { Invitation } from "@/components/invite/Invitation";
import { normalizeConfig, SAMPLE_CONFIG } from "@/lib/themes";
import type { InviteConfig } from "@/lib/types";

// Lives inside the editor's iframe. The editor posts every draft change here, so the
// preview is the real template rendering the real config, with nothing saved.
export default function PreviewPage() {
  const [config, setConfig] = useState<InviteConfig | null>(null);
  const [slug, setSlug] = useState("preview");

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (d && d.type === "invite-config" && d.config) {
        setConfig(normalizeConfig(d.config, d.config.event?.type));
        if (d.slug) setSlug(d.slug);
      }
    };
    window.addEventListener("message", onMsg);
    window.parent?.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  if (!config) {
    if (typeof window !== "undefined" && window.parent === window) {
      return <Invitation config={SAMPLE_CONFIG} slug="sample" preview />;
    }
    return <div style={{ minHeight: "100vh", background: "#0e2521" }} />;
  }
  return <Invitation config={config} slug={slug} preview />;
}
