import { NextResponse } from "next/server";

import { createPublicSupabaseClient } from "@/lib/supabase-public";

export const runtime = "nodejs";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function resultRedirect(request: Request, status: "success" | "error") {
  return NextResponse.redirect(new URL(`/newsletter/unsubscribe?status=${status}`, request.url), 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = formData.get("token");

  if (typeof token !== "string" || !isUuid(token)) {
    return resultRedirect(request, "error");
  }

  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.rpc("unsubscribe_newsletter", { p_token: token });

    if (error || data !== true) {
      return resultRedirect(request, "error");
    }

    return resultRedirect(request, "success");
  } catch {
    return resultRedirect(request, "error");
  }
}

