import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const samples = [
  {
    slug: "cities-rethinking-the-future-of-urban-travel", section: "travel", category: "travel-tips",
    title: "How cities are rethinking the future of urban travel",
    excerpt: "From night trains to walkable neighbourhoods, a new generation of ideas is making city breaks calmer, greener and more memorable.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "A traveller overlooking a dramatic mountain landscape", featured: true, breaking: false, publishedAt: "2026-08-27T09:00:00Z",
    body: ["Travel is changing. The most interesting destinations are no longer competing only for visitor numbers; they are designing better experiences for residents and guests alike.", "That shift can be seen in expanded rail networks, neighbourhood walking routes, small-group cultural experiences and a renewed emphasis on travelling outside peak seasons.", "For travellers, the result is a richer way to explore: slower, more curious and better connected to the places they visit."],
  },
  {
    slug: "five-technology-shifts-to-watch-this-week", section: "news", category: "technology",
    title: "Five technology shifts worth watching this week",
    excerpt: "A concise briefing on the products, policies and research shaping the digital world.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Close-up of a modern computer circuit board", featured: false, breaking: true, publishedAt: "2026-08-27T08:00:00Z",
    body: ["Technology moves quickly, but the most important changes are often visible before they become mainstream.", "This weekly briefing separates durable developments from passing noise and explains why each shift matters."],
  },
  {
    slug: "streaming-stories-redefining-the-small-screen", section: "entertainment", category: "series",
    title: "The streaming stories redefining the small screen",
    excerpt: "Fresh formats, global voices and ambitious limited series are changing what audiences expect.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Rows of seats in a softly lit cinema", featured: false, breaking: false, publishedAt: "2026-08-26T09:00:00Z",
    body: ["The boundary between television and cinema continues to blur as creators experiment with scale, pacing and international collaboration.", "Our guide highlights the storytelling trends behind the season's most discussed releases."],
  },
  {
    slug: "a-practical-guide-to-everyday-nutrition", section: "health", category: "nutrition",
    title: "A practical, balanced guide to everyday nutrition",
    excerpt: "Simple principles for building satisfying meals without chasing every new wellness trend.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A colourful selection of fresh and balanced foods", featured: false, breaking: false, publishedAt: "2026-08-25T09:00:00Z",
    body: ["Good nutrition does not have to be complicated. Consistency, variety and context usually matter more than a single ingredient or rule.", "This educational guide offers a starting point for informed conversations with qualified health professionals."],
  },
  {
    slug: "sap-basics-a-clear-starting-point", section: "learn", category: "sap",
    title: "SAP basics: a clear starting point for new learners",
    excerpt: "Understand systems, modules and business processes before diving into technical terminology.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Notebook and laptop arranged for focused learning", featured: false, breaking: false, publishedAt: "2026-08-24T09:00:00Z",
    body: ["SAP becomes much easier to understand once you see it as a connected set of business processes rather than a collection of screens.", "This introduction maps the essential concepts and gives new learners a practical route through the ecosystem."],
  },
  {
    slug: "small-habits-for-a-stronger-fitness-routine", section: "health", category: "fitness",
    title: "Small habits that make a fitness routine sustainable",
    excerpt: "A realistic approach to movement, recovery and keeping momentum over time.",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Runner exercising outdoors on a quiet road", featured: false, breaking: false, publishedAt: "2026-08-23T09:00:00Z",
    body: ["A durable fitness practice is built through manageable choices repeated over time.", "Start with movement you enjoy, leave space for recovery and seek professional guidance when your health circumstances require it."],
  },
];

const { data: admins, error: adminError } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1);
if (adminError) throw adminError;
const authorId = admins?.[0]?.id;
if (!authorId) throw new Error("No admin profile exists. Promote an account before importing sample articles.");

const [{ data: sections, error: sectionError }, { data: categories, error: categoryError }, { data: existing, error: existingError }] = await Promise.all([
  supabase.from("sections").select("id, slug"),
  supabase.from("categories").select("id, section_id, slug"),
  supabase.from("articles").select("slug").in("slug", samples.map((sample) => sample.slug)),
]);
if (sectionError) throw sectionError;
if (categoryError) throw categoryError;
if (existingError) throw existingError;

const existingSlugs = new Set((existing ?? []).map((article) => article.slug));
let inserted = 0;
for (const sample of samples) {
  if (existingSlugs.has(sample.slug)) continue;
  const section = sections.find((item) => item.slug === sample.section);
  const category = categories.find((item) => item.section_id === section?.id && item.slug === sample.category);
  if (!section || !category) throw new Error(`Missing taxonomy for ${sample.section}/${sample.category}.`);
  const contentHtml = sample.body.map((paragraph) => `<p>${paragraph}</p>`).join("");
  const { data: article, error: articleError } = await supabase.from("articles").insert({
    author_id: authorId,
    section_id: section.id,
    title: sample.title,
    slug: sample.slug,
    excerpt: sample.excerpt,
    content: { type: "html", html: contentHtml },
    content_html: contentHtml,
    featured_image_url: sample.image,
    featured_image_alt: sample.imageAlt,
    status: "published",
    is_featured: sample.featured,
    is_breaking: sample.breaking,
    allow_comments: true,
    seo_title: sample.title,
    seo_description: sample.excerpt,
    published_at: sample.publishedAt,
  }).select("id").single();
  if (articleError) throw articleError;
  const { error: linkError } = await supabase.from("article_categories").insert({ article_id: article.id, category_id: category.id, is_primary: true });
  if (linkError) throw linkError;
  inserted++;
}

const { error: bucketError } = await supabase.storage.getBucket("article-images");
if (bucketError) {
  const { error: createError } = await supabase.storage.createBucket("article-images", {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  });
  if (createError && !createError.message.toLowerCase().includes("already exists")) throw createError;
}

console.log(`Sample article import complete: ${inserted} inserted, ${samples.length - inserted} already present.`);
