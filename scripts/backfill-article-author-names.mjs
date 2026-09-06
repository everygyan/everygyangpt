import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase configuration missing.");

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await db.from("articles").select("id, title, content, profiles(display_name)");
if (error) throw error;

fs.mkdirSync("tmp/backups", { recursive: true });
fs.writeFileSync(`tmp/backups/article-authors-${Date.now()}.json`, JSON.stringify(data, null, 2));

let updated = 0;
for (const article of data ?? []) {
  const content = article.content && typeof article.content === "object" && !Array.isArray(article.content) ? article.content : {};
  if (typeof content.authorName === "string" && content.authorName.trim()) continue;
  const profile = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles;
  const authorName = profile?.display_name?.trim() || "Sandeep";
  const { error: updateError } = await db.from("articles").update({ content: { ...content, authorName } }).eq("id", article.id);
  if (updateError) throw new Error(`Could not preserve the byline for “${article.title}”: ${updateError.message}`);
  updated += 1;
}

console.log(`Preserved author names for ${updated} article${updated === 1 ? "" : "s"}.`);
