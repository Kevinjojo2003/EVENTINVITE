import Link from "next/link";
import { EVENT_TYPES } from "@/lib/types";

export default function Landing() {
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "yourdomain.com";
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-[0.3em]">{app}</span>
        <nav className="flex items-center gap-3">
          <Link href="/preview" className="btn-secondary">
            See a sample
          </Link>
          <Link href="/login" className="btn-primary">
            Create an invite
          </Link>
        </nav>
      </header>

      <section className="grid gap-10 py-20 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1.02]" style={{ textWrap: "balance" }}>
            Invitations people open with the sound on.
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: "var(--ink-2)" }}>
            A sealed envelope, your song, your photos, your colours. Every event gets its own address, like{" "}
            <span className="whitespace-nowrap font-medium" style={{ color: "var(--ink)" }}>
              meera-arjun.{root}
            </span>
            , and every guest gets a personal link you send on WhatsApp.
          </p>
        </div>
        <div className="md:col-span-4">
          <ul className="grid gap-3 text-sm">
            <li className="card px-4 py-3">Live preview while you edit</li>
            <li className="card px-4 py-3">Upload an MP3, paste a YouTube link, or use the built-in score</li>
            <li className="card px-4 py-3">RSVPs, guest lists, QR tickets and door check-in</li>
          </ul>
        </div>
      </section>

      <section className="border-t py-14" style={{ borderColor: "var(--line)" }}>
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--ink-2)" }}>
          Made for
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(EVENT_TYPES).map(([k, t]) => (
            <li key={k} className="card p-5">
              <p className="font-medium">{t.label}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
                {t.blurb}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
