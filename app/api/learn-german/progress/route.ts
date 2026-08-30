import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { lessonSlug?: string; score?: number };
    const lessonSlug = String(payload.lessonSlug ?? "").trim();
    const score = Math.max(0, Math.min(100, Number(payload.score) || 0));
    if (!lessonSlug || lessonSlug.length > 100) return Response.json({ error: "Invalid lesson." }, { status: 400 });

    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (!userId) return Response.json({ error: "Sign in to sync progress." }, { status: 401 });

    const { data: lesson, error: lessonError } = await supabase
      .from("german_lessons")
      .select("slug, xp_reward")
      .eq("slug", lessonSlug)
      .eq("is_published", true)
      .maybeSingle();
    if (lessonError || !lesson) return Response.json({ error: "This lesson is not available in Supabase yet." }, { status: 404 });

    const { error } = await supabase.from("german_progress").upsert({
      user_id: userId,
      lesson_slug: lesson.slug,
      status: "completed",
      score,
      xp_earned: lesson.xp_reward,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_slug" });
    if (error) return Response.json({ error: "Progress could not be synced." }, { status: 500 });
    return Response.json({ success: true, xp: lesson.xp_reward });
  } catch {
    return Response.json({ error: "Progress could not be saved." }, { status: 500 });
  }
}
