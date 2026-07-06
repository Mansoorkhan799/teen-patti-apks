import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PostCard from "@/components/PostCard";
import JsonLd from "@/components/JsonLd";
import { buildSiteMetadata, getSiteName, getSiteUrl } from "@/lib/seo";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/schema/builders";
import { SCHEMA_CONTEXT } from "@/lib/schema/constants";
import { getPosts } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = buildSiteMetadata(
  "Guides & APK Reviews",
  "Browse Teen Patti APK guides, downloads, and earning tips for Pakistan.",
  "/blog"
);

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];

  try {
    posts = await getPosts({ per_page: 20 });
  } catch {
    posts = [];
  }

  const pageUrl = `${getSiteUrl().replace(/\/$/, "")}/blog`;
  const breadcrumbs = [
    { label: getSiteName(), href: "/" },
    { label: "Guides" },
  ];

  const schemaGraph = {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      buildBreadcrumbSchema(breadcrumbs, pageUrl),
      buildCollectionPageSchema(
        pageUrl,
        "Guides & APK Reviews",
        "Browse Teen Patti APK guides, downloads, and earning tips for Pakistan.",
        posts.map((post) => `${getSiteUrl().replace(/\/$/, "")}/${post.slug}`)
      ),
    ],
  };

  return (
    <SiteLayout>
      <JsonLd data={schemaGraph} />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-white">All Guides</h1>
        <p className="mt-2 text-zinc-400">
          APK downloads, earning tips, and in-depth Teen Patti reviews for Pakistan.
        </p>

        {posts.length === 0 ? (
          <p className="mt-10 text-zinc-500">No posts yet.</p>
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
