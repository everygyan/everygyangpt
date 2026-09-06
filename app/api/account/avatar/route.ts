import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET = "article-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  const userClient = await createClient();
  const { data: claimsData } = await userClient.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return Response.json({ error: "Sign in before uploading a profile photo." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a profile photo to upload." }, { status: 400 });
  const extension = extensions[file.type];
  if (!extension) return Response.json({ error: "Use a JPG, PNG, WebP or AVIF image." }, { status: 415 });
  if (!file.size || file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "Profile photos must be smaller than 5 MB." }, { status: 413 });
  }

  try {
    const admin = createAdminClient();
    const { error: bucketError } = await admin.storage.getBucket(BUCKET);
    if (bucketError) {
      const { error: createError } = await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: [...Object.keys(extensions), "image/gif"],
      });
      if (createError && !createError.message.toLowerCase().includes("already exists")) throw createError;
    }

    const path = `avatars/${userId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);

    const { error: profileError } = await userClient
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);
    if (profileError) {
      await admin.storage.from(BUCKET).remove([path]);
      throw profileError;
    }
    await userClient.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    return Response.json({ url: data.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The profile photo could not be uploaded.";
    return Response.json({ error: message }, { status: 500 });
  }
}

