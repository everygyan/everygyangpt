import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/data/articles";

export function LiveTicker({ articles }: { articles: Article[] }) {
  const items = articles.slice(0, 25);
  return (
    <div className="breaking-strip" aria-label="Live article topics">
      <div className="shell breaking-inner">
        <span className="breaking-label">Live</span>
        {items.length ? (
          <div className="live-ticker-window">
            <div className="live-ticker-track">
              {[...items, ...items].map((article, index) => (
                <Link href={`/article/${article.slug}`} key={`${article.slug}-${index}`} aria-hidden={index >= items.length} tabIndex={index >= items.length ? -1 : undefined}>
                  <strong>{article.category}</strong><span>{article.title}</span><i aria-hidden="true">•</i>
                </Link>
              ))}
            </div>
          </div>
        ) : <span className="live-empty">Topics selected for Live will scroll here.</span>}
        <Link className="live-follow" href="/#latest">Follow updates <ArrowRight size={15} /></Link>
      </div>
    </div>
  );
}
