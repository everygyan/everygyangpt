"use server";

import { revalidatePath } from "next/cache";
import { requireEditorialUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type MenuActionState = { error?: string; success?: string };

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function requireAdmin() {
  const profile = await requireEditorialUser();
  if (profile.role !== "admin") throw new Error("Only an administrator can manage navigation menus.");
  return profile;
}

function validCustomUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function saveMenuItem(_previous: MenuActionState, formData: FormData): Promise<MenuActionState> {
  try {
    await requireAdmin();
    const label = text(formData, "label");
    const target = text(formData, "target");
    const parentId = text(formData, "parentId") || null;
    const itemId = text(formData, "itemId");
    const sortOrder = Math.max(0, Math.min(999, Number.parseInt(text(formData, "sortOrder") || "0", 10) || 0));
    if (label.length < 2 || label.length > 60) return { error: "Menu labels must contain 2 to 60 characters." };

    const supabase = await createClient();
    const menuResult = await supabase.from("menus").select("id").eq("location", "header").maybeSingle();
    let menu = menuResult.data;
    if (menuResult.error) return { error: menuResult.error.message };
    if (!menu) {
      const created = await supabase.from("menus").insert({ name: "Primary navigation", location: "header" }).select("id").single();
      if (created.error || !created.data) return { error: created.error?.message || "The primary menu could not be created." };
      menu = created.data;
    }

    if (parentId) {
      const { data: parent } = await supabase.from("menu_items").select("id, parent_id").eq("id", parentId).eq("menu_id", menu.id).maybeSingle();
      if (!parent || parent.parent_id) return { error: "Choose a valid main menu item as the parent." };
      if (parent.id === itemId) return { error: "A menu item cannot be its own parent." };
      if (itemId) {
        const { count: childCount } = await supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("parent_id", itemId);
        if (childCount) return { error: "Move or delete this item's submenus before making it a submenu." };
      }
    }

    let url: string | null = null;
    let sectionId: string | null = null;
    let categoryId: string | null = null;
    if (target === "none") {
      if (parentId) return { error: "Choose a destination for this submenu item." };
    } else if (target.startsWith("section:")) sectionId = target.slice(8);
    else if (target.startsWith("category:")) categoryId = target.slice(9);
    else if (target === "custom") {
      url = validCustomUrl(text(formData, "customUrl"));
      if (!url) return { error: "Enter a valid internal path or an HTTP/HTTPS URL." };
    } else return { error: "Choose where this menu item should link." };

    const values = {
      menu_id: menu.id,
      parent_id: parentId,
      label,
      url,
      section_id: sectionId,
      category_id: categoryId,
      sort_order: sortOrder,
      is_active: formData.get("isActive") === "on",
    };
    const result = itemId
      ? await supabase.from("menu_items").update(values).eq("id", itemId).eq("menu_id", menu.id)
      : await supabase.from("menu_items").insert(values);
    if (result.error) return { error: result.error.message };
    revalidatePath("/admin/menus");
    revalidatePath("/", "layout");
    return { success: itemId ? "Menu item updated." : target === "none" ? "Main menu heading created. You can now add submenus beneath it." : "Menu item created." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The menu item could not be saved." };
  }
}

export async function deleteMenuItem(itemId: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
    if (error) return { error: error.message };
    revalidatePath("/admin/menus");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The menu item could not be deleted." };
  }
}

