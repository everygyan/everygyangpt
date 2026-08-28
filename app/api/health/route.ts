import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      supabaseConfigured: isSupabaseConfigured(),
      mediaUploadsConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
