import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type ConfirmationPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function NewsletterConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  let confirmed = false;

  if (token && isUuid(token)) {
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase.rpc("confirm_newsletter_subscription", { p_token: token });
      confirmed = !error && data === true;
    } catch {
      confirmed = false;
    }
  }

  return (
    <main className="newsletter-action-page">
      <section className="newsletter-action-card">
        <Link href="/" aria-label="EveryGyan home">
          <Image src="/everygyan-logo.png" alt="EveryGyan" width={220} height={58} priority />
        </Link>
        {confirmed ? <CheckCircle2 className="action-success" size={54} /> : <XCircle className="action-error" size={54} />}
        <p className="eyebrow">The Daily Gyan</p>
        <h1>{confirmed ? "You’re subscribed." : "This confirmation link is invalid."}</h1>
        <p>
          {confirmed
            ? "Welcome to EveryGyan. Your first thoughtful read will arrive in your inbox soon."
            : "The link may be incomplete or expired. Return home and enter your email again to request a fresh link."}
        </p>
        <Link className="button button-primary" href="/">Return to EveryGyan</Link>
      </section>
    </main>
  );
}

