"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteMenuItem } from "@/app/admin/menus/actions";

export function DeleteMenuItemButton({ id, label, hasChildren }: { id: string; label: string; hasChildren: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  function remove() {
    const detail = hasChildren ? " Its submenu items will also be deleted." : "";
    if (!window.confirm(`Delete “${label}”?${detail}`)) return;
    startTransition(async () => {
      const result = await deleteMenuItem(id);
      if (result.error) setError(result.error);
    });
  }
  return <span className="menu-delete"><button type="button" onClick={remove} disabled={pending}><Trash2 size={14} /> {pending ? "Deleting…" : "Delete"}</button>{error && <small role="alert">{error}</small>}</span>;
}
