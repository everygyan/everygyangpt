"use client";

import Link from "next/link";
import { ArrowLeft, Bold, ChevronDown, Eye, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, Save, Send, Undo2 } from "lucide-react";
import { useState } from "react";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);

  function saveDraft() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="editor-page">
      <header className="editor-topbar">
        <Link href="/admin" className="editor-back"><ArrowLeft size={19} /> Dashboard</Link>
        <span className="save-status">{saved ? "Draft saved" : "Unsaved draft"}</span>
        <div className="editor-actions">
          <button type="button" onClick={saveDraft}><Save size={17} /> Save draft</button>
          <button type="button"><Eye size={17} /> Preview</button>
          <button className="publish-button" type="button"><Send size={17} /> Publish</button>
        </div>
      </header>

      <div className="editor-layout">
        <section className="editor-canvas">
          <div className="editor-breadcrumb"><span>Articles</span><span>/</span><strong>New article</strong></div>
          <input
            className="title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter an engaging headline..."
            aria-label="Article title"
          />
          <textarea className="excerpt-input" placeholder="Write a short summary that gives readers a reason to continue..." aria-label="Article summary" />

          <div className="format-toolbar" aria-label="Article formatting">
            <button type="button" aria-label="Undo"><Undo2 size={17} /></button>
            <button type="button" aria-label="Redo"><Redo2 size={17} /></button>
            <span />
            <button className="format-select" type="button">Paragraph <ChevronDown size={14} /></button>
            <span />
            <button type="button" aria-label="Bold"><Bold size={17} /></button>
            <button type="button" aria-label="Italic"><Italic size={17} /></button>
            <button type="button" aria-label="Link"><Link2 size={17} /></button>
            <button type="button" aria-label="Bullet list"><List size={17} /></button>
            <button type="button" aria-label="Numbered list"><ListOrdered size={17} /></button>
            <button type="button" aria-label="Quote"><Quote size={17} /></button>
            <button type="button" aria-label="Add image"><ImagePlus size={17} /></button>
          </div>

          <div className="rich-editor" contentEditable suppressContentEditableWarning data-placeholder="Start writing your story here..." />
          <div className="editor-tip"><strong>Editor preview</strong><span>This interface establishes the publishing experience. Database saving, media uploads and the full rich-text engine will connect during the Supabase phase.</span></div>
        </section>

        <aside className="editor-settings">
          <h2>Article settings</h2>
          <label>Section<select defaultValue="News"><option>News</option><option>Travel</option><option>Entertainment</option><option>Health</option><option>Learn</option></select></label>
          <label>Category<select defaultValue="Technology"><option>Technology</option><option>World</option><option>Travel Guides</option><option>Movies</option><option>Nutrition</option><option>SAP</option></select></label>
          <label>Tags<input placeholder="Add tags separated by commas" /></label>
          <label>Author<select defaultValue="Sandeep"><option>Sandeep</option></select></label>
          <div className="cover-upload"><ImagePlus size={25} /><strong>Featured image</strong><span>Upload JPG, PNG, WebP or AVIF</span><button type="button">Choose image</button></div>
          <label className="toggle-label"><span><strong>Featured story</strong><small>Show prominently on the homepage</small></span><input type="checkbox" /></label>
          <label className="toggle-label"><span><strong>Allow comments</strong><small>Readers can join the discussion</small></span><input type="checkbox" defaultChecked /></label>
          <details><summary>Search & social preview</summary><label>SEO title<input placeholder={title || "Article title"} /></label><label>Meta description<textarea placeholder="Description for search results" /></label></details>
        </aside>
      </div>
    </main>
  );
}

