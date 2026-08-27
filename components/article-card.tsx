import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Article, sectionStyles } from "@/data/articles";

type ArticleCardProps = {
  article: Article;
  variant?: "standard" | "compact" | "horizontal";
};

export function ArticleCard({ article, variant = "standard" }: ArticleCardProps) {
  return (
    <article className={`article-card article-card-${variant}`}>
      <Link className="card-image" href={`/article/${article.slug}`}>
        <span className="card-photo" role="img" aria-label={article.imageAlt} style={{ backgroundImage: `url(${article.image})` }} />
        <span className={`section-pill pill-${sectionStyles[article.section]}`}>{article.section}</span>
      </Link>
      <div className="card-body">
        <p className="card-category">{article.category}</p>
        <h3><Link href={`/article/${article.slug}`}>{article.title}</Link></h3>
        {variant !== "compact" && <p className="card-excerpt">{article.excerpt}</p>}
        <div className="article-meta">
          <span>{article.publishedAt}</span>
          <span aria-hidden="true">•</span>
          <span>{article.readTime}</span>
          <ArrowUpRight size={16} className="card-arrow" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
