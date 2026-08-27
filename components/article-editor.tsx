"use client";

import Link from "next/link";
import { ArrowLeft, Bold, Eye, Italic, Link2, List, ListOrdered, Quote, Save, Send } from "lucide-react";
import { useActionState, useMemo, useRef, useState } from "react";
import { saveArticle, type ArticleActionState } from "@/app/admin/articles/actions";

export type EditorSection = { id: string; name: string };
export type EditorCategory = { id: string; section_id: string; name: string };
export type ArticleEditorData = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  contentHtml?: string;
  sectionId?: string;
  categoryId?: string;
  tags?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  isFeatured?: boolean;
  allowComments?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export function ArticleEditor({
  sections,
  categories,
  initial = {},
}: {
  sections: EditorSection[];
  categories: EditorCategory[];
  initial?: ArticleEditorData;
}) {
  const initialState: ArticleActionState = { articleId: initial.id, slug: initial.slug };
  const [state, formAction, pending] = useActionState(saveArticle, initialState);
  const [title, setTitle] = useState(initial.title ?? "");
  const [sectionId, setSectionId] = useState(initial.sectionId ?? sections[0]?.id ?? "");
  const [contentHtml, setContentHtml] = useState(initial.contentHtml ?? "");
  const editorRef = useRef<HTMLDivElement>(null);
  const availableCategories = useMemo(
    () => categories.filter((category) => category.section_id === sectionId),
    [categories, sectionId],
  );

  function format(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setContentHtml(editorRef.current?.innerHTML ?? "");
  }

  function addLink() {
    const url = window.prompt("Paste the link URL");
    if (url) format("createLink", url);
  }

  return (
    <form className="editor-page" action={formAction}>
      <input type="hidden" name="articleId" value={state.articleId ?? initial.id ?? ""} />
      <input type="hidden" name="slug" value={state.slug ?? initial.slug ?? ""} />
      <input type="hidden" name="contentHtml" value={contentHtml} />
      <header className="editor-topbar">
        <Link href="/admin" className="editor-back"><ArrowLeft size={19} /> Dashboard</Link>
        <span className="save-status">{pending ? "Saving…" : state.success || "Changes not saved"}</span>
        <div className="editor-actions">
          <button type="submit" name="intent" value="draft" disabled={pending}><Save size={17} /> Save draft</button>
          {state.slug && <Link className="editor-preview" href={`/article/${state.slug}`} target="_blank"><Eye size={17} /> Preview</Link>}
          <button className="publish-button" type="submit" name="intent" value="publish" disabled={pending}><Send size={17} /> Publish</button>
        </div>
      </header>

      <div className="editor-layout">
        <section className="editor-canvas">
          <div className="editor-breadcrumb"><span>Articles</span><span>/</span><strong>{initial.id ? "Edit article" : "New article"}</strong></div>
          {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
          {state.success && <p className="form-message form-success" role="status">{state.success}</p>}
          <input className="title-input" name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter an engaging headline..." aria-label="Article title" required />
          <textarea className="excerpt-input" name="excerpt" defaultValue={initial.excerpt} placeholder="Write a short summary that gives readers a reason to continue..." aria-label="Article summary" required />
          <div className="format-toolbar" aria-label="Article formatting">
            <button type="button" onClick={() => format("bold")} aria-label="Bold"><Bold size={17} /></button>
            <button type="button" onClick={() => format("italic")} aria-label="Italic"><Italic size={17} /></button>
            <button type="button" onClick={addLink} aria-label="Link"><Link2 size={17} /></button>
            <button type="button" onClick={() => format("insertUnorderedList")} aria-label="Bullet list"><List size={17} /></button>
            <button type="button" onClick={() => format("insertOrderedList")} aria-label="Numbered list"><ListOrdered size={17} /></button>
            <button type="button" onClick={() => format("formatBlock", "blockquote")} aria-label="Quote"><Quote size={17} /></button>
          </div>
          <div
            ref={editorRef}
            className="rich-editor"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Start writing your story here..."
            onInput={(event) => setContentHtml(event.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: initial.contentHtml ?? "" }}
          />
          <div className="editor-tip"><strong>Secure publishing</strong><span>Article HTML is cleaned on the server before it is stored. Save as a draft until the story is ready, then publish it.</span></div>
        </section>

        <aside className="editor-settings">
          <h2>Article settings</h2>
          <label>Section<select name="sectionId" value={sectionId} onChange={(event) => setSectionId(event.target.value)} required>{sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>
          <label>Category<select name="categoryId" defaultValue={initial.categoryId ?? ""}><option value="">No category</option>{availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label>Tags<input name="tags" defaultValue={initial.tags} placeholder="travel, technology, guide" /></label>
          <label>Featured image URL<input name="featuredImageUrl" type="url" defaultValue={initial.featuredImageUrl} placeholder="https://..." /></label>
          <label>Featured image description<input name="featuredImageAlt" defaultValue={initial.featuredImageAlt} placeholder="Describe the image" /></label>
          <label className="toggle-label"><span><strong>Featured story</strong><small>Show prominently on the homepage</small></span><input name="isFeatured" type="checkbox" defaultChecked={initial.isFeatured} /></label>
          <label className="toggle-label"><span><strong>Allow comments</strong><small>Readers can join the discussion</small></span><input name="allowComments" type="checkbox" defaultChecked={initial.allowComments ?? true} /></label>
          <details><summary>Search & social preview</summary><label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle} placeholder={title || "Article title"} /></label><label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription} placeholder="Description for search results" /></label></details>
        </aside>
      </div>
    </form>
  );
}
