import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="m-eyebrow">404</p>
      <h1 className="m-dis text-[clamp(2rem,6vw,3.2rem)] leading-[1.1]">We could not find that page.</h1>
      <p className="text-[17px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
        If you were sent a link to an invitation, it may not be published yet, or the address may have a typo. Ask the host to check the link.
      </p>
      <Link href="/" className="m-btn m-btn-pri mt-2">
        Back to the home page
      </Link>
    </main>
  );
}
