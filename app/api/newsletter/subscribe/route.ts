import { Resend } from "resend";

import { createPublicSupabaseClient } from "@/lib/supabase-public";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeBody = {
  email?: unknown;
  locale?: unknown;
  website?: unknown;
};

function getSiteUrl(request: Request) {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
}

export async function POST(request: Request) {
  let body: SubscribeBody;

  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return Response.json({ message: "Please enter a valid email address." }, { status: 400 });
  }

  // Hidden honeypot field: bots receive the normal response without creating a row.
  if (typeof body.website === "string" && body.website.trim()) {
    return Response.json({ message: "Please check your inbox to confirm your subscription." });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const locale = typeof body.locale === "string" ? body.locale : "en";

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return Response.json({ message: "Please enter a valid email address." }, { status: 400 });
  }

  const resendKey = process.env.NEWSLETTER_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL || "EveryGyan <newsletter@mail.everygyan.com>";

  if (!resendKey) {
    console.error("The newsletter API key is not configured.");
    return Response.json({ message: "Subscriptions are temporarily unavailable." }, { status: 503 });
  }

  try {
    const supabase = createPublicSupabaseClient();
    const { data: token, error: subscriptionError } = await supabase.rpc(
      "request_newsletter_subscription",
      {
        p_email: email,
        p_locale: locale,
        p_source: "everygyan-homepage",
      },
    );

    if (subscriptionError) {
      console.error("Newsletter subscription request failed:", subscriptionError.code);
      return Response.json({ message: "Subscriptions are temporarily unavailable." }, { status: 503 });
    }

    // Active and recently requested addresses return no token. Keep the response
    // indistinguishable so the endpoint cannot be used to discover subscribers.
    if (!token || typeof token !== "string") {
      return Response.json({ message: "Please check your inbox to confirm your subscription." });
    }

    const siteUrl = getSiteUrl(request);
    const confirmationUrl = new URL("/newsletter/confirm", siteUrl);
    confirmationUrl.searchParams.set("token", token);

    const unsubscribeUrl = new URL("/newsletter/unsubscribe", siteUrl);
    unsubscribeUrl.searchParams.set("token", token);

    const resend = new Resend(resendKey);
    const { error: emailError } = await resend.emails.send({
      from,
      to: email,
      subject: "Confirm your EveryGyan subscription",
      html: `
        <div style="background:#f5f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#101828">
          <div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #dfe5ee;border-radius:16px;padding:32px">
            <p style="margin:0 0 8px;color:#146ef5;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">The Daily Gyan</p>
            <h1 style="margin:0 0 16px;color:#081f4d;font-size:28px">Confirm your subscription</h1>
            <p style="margin:0 0 24px;line-height:1.6">One click confirms that you would like to receive EveryGyan's curated news, travel ideas and practical knowledge.</p>
            <a href="${confirmationUrl.toString()}" style="display:inline-block;padding:13px 20px;color:#ffffff;background:#146ef5;border-radius:8px;font-weight:700;text-decoration:none">Confirm subscription</a>
            <p style="margin:24px 0 0;color:#667085;font-size:12px;line-height:1.5">If you did not request this email, you can ignore it or <a href="${unsubscribeUrl.toString()}" style="color:#146ef5">unsubscribe</a>.</p>
          </div>
        </div>
      `,
      text: `Confirm your EveryGyan subscription: ${confirmationUrl.toString()}\n\nIf you did not request this email, ignore it or unsubscribe: ${unsubscribeUrl.toString()}`,
    });

    if (emailError) {
      console.error("Newsletter confirmation email failed:", emailError.name);
      return Response.json({ message: "We could not send the confirmation email. Please try again later." }, { status: 502 });
    }

    return Response.json({ message: "Please check your inbox to confirm your subscription." });
  } catch (error) {
    console.error("Unexpected newsletter subscription error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ message: "Subscriptions are temporarily unavailable." }, { status: 503 });
  }
}

