"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import type { Blog } from "@/types";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/blogs")
      .then((res) => setBlogs(res.data.blogs))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (blog: Blog) => {
    setActioningId(blog._id);
    try {
      await api.put(`/admin/blogs/${blog._id}/${blog.isPublished ? "unpublish" : "publish"}`);
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    setActioningId(id);
    try {
      await api.delete(`/admin/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return <Spinner label="Loading posts…" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Blog</h1>
        <Link href="/dashboard/admin/blogs/new" className="btn-accent">
          <PlusCircle size={16} /> New Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <p className="mt-8 text-sm text-slate">No posts yet.</p>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {blogs.map((blog) => (
            <div key={blog._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink">{blog.title}</p>
                  <span className={`pill ${blog.isPublished ? "pill-approved" : "pill-neutral"}`}>
                    {blog.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate">
                  /{blog.slug} · {formatDate(blog.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button onClick={() => togglePublish(blog)} disabled={actioningId === blog._id} className="btn-outline">
                  {blog.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/dashboard/admin/blogs/${blog._id}/edit`} className="btn-outline px-3">
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(blog._id)}
                  disabled={actioningId === blog._id}
                  className="btn-outline px-3 text-brick hover:border-brick"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
