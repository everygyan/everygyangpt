import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { DeleteArticleButton } from "@/components/delete-article-button";
import { requireEditorialUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const validStatuses = new Set(["draft", "review", "scheduled", "published", "archived"]);
type Search = { status?: string; section?: string; category?: string };
type MenuItem = { id: string; parent_id: string | null; label: string; section_id: string | null; category_id: string | null; sort_order: number };
type Section = { id: string; name: string; slug: string };
type Category = { id: string; section_id: string; name: string; slug: string };

function href(filters: Search) {
  const values = new URLSearchParams();
  if (filters.status) values.set("status", filters.status);
  if (filters.section) values.set("section", filters.section);
  if (filters.category) values.set("category", filters.category);
  const query = values.toString();
  return `/admin/articles${query ? `?${query}` : ""}`;
}

function one<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const profile = await requireEditorialUser();
  const requested = await searchParams;
  const status = validStatuses.has(requested.status ?? "") ? requested.status ?? "" : "";
  const supabase = await createClient();
  const [menuResult, sectionsResult, categoriesResult] = await Promise.all([
    supabase.from("menus").select("id").eq("location", "header").maybeSingle(),
    supabase.from("sections").select("id, name, slug").eq("is_active", true).order("sort_order"),
    supabase.from("categories").select("id, section_id, name, slug").eq("is_active", true).order("sort_order"),
  ]);
  const sections = (sectionsResult.data ?? []) as Section[];
  const categories = (categoriesResult.data ?? []) as Category[];
  const menuItemsResult = menuResult.data
    ? await supabase.from("menu_items").select("id, parent_id, label, section_id, category_id, sort_order").eq("menu_id", menuResult.data.id).eq("is_active", true).order("sort_order")
    : { data: [] as MenuItem[], error: null };
  const menuItems = (menuItemsResult.data ?? []) as MenuItem[];
  const roots = menuItems.filter((item) => !item.parent_id && item.section_id);
  const sectionMenus = roots.length ? roots.map((root) => ({
    id: root.section_id!,
    label: root.label,
    children: menuItems.filter((item) => item.parent_id === root.id && item.category_id).map((item) => ({ id: item.category_id!, label: item.label })),
  })) : sections.map((section) => ({
    id: section.id,
    label: section.name,
    children: categories.filter((category) => category.section_id === section.id).map((category) => ({ id: category.id, label: category.name })),
  }));
  const selectedSection = sectionMenus.find((section) => section.id === requested.section)?.id ?? "";
  const visibleSubmenus = sectionMenus.find((section) => section.id === selectedSection)?.children ?? [];
  const selectedCategory = visibleSubmenus.find((category) => category.id === requested.category)?.id ?? "";

  let query = supabase
    .from("articles")
    .select("id, title, slug, status, section_id, is_featured, is_breaking, updated_at, sections(name), article_categories(is_primary, category_id, categories(name))")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  if (selectedSection) query = query.eq("section_id", selectedSection);
  const { data, error } = await query;
  const articles = (data ?? []).filter((article) => !selectedCategory || article.article_categories?.some((link) => link.category_id === selectedCategory));

  return (
    <main className="admin-shell">
      <AdminSidebar active="articles" role={profile.role} />
      <section className="admin-main">
        <AdminPageHeader title="Articles" context="publishing" displayName={profile.display_name} />
        <div className="admin-content">
          <div className="admin-page-heading">
            <div><p className="eyebrow">Publishing library</p><h2>Manage every story</h2><p>Browse stories by the same menu and submenu structure readers use on the website.</p></div>
            <Link className="button button-primary" href="/admin/articles/new"><Plus size={17} /> New article</Link>
          </div>
          <nav className="admin-filter-tabs" aria-label="Filter articles by status">
            <Link className={!status ? "active" : undefined} href={href({ section: selectedSection, category: selectedCategory })}>All statuses</Link>
            <Link className={status === "published" ? "active" : undefined} href={href({ status: "published", section: selectedSection, category: selectedCategory })}>Published</Link>
            <Link className={status === "draft" ? "active" : undefined} href={href({ status: "draft", section: selectedSection, category: selectedCategory })}>Drafts</Link>
            <Link className={status === "archived" ? "active" : undefined} href={href({ status: "archived", section: selectedSection, category: selectedCategory })}>Archived</Link>
          </nav>
          <section className="article-menu-filters" aria-labelledby="article-menu-filter-title">
            <div className="article-menu-filter-heading"><FolderOpen size={18} /><div><strong id="article-menu-filter-title">Website menu</strong><span>Choose a main menu, then narrow the list by submenu.</span></div></div>
            <nav className="article-section-tabs" aria-label="Filter by main menu">
              <Link className={!selectedSection ? "active" : undefined} href={href({ status })}>All menus</Link>
              {sectionMenus.map((section) => <Link className={selectedSection === section.id ? "active" : undefined} href={href({ status, section: section.id })} key={section.id}>{section.label}</Link>)}
            </nav>
            {!!selectedSection && <nav className="article-category-tabs" aria-label="Filter by submenu">
              <Link className={!selectedCategory ? "active" : undefined} href={href({ status, section: selectedSection })}>All {sectionMenus.find((item) => item.id === selectedSection)?.label}</Link>
              {visibleSubmenus.map((category) => <Link className={selectedCategory === category.id ? "active" : undefined} href={href({ status, section: selectedSection, category: category.id })} key={category.id}>{category.label}</Link>)}
              {!visibleSubmenus.length && <span>No submenus are configured for this menu.</span>}
            </nav>}
          </section>
          <div className="article-library-summary"><strong>{articles.length}</strong> {articles.length === 1 ? "article" : "articles"}{selectedCategory ? ` in ${visibleSubmenus.find((item) => item.id === selectedCategory)?.label}` : selectedSection ? ` in ${sectionMenus.find((item) => item.id === selectedSection)?.label}` : " across all menus"}</div>
          <section className="admin-table-card admin-library-card">
            {(error || sectionsResult.error || categoriesResult.error || menuItemsResult.error) && <p className="admin-inline-error">The article groups could not be loaded completely. Please refresh the page.</p>}
            <div className="admin-list-table">
              {articles.map((article) => {
                const sectionName = one(article.sections as unknown as { name?: string } | { name?: string }[] | null)?.name;
                const primary = article.article_categories?.find((link) => link.is_primary) ?? article.article_categories?.[0];
                const categoryName = one(primary?.categories as unknown as { name?: string } | { name?: string }[] | null)?.name;
                return (
                  <article className="admin-list-row" key={article.id}>
                    <div className="admin-list-primary"><strong>{article.title}</strong><span>{sectionName || "Uncategorised"}{categoryName ? ` / ${categoryName}` : ""} · Updated {new Date(article.updated_at).toLocaleDateString("en-GB")}</span></div>
                    <div className="placement-badges">{article.is_breaking && <span className="placement-live">Live</span>}{article.is_featured && <span className="placement-featured">Carousel</span>}</div>
                    <span className={`status-${article.status}`}>{article.status}</span>
                    <div className="row-actions"><Link href={`/admin/articles/${article.id}/edit`}>Edit</Link><Link href={`/article/${article.slug}`}>View</Link>{profile.role === "admin" && <DeleteArticleButton articleId={article.id} title={article.title} />}</div>
                  </article>
                );
              })}
              {!articles.length && !error && <div className="admin-empty"><strong>No matching articles.</strong><span>Choose another menu, submenu or status filter.</span></div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
