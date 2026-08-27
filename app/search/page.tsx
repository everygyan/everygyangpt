import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SearchExperience } from "@/components/search-experience";
import { articles } from "@/data/articles";
import { getPublishedArticles } from "@/lib/published-articles";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const published = await getPublishedArticles();
  const publishedSlugs = new Set(published.map((article) => article.slug));
  const searchableArticles = [...published, ...articles.filter((article) => !publishedSlugs.has(article.slug))];
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className="search-page shell"><p>Loading search…</p></main>}>
        <SearchExperience articles={searchableArticles} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
