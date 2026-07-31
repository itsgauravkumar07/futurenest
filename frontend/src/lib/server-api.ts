import type { Blog, Pagination, Plan, Property } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getProperties(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  return safeGet<{ properties: Property[]; pagination: Pagination }>(
    `/properties?${query.toString()}`,
    { properties: [], pagination: { total: 0, page: 1, pages: 0 } }
  );
}

export async function getProperty(id: string) {
  return safeGet<{ property: Property | null }>(`/properties/${id}`, { property: null });
}

export async function getBlogs(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  return safeGet<{ blogs: Blog[]; pagination: Pagination }>(`/blogs?${query.toString()}`, {
    blogs: [],
    pagination: { total: 0, page: 1, pages: 0 },
  });
}

export async function getBlogBySlug(slug: string) {
  return safeGet<{ blog: Blog | null }>(`/blogs/${slug}`, { blog: null });
}

export async function getPlans(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  return safeGet<{ plans: Plan[] }>(`/plans?${query.toString()}`, { plans: [] });
}
