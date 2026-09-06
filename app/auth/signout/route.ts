import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// A normal form POST gives the browser a full document redirect after cookies
// change, avoiding a Server Action refresh of the now-protected admin page.
export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return new Response("Cross-site sign-out is not allowed.", { status: 403 });
  }
  const config = getSupabaseConfig();
  if (config) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Clear this browser's session even if the auth service is unavailable.
    }
    const cookieStore = await cookies();
    const prefix = `sb-${new URL(config.url).hostname.split(".")[0]}-auth-token`;
    for (const cookie of cookieStore.getAll()) {
      if (cookie.name === prefix || cookie.name.startsWith(`${prefix}.`) || cookie.name === `${prefix}-code-verifier`) {
        cookieStore.set(cookie.name, "", { path: "/", maxAge: 0 });
      }
    }
  }
  return new Response(null, { status: 303, headers: { Location: "/", "Cache-Control": "no-store" } });
}
