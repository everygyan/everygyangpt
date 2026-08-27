export type Section = "News" | "Travel" | "Entertainment" | "Health" | "Learn";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  section: Section;
  category: string;
  image: string;
  imageAlt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  breaking?: boolean;
  body: string[];
};

export const sectionStyles: Record<Section, string> = {
  News: "blue",
  Travel: "teal",
  Entertainment: "violet",
  Health: "green",
  Learn: "orange",
};

export const articles: Article[] = [
  {
    slug: "cities-rethinking-the-future-of-urban-travel",
    title: "How cities are rethinking the future of urban travel",
    excerpt:
      "From night trains to walkable neighbourhoods, a new generation of ideas is making city breaks calmer, greener and more memorable.",
    section: "Travel",
    category: "Travel Trends",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "A traveller overlooking a dramatic mountain landscape",
    author: "Sandeep",
    publishedAt: "27 Aug 2026",
    readTime: "6 min read",
    featured: true,
    body: [
      "Travel is changing. The most interesting destinations are no longer competing only for visitor numbers; they are designing better experiences for residents and guests alike.",
      "That shift can be seen in expanded rail networks, neighbourhood walking routes, small-group cultural experiences and a renewed emphasis on travelling outside peak seasons.",
      "For travellers, the result is a richer way to explore: slower, more curious and better connected to the places they visit.",
    ],
  },
  {
    slug: "five-technology-shifts-to-watch-this-week",
    title: "Five technology shifts worth watching this week",
    excerpt: "A concise briefing on the products, policies and research shaping the digital world.",
    section: "News",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Close-up of a modern computer circuit board",
    author: "Sandeep",
    publishedAt: "27 Aug 2026",
    readTime: "4 min read",
    breaking: true,
    body: [
      "Technology moves quickly, but the most important changes are often visible before they become mainstream.",
      "This weekly briefing separates durable developments from passing noise and explains why each shift matters.",
    ],
  },
  {
    slug: "streaming-stories-redefining-the-small-screen",
    title: "The streaming stories redefining the small screen",
    excerpt: "Fresh formats, global voices and ambitious limited series are changing what audiences expect.",
    section: "Entertainment",
    category: "TV & Streaming",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Rows of seats in a softly lit cinema",
    author: "Sandeep",
    publishedAt: "26 Aug 2026",
    readTime: "5 min read",
    body: [
      "The boundary between television and cinema continues to blur as creators experiment with scale, pacing and international collaboration.",
      "Our guide highlights the storytelling trends behind the season's most discussed releases.",
    ],
  },
  {
    slug: "a-practical-guide-to-everyday-nutrition",
    title: "A practical, balanced guide to everyday nutrition",
    excerpt: "Simple principles for building satisfying meals without chasing every new wellness trend.",
    section: "Health",
    category: "Nutrition",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A colourful selection of fresh and balanced foods",
    author: "Sandeep",
    publishedAt: "25 Aug 2026",
    readTime: "7 min read",
    body: [
      "Good nutrition does not have to be complicated. Consistency, variety and context usually matter more than a single ingredient or rule.",
      "This educational guide offers a starting point for informed conversations with qualified health professionals.",
    ],
  },
  {
    slug: "sap-basics-a-clear-starting-point",
    title: "SAP basics: a clear starting point for new learners",
    excerpt: "Understand systems, modules and business processes before diving into technical terminology.",
    section: "Learn",
    category: "SAP",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Notebook and laptop arranged for focused learning",
    author: "Sandeep",
    publishedAt: "24 Aug 2026",
    readTime: "8 min read",
    body: [
      "SAP becomes much easier to understand once you see it as a connected set of business processes rather than a collection of screens.",
      "This introduction maps the essential concepts and gives new learners a practical route through the ecosystem.",
    ],
  },
  {
    slug: "small-habits-for-a-stronger-fitness-routine",
    title: "Small habits that make a fitness routine sustainable",
    excerpt: "A realistic approach to movement, recovery and keeping momentum over time.",
    section: "Health",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Runner exercising outdoors on a quiet road",
    author: "Sandeep",
    publishedAt: "23 Aug 2026",
    readTime: "5 min read",
    body: [
      "A durable fitness practice is built through manageable choices repeated over time.",
      "Start with movement you enjoy, leave space for recovery and seek professional guidance when your health circumstances require it.",
    ],
  },
];

export const sections: { name: Section; description: string }[] = [
  { name: "News", description: "World, technology and ideas that matter" },
  { name: "Travel", description: "Places, people and practical guides" },
  { name: "Entertainment", description: "Movies, series, music and culture" },
  { name: "Health", description: "Nutrition, fitness and balanced living" },
  { name: "Learn", description: "SAP, technology and creative skills" },
];

