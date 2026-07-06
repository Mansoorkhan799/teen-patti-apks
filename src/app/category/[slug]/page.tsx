import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import PostCard from "@/components/PostCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { buildSiteMetadata, getSiteName, getSiteUrl } from "@/lib/seo";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/schema/builders";
import { SCHEMA_CONTEXT } from "@/lib/schema/constants";
import {
  getCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/lib/wordpress";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories
      .filter((cat) => cat.slug !== "uncategorized")
      .map((cat) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return {};
    return buildSiteMetadata(
      category.name,
      category.description || `Posts in ${category.name}`,
      `/category/${slug}`
    );
  } catch {
    return {};
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  const posts = await getPostsByCategory(category.id).catch(() => []);

  const pageUrl = `${getSiteUrl().replace(/\/$/, "")}/category/${slug}`;
  const breadcrumbs = [
    { label: getSiteName(), href: "/" },
    { label: "Guides", href: "/blog" },
    { label: category.name },
  ];

  const schemaGraph = {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      buildBreadcrumbSchema(breadcrumbs, pageUrl),
      buildCollectionPageSchema(
        pageUrl,
        category.name,
        category.description || `Posts in ${category.name}`,
        posts.map((post) => `${getSiteUrl().replace(/\/$/, "")}/${post.slug}`)
      ),
    ],
  };

  return (
    <SiteLayout>
      <JsonLd data={schemaGraph} />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
        <Breadcrumbs items={breadcrumbs} />

        <h1 className="text-3xl font-bold tracking-tight text-white">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-zinc-400">{category.description}</p>
        )}

        {posts.length === 0 ? (
          <p className="mt-10 text-zinc-500">No posts in this category yet.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
