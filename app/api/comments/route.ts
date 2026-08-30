import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function cleanLine(value: unknown, limit: number) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);
}

function cleanBody(value: unknown) {
  return String(value ?? "").replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim().slice(0, 4000);
}

export async function POST(request: Request) {
  let input: { articleId?: unknown; name?: unknown; body?: unknown; website?: unknown };
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "The comment could not be read." }, { status: 400 });
  }

  if (cleanLine(input.website, 200)) return Response.json({ success: true });
  const articleId = cleanLine(input.articleId, 80);
  const guestName = cleanLine(input.name, 80);
  const body = cleanBody(input.body);
  if (!articleId) return Response.json({ error: "The article is missing." }, { status: 400 });
  if (guestName.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (body.length < 3) return Response.json({ error: "Please write a comment of at least 3 characters." }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("id, allow_comments")
      .eq("id", articleId)
      .eq("status", "published")
      .maybeSingle();
    if (articleError || !article) return Response.json({ error: "This article is not available for comments." }, { status: 404 });
    if (!article.allow_comments) return Response.json({ error: "Comments are closed for this article." }, { status: 403 });

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({ article_id: article.id, user_id: null, guest_name: guestName, body })
      .select("id, guest_name, body, created_at")
      .single();
    if (error || !comment) throw error || new Error("The comment could not be saved.");
    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The comment could not be saved.";
    return Response.json({ error: message }, { status: 500 });
  }
}
