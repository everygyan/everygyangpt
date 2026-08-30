"use client";

import { MessageCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

export type PublicComment = { id: string; author: string; body: string; createdAt: string };

export function CommentsSection({ articleId, initialComments }: { articleId: string; initialComments: PublicComment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, name, body, website: form.get("website") }),
      });
      const result = await response.json() as { error?: string; comment?: { id: string; guest_name: string; body: string; created_at: string } };
      if (!response.ok || !result.comment) throw new Error(result.error || "Your comment could not be posted.");
      setComments((current) => [{ id: result.comment!.id, author: result.comment!.guest_name, body: result.comment!.body, createdAt: result.comment!.created_at }, ...current]);
      setBody("");
      setMessage({ type: "success", text: "Your comment is now visible." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Your comment could not be posted." });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="comment-section shell" aria-labelledby="comments-heading">
      <div className="comment-section-heading"><MessageCircle size={25} /><div><p className="eyebrow">Community</p><h2 id="comments-heading">Join the conversation</h2><p>No account is needed. Be thoughtful and stay on topic.</p></div></div>
      <form className="comment-form" onSubmit={submit}>
        <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required /></label>
        <label>Comment<textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={3} maxLength={4000} rows={5} required /></label>
        <label className="comment-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <div className="comment-submit-row"><small>Comments may be hidden or removed by the EveryGyan administrator.</small><button className="button button-primary" type="submit" disabled={pending}><Send size={16} /> {pending ? "Posting…" : "Post comment"}</button></div>
        {message && <p className={`form-message form-${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
      </form>
      <div className="public-comment-list">
        {comments.map((comment) => <article className="public-comment" key={comment.id}><div className="public-comment-avatar">{comment.author[0]?.toUpperCase() || "R"}</div><div><header><strong>{comment.author}</strong><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time></header><p>{comment.body}</p></div></article>)}
        {!comments.length && <p className="no-comments">Be the first reader to comment.</p>}
      </div>
    </section>
  );
}
