import { ArticleEditor } from "@/components/article-editor";
import { getEditorOptions } from "@/lib/editor-data";
import { requireEditorialUser } from "@/lib/auth";

export default async function NewArticlePage() {
  const [profile, { sections, categories }] = await Promise.all([requireEditorialUser(), getEditorOptions()]);
  return <ArticleEditor sections={sections} categories={categories} initial={{ authorName: profile.display_name }} />;
}
