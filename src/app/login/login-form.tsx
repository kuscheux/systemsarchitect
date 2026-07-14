"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, KeyRound, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "pin" | "create";

export function LoginForm({
  isConfigured,
  nextPath = "/account",
}: {
  isConfigured: boolean;
  nextPath?: string;
}) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function ensureConfigured() {
    if (isConfigured) return true;
    setError("Add your Supabase URL and publishable key before signing in.");
    return false;
  }

  async function signInWithGoogle() {
    setError("");
    setMessage("");
    if (!ensureConfigured()) return;

    setIsLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    }
  }

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!ensureConfigured()) return;
    setIsLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const pin = String(form.get("pin") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    if (mode === "pin") {
      const response = await fetch("/api/auth/employee-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin, nextPath }),
      });
      const result = (await response.json()) as { error?: string; nextPath?: string };
      if (!response.ok) {
        setError(result.error || "Employee PIN sign-in was not accepted.");
        setIsLoading(false);
        return;
      }
      window.location.assign(result.nextPath || nextPath);
      return;
    }

    const supabase = createClient();

    if (mode === "create") {
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        window.location.assign(nextPath);
        return;
      } else {
        setMessage("Profile created. Check your email to confirm the account, then sign in.");
        setMode("sign-in");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        window.location.assign(nextPath);
        return;
      }
    }

    setIsLoading(false);
  }

  const inputClass =
    "h-12 w-full rounded-[8px] border border-border bg-white pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/8";

  return (
    <div className="border border-border bg-white p-5 md:p-6">
      <div className="grid grid-cols-3 rounded-[8px] bg-secondary p-1">
        {(["sign-in", "pin", "create"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setError("");
              setMessage("");
            }}
            className={`h-10 rounded-[6px] text-sm font-medium transition ${
              mode === item ? "bg-white text-foreground shadow-sm" : "text-muted"
            }`}
          >
            {item === "sign-in" ? "Email" : item === "pin" ? "Employee PIN" : "Create"}
          </button>
        ))}
      </div>

      <form onSubmit={submitCredentials} className="mt-5 grid gap-4">
        {mode === "create" ? (
          <label className="grid gap-2 text-sm font-medium">
            Full name
            <span className="relative">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input required name="fullName" autoComplete="name" className={inputClass} />
            </span>
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-medium">
          Email
          <span className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input required type="email" name="email" autoComplete="email" className={inputClass} />
          </span>
        </label>
        {mode === "pin" ? (
          <label className="grid gap-2 text-sm font-medium">
            Six-digit employee PIN
            <span className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input required type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} name="pin" autoComplete="one-time-code" className={inputClass} />
            </span>
          </label>
        ) : (
          <label className="grid gap-2 text-sm font-medium">
            Password
            <span className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                required
                minLength={8}
                type="password"
                name="password"
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                className={inputClass}
              />
            </span>
          </label>
        )}
        <button
          disabled={isLoading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-82 disabled:cursor-wait disabled:opacity-55"
        >
          {isLoading ? <Loader2 size={17} className="animate-spin" /> : null}
          {mode === "sign-in" ? "Sign in" : mode === "pin" ? "Enter portal" : "Create profile"}
          {!isLoading ? <ArrowRight size={16} /> : null}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-muted">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-white px-5 text-sm font-medium text-black transition hover:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="grid size-5 place-items-center rounded-full bg-black text-[11px] font-semibold text-white">G</span>
        Continue with Google
        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </button>

      {!isConfigured ? (
        <div className="mt-5 border border-amber-700/20 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Supabase is wired in, but environment variables are not set yet.
        </div>
      ) : null}
      {error ? <div role="alert" className="mt-5 border border-red-900/15 bg-red-50 p-4 text-sm text-red-950">{error}</div> : null}
      {message ? <div role="status" className="mt-5 border border-emerald-900/15 bg-emerald-50 p-4 text-sm text-emerald-950">{message}</div> : null}
    </div>
  );
}
