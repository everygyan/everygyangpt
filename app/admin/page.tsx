import Link from "next/link";
import { BarChart3, Eye, FileText, ListTree, MessageSquare, Plus, Users } from "lucide-react";
import { signOut } from "@/app/auth/actions";
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
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/">Every<span>Gyan</span></Link>
        <nav>
          <a className="active" href="#"><BarChart3 size={19} /> Overview</a>
          <Link href="/admin"><FileText size={19} /> Articles</Link>
          {profile.role === "admin" && <Link href="/admin/menus"><ListTree size={19} /> Menus</Link>}
          <Link href="/admin"><MessageSquare size={19} /> Comments</Link>
          <Link href="/admin"><Users size={19} /> Subscribers</Link>
        </nav>
        <Link className="admin-view-site" href="/"><Eye size={17} /> View website</Link>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><p>EveryGyan workspace · {profile.role}</p><h1>Welcome, {firstName}.</h1></div><div className="admin-account"><div className="author-avatar">{firstName[0]?.toUpperCase()}</div><form action={signOut}><button type="submit">Sign out</button></form></div></header>
        <div className="admin-content">
          <div className="admin-welcome">
            <div><p className="eyebrow">Your newsroom</p><h2>What will readers discover today?</h2><p>Create a clear, engaging story with the new EveryGyan editor.</p></div>
            <Link className="button button-primary" href="/admin/articles/new"><Plus size={18} /> New article</Link>
          </div>
          <div className="stat-grid">
            <div><span>Published</span><strong>{publishedResult.count ?? 0}</strong><small>Articles</small></div>
            <div><span>Drafts</span><strong>{draftsResult.count ?? 0}</strong><small>In progress</small></div>
            <div><span>Comments</span><strong>{commentsResult.count ?? 0}</strong><small>Community responses</small></div>
            <div><span>Subscribers</span><strong>{subscribersResult.count ?? 0}</strong><small>Active readers</small></div>
          </div>
          <section className="admin-table-card">
            <div className="admin-section-title"><div><h2>Recent articles</h2><p>Manage, edit and preview your latest work.</p></div><button type="button">View all</button></div>
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
