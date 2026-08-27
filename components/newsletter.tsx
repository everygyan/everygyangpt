"use client";

import { ArrowRight, Check, LoaderCircle, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          locale: document.documentElement.lang || "en",
          website: formData.get("website"),
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "We could not process your subscription.");
      }

      setMessage(result.message || "Please check your inbox to confirm your subscription.");
      setStatus("success");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again in a moment.");
      setStatus("error");
    }
  }

  return (
    <section className="newsletter shell" aria-labelledby="newsletter-title">
      <div className="newsletter-icon"><Mail size={28} /></div>
      <div className="newsletter-copy">
        <p className="eyebrow">The Daily Gyan</p>
        <h2 id="newsletter-title">One thoughtful read in your inbox.</h2>
        <p>News, travel ideas and practical knowledge—curated without the noise.</p>
      </div>
      {status === "success" ? (
        <p className="newsletter-success" role="status"><Check size={20} /> {message}</p>
      ) : (
        <form className="newsletter-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" disabled={status === "loading"} />
          <div className="newsletter-honeypot" aria-hidden="true">
            <label htmlFor="newsletter-website">Website</label>
            <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? <><LoaderCircle className="spinner" size={18} /> Sending…</> : <>Subscribe <ArrowRight size={18} /></>}
          </button>
          <small>By subscribing, you agree to our privacy policy. Unsubscribe anytime.</small>
          {status === "error" && <p className="newsletter-error" role="alert">{message}</p>}
        </form>
      )}
    </section>
  );
}

