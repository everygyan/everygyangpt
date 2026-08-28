"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteArticle } from "@/app/admin/articles/actions";

export function DeleteArticleButton({ articleId, title }: { articleId: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteArticle(articleId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <span className="delete-article-control">
      <button type="button" onClick={remove} disabled={pending} aria-label={`Delete ${title}`}><Trash2 size={14} /> {pending ? "Deleting…" : "Delete"}</button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
