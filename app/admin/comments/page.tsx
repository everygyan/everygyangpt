import Link from "next/link";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { CommentModerationButtons } from "@/components/comment-moderation-buttons";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type CommentRow = {
  id: string;
  body: string;
  guest_name: string | null;
  is_hidden: boolean;
  created_at: string;
  articles: { title?: string; slug?: string } | { title?: string; slug?: string }[] | null;
  profiles: { display_name?: string } | { display_name?: string }[] | null;
};

function relation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CommentsPage() {
  const profile = await requireAdminUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, guest_name, is_hidden, created_at, articles(title, slug), profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  const comments = (data ?? []) as unknown as CommentRow[];

  return (
    <main className="admin-shell">
      <AdminSidebar active="comments" role={profile.role} />
      <section className="admin-main">
        <AdminPageHeader title="Comments" context="community moderation" displayName={profile.display_name} />
        <div className="admin-content">
          <div className="admin-page-heading"><div><p className="eyebrow">Community</p><h2>Moderate reader comments</h2><p>Hide a comment from the public site, restore it later, or delete it permanently.</p></div></div>
          <section className="admin-table-card admin-library-card">
            {error && <p className="admin-inline-error">{error.message}</p>}
            <div className="comment-admin-list">
              {comments.map((comment) => {
                const article = relation(comment.articles);
                const author = comment.guest_name || relation(comment.profiles)?.display_name || "Registered reader";
                return (
                  <article className={`comment-admin-row ${comment.is_hidden ? "is-hidden" : ""}`} key={comment.id}>
                    <div className="comment-admin-meta"><strong>{author}</strong><span>{new Date(comment.created_at).toLocaleString("en-GB")}</span><span className={comment.is_hidden ? "menu-hidden" : "menu-visible"}>{comment.is_hidden ? "Hidden" : "Visible"}</span></div>
                    <p>{comment.body}</p>
                    <div className="comment-admin-footer">{article?.slug ? <Link href={`/article/${article.slug}`}>{article.title || "View article"}</Link> : <span>Article unavailable</span>}<CommentModerationButtons commentId={comment.id} hidden={comment.is_hidden} /></div>
                  </article>
                );
              })}
              {!comments.length && !error && <div className="admin-empty"><strong>No comments yet.</strong><span>New reader responses will appear here.</span></div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
