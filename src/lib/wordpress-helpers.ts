import type { WPCategory, WPPost } from "@/types/wordpress";

export function getFeaturedImage(post: WPPost): {
  url: string;
  alt: string;
  width?: number;
  height?: number;
} | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return null;

  return {
    url: media.source_url,
    alt: media.alt_text || stripHtml(post.title.rendered),
    width: media.media_details?.width,
    height: media.media_details?.height,
  };
}

export function getPostCategories(post: WPPost): WPCategory[] {
  return post._embedded?.["wp:term"]?.[0] ?? [];
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&#8230;|&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/\s+/g, " ")
    .trim();
}
