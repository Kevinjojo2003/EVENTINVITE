"use client";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { devSignIn } from "./dev-actions";

type Mode = "password" | "code";
type Step = "password" | "code-request" | "code-verify" | "set-password";

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/dashboard";
  const [mode, setMode] = useState<Mode>("password");
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "link" ? "That sign-in link expired. Request a new code below." : "");
  const [wait, setWait] = useState(0); // seconds until another code can be requested
  const app = process.env.NEXT_PUBLIC_APP_NAME || "K-Invites";
  const [devPending, startDev] = useTransition();
  const [devError, setDevError] = useState("");

  useEffect(() => setStep(mode === "password" ? "password" : "code-request"), [mode]);

  // A short pause between requests, so a second tap does not use up the hourly email allowance.
  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("invalid")) setError("That email or password isn't right.");
      else setError("Could not sign in. Please try again.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (wait > 0) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    // emailRedirectTo is kept as a fallback in case someone clicks the link in the email
    // instead of typing the code.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("rate limit") || error.status === 429) {
        setError("Too many codes were requested. Please wait a few minutes and try again.");
        setWait(60);
      } else if (m.includes("invalid") && m.includes("email")) setError("That email address does not look right. Please check it.");
      else setError("We could not send the code. Please check your connection and try again.");
    } else {
      setError("");
      setCode("");
      setStep("code-verify");
      setWait(60);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy || code.trim().length < 6) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("expired")) setError("That code has expired. Send a new one below.");
      else if (m.includes("invalid") || m.includes("token")) setError("That code isn't right. Check the email and try again.");
      else setError("Could not verify that code. Please try again.");
      return;
    }
    // First time in: offer to set a password, so next time doesn't need a fresh code.
    if (!data.user?.user_metadata?.has_password) {
      setStep("set-password");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function setPasswordAndContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) return setError("Use at least 8 characters.");
    if (newPassword !== newPassword2) return setError("Those two passwords don't match.");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword, data: { has_password: true } });
    setBusy(false);
    if (error) return setError("Could not set a password right now. You're still signed in — try again from your account later.");
    router.push(next);
    router.refresh();
  }

  function skipPassword() {
    router.push(next);
    router.refresh();
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
        <h1 className="mt-2 text-3xl font-medium">{step === "set-password" ? "Set a password" : "Sign in"}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
          {step === "password" && "Your email and password."}
          {step === "code-request" && "We'll email you a 6-digit code — no password needed."}
          {step === "code-verify" && "Enter the code we sent you."}
          {step === "set-password" && "You're signed in. Add a password so you can skip the code next time (at least 8 characters)."}
        </p>
      </div>

      {step === "password" && (
        <form onSubmit={signInPassword} className="grid gap-4">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={busy}>
            {busy ? "Signing in" : "Sign in"}
          </button>
          <button type="button" className="text-sm underline underline-offset-4" style={{ color: "var(--ink-2)" }} onClick={() => setMode("code")}>
            No password yet? Sign in with a one-time code
          </button>
          {process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1" && (
            <button type="button" className="btn-secondary justify-center" onClick={google}>
              Continue with Google
            </button>
          )}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </form>
      )}

      {step === "code-request" && (
        <form onSubmit={sendCode} className="grid gap-4">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={busy || wait > 0}>
            {busy ? "Sending" : wait > 0 ? `Wait ${wait}s` : "Email me a code"}
          </button>
          <button type="button" className="text-sm underline underline-offset-4" style={{ color: "var(--ink-2)" }} onClick={() => setMode("password")}>
            Have a password? Sign in with it instead
          </button>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </form>
      )}

      {step === "code-verify" && (
        <form onSubmit={verifyCode} className="card grid gap-4 p-5">
          <div>
            <p className="font-medium">Check your inbox</p>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
              A 6-digit code went to {email}. It can take a minute, and it may land in spam or promotions.
            </p>
          </div>
          <div className="field">
            <label htmlFor="code">Code</label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              style={{ fontSize: "1.4rem", letterSpacing: "0.3em", textAlign: "center" }}
            />
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={busy || code.length < 6}>
            {busy ? "Verifying" : "Verify and sign in"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" className="underline underline-offset-4" style={{ color: "var(--ink-2)" }} disabled={wait > 0 || busy} onClick={(e) => sendCode(e as unknown as React.FormEvent)}>
              {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
            </button>
            <button type="button" className="underline underline-offset-4" style={{ color: "var(--ink-2)" }} onClick={() => setStep("code-request")}>
              Use a different email
            </button>
          </div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </form>
      )}

      {step === "set-password" && (
        <form onSubmit={setPasswordAndContinue} className="grid gap-4">
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input id="new-password" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="new-password-2">Confirm password</label>
            <input id="new-password-2" type="password" required minLength={8} value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={busy}>
            {busy ? "Saving" : "Set password"}
          </button>
          <button type="button" className="text-sm underline underline-offset-4" style={{ color: "var(--ink-2)" }} onClick={skipPassword}>
            Skip for now
          </button>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </form>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="rounded border border-dashed p-4" style={{ borderColor: "var(--line-2)" }}>
          <p className="text-xs font-medium uppercase tracking-[0.1em]" style={{ color: "var(--ink-3)" }}>
            Local testing only — not shown in production
          </p>
          <button
            type="button"
            className="btn-secondary mt-3"
            disabled={devPending}
            onClick={() =>
              startDev(async () => {
                setDevError("");
                const r = await devSignIn();
                if (r?.error) setDevError(r.error);
              })
            }
          >
            {devPending ? "Signing in…" : "Skip email — sign in as a test user"}
          </button>
          {devError && <p className="mt-2 text-sm text-red-700" role="alert">{devError}</p>}
        </div>
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
