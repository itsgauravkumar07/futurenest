import BlogForm from "@/components/dashboard/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="text-2xl">New Blog Post</h1>
      <BlogForm mode="create" />
    </div>
  );
}
