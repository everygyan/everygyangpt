import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      supabaseConfigured: isSupabaseConfigured(),
      siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
