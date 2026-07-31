import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getBlogBySlug } from "@/lib/server-api";
import { formatDate } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Dynamic SEO metadata per post — this is what search engines actually read
// for the title/snippet, and the canonical tag tells them this is the one
// true URL for this content (important when migrating from another site).
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { blog } = await getBlogBySlug(params.slug);
  if (!blog) return {};

  const description = blog.excerpt || blog.content.replace(/<[^>]+>/g, "").slice(0, 160);

  return {
    title: `${blog.title} | FutureNest Blog`,
    description,
    alternates: {
      canonical: `${SITE_URL}/blog/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description,
      type: "article",
      publishedTime: blog.publishedAt || undefined,
      images: blog.coverImage?.url ? [blog.coverImage.url] : undefined,
      url: `${SITE_URL}/blog/${blog.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const { blog } = await getBlogBySlug(params.slug);

  if (!blog) notFound();

  const authorName = typeof blog.author === "object" ? blog.author.name : "FutureNest Team";

  // Article structured data — helps Google understand this is a blog post
  // (author, dates, image), which supports rich results and can help
  // migrated content get re-evaluated faster than plain HTML alone.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage?.url,
    datePublished: blog.publishedAt,
    author: { "@type": "Person", name: authorName },
  };

  return (
    <div className="container-page py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-2xl">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink">
          <ArrowLeft size={15} /> Back to blog
        </Link>

        <div className="mt-6">
          {blog.categories?.[0] && <p className="eyebrow mb-3">{blog.categories[0]}</p>}
          <h1 className="text-3xl md:text-4xl">{blog.title}</h1>
          <p className="mt-3 text-sm text-slate">
            By {authorName} · {formatDate(blog.publishedAt)}
          </p>
        </div>

        {blog.coverImage?.url && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-ink-50">
            <Image src={blog.coverImage.url} alt={blog.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="prose-content mt-8" dangerouslySetInnerHTML={{ __html: blog.content }} />

        {blog.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
            {blog.tags.map((tag) => (
              <span key={tag} className="pill pill-neutral">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

