import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogs } from "@/lib/server-api";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | FutureNest Property",
  description: "Guides for property buyers, tenants, sellers, and landlords in Dehradun and beyond.",
};

interface Props {
  searchParams: { category?: string; tag?: string; search?: string; page?: string };
}

export default async function BlogPage({ searchParams }: Props) {
  const { blogs, pagination } = await getBlogs(searchParams);

  return (
    // <div className="container-page py-10 md:py-14">
    //   <p className="eyebrow mb-2">FutureNest Blog</p>
    //   <h1 className="text-3xl">Guides for buyers, tenants, sellers &amp; landlords</h1>

    //   {blogs.length === 0 ? (
    //     <div className="card mt-10 p-12 text-center">
    //       <p className="text-lg font-medium">No articles yet</p>
    //       <p className="mt-1 text-sm text-slate">Check back soon — we&apos;re working on our first posts.</p>
    //     </div>
    //   ) : (
    //     <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
    //       {blogs.map((blog) => (
    //         <Link key={blog._id} href={`/blog/${blog.slug}`} className="card group flex flex-col overflow-hidden">
    //           <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-50">
    //             {blog.coverImage?.url ? (
    //               <Image
    //                 src={blog.coverImage.url}
    //                 alt={blog.title}
    //                 fill
    //                 className="object-cover transition-transform duration-300 group-hover:scale-105"
    //               />
    //             ) : (
    //               <div className="flex h-full w-full items-center justify-center text-sm text-slate-light">
    //                 FutureNest
    //               </div>
    //             )}
    //           </div>
    //           <div className="flex flex-1 flex-col p-5">
    //             {blog.categories?.[0] && <p className="eyebrow mb-2">{blog.categories[0]}</p>}
    //             <h2 className="line-clamp-2 text-lg font-medium">{blog.title}</h2>
    //             {blog.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate">{blog.excerpt}</p>}
    //             <p className="mt-auto pt-4 text-xs text-slate-light">{formatDate(blog.publishedAt)}</p>
    //           </div>
    //         </Link>
    //       ))}
    //     </div>
    //   )}

    //   {pagination.pages > 1 && (
    //     <div className="mt-10 flex items-center justify-center gap-2">
    //       {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
    //         <Link
    //           key={p}
    //           href={`/blog?page=${p}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
    //           className={`flex h-9 w-9 items-center justify-center rounded text-sm ${
    //             p === pagination.page ? "bg-ink text-paper" : "border border-line text-ink hover:border-ink"
    //           }`}
    //         >
    //           {p}
    //         </Link>
    //       ))}
    //     </div>
    //   )}
    // </div>

<div className="container-page py-16 md:py-20">

  {/* Header */}

  <div className="max-w-2xl">

    <p className="eyebrow mb-3">
      Blog
    </p>

    <h1 className="text-4xl">
      Real Estate Insights & Guides
    </h1>

    <p className="mt-4 text-sm leading-7 text-slate">
      Practical guides, market updates, and expert advice for buyers,
      sellers, landlords, and tenants.
    </p>

  </div>

  {/* Articles */}

  {blogs.length === 0 ? (

    <div className="mt-14 rounded-2xl border border-line bg-white p-12 text-center">

      <h2 className="text-xl">
        No articles yet
      </h2>

      <p className="mt-3 text-sm text-slate">
        We&apos;re working on our first articles. Check back soon.
      </p>

    </div>

  ) : (

    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

      {blogs.map((blog) => (

        <Link
          key={blog._id}
          href={`/blog/${blog.slug}`}
          className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >

          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">

            {blog.coverImage?.url ? (

              <Image
                src={blog.coverImage.url}
                alt={blog.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

            ) : (

              <div className="flex h-full items-center justify-center text-sm text-slate">
                FutureNest
              </div>

            )}

          </div>

          <div className="p-6">

            {blog.categories?.[0] && (
              <p className="eyebrow mb-2">
                {blog.categories[0]}
              </p>
            )}

            <h2 className="line-clamp-2 text-lg font-medium group-hover:text-accent-dark">
              {blog.title}
            </h2>

            {blog.excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate">
                {blog.excerpt}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between">

              <span className="text-xs text-slate-light">
                {formatDate(blog.publishedAt)}
              </span>

              <span className="text-sm font-medium text-accent-dark">
                Read →
              </span>

            </div>

          </div>

        </Link>

      ))}

    </div>

  )}

  {/* Pagination */}

  {pagination.pages > 1 && (

    <div className="mt-14 flex justify-center gap-2">

      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (

        <Link
          key={p}
          href={`/blog?page=${p}${
            searchParams.search
              ? `&search=${searchParams.search}`
              : ""
          }`}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm transition ${
            p === pagination.page
              ? "bg-ink text-paper"
              : "border border-line hover:border-ink"
          }`}
        >
          {p}
        </Link>

      ))}

    </div>

  )}

</div>
  );
}
