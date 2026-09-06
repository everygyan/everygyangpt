"use client";

import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { AppRole } from "@/lib/auth";

export function AccountMenu({
  displayName,
  avatarUrl,
  role,
}: {
  displayName: string;
  avatarUrl: string | null;
  role: AppRole;
}) {
  const [open, setOpen] = useState(false);
  const canPublish = role === "admin" || role === "editor";

  return (
    <div className="profile-menu" onMouseLeave={() => setOpen(false)}>
      <button
        className="profile-trigger"
        type="button"
        aria-label={`Open account menu for ${displayName}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => setOpen(true)}
      >
        <ProfileAvatar name={displayName} url={avatarUrl} />
        <span className="profile-name">{displayName.split(" ")[0]}</span>
        <ChevronDown size={14} />
      </button>
      <div className={`profile-dropdown ${open ? "is-open" : ""}`}>
        <div className="profile-summary">
          <ProfileAvatar name={displayName} url={avatarUrl} className="profile-avatar-large" />
          <div><strong>{displayName}</strong><small>{role}</small></div>
        </div>
        <Link href="/account" onClick={() => setOpen(false)}><UserRound size={17} /> My profile</Link>
        {canPublish && <Link href="/admin" onClick={() => setOpen(false)}><LayoutDashboard size={17} /> Publishing dashboard</Link>}
        <form action="/auth/signout" method="post"><button type="submit"><LogOut size={17} /> Sign out</button></form>
      </div>
    </div>
  );
}

