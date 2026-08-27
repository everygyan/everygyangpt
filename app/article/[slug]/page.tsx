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

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
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

