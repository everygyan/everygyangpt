import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SearchExperience } from "@/components/search-experience";
import { getPublishedArticles } from "@/lib/published-articles";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const published = await getPublishedArticles();
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className="search-page shell"><p>Loading search…</p></main>}>
        <SearchExperience articles={published} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
