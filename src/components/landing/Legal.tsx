import Link from "next/link";
import type { ReactNode } from "react";

// Shared frame for the plain-language legal pages.
export function Legal({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500&family=Jost:wght@300;400;500;600&display=swap" />
      <header className="flex items-center justify-between border-b px-5 py-4 md:px-12" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <Link href="/" className="m-dis text-[22px]">{app}</Link>
        <Link href="/login" className="m-btn m-btn-pri m-btn-sm">Create invitation</Link>
      </header>
      <main className="mx-auto max-w-[720px] px-5 py-16 md:py-20">
        <p className="m-eyebrow">Legal</p>
        <h1 className="m-dis mt-3 text-[clamp(2rem,6vw,3rem)] leading-[1.1]">{title}</h1>
        <p className="mt-3 text-sm" style={{ color: "var(--ink-3)" }}>Last updated {updated}</p>
        <div className="mt-10 grid gap-8 text-[17px] leading-[1.75]" style={{ color: "var(--ink-2)" }}>{children}</div>
      </main>
    </>
  );
}

export function H({ children }: { children: ReactNode }) {
  return <h2 className="m-dis text-[24px]" style={{ color: "var(--ink)" }}>{children}</h2>;
}
