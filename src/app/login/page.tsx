"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
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
          No password. We email you a link, or use Google.
        </p>
      </div>

      {sent ? (
        <div className="card p-5">
          <p className="font-medium">Check your inbox</p>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            A sign-in link went to {email}. It opens your dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={sendLink} className="grid gap-4">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={busy}>
            {busy ? "Sending" : "Email me a link"}
          </button>
          <button type="button" className="btn-secondary justify-center" onClick={google}>
            Continue with Google
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
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
