import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Play, Sparkles } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { articles, sectionStyles, sections } from "@/data/articles";

export default function Home() {
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const leadStories = articles.filter((article) => article.slug !== featured.slug).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="breaking-strip">
          <div className="shell breaking-inner">
            <span className="breaking-label">Live</span>
            <strong>Today&apos;s briefing</strong>
            <span>Technology, global affairs and the ideas shaping tomorrow</span>
            <Link href="/#latest">Follow updates <ArrowRight size={15} /></Link>
          </div>
        </div>

        <section className="shell hero-section" aria-labelledby="top-stories-title">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Thursday edition</p>
              <h1 id="top-stories-title">Stories for curious minds.</h1>
            </div>
            <p className="hero-intro">A sharper view of the world, with useful ideas for how you travel, learn and live.</p>
          </div>

          <div className="hero-grid">
            <article className="lead-story">
              <Link className="lead-image" href={`/article/${featured.slug}`}>
                <Image src={featured.image} alt={featured.imageAlt} fill priority sizes="(max-width: 900px) 100vw, 66vw" />
                <div className="image-shade" />
                <div className="lead-copy">
                  <span className={`section-pill pill-${sectionStyles[featured.section]}`}>{featured.section}</span>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <div className="lead-meta"><Clock3 size={16} /> {featured.readTime} <span>By {featured.author}</span></div>
                </div>
              </Link>
            </article>

            <div className="lead-stack">
              {leadStories.map((article, index) => (
                <ArticleCard key={article.slug} article={article} variant={index === 0 ? "horizontal" : "compact"} />
              ))}
            </div>
          </div>
        </section>

        <section className="shell topic-rail" aria-label="Explore EveryGyan topics">
          {sections.map((section) => (
            <Link key={section.name} href={`/#${section.name.toLowerCase()}`} className={`topic-card topic-${sectionStyles[section.name]}`}>
              <span>{section.name}</span>
              <small>{section.description}</small>
              <ArrowRight size={18} />
            </Link>
          ))}
        </section>

        <section className="shell content-section" id="latest" aria-labelledby="latest-heading">
          <div className="section-heading">
            <div><p className="eyebrow">Fresh from the desk</p><h2 id="latest-heading">Latest stories</h2></div>
            <Link className="text-link" href="/search">View all <ArrowRight size={17} /></Link>
          </div>
          <div className="article-grid">
            {articles.slice(1, 4).map((article) => <ArticleCard key={article.slug} article={article} />)}
          </div>
        </section>

        <section className="knowledge-band" id="learn">
          <div className="shell knowledge-grid">
            <div className="knowledge-copy">
              <span className="feature-icon"><Sparkles size={23} /></span>
              <p className="eyebrow">Learn something useful</p>
              <h2>Knowledge that moves with you.</h2>
              <p>Clear explainers, practical tutorials and structured learning paths—from SAP and new technology to creative skills.</p>
              <Link className="button button-light" href={`/article/${articles[4].slug}`}>Start learning <ArrowRight size={18} /></Link>
            </div>
            <Link className="knowledge-feature" href={`/article/${articles[4].slug}`}>
              <Image src={articles[4].image} alt={articles[4].imageAlt} fill sizes="(max-width: 800px) 100vw, 50vw" />
              <span className="video-button"><Play fill="currentColor" size={18} /> 8 min lesson</span>
              <div><small>{articles[4].category} · Beginner</small><h3>{articles[4].title}</h3></div>
            </Link>
          </div>
        </section>

        <section className="shell content-section" id="health" aria-labelledby="health-heading">
          <div className="section-heading">
            <div><p className="eyebrow">Evidence-minded living</p><h2 id="health-heading">Health & wellness</h2></div>
            <Link className="text-link" href="/search?q=health">Explore health <ArrowRight size={17} /></Link>
          </div>
          <div className="article-grid two-up">
            {articles.filter((article) => article.section === "Health").map((article) => (
              <ArticleCard key={article.slug} article={article} variant="horizontal" />
            ))}
          </div>
          <p className="health-note">EveryGyan health content is educational and does not replace advice from a qualified health professional.</p>
        </section>

        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}

