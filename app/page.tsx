import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { HomepageCarousel } from "@/components/homepage-carousel";
import { LiveTicker } from "@/components/live-ticker";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { sectionStyles, sections } from "@/data/articles";
import { getPublishedArticles } from "@/lib/published-articles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const databaseArticles = await getPublishedArticles();
  const contentArticles = databaseArticles;
  const carouselArticles = contentArticles.filter((article) => article.featured).slice(0, 25);
  const liveArticles = contentArticles.filter((article) => article.breaking).slice(0, 25);

  return (
    <>
      <SiteHeader />
      <main>
        <LiveTicker articles={liveArticles} />

        <section className="shell hero-section" aria-labelledby="top-stories-title">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Thursday edition</p>
              <h1 id="top-stories-title">Stories for curious minds.</h1>
            </div>
            <p className="hero-intro">A sharper view of the world, with useful ideas for how you travel, learn and live.</p>
          </div>

          <HomepageCarousel articles={carouselArticles} />
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
