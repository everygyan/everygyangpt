"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function setCommentHidden(commentId: string, hidden: boolean) {
  await requireAdminUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .update({ is_hidden: hidden, hidden_reason: hidden ? "Hidden by administrator" : null })
    .eq("id", commentId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/comments");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  await requireAdminUser();
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/comments");
  return { success: true };
}
