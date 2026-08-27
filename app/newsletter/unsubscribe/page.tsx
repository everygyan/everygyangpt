import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string | string[]; status?: string | string[] }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function NewsletterUnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const status = typeof params.status === "string" ? params.status : "";
  const canUnsubscribe = Boolean(token && isUuid(token) && !status);
  const unsubscribed = status === "success";

  return (
    <main className="newsletter-action-page">
      <section className="newsletter-action-card">
        <Link href="/" aria-label="EveryGyan home">
          <Image src="/everygyan-logo.png" alt="EveryGyan" width={220} height={58} priority />
        </Link>
        {unsubscribed || canUnsubscribe
          ? <CheckCircle2 className="action-success" size={54} />
          : <XCircle className="action-error" size={54} />}
        <p className="eyebrow">Newsletter preferences</p>
        <h1>
          {unsubscribed
            ? "You’ve been unsubscribed."
            : canUnsubscribe
              ? "Leave The Daily Gyan?"
              : "This unsubscribe link is invalid."}
        </h1>
        <p>
          {unsubscribed
            ? "You will no longer receive The Daily Gyan. You can subscribe again from the homepage whenever you like."
            : canUnsubscribe
              ? "Confirm below and we’ll stop future newsletter emails to this address."
              : "The link may be incomplete. No subscription preferences were changed."}
        </p>
        {canUnsubscribe ? (
          <form className="newsletter-action-form" action="/api/newsletter/unsubscribe" method="post">
            <input type="hidden" name="token" value={token} />
            <button className="button button-primary" type="submit">Confirm unsubscribe</button>
            <Link className="text-link" href="/">Keep my subscription</Link>
          </form>
        ) : (
          <Link className="button button-primary" href="/">Return to EveryGyan</Link>
        )}
      </section>
    </main>
  );
}

