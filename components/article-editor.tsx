"use client";

import Link from "next/link";
import { ArrowLeft, Bold, Eye, ImagePlus, Italic, Link2, List, ListOrdered, LoaderCircle, Quote, Save, Send } from "lucide-react";
import { useActionState, useMemo, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { saveArticle, type ArticleActionState } from "@/app/admin/articles/actions";

export type EditorSection = { id: string; name: string };
export type EditorCategory = { id: string; section_id: string; name: string };
export type ArticleEditorData = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  authorName?: string;
  contentHtml?: string;
  sectionId?: string;
  categoryId?: string;
  tags?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
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
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [sectionId, setSectionId] = useState(initial.sectionId ?? sections[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(
    initial.categoryId ?? categories.find((category) => category.section_id === (initial.sectionId ?? sections[0]?.id))?.id ?? "",
  );
  const [contentHtml, setContentHtml] = useState(initial.contentHtml ?? "");
  const [mediaUploads, setMediaUploads] = useState(0);
  const [mediaError, setMediaError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) return null;
    setMediaUploads((count) => count + 1);
    setMediaError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "The image could not be uploaded.");
      return result.url;
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "The image could not be uploaded.");
      return null;
    } finally {
      setMediaUploads((count) => Math.max(0, count - 1));
    }
  }

  function currentRange() {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current?.contains(selection.anchorNode)) return null;
    return selection.getRangeAt(0).cloneRange();
  }

  function insertImage(url: string, alt: string, range: Range | null) {
    const editor = editorRef.current;
    if (!editor) return null;
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = url;
    image.alt = alt.replace(/\.[^.]+$/, "") || "Article image";
    image.loading = "lazy";
    figure.appendChild(image);
    const nextRange = document.createRange();
    if (range && editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(figure);
      nextRange.setStartAfter(figure);
    } else {
      editor.appendChild(figure);
      nextRange.setStartAfter(figure);
    }
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createElement("br"));
    figure.after(paragraph);
    nextRange.setStart(paragraph, 0);
    nextRange.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(nextRange);
    setContentHtml(editor.innerHTML);
    return nextRange;
  }

  async function addImages(files: File[]) {
    let range = currentRange();
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) range = insertImage(url, file.name, range);
    }
    editorRef.current?.focus();
  }

  function pasteImages(event: ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));
    if (!files.length) return;
    event.preventDefault();
    void addImages(files);
  }

  function dropImages(event: DragEvent<HTMLDivElement>) {
    const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    event.preventDefault();
    editorRef.current?.focus();
    void addImages(files);
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
          <button type="submit" name="intent" value="draft" disabled={pending || mediaUploads > 0}><Save size={17} /> Save draft</button>
          {state.slug && <Link className="editor-preview" href={`/article/${state.slug}`} target="_blank"><Eye size={17} /> Preview</Link>}
          <button className="publish-button" type="submit" name="intent" value="publish" disabled={pending || mediaUploads > 0}><Send size={17} /> Publish</button>
        </div>
      </header>

      <div className="editor-layout">
        <section className="editor-canvas">
          <div className="editor-breadcrumb"><span>Articles</span><span>/</span><strong>{initial.id ? "Edit article" : "New article"}</strong></div>
          {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
          {state.success && <p className="form-message form-success" role="status">{state.success}</p>}
          <input className="title-input" name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter an engaging headline..." aria-label="Article title" required />
          <textarea className="excerpt-input" name="excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Write a short summary that gives readers a reason to continue..." aria-label="Article summary" required />
          <div className="format-toolbar" aria-label="Article formatting">
            <button type="button" onClick={() => format("bold")} aria-label="Bold"><Bold size={17} /></button>
            <button type="button" onClick={() => format("italic")} aria-label="Italic"><Italic size={17} /></button>
            <button type="button" onClick={addLink} aria-label="Link"><Link2 size={17} /></button>
            <button type="button" onClick={() => format("insertUnorderedList")} aria-label="Bullet list"><List size={17} /></button>
            <button type="button" onClick={() => format("insertOrderedList")} aria-label="Numbered list"><ListOrdered size={17} /></button>
            <button type="button" onClick={() => format("formatBlock", "blockquote")} aria-label="Quote"><Quote size={17} /></button>
            <button type="button" onClick={() => imageInputRef.current?.click()} aria-label="Add image"><ImagePlus size={17} /></button>
            <input ref={imageInputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={(event) => { void addImages(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
            {mediaUploads > 0 && <span className="media-upload-status"><LoaderCircle className="spinner" size={15} /> Uploading image…</span>}
          </div>
          <div
            ref={editorRef}
            className="rich-editor"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Start writing your story here..."
            onInput={(event) => setContentHtml(event.currentTarget.innerHTML)}
            onPaste={pasteImages}
            onDrop={dropImages}
            onDragOver={(event) => { if (Array.from(event.dataTransfer.items).some((item) => item.type.startsWith("image/"))) event.preventDefault(); }}
            dangerouslySetInnerHTML={{ __html: initial.contentHtml ?? "" }}
          />
          {mediaError && <p className="form-message form-error" role="alert">{mediaError}</p>}
          <div className="editor-tip"><strong>Secure publishing</strong><span>Article HTML is cleaned on the server before it is stored. Save as a draft until the story is ready, then publish it.</span></div>
        </section>

        <aside className="editor-settings">
          <h2>Article settings</h2>
          <label>Author name<input name="authorName" defaultValue={initial.authorName} placeholder="Name shown to readers" maxLength={100} required /></label>
          <label>Section<select name="sectionId" value={sectionId} onChange={(event) => { const nextSection = event.target.value; setSectionId(nextSection); setCategoryId(categories.find((category) => category.section_id === nextSection)?.id ?? ""); }} required>{sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>
          <label>Category<select name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required><option value="" disabled>Choose category</option>{availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label>Tags<input name="tags" defaultValue={initial.tags} placeholder="travel, technology, guide" /></label>
          <label>Featured image URL<input name="featuredImageUrl" type="url" defaultValue={initial.featuredImageUrl} placeholder="https://..." /></label>
          <label>Featured image description<input name="featuredImageAlt" defaultValue={initial.featuredImageAlt} placeholder="Describe the image" /></label>
          <label className="toggle-label"><span><strong>Homepage carousel</strong><small>Include this story in the rotating homepage feature (maximum 25)</small></span><input name="isFeatured" type="checkbox" defaultChecked={initial.isFeatured} /></label>
          <label className="toggle-label"><span><strong>Show in Live ticker</strong><small>Scroll this article topic and headline in the Live bar</small></span><input name="isBreaking" type="checkbox" defaultChecked={initial.isBreaking} /></label>
          <label className="toggle-label"><span><strong>Allow comments</strong><small>Readers can join the discussion</small></span><input name="allowComments" type="checkbox" defaultChecked={initial.allowComments ?? true} /></label>
          <details><summary>Search & social preview</summary><label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle} placeholder={title || "Article title"} /></label><label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription} placeholder="Description for search results" /></label></details>
        </aside>
      </div>
    </form>
  );
}
