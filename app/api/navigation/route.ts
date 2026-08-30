import { sections as defaultSections } from "@/data/articles";
import type { NavigationItem } from "@/lib/navigation-types";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type RelatedRecord = { slug?: string; sections?: RelatedRecord | RelatedRecord[] | null };

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function safeHref(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function fallbackNavigation(): NavigationItem[] {
  return [
    { id: "latest", label: "Latest", href: "/#latest", children: [] },
    ...defaultSections.map((section) => ({
      id: section.name.toLowerCase(),
      label: section.name,
      href: `/topic/${section.name.toLowerCase()}`,
      children: [],
    })),
  ];
}

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();
    const { data: menu } = await supabase.from("menus").select("id").eq("location", "header").maybeSingle();
    if (!menu) return Response.json({ items: fallbackNavigation() }, { headers: { "Cache-Control": "no-store" } });
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, parent_id, label, url, sort_order, sections(slug), categories(slug, sections(slug))")
      .eq("menu_id", menu.id)
      .eq("is_active", true)
      .order("sort_order")
      .order("label");
    if (error || !data?.length) return Response.json({ items: fallbackNavigation() }, { headers: { "Cache-Control": "no-store" } });

    const flat = data.map((row) => {
      const section = one(row.sections as RelatedRecord | RelatedRecord[] | null);
      const category = one(row.categories as RelatedRecord | RelatedRecord[] | null);
      const categorySection = one(category?.sections);
      const href = safeHref(row.url)
        ?? (category?.slug && categorySection?.slug ? `/topic/${categorySection.slug}/${category.slug}` : null)
        ?? (section?.slug ? `/topic/${section.slug}` : "/");
      return { id: row.id, parentId: row.parent_id, label: row.label, href, children: [] as NavigationItem[] };
    });
    const byId = new Map(flat.map((item) => [item.id, item]));
    const roots: NavigationItem[] = [];
    for (const item of flat) {
      const parent = item.parentId ? byId.get(item.parentId) : null;
      const publicItem: NavigationItem = { id: item.id, label: item.label, href: item.href, children: item.children };
      if (parent) parent.children.push(publicItem);
      else roots.push(publicItem);
    }
    return Response.json({ items: roots }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ items: fallbackNavigation() }, { headers: { "Cache-Control": "no-store" } });
  }
}
