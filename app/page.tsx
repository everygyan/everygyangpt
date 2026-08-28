import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { sectionStyles, sections } from "@/data/articles";
import { getPublishedArticles } from "@/lib/published-articles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const databaseArticles = await getPublishedArticles();
  const contentArticles = databaseArticles;
  const featured = contentArticles.find((article) => article.featured) ?? contentArticles[0];
  const leadStories = featured ? contentArticles.filter((article) => article.slug !== featured.slug).slice(0, 3) : [];

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

          {featured ? <div className="hero-grid">
            <article className="lead-story">
              <Link className="lead-image" href={`/article/${featured.slug}`}>
                <span className="lead-photo" role="img" aria-label={featured.imageAlt} style={{ backgroundImage: `url(${featured.image})` }} />
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
          </div> : <div className="empty-publication"><h2>Your next story starts here.</h2><p>Published articles will appear here as soon as they are ready.</p></div>}
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
            {contentArticles.slice(0, 6).map((article) => <ArticleCard key={article.slug} article={article} />)}
          </div>
        </section>

        {sections.map((section) => {
          const sectionArticles = contentArticles.filter((article) => article.section === section.name).slice(0, 6);
          if (!sectionArticles.length) return null;
          return (
            <section className="shell content-section" id={section.name.toLowerCase()} key={section.name} aria-labelledby={`${section.name.toLowerCase()}-heading`}>
              <div className="section-heading">
                <div><p className="eyebrow">{section.description}</p><h2 id={`${section.name.toLowerCase()}-heading`}>{section.name}</h2></div>
                <Link className="text-link" href={`/search?q=${section.name.toLowerCase()}`}>Explore {section.name.toLowerCase()} <ArrowRight size={17} /></Link>
              </div>
              <div className="article-grid">
                {sectionArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}
              </div>
              {section.name === "Health" && <p className="health-note">EveryGyan health content is educational and does not replace advice from a qualified health professional.</p>}
            </section>
          );
        })}

        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
