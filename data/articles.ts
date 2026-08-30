export type Section = "News" | "Travel" | "Entertainment" | "Health" | "Learn";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  section: Section;
  category: string;
  sectionSlug?: string;
  categorySlug?: string;
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

export const sections: { name: Section; description: string }[] = [
  { name: "News", description: "World, technology and ideas that matter" },
  { name: "Travel", description: "Places, people and practical guides" },
  { name: "Entertainment", description: "Movies, series, music and culture" },
  { name: "Health", description: "Nutrition, fitness and balanced living" },
  { name: "Learn", description: "SAP, technology and creative skills" },
];
