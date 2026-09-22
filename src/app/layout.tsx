import type { Metadata, Viewport } from "next";
import "./globals.css";

const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";

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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Hanken+Grotesk:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
