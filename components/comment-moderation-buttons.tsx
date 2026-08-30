"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteComment, setCommentHidden } from "@/app/admin/comments/actions";

export function CommentModerationButtons({ commentId, hidden }: { commentId: string; hidden: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggleVisibility() {
    setError("");
    startTransition(async () => {
      const result = await setCommentHidden(commentId, !hidden);
      if (result.error) setError(result.error);
    });
  }

  function remove() {
    if (!window.confirm("Permanently delete this comment? This cannot be undone.")) return;
    setError("");
    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="comment-moderation-actions">
      <button type="button" disabled={pending} onClick={toggleVisibility}>{hidden ? <Eye size={15} /> : <EyeOff size={15} />}{hidden ? "Show" : "Hide"}</button>
      <button className="danger-action" type="button" disabled={pending} onClick={remove}><Trash2 size={15} /> Delete</button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
