import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedArticles } from "@/lib/published-articles";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type Topic = { name: string; description: string | null; sectionSlug: string; categorySlug?: string };

async function getTopic(slugs: string[]): Promise<Topic | null> {
  if (!slugs.length || slugs.length > 2) return null;
  const supabase = createPublicSupabaseClient();
  const { data: section } = await supabase.from("sections").select("id, name, slug, description").eq("slug", slugs[0]).maybeSingle();
  if (!section) return null;
  if (!slugs[1]) return { name: section.name, description: section.description, sectionSlug: section.slug };
  const { data: category } = await supabase.from("categories").select("name, slug, description").eq("section_id", section.id).eq("slug", slugs[1]).maybeSingle();
  if (!category) return null;
  return { name: category.name, description: category.description, sectionSlug: section.slug, categorySlug: category.slug };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const topic = await getTopic((await params).slug);
  return topic ? { title: `${topic.name} articles`, description: topic.description ?? undefined } : {};
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const topic = await getTopic((await params).slug);
  if (!topic) notFound();
  const allArticles = await getPublishedArticles();
  const articles = allArticles.filter((article) => article.sectionSlug === topic.sectionSlug && (!topic.categorySlug || article.categorySlug === topic.categorySlug));

  return (
    <>
      <SiteHeader />
      <main className="topic-page">
        <header className="topic-hero">
          <div className="shell"><p className="eyebrow">Explore EveryGyan</p><h1>{topic.name}</h1><p>{topic.description || `Latest articles and practical knowledge about ${topic.name}.`}</p></div>
        </header>
        <section className="shell content-section">
          <div className="section-heading"><div><p className="eyebrow">Latest stories</p><h2>{articles.length} {articles.length === 1 ? "article" : "articles"}</h2></div></div>
          {articles.length ? <div className="article-grid">{articles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div> : <div className="empty-publication"><h2>No published articles yet.</h2><p>New stories tagged to this topic will appear here automatically.</p></div>}
        </section>
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
