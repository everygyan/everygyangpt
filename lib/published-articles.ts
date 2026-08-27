import "server-only";

import type { Article, Section } from "@/data/articles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

const fallbackImages: Record<Section, string> = {
  News: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=85",
  Travel: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  Entertainment: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=85",
  Health: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=85",
  Learn: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85",
};

function relationName(value: unknown): string | undefined {
  if (Array.isArray(value)) return relationName(value[0]);
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : undefined;
  }
  return undefined;
}

function displayName(value: unknown): string | undefined {
  if (Array.isArray(value)) return displayName(value[0]);
  if (value && typeof value === "object" && "display_name" in value) {
    const name = (value as { display_name?: unknown }).display_name;
    return typeof name === "string" ? name : undefined;
  }
  return undefined;
}

function validSection(value: string | undefined): Section {
  return (["News", "Travel", "Entertainment", "Health", "Learn"] as string[]).includes(value ?? "")
    ? value as Section
    : "News";
}

export async function getPublishedArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, title, excerpt, content_html, featured_image_url, featured_image_alt, is_featured, published_at, sections(name), profiles(display_name), article_categories(is_primary, categories(name))")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) return [];

    return (data ?? []).map((row) => {
      const section = validSection(relationName(row.sections));
      const categories = row.article_categories as unknown as Array<{ is_primary?: boolean; categories?: unknown }> | null;
      const primaryCategory = categories?.find((item) => item.is_primary) ?? categories?.[0];
      const plainText = String(row.content_html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const readMinutes = Math.max(1, Math.ceil(plainText.split(" ").filter(Boolean).length / 220));
      return {
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt ?? "",
        section,
        category: relationName(primaryCategory?.categories) ?? section,
        image: row.featured_image_url || fallbackImages[section],
        imageAlt: row.featured_image_alt || row.title,
        author: displayName(row.profiles) ?? "Sandeep",
        publishedAt: new Date(row.published_at ?? Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        readTime: `${readMinutes} min read`,
        featured: row.is_featured,
        body: [],
      } satisfies Article;
    });
  } catch {
    return [];
  }
}
