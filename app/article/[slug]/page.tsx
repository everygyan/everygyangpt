import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bookmark, MessageCircle, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type ArticlePageProps = { params: Promise<{ slug: string }> };
type PublishedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  published_at: string | null;
  updated_at: string;
  allow_comments: boolean;
  sections: { name?: string } | { name?: string }[] | null;
  profiles: { display_name?: string } | { display_name?: string }[] | null;
  article_categories: { categories: { name?: string } | { name?: string }[] | null }[] | null;
  article_tags: { tags: { name?: string } | { name?: string }[] | null }[] | null;
};

async function getArticle(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, content_html, featured_image_url, featured_image_alt, published_at, updated_at, allow_comments, sections(name), profiles(display_name), article_categories(categories(name)), article_tags(tags(name))")
    .eq("slug", slug)
    .maybeSingle();
  return data as unknown as PublishedArticle | null;
}

function relationName(value: { name?: string } | { name?: string }[] | null) {
  return Array.isArray(value) ? value[0]?.name : value?.name;
}

function relationDisplayName(value: { display_name?: string } | { display_name?: string }[] | null) {
  return Array.isArray(value) ? value[0]?.display_name : value?.display_name;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  return article ? { title: article.title, description: article.excerpt ?? undefined } : {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  const section = relationName(article.sections) || "Latest";
  const author = relationDisplayName(article.profiles) || "Sandeep";
  const category = article.article_categories?.map((item) => relationName(item.categories)).find(Boolean) || "EveryGyan";
  const tags = article.article_tags?.map((item) => relationName(item.tags)).filter((tag): tag is string => Boolean(tag)) ?? [];
  const style = ({ News: "blue", Travel: "teal", Entertainment: "violet", Health: "green", Learn: "orange" } as Record<string, string>)[section] || "blue";
  const publishedDate = new Date(article.published_at || article.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <SiteHeader />
      <main className="article-page">
        <header className="article-hero shell">
          <Link className="back-link" href="/"><ArrowLeft size={17} /> Back to latest</Link>
          <div className="article-heading">
            <span className={`section-pill pill-${style}`}>{section}</span>
            <p className="article-kicker">{category}</p>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.excerpt}</p>
            <div className="author-row"><div className="author-avatar">{author[0]?.toUpperCase()}</div><div><strong>{author}</strong><span>EveryGyan editor</span></div><span className="meta-divider" /><span>{publishedDate}</span></div>
          </div>
        </header>
        {article.featured_image_url && <div className="article-cover shell database-cover" role="img" aria-label={article.featured_image_alt || article.title} style={{ backgroundImage: `url(${article.featured_image_url})` }} />}
        <div className="article-layout shell">
          <aside className="share-column" aria-label="Share article"><button aria-label="Save article"><Bookmark size={19} /></button><button aria-label="Share article"><Share2 size={19} /></button></aside>
          <article className="article-content" dangerouslySetInnerHTML={{ __html: article.content_html || "" }} />
          <aside className="article-aside"><div className="aside-card"><p className="eyebrow">About the author</p><h3>{author}</h3><p>EveryGyan editor sharing clear, useful knowledge for curious readers.</p></div></aside>
        </div>
        {article.allow_comments && <section className="comments shell"><div><MessageCircle size={24} /><h2>Join the conversation</h2><p>Sign in to share your perspective.</p></div><Link className="button button-primary" href="/login">Sign in to comment</Link></section>}
        {!!tags.length && <div className="article-tags shell"><span>Topics</span>{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
