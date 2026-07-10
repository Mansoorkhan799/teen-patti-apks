import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import WordPressContent from "@/components/WordPressContent";
import JsonLd from "@/components/JsonLd";
import FadeIn from "@/components/motion/FadeIn";
import { buildPostMetadata, getSiteName } from "@/lib/seo";
import { buildPostSchemaGraph } from "@/lib/schema/builders";
import {
  getAllPostSlugs,
  getFeaturedImage,
  getPostBySlug,
  getPostCategories,
  stripHtml,
} from "@/lib/wordpress";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);
    if (!post) return {};
    return buildPostMetadata(post, `/${slug}`);
  } catch {
    return {};
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPostBySlug>> = null;

  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const featured = getFeaturedImage(post);
  const categories = getPostCategories(post);
  const postTitle = stripHtml(post.title.rendered);
  const excerpt = stripHtml(post.excerpt.rendered);

  const breadcrumbs = [
    { label: getSiteName(), href: "/" },
    { label: "Guides", href: "/blog" },
    { label: postTitle },
  ];

  const schemaGraph = buildPostSchemaGraph(post, slug, categories, breadcrumbs);

  return (
    <SiteLayout>
      <JsonLd data={schemaGraph} />
      <article className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />

        <FadeIn>
        {/* Card-style hero — title left, compact image right */}
        <header className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-800/20 p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                {postTitle}
              </h1>
              {excerpt && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {excerpt}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500 sm:text-sm">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {post.modified !== post.date && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      Updated{" "}
                      {new Date(post.modified).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </>
                )}
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>

            {featured && (
              <figure className="mx-auto shrink-0 sm:mx-0">
                <Image
                  src={featured.url}
                  alt={featured.alt}
                  width={160}
                  height={160}
                  className="h-28 w-28 rounded-xl object-cover sm:h-36 sm:w-36 sm:rounded-2xl"
                  priority
                />
              </figure>
            )}
          </div>
        </header>
        </FadeIn>

        <FadeIn delay={0.1}>
        <WordPressContent
          html={post.content.rendered}
          skipLeadingH1
          excerpt={excerpt}
        />
        </FadeIn>
      </article>
    </SiteLayout>
  );
}
