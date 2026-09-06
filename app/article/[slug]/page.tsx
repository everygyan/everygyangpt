import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Newsletter } from "@/components/newsletter";
import { CommentsSection, type PublicComment } from "@/components/comments-section";
import { ArticleReadAloud } from "@/components/article-read-aloud";
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
  content: unknown;
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
    .select("id, title, slug, excerpt, content, content_html, featured_image_url, featured_image_alt, published_at, updated_at, allow_comments, sections(name), profiles(display_name), article_categories(categories(name)), article_tags(tags(name))")
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

function articleAuthor(content: unknown, fallback?: string) {
  if (content && typeof content === "object" && !Array.isArray(content)) {
    const name = (content as { authorName?: unknown }).authorName;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return fallback || "Sandeep";
}

function articlePlainText(html: string | null) {
  return String(html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function getComments(articleId: string): Promise<PublicComment[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, body, guest_name, created_at, profiles(display_name)")
      .eq("article_id", articleId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return [];
    return (data ?? []).map((comment) => {
      const profiles = comment.profiles as unknown as { display_name?: string } | { display_name?: string }[] | null;
      return {
        id: comment.id,
        author: comment.guest_name || relationDisplayName(profiles) || "EveryGyan reader",
        body: comment.body,
        createdAt: comment.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  return article ? { title: article.title, description: article.excerpt ?? undefined } : {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  const comments = article.allow_comments ? await getComments(article.id) : [];

  const section = relationName(article.sections) || "Latest";
  const author = articleAuthor(article.content, relationDisplayName(article.profiles));
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
          <div><ArticleReadAloud title={article.title} text={articlePlainText(article.content_html)} /><article className="article-content" dangerouslySetInnerHTML={{ __html: article.content_html || "" }} /></div>
          <aside className="article-aside"><div className="aside-card"><p className="eyebrow">About the author</p><h3>{author}</h3><p>EveryGyan editor sharing clear, useful knowledge for curious readers.</p></div></aside>
        </div>
        {article.allow_comments && <CommentsSection articleId={article.id} initialComments={comments} />}
        {!!tags.length && <div className="article-tags shell"><span>Topics</span>{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
