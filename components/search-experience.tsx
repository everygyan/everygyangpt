"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/data/articles";

export function SearchExperience({ articles }: { articles: Article[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const normalized = query.toLowerCase();
  const matches = normalized
    ? articles.filter((article) => `${article.title} ${article.excerpt} ${article.section} ${article.category}`.toLowerCase().includes(normalized))
    : articles;

  return (
    <main className="search-page shell">
      <p className="eyebrow">Explore EveryGyan</p>
      <h1>Search stories and knowledge</h1>
      <form className="large-search-form">
        <Search size={22} />
        <input name="q" type="search" defaultValue={query} placeholder="Try technology, travel, SAP or nutrition..." />
        <button className="button button-primary" type="submit">Search</button>
      </form>
      <div className="search-summary"><strong>{matches.length} results</strong>{query && <span>for “{query}”</span>}</div>
      <div className="article-grid">{matches.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
    </main>
  );
}
