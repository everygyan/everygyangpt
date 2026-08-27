import { notFound } from "next/navigation";
import { ArticleEditor, type ArticleEditorData } from "@/components/article-editor";
import { getEditorOptions } from "@/lib/editor-data";
import { createClient } from "@/lib/supabase/server";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ sections, categories }, articleResult, categoryResult, tagsResult] = await Promise.all([
    getEditorOptions(),
    supabase.from("articles").select("id, title, slug, excerpt, content_html, section_id, featured_image_url, featured_image_alt, is_featured, allow_comments, seo_title, seo_description").eq("id", id).single(),
    supabase.from("article_categories").select("category_id").eq("article_id", id).eq("is_primary", true).maybeSingle(),
    supabase.from("article_tags").select("tags(name)").eq("article_id", id),
  ]);
  if (articleResult.error || !articleResult.data) notFound();
  const article = articleResult.data;
  const tagNames = (tagsResult.data ?? [])
    .map((item) => {
      const relation = item.tags as unknown as { name?: string } | { name?: string }[] | null;
      return Array.isArray(relation) ? relation[0]?.name : relation?.name;
    })
    .filter(Boolean)
    .join(", ");
  const initial: ArticleEditorData = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    contentHtml: article.content_html ?? "",
    sectionId: article.section_id,
    categoryId: categoryResult.data?.category_id,
    tags: tagNames,
    featuredImageUrl: article.featured_image_url ?? "",
    featuredImageAlt: article.featured_image_alt ?? "",
    isFeatured: article.is_featured,
    allowComments: article.allow_comments,
    seoTitle: article.seo_title ?? "",
    seoDescription: article.seo_description ?? "",
  };
  return <ArticleEditor sections={sections} categories={categories} initial={initial} />;
}
