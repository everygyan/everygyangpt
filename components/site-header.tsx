"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sections } from "@/data/articles";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { NavigationItem } from "@/lib/navigation-types";
import { createClient } from "@/lib/supabase/client";

type HeaderProfile = {
  displayName: string;
  avatarUrl: string | null;
  role: "reader" | "editor" | "moderator" | "admin";
};

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openNavigationId, setOpenNavigationId] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<NavigationItem[]>([
    { id: "latest", label: "Latest", href: "/#latest", children: [] },
    ...sections.map((section) => ({ id: section.name, label: section.name, href: `/topic/${section.name.toLowerCase()}`, children: [] })),
  ]);
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      if (!supabase) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!active || !userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("id", userData.user.id)
        .single();
      if (!active) return;
      setProfile({
        displayName: data?.display_name || userData.user.user_metadata?.display_name || "EveryGyan reader",
        avatarUrl: data?.avatar_url || userData.user.user_metadata?.avatar_url || null,
        role: data?.role || "reader",
      });
    }
    void loadProfile();
    return () => { active = false; };
  }, [supabase]);

  useEffect(() => {
    let active = true;
    void fetch("/api/navigation", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((result: { items?: NavigationItem[] }) => {
        if (active && result.items?.length) setNavigation(result.items);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  function closeNavigation() {
    setMenuOpen(false);
    setOpenNavigationId(null);
  }

  const canPublish = profile?.role === "admin" || profile?.role === "editor";

  return (
    <>
      <div className="utility-bar">
        <div className="shell utility-inner">
          <span>Thursday, 27 August 2026</span>
          <div className="utility-links">
            <Link href="/about">About</Link>
            <Link href="/newsletter">Newsletter</Link>
            <Link href="/admin">Write for EveryGyan</Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="shell header-main">
          <button
            className="icon-button mobile-menu-button"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link className="brand" href="/" aria-label="EveryGyan home">
            <Image src="/everygyan-logo.png" alt="EveryGyan" width={318} height={115} priority />
          </Link>

          <nav className={`primary-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
            {navigation.map((item) => (
              <div className={`navigation-item ${openNavigationId === item.id ? "is-open" : ""}`} key={item.id}>
                <Link href={item.href} onClick={closeNavigation}>{item.label}</Link>
                {!!item.children.length && <button type="button" aria-label={`Show ${item.label} submenu`} aria-expanded={openNavigationId === item.id} onClick={() => setOpenNavigationId((current) => current === item.id ? null : item.id)}><ChevronDown size={14} /></button>}
                {!!item.children.length && <div className="navigation-submenu">{item.children.map((child) => <Link key={child.id} href={child.href} onClick={closeNavigation}>{child.label}</Link>)}</div>}
              </div>
            ))}
          </nav>

          <div className="header-actions">
            <select className="language-select" aria-label="Choose language" defaultValue="en">
              <option value="en">EN</option>
              <option value="de">DE</option>
              <option value="hi">HI</option>
              <option value="es">ES</option>
            </select>
            <ThemeToggle />
            <button
              className="icon-button"
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Search EveryGyan"
            >
              <Search size={20} />
            </button>
            {profile ? (
              <div className="profile-menu" onMouseLeave={() => setProfileOpen(false)}>
                <button
                  className="profile-trigger"
                  type="button"
                  aria-label={`Open account menu for ${profile.displayName}`}
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((value) => !value)}
                  onMouseEnter={() => setProfileOpen(true)}
                >
                  <ProfileAvatar name={profile.displayName} url={profile.avatarUrl} />
                  <span className="profile-name">{profile.displayName.split(" ")[0]}</span>
                  <ChevronDown size={14} />
                </button>
                <div className={`profile-dropdown ${profileOpen ? "is-open" : ""}`}>
                  <div className="profile-summary">
                    <ProfileAvatar name={profile.displayName} url={profile.avatarUrl} className="profile-avatar-large" />
                    <div><strong>{profile.displayName}</strong><small>{profile.role}</small></div>
                  </div>
                  <Link href="/account" onClick={() => setProfileOpen(false)}><UserRound size={17} /> My profile</Link>
                  {canPublish && <Link href="/admin" onClick={() => setProfileOpen(false)}><LayoutDashboard size={17} /> Publishing dashboard</Link>}
                  <form action="/auth/signout" method="post"><button type="submit"><LogOut size={17} /> Sign out</button></form>
                </div>
              </div>
            ) : (
              <Link className="sign-in" href="/login">
                <UserRound size={18} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="search-panel">
            <form className="shell search-form" action="/search">
              <Search size={21} />
              <input name="q" type="search" autoFocus placeholder="Search news, guides, reviews and learning..." />
              <button className="button button-primary" type="submit">Search</button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
