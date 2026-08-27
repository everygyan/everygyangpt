import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SearchExperience } from "@/components/search-experience";

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className="search-page shell"><p>Loading search…</p></main>}>
        <SearchExperience />
      </Suspense>
      <SiteFooter />
    </>
  );
}

