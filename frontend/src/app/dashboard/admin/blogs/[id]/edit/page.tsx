"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import BlogForm from "@/components/dashboard/BlogForm";
import Spinner from "@/components/Spinner";
import type { Blog } from "@/types";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // No GET /admin/blogs/:id endpoint yet — fetch the full admin list and
    // find this one client-side, same pattern as the property edit page.
    api
      .get("/admin/blogs")
      .then((res) => {
        const found = (res.data.blogs as Blog[]).find((b) => b._id === params.id);
        if (found) setBlog(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) return <p className="text-sm text-brick">Post not found.</p>;
  if (!blog) return <Spinner label="Loading post…" />;

  return (
    <div>
      <h1 className="text-2xl">Edit Blog Post</h1>
      <BlogForm mode="edit" blogId={blog._id} initialData={blog} />
    </div>
  );
}
