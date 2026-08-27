import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "reader" | "editor" | "moderator" | "admin";
export type CurrentProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: AppRole;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", userId)
    .single();

  return (data as CurrentProfile | null) ?? null;
}

export async function requireUser() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireEditorialUser() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (!(["editor", "admin"] as AppRole[]).includes(profile.role)) {
    redirect("/account?error=editor-access-required");
  }
  return profile;
}
