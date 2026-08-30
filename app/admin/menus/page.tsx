import Link from "next/link";
import { BarChart3, Eye, FileText, ListTree, MessageSquare, Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { DeleteMenuItemButton } from "@/components/delete-menu-item-button";
import { MenuItemForm, type MenuFormInitial } from "@/components/menu-item-form";
import { requireEditorialUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type MenuRow = { id: string; parent_id: string | null; label: string; url: string | null; section_id: string | null; category_id: string | null; sort_order: number; is_active: boolean };

export default async function MenusPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const profile = await requireEditorialUser();
  if (profile.role !== "admin") redirect("/admin");
  const supabase = await createClient();
  const { edit } = await searchParams;
  const [{ data: menu }, { data: sections }, { data: categories }] = await Promise.all([
    supabase.from("menus").select("id").eq("location", "header").maybeSingle(),
    supabase.from("sections").select("id, name").eq("is_active", true).order("sort_order"),
    supabase.from("categories").select("id, name, sections(name)").eq("is_active", true).order("sort_order"),
  ]);
  const { data: menuData } = menu
    ? await supabase.from("menu_items").select("id, parent_id, label, url, section_id, category_id, sort_order, is_active").eq("menu_id", menu.id).order("sort_order").order("label")
    : { data: [] };
  const items = (menuData ?? []) as MenuRow[];
  const roots = items.filter((item) => !item.parent_id);
  const editing = items.find((item) => item.id === edit);
  const categoryOptions = (categories ?? []).map((category) => {
    const section = category.sections as unknown as { name?: string } | { name?: string }[] | null;
    const sectionName = Array.isArray(section) ? section[0]?.name : section?.name;
    return { id: category.id, label: `${sectionName || "Category"} — ${category.name}` };
  });
  const initial: MenuFormInitial | undefined = editing ? {
    id: editing.id,
    label: editing.label,
    target: editing.section_id ? `section:${editing.section_id}` : editing.category_id ? `category:${editing.category_id}` : "custom",
    customUrl: editing.url ?? "",
    parentId: editing.parent_id ?? "",
    sortOrder: editing.sort_order,
    isActive: editing.is_active,
  } : undefined;
  const firstName = profile.display_name.split(" ")[0] || "Admin";

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/">Every<span>Gyan</span></Link>
        <nav>
          <Link href="/admin"><BarChart3 size={19} /> Overview</Link>
          <Link href="/admin"><FileText size={19} /> Articles</Link>
          <Link className="active" href="/admin/menus"><ListTree size={19} /> Menus</Link>
          <Link href="/admin"><MessageSquare size={19} /> Comments</Link>
          <Link href="/admin"><Users size={19} /> Subscribers</Link>
        </nav>
        <Link className="admin-view-site" href="/"><Eye size={17} /> View website</Link>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><p>EveryGyan workspace · navigation</p><h1>Manage website menus</h1></div><div className="admin-account"><div className="author-avatar">{firstName[0]?.toUpperCase()}</div><form action={signOut}><button type="submit">Sign out</button></form></div></header>
        <div className="admin-content menu-management">
          <div className="menu-management-heading"><div><p className="eyebrow">Primary navigation</p><h2>Menu items and submenus</h2><p>Connect each item to a section, category or custom page. Drag-free ordering keeps changes predictable.</p></div>{editing && <Link className="button menu-new-button" href="/admin/menus"><Plus size={17} /> Create new</Link>}</div>
          <div className="menu-management-grid">
            <section className="menu-editor-card"><h3>{editing ? `Edit “${editing.label}”` : "Create menu item"}</h3><MenuItemForm key={editing?.id ?? "new"} sections={(sections ?? []).map((section) => ({ id: section.id, label: section.name }))} categories={categoryOptions} parents={roots.map((root) => ({ id: root.id, label: root.label }))} initial={initial} /></section>
            <section className="menu-list-card"><div className="menu-list-heading"><h3>Website menu</h3><span>{items.length} items</span></div>
              <div className="menu-list">
                {roots.map((root) => {
                  const children = items.filter((item) => item.parent_id === root.id);
                  return <div className="menu-tree-group" key={root.id}><MenuRow item={root} hasChildren={children.length > 0} />{children.map((child) => <MenuRow key={child.id} item={child} child />)}</div>;
                })}
                {!items.length && <div className="admin-empty"><strong>No menu items yet.</strong><span>Create the first item or run the navigation seed.</span></div>}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function MenuRow({ item, child = false, hasChildren = false }: { item: MenuRow; child?: boolean; hasChildren?: boolean }) {
  return <div className={`menu-list-row ${child ? "is-child" : ""}`}><div><strong>{item.label}</strong><span>{child ? "Submenu" : "Main item"} · order {item.sort_order}</span></div><span className={item.is_active ? "menu-visible" : "menu-hidden"}>{item.is_active ? "Visible" : "Hidden"}</span><div><Link href={`/admin/menus?edit=${item.id}`}>Edit</Link><DeleteMenuItemButton id={item.id} label={item.label} hasChildren={hasChildren} /></div></div>;
}
