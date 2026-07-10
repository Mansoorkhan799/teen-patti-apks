import type { WPCategory, WPPost } from "@/types/wordpress";
import {
  getFeaturedImage,
  getPostCategories,
  stripHtml,
} from "@/lib/wordpress-helpers";

export { getFeaturedImage, getPostCategories, stripHtml };

const DEFAULT_REVALIDATE = 3600;

function getApiUrl(): string {
  const url = process.env.WORDPRESS_API_URL;
  if (!url) {
    throw new Error(
      "WORDPRESS_API_URL environment variable is not configured. Add it to .env.local."
    );
  }
  return url;
}

async function wpFetch<T>(
  path: string,
  options?: { revalidate?: number | false }
): Promise<T> {
  const apiUrl = getApiUrl();
  const url = `${apiUrl.replace(/\/$/, "")}${path}`;
  const revalidate = options?.revalidate ?? DEFAULT_REVALIDATE;

  const response = await fetch(url, {
    next:
      revalidate === false
        ? { revalidate: 0 }
        : { revalidate, tags: ["wordpress"] },
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function getWordPressOrigin(): string {
  try {
    return new URL(getApiUrl()).origin;
  } catch {
    return "";
  }
}

export async function getPosts(
  params: Record<string, string | number> = {}
): Promise<WPPost[]> {
  const searchParams = new URLSearchParams({
    _embed: "1",
    per_page: "10",
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
  });

  return wpFetch<WPPost[]>(`/wp/v2/posts?${searchParams}`);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`
  );
  return posts[0] ?? null;
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const posts = await wpFetch<{ slug: string }[]>(
        `/wp/v2/posts?per_page=100&page=${page}&_fields=slug`
      );

      if (posts.length === 0) {
        hasMore = false;
      } else {
        slugs.push(...posts.map((p) => p.slug));
        page++;
      }
    } catch {
      hasMore = false;
    }
  }

  return slugs;
}

export async function getCategories(): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>("/wp/v2/categories?per_page=100");
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const categories = await wpFetch<WPCategory[]>(
    `/wp/v2/categories?slug=${encodeURIComponent(slug)}`
  );
  return categories[0] ?? null;
}

export async function getPostsByCategory(categoryId: number): Promise<WPPost[]> {
  return getPosts({ categories: categoryId, per_page: 20 });
}

/** Rewrite relative WordPress URLs in content to absolute URLs */
export function fixContentUrls(html: string): string {
  const origin = getWordPressOrigin();
  if (!origin) return html;

  return html
    .replace(/src="\/wp-content/g, `src="${origin}/wp-content`)
    .replace(/href="\/wp-content/g, `href="${origin}/wp-content`)
    .replace(/srcset="\/wp-content/g, `srcset="${origin}/wp-content`);
}
