import type { WPCategory, WPPost } from "@/types/wordpress";
import type { ParsedFaqItem, ParsedHowToStep } from "./parse-content";
import {
  extractFaqItems,
  extractHowToSteps,
  extractTotalTime,
} from "./parse-content";
import {
  APK_CATEGORY_SLUGS,
  DEFAULT_LOGO_PATH,
  HOWTO_CATEGORY_SLUGS,
  HOWTO_TITLE_PATTERN,
  SCHEMA_CONTEXT,
} from "./constants";
import { getFeaturedImage, stripHtml } from "@/lib/wordpress-helpers";
import { getSiteDescription, getSiteName, getSiteUrl } from "@/lib/seo";

type JsonLdObject = Record<string, unknown>;

function siteOrigin(): string {
  return getSiteUrl().replace(/\/$/, "");
}

function logoUrl(): string {
  return `${siteOrigin()}${DEFAULT_LOGO_PATH}`;
}

export function buildOrganizationSchema(): JsonLdObject {
  const url = siteOrigin();
  return {
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: getSiteName(),
    url,
    logo: {
      "@type": "ImageObject",
      "@id": `${url}/#logo`,
      url: logoUrl(),
      contentUrl: logoUrl(),
      caption: getSiteName(),
    },
  };
}

export function buildWebSiteSchema(): JsonLdObject {
  const url = siteOrigin();
  return {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: getSiteName(),
    url,
    description: getSiteDescription(),
    publisher: { "@id": `${url}/#organization` },
    inLanguage: "en-PK",
  };
}

export function buildSiteGraph(): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [buildOrganizationSchema(), buildWebSiteSchema()],
  };
}

export interface BreadcrumbInput {
  label: string;
  href?: string;
}

export function buildBreadcrumbSchema(
  items: BreadcrumbInput[],
  pageUrl: string
): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${siteOrigin()}${item.href}` }),
    })),
  };
}

export function buildArticleSchema(
  post: WPPost,
  pageUrl: string,
  title: string,
  description: string
): JsonLdObject {
  const url = siteOrigin();
  const featured = getFeaturedImage(post);
  const author = post._embedded?.author?.[0];

  return {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: title,
    description,
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    datePublished: post.date,
    dateModified: post.modified,
    inLanguage: "en-PK",
    isAccessibleForFree: true,
    ...(featured && {
      image: {
        "@type": "ImageObject",
        url: featured.url,
        width: featured.width,
        height: featured.height,
      },
      thumbnailUrl: featured.url,
    }),
    author: {
      "@type": "Person",
      name: author?.name ?? getSiteName(),
      ...(author?.slug && { url: `${url}/author/${author.slug}` }),
    },
    publisher: {
      "@type": "Organization",
      "@id": `${url}/#organization`,
      name: getSiteName(),
      logo: { "@type": "ImageObject", url: logoUrl() },
    },
    ...(post.rank_math?.focus_keyword && {
      keywords: post.rank_math.focus_keyword,
    }),
  };
}

export function buildHowToSchema(
  post: WPPost,
  pageUrl: string,
  title: string,
  description: string,
  steps: ParsedHowToStep[]
): JsonLdObject {
  const featured = getFeaturedImage(post);
  const totalTime = extractTotalTime(post.content.rendered);

  return {
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    name: title,
    description,
    url: pageUrl,
    inLanguage: "en-PK",
    ...(totalTime && { totalTime }),
    ...(featured && { image: featured.url }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${pageUrl}#step-${index + 1}`,
      ...(step.image && {
        image: { "@type": "ImageObject", url: step.image },
      }),
    })),
  };
}

export function buildFaqSchema(
  pageUrl: string,
  items: ParsedFaqItem[]
): JsonLdObject {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildSoftwareApplicationSchema(
  pageUrl: string,
  title: string,
  description: string,
  imageUrl?: string
): JsonLdObject {
  return {
    "@type": "SoftwareApplication",
    "@id": `${pageUrl}#software`,
    name: title.replace(/\s*(apk|download|202\d)\s*/gi, " ").trim() || title,
    applicationCategory: "GameApplication",
    operatingSystem: "Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    },
    description,
    url: pageUrl,
    ...(imageUrl && { image: imageUrl, screenshot: imageUrl }),
  };
}

export function buildCollectionPageSchema(
  pageUrl: string,
  name: string,
  description: string,
  postUrls: string[]
): JsonLdObject {
  return {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    name,
    description,
    url: pageUrl,
    inLanguage: "en-PK",
    isPartOf: { "@id": `${siteOrigin()}/#website` },
    hasPart: postUrls.map((url) => ({
      "@type": "WebPage",
      url,
    })),
  };
}

export type PostSchemaType = "howto" | "faq" | "software";

export function detectPostSchemaTypes(
  post: WPPost,
  title: string,
  categories: WPCategory[]
): PostSchemaType[] {
  const types: PostSchemaType[] = [];
  const categorySlugs = categories.map((c) => c.slug);
  const richSnippet = post.rank_math?.rich_snippet?.toLowerCase() ?? "";
  const combined = `${title} ${post.slug}`.toLowerCase();

  const wantsHowTo =
    richSnippet === "howto" ||
    richSnippet === "how_to" ||
    HOWTO_CATEGORY_SLUGS.some((s) => categorySlugs.includes(s)) ||
    HOWTO_TITLE_PATTERN.test(title);

  const wantsFaq = richSnippet === "faq" || /\bfaq\b/i.test(title);

  const wantsSoftware =
    richSnippet === "software" ||
    richSnippet === "softwareapplication" ||
    /\bapk\b/i.test(combined) ||
    APK_CATEGORY_SLUGS.some((s) => categorySlugs.includes(s));

  if (wantsHowTo) types.push("howto");
  if (wantsFaq) types.push("faq");
  if (wantsSoftware) types.push("software");

  return types;
}

export function buildPostSchemaGraph(
  post: WPPost,
  slug: string,
  categories: WPCategory[],
  breadcrumbs: BreadcrumbInput[]
): JsonLdObject {
  const pageUrl = `${siteOrigin()}/${slug}`;
  const title = stripHtml(post.title.rendered);
  const description =
    post.rank_math?.description ||
    stripHtml(post.excerpt.rendered) ||
    title;

  const graph: JsonLdObject[] = [
    buildBreadcrumbSchema(breadcrumbs, pageUrl),
    buildArticleSchema(post, pageUrl, title, description),
  ];

  const detectedTypes = detectPostSchemaTypes(post, title, categories);
  const howToSteps = extractHowToSteps(post.content.rendered);
  const faqItems = extractFaqItems(post.content.rendered);
  const featured = getFeaturedImage(post);

  if (
    (detectedTypes.includes("howto") || howToSteps.length >= 2) &&
    howToSteps.length >= 2
  ) {
    graph.push(buildHowToSchema(post, pageUrl, title, description, howToSteps));
  }

  if ((detectedTypes.includes("faq") || faqItems.length > 0) && faqItems.length > 0) {
    graph.push(buildFaqSchema(pageUrl, faqItems));
  }

  if (detectedTypes.includes("software") || /\bapk\b/i.test(title)) {
    graph.push(
      buildSoftwareApplicationSchema(
        pageUrl,
        title,
        description,
        featured?.url
      )
    );
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": graph,
  };
}
