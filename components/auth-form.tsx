"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState } from "@/app/auth/actions";

type AuthAction = (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;

export function AuthForm({
  action,
  kind,
  next = "",
}: {
  action: AuthAction;
  kind: "signin" | "signup" | "reset" | "update";
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignUp = kind === "signup";
  const isSignIn = kind === "signin";

  return (
    <form className="auth-form" action={formAction}>
      {next && <input type="hidden" name="next" value={next} />}
      {isSignUp && (
        <label>Display name<input name="displayName" autoComplete="name" required /></label>
      )}
      {kind !== "update" && (
        <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
      )}
      {kind !== "reset" && (
        <label>{kind === "update" ? "New password" : "Password"}<input name="password" type="password" minLength={8} autoComplete={isSignIn ? "current-password" : "new-password"} placeholder="At least 8 characters" required /></label>
      )}
      {isSignIn && <div className="auth-options"><span>Secure Supabase sign in</span><Link href="/forgot-password">Forgot password?</Link></div>}
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-message form-success" role="status">{state.success}</p>}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Please wait…" : kind === "signin" ? "Sign in" : kind === "signup" ? "Create account" : kind === "reset" ? "Send reset link" : "Update password"}
      </button>
    </form>
  );
}
