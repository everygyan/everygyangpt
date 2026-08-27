import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bookmark, Clock3, Facebook, Linkedin, MessageCircle, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { articles, sectionStyles } from "@/data/articles";
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

async function getPublishedArticle(slug: string) {
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

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const published = await getPublishedArticle(slug);
  if (published) return { title: published.title, description: published.excerpt ?? undefined };
  const article = articles.find((item) => item.slug === slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const published = await getPublishedArticle(slug);
  if (published) {
    const section = relationName(published.sections) || "Latest";
    const author = relationDisplayName(published.profiles) || "Sandeep";
    const category = published.article_categories?.map((item) => relationName(item.categories)).find(Boolean) || "EveryGyan";
    const tags = published.article_tags?.map((item) => relationName(item.tags)).filter(Boolean) ?? [];
    const style = ({ News: "blue", Travel: "teal", Entertainment: "violet", Health: "green", Learn: "orange" } as Record<string, string>)[section] || "blue";
    const publishedDate = new Date(published.published_at || published.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    return (
      <>
        <SiteHeader />
        <main className="article-page">
          <header className="article-hero shell">
            <Link className="back-link" href="/"><ArrowLeft size={17} /> Back to latest</Link>
            <div className="article-heading">
              <span className={`section-pill pill-${style}`}>{section}</span>
              <p className="article-kicker">{category}</p>
              <h1>{published.title}</h1>
              <p className="article-deck">{published.excerpt}</p>
              <div className="author-row"><div className="author-avatar">{author[0]?.toUpperCase()}</div><div><strong>{author}</strong><span>EveryGyan editor</span></div><span className="meta-divider" /><span>{publishedDate}</span></div>
            </div>
          </header>
          {published.featured_image_url && <div className="article-cover shell database-cover" role="img" aria-label={published.featured_image_alt || published.title} style={{ backgroundImage: `url(${published.featured_image_url})` }} />}
          <div className="article-layout shell">
            <aside className="share-column" aria-label="Share article"><button aria-label="Save article"><Bookmark size={19} /></button><button aria-label="Share article"><Share2 size={19} /></button></aside>
            <article className="article-content" dangerouslySetInnerHTML={{ __html: published.content_html || "" }} />
            <aside className="article-aside"><div className="aside-card"><p className="eyebrow">About the author</p><h3>{author}</h3><p>EveryGyan editor sharing clear, useful knowledge for curious readers.</p></div></aside>
          </div>
          {published.allow_comments && <section className="comments shell"><div><MessageCircle size={24} /><h2>Join the conversation</h2><p>Sign in to share your perspective.</p></div><Link className="button button-primary" href="/login">Sign in to comment</Link></section>}
          {!!tags.length && <div className="article-tags shell"><span>Topics</span>{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
          <Newsletter />
        </main>
        <SiteFooter />
      </>
    );
  }
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="article-page">
        <header className="article-hero shell">
          <Link className="back-link" href="/"><ArrowLeft size={17} /> Back to latest</Link>
          <div className="article-heading">
            <span className={`section-pill pill-${sectionStyles[article.section]}`}>{article.section}</span>
            <p className="article-kicker">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.excerpt}</p>
            <div className="author-row">
              <div className="author-avatar">S</div>
              <div><strong>{article.author}</strong><span>Founder & editor</span></div>
              <span className="meta-divider" />
              <span>{article.publishedAt}</span>
              <span><Clock3 size={15} /> {article.readTime}</span>
            </div>
          </div>
        </header>

        <div className="article-cover shell">
          <Image src={article.image} alt={article.imageAlt} fill priority sizes="100vw" />
        </div>

        <div className="article-layout shell">
          <aside className="share-column" aria-label="Share article">
            <button aria-label="Save article"><Bookmark size={19} /></button>
            <button aria-label="Share article"><Share2 size={19} /></button>
            <button aria-label="Share on Facebook"><Facebook size={19} /></button>
            <button aria-label="Share on LinkedIn"><Linkedin size={19} /></button>
          </aside>
          <article className="article-content">
            {article.body.map((paragraph, index) => (
              index === 1 ? (
                <div key={paragraph}>
                  <h2>Why this matters now</h2>
                  <p>{paragraph}</p>
                  <blockquote>Curiosity becomes useful when it helps us see familiar things from a clearer point of view.</blockquote>
                </div>
              ) : <p key={paragraph}>{paragraph}</p>
            ))}
            <h2>A practical perspective</h2>
            <p>EveryGyan brings context, clear explanations and useful next steps together in one place. This demonstration article will be replaced by content created in the publishing dashboard.</p>
            <div className="article-tags"><span>Topics</span><a href="#">{article.category}</a><a href="#">Explainer</a><a href="#">EveryGyan</a></div>
          </article>
          <aside className="article-aside">
            <div className="aside-card">
              <p className="eyebrow">About the author</p>
              <h3>Sandeep</h3>
              <p>Founder and editor of EveryGyan, writing about ideas that help readers understand and enjoy the world.</p>
            </div>
          </aside>
        </div>

        <section className="comments shell">
          <div><MessageCircle size={24} /><h2>Join the conversation</h2><p>Sign in to share your perspective. Comments can be moderated by the EveryGyan team.</p></div>
          <Link className="button button-primary" href="/login">Sign in to comment</Link>
        </section>

        <section className="shell content-section">
          <div className="section-heading"><div><p className="eyebrow">Continue exploring</p><h2>More from EveryGyan</h2></div></div>
          <div className="article-grid">{related.map((item) => <ArticleCard key={item.slug} article={item} />)}</div>
        </section>
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
