import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { loadA1 } from "./lib/load-german-a1.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase configuration missing.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const lessons = loadA1();
const { data: previous, error: readError } = await db.from("german_lessons").select("*").eq("level", "A1");
if (readError) throw readError;
const known = new Set(lessons.map((lesson) => lesson.slug));
const extra = previous.filter((row) => !known.has(row.slug));
if (extra.length) throw new Error(`Unrecognised A1 lessons require review: ${extra.map((row) => row.slug).join(", ")}`);
fs.mkdirSync("tmp/backups", { recursive: true });
fs.writeFileSync(`tmp/backups/german-a1-${Date.now()}.json`, JSON.stringify(previous, null, 2));
const rows = lessons.map((lesson) => ({
  slug: lesson.slug, level: "A1", title: lesson.title, description: lesson.description,
  // Preserve existing positions in the first pass to avoid the unique index during reordering.
  unit_order: previous.find((row) => row.slug === lesson.slug)?.unit_order ?? 1000 + lessons.indexOf(lesson),
  lesson_order: previous.find((row) => row.slug === lesson.slug)?.lesson_order ?? 1,
  unit_title: lesson.unit, icon: lesson.icon, estimated_minutes: lesson.minutes, xp_reward: lesson.xp,
  is_published: true,
  content: { phrases: lesson.phrases, exercise: lesson.exercise, exercises: lesson.exercises, notes: lesson.notes,
    dialogue: lesson.dialogue, task: lesson.task, model: lesson.model, pdfUrl: lesson.pdfUrl, curriculumVersion: "a1-50-v1" },
}));
// Put existing rows at unique temporary positions before the final atomic batch upsert.
// Slugs stay unchanged so existing progress remains attached to the same lessons.
for (const row of previous) {
  const { error } = await db.from("german_lessons").update({ unit_order: 2000 + previous.indexOf(row), lesson_order: 1 }).eq("slug", row.slug);
  if (error) throw error;
}
const finalRows = rows.map((row, i) => ({ ...row, unit_order: lessons[i].unitOrder, lesson_order: lessons[i].lessonOrder }));
const { error } = await db.from("german_lessons").upsert(finalRows, { onConflict: "slug" });
if (error) {
  for (const row of previous) await db.from("german_lessons").update({ unit_order: row.unit_order, lesson_order: row.lesson_order }).eq("slug", row.slug);
  throw error;
}
const { count, error: countError } = await db.from("german_lessons").select("slug", { count: "exact", head: true }).eq("level", "A1").eq("is_published", true);
if (countError || count !== 50) throw countError ?? new Error(`Expected 50 published A1 lessons, found ${count}`);
console.log("Supabase now has 50 published A1 lessons. Existing lesson identifiers and learner progress preserved.");
