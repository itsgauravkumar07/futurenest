import type { MetadataRoute } from "next";
import { getBlogs, getProperties } from "@/lib/server-api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Generates /sitemap.xml at request time. Submit this URL in Google Search
// Console after launch/migration so blog and property URLs get re-crawled
// quickly instead of waiting for organic discovery.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Pull every published blog post — paginate through if there are many
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { blogs, pagination } = await getBlogs({ limit: "200" });
    blogPages = blogs.map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: blog.publishedAt || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
    // If there's more than one page of posts, fetch the rest too
    for (let page = 2; page <= pagination.pages; page++) {
      const next = await getBlogs({ limit: "200", page: String(page) });
      blogPages.push(
        ...next.blogs.map((blog) => ({
          url: `${SITE_URL}/blog/${blog.slug}`,
          lastModified: blog.publishedAt || undefined,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }))
      );
    }
  } catch {
    blogPages = [];
  }

  // Pull every live property
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const { properties } = await getProperties({ limit: "200" });
    propertyPages = properties.map((property) => ({
      url: `${SITE_URL}/properties/${property._id}`,
      lastModified: property.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    propertyPages = [];
  }

  return [...staticPages, ...blogPages, ...propertyPages];
}
