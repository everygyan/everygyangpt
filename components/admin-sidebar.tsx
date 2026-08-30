import Link from "next/link";
import { BarChart3, Eye, FileText, ListTree, MessageSquare, Users } from "lucide-react";
import type { AppRole } from "@/lib/auth";

export type AdminSection = "overview" | "articles" | "menus" | "comments" | "subscribers";

export function AdminSidebar({ active, role }: { active: AdminSection; role: AppRole }) {
  const links = [
    { key: "overview" as const, href: "/admin", label: "Overview", icon: BarChart3 },
    { key: "articles" as const, href: "/admin/articles", label: "Articles", icon: FileText },
    ...(role === "admin" ? [{ key: "menus" as const, href: "/admin/menus", label: "Menus", icon: ListTree }] : []),
    ...(role === "admin" ? [
      { key: "comments" as const, href: "/admin/comments", label: "Comments", icon: MessageSquare },
      { key: "subscribers" as const, href: "/admin/subscribers", label: "Subscribers", icon: Users },
    ] : []),
  ];

  return (
    <aside className="admin-sidebar">
      <Link className="admin-logo" href="/">Every<span>Gyan</span></Link>
      <nav>
        {links.map(({ key, href, label, icon: Icon }) => (
          <Link className={active === key ? "active" : undefined} href={href} key={key}>
            <Icon size={19} /> {label}
          </Link>
        ))}
      </nav>
      <Link className="admin-view-site" href="/"><Eye size={17} /> View website</Link>
    </aside>
  );
}
