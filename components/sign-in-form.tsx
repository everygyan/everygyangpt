"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

function safeNext(input: string, fallback: string) {
  return input.startsWith("/") && !input.startsWith("//") ? input : fallback;
}

export function SignInForm({ next = "" }: { next?: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        password: String(formData.get("password") ?? ""),
      });
      if (signInError || !data.user) {
        setError("The email address or password is incorrect.");
        setPending(false);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      const fallback = profile?.role === "admin" || profile?.role === "editor" ? "/admin" : "/account";
      window.location.replace(safeNext(next, fallback));
    } catch {
      setError("Account access is temporarily unavailable. Please try again.");
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
      <label>Password<input name="password" type="password" minLength={8} autoComplete="current-password" placeholder="Your password" required /></label>
      <div className="auth-options"><span>Secure Supabase sign in</span><Link href="/forgot-password">Forgot password?</Link></div>
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
