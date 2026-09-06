"use server";

import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { requireEditorialUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ArticleActionState = {
  error?: string;
  success?: string;
  articleId?: string;
  slug?: string;
  status?: "draft" | "published";
};

const cleanHtmlOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
    "blockquote", "ul", "ol", "li", "a", "figure", "figcaption", "img", "hr", "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }, true),
  },
};

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function saveArticle(
  previous: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  const profile = await requireEditorialUser();
  const title = text(formData, "title");
  const excerpt = text(formData, "excerpt");
  const authorName = text(formData, "authorName");
  const sectionId = text(formData, "sectionId");
  const categoryId = text(formData, "categoryId");
  const cleanContent = sanitizeHtml(text(formData, "contentHtml"), cleanHtmlOptions);
  const contentText = sanitizeHtml(cleanContent, { allowedTags: [], allowedAttributes: {} }).trim();
  const intent = text(formData, "intent") === "publish" ? "published" : "draft";

  if (title.length < 5) return { ...previous, error: "The headline must contain at least 5 characters." };
  if (excerpt.length < 20) return { ...previous, error: "Add a summary of at least 20 characters." };
  if (authorName.length < 2) return { ...previous, error: "Add the author name shown to readers." };
  if (!sectionId) return { ...previous, error: "Choose a section for this article." };
  if (!categoryId) return { ...previous, error: "Choose a category for this article." };
  if (contentText.length < 20) return { ...previous, error: "Write at least 20 characters in the article body." };

  const supabase = await createClient();
  const existingId = text(formData, "articleId") || previous.articleId || "";
  let slug = text(formData, "slug") || previous.slug || "";
  if (!slug) slug = `${slugify(title) || "article"}-${crypto.randomUUID().slice(0, 8)}`;

  const isFeatured = formData.get("isFeatured") === "on";
  if (isFeatured) {
    let featuredQuery = supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_featured", true);
    if (existingId) featuredQuery = featuredQuery.neq("id", existingId);
    const { count, error } = await featuredQuery;
    if (error) return { ...previous, error: `Could not check carousel capacity: ${error.message}` };
    if ((count ?? 0) >= 25) return { ...previous, error: "The homepage carousel already has 25 articles. Remove one before adding another." };
  }

  const articleValues = {
    author_id: profile.id,
    section_id: sectionId,
    title,
    slug,
    excerpt,
    content: { type: "html", html: cleanContent, authorName },
    content_html: cleanContent,
    featured_image_url: text(formData, "featuredImageUrl") || null,
    featured_image_alt: text(formData, "featuredImageAlt") || title,
    status: intent,
    is_featured: isFeatured,
    is_breaking: formData.get("isBreaking") === "on",
    allow_comments: formData.get("allowComments") === "on",
    seo_title: text(formData, "seoTitle") || null,
    seo_description: text(formData, "seoDescription") || excerpt,
    published_at: intent === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const result = existingId
    ? await supabase.from("articles").update(articleValues).eq("id", existingId).select("id, slug").single()
    : await supabase.from("articles").insert(articleValues).select("id, slug").single();
  if (result.error || !result.data) {
    return { ...previous, error: result.error?.message || "The article could not be saved." };
  }

  const articleId = result.data.id as string;
  slug = result.data.slug as string;

  const { error: categoryDeleteError } = await supabase
    .from("article_categories")
    .delete()
    .eq("article_id", articleId);
  if (categoryDeleteError) return { articleId, slug, status: intent, error: categoryDeleteError.message };
  if (categoryId) {
    const { error } = await supabase.from("article_categories").insert({
      article_id: articleId,
      category_id: categoryId,
      is_primary: true,
    });
    if (error) return { articleId, slug, status: intent, error: error.message };
  }

  const tagNames = Array.from(new Set(text(formData, "tags").split(",").map((tag) => tag.trim()).filter(Boolean))).slice(0, 12);
  const { error: tagDeleteError } = await supabase.from("article_tags").delete().eq("article_id", articleId);
  if (tagDeleteError) return { articleId, slug, status: intent, error: tagDeleteError.message };
  if (tagNames.length) {
    const tagValues = tagNames.map((name) => ({ name, slug: slugify(name) }));
    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .upsert(tagValues, { onConflict: "slug" })
      .select("id");
    if (tagsError) return { articleId, slug, status: intent, error: tagsError.message };
    const { error: linksError } = await supabase.from("article_tags").insert(
      (tags ?? []).map((tag) => ({ article_id: articleId, tag_id: tag.id })),
    );
    if (linksError) return { articleId, slug, status: intent, error: linksError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/article/${slug}`);
  return {
    articleId,
    slug,
    status: intent,
    success: intent === "published" ? "Article published successfully." : "Draft saved successfully.",
  };
}

export async function deleteArticle(articleId: string) {
  const profile = await requireEditorialUser();
  if (profile.role !== "admin") return { error: "Only an administrator can delete articles." };
  const supabase = await createClient();
  const { data: article, error: findError } = await supabase
    .from("articles")
    .select("slug")
    .eq("id", articleId)
    .single();
  if (findError || !article) return { error: findError?.message || "The article was not found." };
  const { error } = await supabase.from("articles").delete().eq("id", articleId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/article/${article.slug}`);
  return { success: true };
}
