"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string };

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeNext(input: string, fallback: string) {
  return input.startsWith("/") && !input.startsWith("//") ? input : fallback;
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function configurationError(): AuthActionState | null {
  return isSupabaseConfigured()
    ? null
    : { error: "Account access is temporarily unavailable because the hosting environment is not configured." };
}

export async function signIn(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const configError = configurationError();
  if (configError) return configError;
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  if (!email || !password) return { error: "Enter your email address and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "The email address or password is incorrect." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  const fallback = profile?.role === "admin" || profile?.role === "editor" ? "/admin" : "/account";
  redirect(safeNext(value(formData, "next"), fallback));
}

export async function signUp(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const configError = configurationError();
  if (configError) return configError;
  const displayName = value(formData, "displayName");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  if (displayName.length < 2) return { error: "Please enter your display name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/account`,
    },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/account");
  return { success: "Account created. Check your email and click the confirmation link to sign in." };
}

export async function requestPasswordReset(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const configError = configurationError();
  if (configError) return configError;
  const email = value(formData, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/update-password`,
  });
  return { success: "If an account exists, a password reset email is on its way." };
}

export async function updatePassword(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const configError = configurationError();
  if (configError) return configError;
  const password = value(formData, "password");
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { error: error.message } : { success: "Your password has been updated." };
}
