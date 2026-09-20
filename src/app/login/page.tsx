"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "link" ? "That sign-in link has expired or was already used. Request a new one below." : "");
  const [wait, setWait] = useState(0); // seconds until another link can be requested
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";

  // A short pause between requests, so a second tap does not use up the hourly email allowance.
  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (wait > 0) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) {
      // Say what happened in plain words, not the raw provider message.
      const m = error.message.toLowerCase();
      if (m.includes("rate limit") || error.status === 429) {
        setError("Too many sign-in emails were requested. Please wait a few minutes and try again.");
        setWait(60);
      } else if (m.includes("invalid") && m.includes("email")) setError("That email address does not look right. Please check it.");
      else setError("We could not send the link. Please check your connection and try again.");
    } else {
      setError("");
      setSent(true);
      setWait(60);
    }
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-5 py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--ink-2)" }}>
          {app}
        </p>
        <h1 className="mt-2 text-3xl font-medium">Sign in</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
          No password. We email you a sign-in link.
        </p>
      </div>

      {sent ? (
        <div className="card p-5">
          <p className="font-medium">Check your inbox</p>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            A sign-in link went to {email}. It opens your dashboard. It can take a minute, and it may land in spam or promotions.
          </p>
          <button type="button" className="btn-secondary mt-4" disabled={wait > 0 || busy} onClick={(e) => sendLink(e as unknown as React.FormEvent)}>
            {wait > 0 ? `Send again in ${wait}s` : "Send the link again"}
          </button>
          <button type="button" className="mt-3 block text-sm underline underline-offset-4" style={{ color: "var(--ink-2)" }} onClick={() => setSent(false)}>
            Use a different email
          </button>
          {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
        </div>
      ) : (
        <form onSubmit={sendLink} className="grid gap-4">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={busy || wait > 0}>
            {busy ? "Sending" : wait > 0 ? `Wait ${wait}s` : "Email me a link"}
          </button>
          {process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1" && (
            <button type="button" className="btn-secondary justify-center" onClick={google}>
              Continue with Google
            </button>
          )}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </form>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
