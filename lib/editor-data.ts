import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getEditorOptions() {
  const supabase = await createClient();
  const [{ data: sections, error: sectionsError }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase.from("sections").select("id, name").eq("is_active", true).order("sort_order"),
    supabase.from("categories").select("id, section_id, name").eq("is_active", true).order("sort_order"),
  ]);
  if (sectionsError) throw new Error(`Could not load sections: ${sectionsError.message}`);
  if (categoriesError) throw new Error(`Could not load categories: ${categoriesError.message}`);
  return { sections: sections ?? [], categories: categories ?? [] };
}
