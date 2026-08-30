import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: menu, error: menuError } = await supabase.from("menus").upsert({ name: "Primary navigation", location: "header" }, { onConflict: "location" }).select("id").single();
if (menuError) throw menuError;
const { count, error: countError } = await supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("menu_id", menu.id);
if (countError) throw countError;
if (count) {
  console.log(`Navigation seed skipped: ${count} menu items already exist.`);
  process.exit(0);
}

const [{ data: sections, error: sectionError }, { data: categories, error: categoryError }] = await Promise.all([
  supabase.from("sections").select("id, name, sort_order").eq("is_active", true).order("sort_order"),
  supabase.from("categories").select("id, section_id, name, sort_order").eq("is_active", true).order("sort_order"),
]);
if (sectionError) throw sectionError;
if (categoryError) throw categoryError;

const { error: latestError } = await supabase.from("menu_items").insert({ menu_id: menu.id, label: "Latest", url: "/#latest", sort_order: 0, is_active: true });
if (latestError) throw latestError;
let inserted = 1;
for (const section of sections ?? []) {
  const { data: root, error: rootError } = await supabase.from("menu_items").insert({ menu_id: menu.id, label: section.name, section_id: section.id, sort_order: section.sort_order * 10, is_active: true }).select("id").single();
  if (rootError) throw rootError;
  inserted++;
  const children = (categories ?? []).filter((category) => category.section_id === section.id).map((category) => ({ menu_id: menu.id, parent_id: root.id, label: category.name, category_id: category.id, sort_order: category.sort_order, is_active: true }));
  if (children.length) {
    const { error: childError } = await supabase.from("menu_items").insert(children);
    if (childError) throw childError;
    inserted += children.length;
  }
}
console.log(`Navigation seed complete: ${inserted} menu items created.`);
