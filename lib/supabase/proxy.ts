import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();
  // Keep public pages available while a new host is waiting for its environment
  // variables. Authentication actions provide a readable configuration error.
  if (!config) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(
      config.url,
      config.publishableKey,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data } = await supabase.auth.getClaims();
    if (!data?.claims && request.nextUrl.pathname.startsWith("/admin")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // A temporary Supabase outage must not take the public publication offline.
  }

  return response;
}
