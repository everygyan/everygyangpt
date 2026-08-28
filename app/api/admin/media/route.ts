import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "article-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return Response.json({ error: "Sign in before uploading an image." }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "editor") {
    return Response.json({ error: "Editorial access is required." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  const extension = extensions[file.type];
  if (!extension) return Response.json({ error: "Use a JPG, PNG, WebP, GIF or AVIF image." }, { status: 415 });
  if (!file.size || file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "Images must be smaller than 10 MB." }, { status: 413 });
  }

  try {
    const supabase = createAdminClient();
    const { error: bucketError } = await supabase.storage.getBucket(BUCKET);
    if (bucketError) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: Object.keys(extensions),
      });
      if (createError && !createError.message.toLowerCase().includes("already exists")) throw createError;
    }

    const now = new Date();
    const path = `${profile.id}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: mediaError } = await supabase.from("media").insert({
      uploaded_by: profile.id,
      storage_path: path,
      file_name: file.name || `article-image.${extension}`,
      mime_type: file.type,
      alt_text: (file.name || "Article image").replace(/\.[^.]+$/, ""),
    });
    if (mediaError) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw mediaError;
    }
    return Response.json({ url: publicUrl.publicUrl, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The image could not be uploaded.";
    return Response.json({ error: message }, { status: 500 });
  }
}
