import type { MetadataRoute } from "next";

// Next.js serves this at /manifest.webmanifest. It is what makes "Add to Home Screen"
// (on a phone opening the dashboard) behave like an app: its own icon, no browser chrome.
export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";
  return {
    name: `${name} — invitations`,
    short_name: name,
    description: "Create and send an invitation, watch the replies, let guests in at the door.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#1f1a17",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
