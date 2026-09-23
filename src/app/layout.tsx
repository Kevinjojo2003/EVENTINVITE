import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const app = process.env.NEXT_PUBLIC_APP_NAME || "K-Invites";

export const metadata: Metadata = {
  title: app,
  description: "Invitations people open with the sound on.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: app },
};

export const viewport: Viewport = {
  themeColor: "#1f1a17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Jost:wght@300;400;500&display=swap" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
