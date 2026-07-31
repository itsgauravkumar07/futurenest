"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import type { Blog } from "@/types";

interface Props {
  mode: "create" | "edit";
  blogId?: string;
  initialData?: Blog;
}

export default function BlogForm({ mode, blogId, initialData }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImage?.url || "");
  const [categories, setCategories] = useState(initialData?.categories?.join(", ") || "");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title,
      slug: slug || undefined,
      content,
      excerpt,
      coverImage: coverImageUrl ? { url: coverImageUrl } : undefined,
      categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      ...(mode === "create" && { isPublished }),
    };

    try {
      if (mode === "create") {
        await api.post("/admin/blogs", payload);
      } else {
        await api.put(`/admin/blogs/${blogId}`, payload);
      }
      router.push("/dashboard/admin/blogs");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
      <div>
        <label className="label" htmlFor="title">
          Title
        </label>
        <input id="title" required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="label" htmlFor="slug">
          URL slug{" "}
          <span className="font-normal text-slate-light">
            (optional — leave blank to auto-generate from title. Set this explicitly when migrating an old
            post, to match its original URL and preserve search ranking.)
          </span>
        </label>
        <input
          id="slug"
          className="input font-mono text-xs"
          placeholder="e.g. what-to-know-when-you-buy-a-land-in-dehradun"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="excerpt">
          Excerpt (short summary shown in listings)
        </label>
        <input id="excerpt" className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div>
        <label className="label" htmlFor="content">
          Content{" "}
          <span className="font-normal text-slate-light">
            (HTML — a rich-text editor isn&apos;t wired up yet, so write or paste HTML directly)
          </span>
        </label>
        <textarea
          id="content"
          required
          rows={12}
          className="input resize-y font-mono text-xs"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <ImageUpload label="Cover image (optional)" value={coverImageUrl} onChange={setCoverImageUrl} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="categories">
            Categories (comma-separated)
          </label>
          <input id="categories" className="input" value={categories} onChange={(e) => setCategories(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input id="tags" className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
      </div>

      {mode === "create" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publish immediately
        </label>
      )}

      {error && <p className="text-sm text-brick">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
      </button>
    </form>
  );
}
