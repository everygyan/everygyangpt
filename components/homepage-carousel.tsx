"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Article } from "@/data/articles";
import { sectionStyles } from "@/data/articles";

export function HomepageCarousel({ articles }: { articles: Article[] }) {
  const slides = articles.slice(0, 25);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => setCurrent((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) return <div className="empty-publication"><h2>Select a homepage carousel story.</h2><p>Edit a published article and enable “Homepage carousel” in Article settings.</p></div>;
  const article = slides[current] ?? slides[0];

  return (
    <section className="homepage-carousel" aria-roledescription="carousel" aria-label="Featured stories" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <article className="carousel-slide" aria-live="off">
        <span className="carousel-photo" role="img" aria-label={article.imageAlt} style={{ backgroundImage: `url(${article.image})` }} />
        <div className="carousel-shade" />
        <div className="carousel-copy">
          <span className={`section-pill pill-${sectionStyles[article.section]}`}>{article.section}</span>
          <p className="carousel-category">{article.category}</p>
          <h2><Link href={`/article/${article.slug}`}>{article.title}</Link></h2>
          <p>{article.excerpt}</p>
          <div className="lead-meta"><Clock3 size={16} /> {article.readTime}<span>By {article.author}</span></div>
        </div>
      </article>
      {slides.length > 1 && <>
        <button className="carousel-arrow carousel-previous" type="button" onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} aria-label="Previous featured article"><ArrowLeft size={21} /></button>
        <button className="carousel-arrow carousel-next" type="button" onClick={() => setCurrent((current + 1) % slides.length)} aria-label="Next featured article"><ArrowRight size={21} /></button>
        <div className="carousel-controls" aria-label="Choose featured article">
          <span>{current + 1} / {slides.length}</span>
          <div className="carousel-dots">{slides.map((slide, index) => <button className={index === current ? "active" : undefined} type="button" key={slide.slug} onClick={() => setCurrent(index)} aria-label={`Show ${slide.title}`} aria-current={index === current ? "true" : undefined} />)}</div>
        </div>
      </>}
    </section>
  );
}
