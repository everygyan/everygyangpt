"use client";

import { Save } from "lucide-react";
import { useActionState, useState } from "react";
import { saveMenuItem, type MenuActionState } from "@/app/admin/menus/actions";

export type MenuFormOption = { id: string; label: string };
export type MenuFormInitial = {
  id?: string;
  label?: string;
  target?: string;
  customUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export function MenuItemForm({ sections, categories, parents, initial = {} }: { sections: MenuFormOption[]; categories: MenuFormOption[]; parents: MenuFormOption[]; initial?: MenuFormInitial }) {
  const [state, action, pending] = useActionState<MenuActionState, FormData>(saveMenuItem, {});
  const [target, setTarget] = useState(initial.target ?? "none");
  const [parentId, setParentId] = useState(initial.parentId ?? "");
  return (
    <form className="menu-editor-form" action={action}>
      <input type="hidden" name="itemId" value={initial.id ?? ""} />
      <label>Menu label<input name="label" defaultValue={initial.label} placeholder="Example: Travel" required minLength={2} maxLength={60} /></label>
      <label>Destination<select name="target" value={target} onChange={(event) => setTarget(event.target.value)} required><option value="none">Menu heading only — add submenus beneath it</option><optgroup label="Sections">{sections.map((option) => <option key={option.id} value={`section:${option.id}`}>{option.label}</option>)}</optgroup><optgroup label="Categories">{categories.map((option) => <option key={option.id} value={`category:${option.id}`}>{option.label}</option>)}</optgroup><option value="custom">Custom link</option></select><small>{target === "none" ? parentId ? "Choose a destination because submenu items must open a page." : "Creates a main menu heading. You can add its submenus afterward." : "Readers will open this destination when they select the menu item."}</small></label>
      {target === "custom" && <label>Custom path or URL<input name="customUrl" defaultValue={initial.customUrl} placeholder="/search or https://example.com" required /></label>}
      <label>Parent item<select name="parentId" value={parentId} onChange={(event) => setParentId(event.target.value)}><option value="">None — create a main menu item</option>{parents.filter((parent) => parent.id !== initial.id).map((parent) => <option key={parent.id} value={parent.id}>{parent.label}</option>)}</select><small>{parentId ? "This item will appear inside the selected main menu." : "The item will appear in the main navigation bar."}</small></label>
      <label>Display order<input name="sortOrder" type="number" min="0" max="999" defaultValue={initial.sortOrder ?? 0} /></label>
      <label className="menu-active-toggle"><input name="isActive" type="checkbox" defaultChecked={initial.isActive ?? true} /> Visible on website</label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-message form-success" role="status">{state.success}</p>}
      <button className="button button-primary" type="submit" disabled={pending}><Save size={17} /> {pending ? "Saving…" : initial.id ? "Update menu item" : "Create menu item"}</button>
    </form>
  );
}

