import "server-only";

import { fallbackGermanCatalog, type GermanCourseCatalog, type GermanLesson, type GermanLevel, type GermanResource } from "@/data/german-course";
import { createPublicSupabaseClient } from "@/lib/supabase-public";
import { createClient } from "@/lib/supabase/server";

type LessonRow = {
  slug: string;
  level: GermanLesson["level"];
  unit_title: string;
  unit_order: number;
  lesson_order: number;
  title: string;
  description: string;
  icon: string;
  estimated_minutes: number;
  xp_reward: number;
  content: Pick<GermanLesson, "phrases" | "exercise" | "exercises" | "notes" | "dialogue" | "task" | "model" | "pdfUrl">;
};

export type GermanProgress = {
  completedLessons: string[];
  xp: number;
};

export async function getGermanCatalog(): Promise<{ catalog: GermanCourseCatalog; source: "supabase" | "starter" }> {
  try {
    const supabase = createPublicSupabaseClient();
    const [levelsResult, lessonsResult, resourcesResult] = await Promise.all([
      supabase.from("german_levels").select("code, title, description, outcome, color, sort_order").eq("is_published", true).order("sort_order"),
      supabase.from("german_lessons").select("slug, level, unit_title, unit_order, lesson_order, title, description, icon, estimated_minutes, xp_reward, content").eq("is_published", true).order("level").order("unit_order").order("lesson_order"),
      supabase.from("german_resources").select("level, title, provider, description, url, resource_type").eq("is_active", true).order("sort_order"),
    ]);

    if (levelsResult.error || lessonsResult.error || resourcesResult.error || !levelsResult.data?.length || !lessonsResult.data?.length) {
      return { catalog: fallbackGermanCatalog, source: "starter" };
    }

    const levels: GermanLevel[] = levelsResult.data.map((row) => ({
      code: row.code as GermanLevel["code"], title: row.title, description: row.description, outcome: row.outcome,
      color: row.color, order: row.sort_order,
    }));
    const lessons: GermanLesson[] = (lessonsResult.data as LessonRow[]).map((row) => ({
      slug: row.slug, level: row.level, unit: row.unit_title, unitOrder: row.unit_order, lessonOrder: row.lesson_order,
      title: row.title, description: row.description, icon: row.icon, minutes: row.estimated_minutes, xp: row.xp_reward,
      phrases: row.content.phrases, exercise: row.content.exercise,
      exercises: row.content.exercises, notes: row.content.notes, dialogue: row.content.dialogue,
      task: row.content.task, model: row.content.model, pdfUrl: row.content.pdfUrl,
    }));
    const resources: GermanResource[] = resourcesResult.data.map((row) => ({
      level: row.level as GermanResource["level"], title: row.title, provider: row.provider, description: row.description,
      url: row.url, kind: row.resource_type,
    }));
    return { catalog: { levels, lessons, resources }, source: "supabase" };
  } catch {
    return { catalog: fallbackGermanCatalog, source: "starter" };
  }
}

export async function getGermanProgress(userId: string | null): Promise<GermanProgress> {
  if (!userId) return { completedLessons: [], xp: 0 };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("german_progress").select("lesson_slug, xp_earned").eq("user_id", userId).eq("status", "completed");
    if (error) return { completedLessons: [], xp: 0 };
    return {
      completedLessons: (data ?? []).map((row) => row.lesson_slug),
      xp: (data ?? []).reduce((sum, row) => sum + Number(row.xp_earned || 0), 0),
    };
  } catch {
    return { completedLessons: [], xp: 0 };
  }
}
