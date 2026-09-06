import { CalendarDays, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileSettings } from "@/components/profile-settings";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireUser();
  const params = await searchParams;
  const canWrite = profile.role === "admin" || profile.role === "editor";
  const supabase = await createClient();
  const [{ data: userData }, { data: profileDetails }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("bio, preferred_locale").eq("id", profile.id).single(),
  ]);
  const user = userData.user;
  const metadata = user?.user_metadata ?? {};
  const address = typeof metadata.address === "object" && metadata.address ? metadata.address as Record<string, unknown> : {};
  const memberSince = user?.created_at
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(user.created_at))
    : "Recently";

  return (
    <>
      <SiteHeader />
      <main className="account-page">
        <div className="shell account-shell">
          <header className="account-hero">
            <ProfileAvatar name={profile.display_name} url={profile.avatar_url} className="account-hero-avatar" />
            <div><p className="eyebrow">Your EveryGyan account</p><h1>{profile.display_name}</h1><p>{user?.email}</p></div>
            <span className="account-role"><ShieldCheck size={16} /> {profile.role}</span>
          </header>

          {params.error && <p className="form-message form-error">Your account does not have publishing access. An administrator can promote it in Supabase.</p>}

          <div className="account-layout">
            <aside className="account-sidebar">
              <nav aria-label="Account settings"><a href="#profile-details"><UserRound size={17} /> Profile details</a><a href="#security"><ShieldCheck size={17} /> Password & security</a>{canWrite && <Link href="/admin"><LayoutDashboard size={17} /> Publishing dashboard</Link>}</nav>
              <div className="account-member-since"><CalendarDays size={18} /><div><small>Member since</small><strong>{memberSince}</strong></div></div>
              <form action="/auth/signout" method="post"><button type="submit"><LogOut size={17} /> Sign out</button></form>
            </aside>
            <ProfileSettings initial={{
              displayName: profile.display_name,
              firstName: String(metadata.first_name ?? ""),
              lastName: String(metadata.last_name ?? ""),
              email: user?.email ?? "",
              contactPhone: String(metadata.contact_phone ?? ""),
              bio: profileDetails?.bio ?? "",
              avatarUrl: profile.avatar_url,
              preferredLocale: profileDetails?.preferred_locale ?? "en",
              addressLine1: String(address.line_1 ?? ""),
              addressLine2: String(address.line_2 ?? ""),
              city: String(address.city ?? ""),
              stateRegion: String(address.state_region ?? ""),
              postalCode: String(address.postal_code ?? ""),
              country: String(address.country ?? ""),
            }} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
