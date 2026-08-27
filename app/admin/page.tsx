import Link from "next/link";
import { BarChart3, Eye, FileText, MessageSquare, Plus, Users } from "lucide-react";
import { articles } from "@/data/articles";

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/">Every<span>Gyan</span></Link>
        <nav>
          <a className="active" href="#"><BarChart3 size={19} /> Overview</a>
          <a href="#"><FileText size={19} /> Articles</a>
          <a href="#"><MessageSquare size={19} /> Comments <b>7</b></a>
          <a href="#"><Users size={19} /> Subscribers</a>
        </nav>
        <Link className="admin-view-site" href="/"><Eye size={17} /> View website</Link>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><p>EveryGyan workspace</p><h1>Good morning, Sandeep.</h1></div><div className="author-avatar">S</div></header>
        <div className="admin-content">
          <div className="admin-welcome">
            <div><p className="eyebrow">Your newsroom</p><h2>What will readers discover today?</h2><p>Create a clear, engaging story with the new EveryGyan editor.</p></div>
            <Link className="button button-primary" href="/admin/articles/new"><Plus size={18} /> New article</Link>
          </div>
          <div className="stat-grid">
            <div><span>Published</span><strong>{articles.length}</strong><small>Articles</small></div>
            <div><span>Drafts</span><strong>3</strong><small>In progress</small></div>
            <div><span>Comments</span><strong>24</strong><small>7 need review</small></div>
            <div><span>Subscribers</span><strong>128</strong><small>+12 this week</small></div>
          </div>
          <section className="admin-table-card">
            <div className="admin-section-title"><div><h2>Recent articles</h2><p>Manage, edit and preview your latest work.</p></div><button type="button">View all</button></div>
            <div className="admin-table">
              {articles.slice(0, 5).map((article) => (
                <div className="admin-table-row" key={article.slug}>
                  <div><strong>{article.title}</strong><span>{article.section} · {article.category}</span></div>
                  <span className="status-published">Published</span>
                  <span>{article.publishedAt}</span>
                  <Link href={`/article/${article.slug}`}>Preview</Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

