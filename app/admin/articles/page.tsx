import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { DeleteArticleButton } from "@/components/delete-article-button";
import { requireEditorialUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const validStatuses = new Set(["draft", "review", "scheduled", "published", "archived"]);

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const profile = await requireEditorialUser();
  const requestedStatus = (await searchParams).status ?? "";
  const status = validStatuses.has(requestedStatus) ? requestedStatus : "";
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select("id, title, slug, status, is_featured, is_breaking, updated_at, sections(name)")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  const { data: articles, error } = await query;

  return (
    <main className="admin-shell">
      <AdminSidebar active="articles" role={profile.role} />
      <section className="admin-main">
        <AdminPageHeader title="Articles" context="publishing" displayName={profile.display_name} />
        <div className="admin-content">
          <div className="admin-page-heading">
            <div><p className="eyebrow">Publishing library</p><h2>Manage every story</h2><p>Open drafts, update published articles, and control Live and carousel placement.</p></div>
            <Link className="button button-primary" href="/admin/articles/new"><Plus size={17} /> New article</Link>
          </div>
          <nav className="admin-filter-tabs" aria-label="Filter articles">
            <Link className={!status ? "active" : undefined} href="/admin/articles">All</Link>
            <Link className={status === "published" ? "active" : undefined} href="/admin/articles?status=published">Published</Link>
            <Link className={status === "draft" ? "active" : undefined} href="/admin/articles?status=draft">Drafts</Link>
            <Link className={status === "archived" ? "active" : undefined} href="/admin/articles?status=archived">Archived</Link>
          </nav>
          <section className="admin-table-card admin-library-card">
            {error && <p className="admin-inline-error">{error.message}</p>}
            <div className="admin-list-table">
              {(articles ?? []).map((article) => {
                const relation = article.sections as unknown as { name?: string } | { name?: string }[] | null;
                const sectionName = Array.isArray(relation) ? relation[0]?.name : relation?.name;
                return (
                  <article className="admin-list-row" key={article.id}>
                    <div className="admin-list-primary"><strong>{article.title}</strong><span>{sectionName || "Uncategorised"} · Updated {new Date(article.updated_at).toLocaleDateString("en-GB")}</span></div>
                    <div className="placement-badges">{article.is_breaking && <span className="placement-live">Live</span>}{article.is_featured && <span className="placement-featured">Carousel</span>}</div>
                    <span className={`status-${article.status}`}>{article.status}</span>
                    <div className="row-actions"><Link href={`/admin/articles/${article.id}/edit`}>Edit</Link><Link href={`/article/${article.slug}`}>View</Link>{profile.role === "admin" && <DeleteArticleButton articleId={article.id} title={article.title} />}</div>
                  </article>
                );
              })}
              {!articles?.length && !error && <div className="admin-empty"><strong>No matching articles.</strong><span>Choose another filter or create a new story.</span></div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
