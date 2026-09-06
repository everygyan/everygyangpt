import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { DeleteArticleButton } from "@/components/delete-article-button";
import { requireEditorialUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const profile = await requireEditorialUser();
  const supabase = await createClient();
  const [articlesResult, publishedResult, draftsResult, commentsResult, subscribersResult] = await Promise.all([
    supabase.from("articles").select("id, title, slug, status, updated_at, sections(name)").order("updated_at", { ascending: false }).limit(8),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);
  const articles = articlesResult.data ?? [];
  const firstName = profile.display_name.split(" ")[0] || "Editor";

  return (
    <main className="admin-shell">
      <AdminSidebar active="overview" role={profile.role} />
      <section className="admin-main">
        <AdminPageHeader title={`Welcome, ${firstName}.`} context={profile.role} displayName={profile.display_name} avatarUrl={profile.avatar_url} role={profile.role} />
        <div className="admin-content">
          <div className="admin-welcome">
            <div><p className="eyebrow">Your newsroom</p><h2>What will readers discover today?</h2><p>Create a clear, engaging story with the new EveryGyan editor.</p></div>
            <Link className="button button-primary" href="/admin/articles/new"><Plus size={18} /> New article</Link>
          </div>
          <div className="stat-grid">
            <Link href="/admin/articles"><span>Published</span><strong>{publishedResult.count ?? 0}</strong><small>Articles</small></Link>
            <Link href="/admin/articles?status=draft"><span>Drafts</span><strong>{draftsResult.count ?? 0}</strong><small>In progress</small></Link>
            <Link href="/admin/comments"><span>Comments</span><strong>{commentsResult.count ?? 0}</strong><small>Community responses</small></Link>
            <Link href="/admin/subscribers"><span>Subscribers</span><strong>{subscribersResult.count ?? 0}</strong><small>Active readers</small></Link>
          </div>
          <section className="admin-table-card">
            <div className="admin-section-title"><div><h2>Recent articles</h2><p>Manage, edit and preview your latest work.</p></div><Link href="/admin/articles">View all</Link></div>
            <div className="admin-table">
              {articles.map((article) => {
                const section = article.sections as unknown as { name?: string } | { name?: string }[] | null;
                const sectionName = Array.isArray(section) ? section[0]?.name : section?.name;
                return (
                <div className="admin-table-row" key={article.slug}>
                  <div><strong>{article.title}</strong><span>{sectionName || "Uncategorised"}</span></div>
                  <span className={`status-${article.status}`}>{article.status}</span>
                  <span>{new Date(article.updated_at).toLocaleDateString("en-GB")}</span>
                  <div className="row-actions"><Link href={`/admin/articles/${article.id}/edit`}>Edit</Link><Link href={`/article/${article.slug}`}>View</Link>{profile.role === "admin" && <DeleteArticleButton articleId={article.id} title={article.title} />}</div>
                </div>
              );})}
              {!articles.length && <div className="admin-empty"><strong>No articles yet.</strong><span>Create your first EveryGyan story and save it as a draft.</span><Link href="/admin/articles/new">Create article</Link></div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

