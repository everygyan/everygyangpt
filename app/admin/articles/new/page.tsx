import { ArticleEditor } from "@/components/article-editor";
import { getEditorOptions } from "@/lib/editor-data";

export default async function NewArticlePage() {
  const { sections, categories } = await getEditorOptions();
  return <ArticleEditor sections={sections} categories={categories} />;
}
