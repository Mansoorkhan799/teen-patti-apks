import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/types/wordpress";
import {
  getFeaturedImage,
  getPostCategories,
  stripHtml,
} from "@/lib/wordpress-helpers";

interface PostCardProps {
  post: WPPost;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const featured = getFeaturedImage(post);
  const categories = getPostCategories(post);
  const title = stripHtml(post.title.rendered);
  const excerpt = stripHtml(post.excerpt.rendered);

  if (compact) {
    return (
      <article className="group rounded-lg border border-zinc-800/80 bg-zinc-800/20 transition hover:border-zinc-700 hover:bg-zinc-800/40">
        <Link href={`/${post.slug}`} className="flex items-center gap-3 p-2.5">
          {featured ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-800">
              <Image
                src={featured.url}
                alt={featured.alt}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-md bg-zinc-800" />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-200 group-hover:text-emerald-400">
              {title}
            </h2>
            <time dateTime={post.date} className="mt-1 block text-xs text-zinc-500">
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800/30 transition hover:border-emerald-500/30 hover:bg-zinc-800/50">
      <Link href={`/${post.slug}`} className="block">
        {featured ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-zinc-800">
            <Image
              src={featured.url}
              alt={featured.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-zinc-800" />
        )}

        <div className="p-5">
          {categories.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          <h2 className="text-lg font-semibold leading-snug text-white group-hover:text-emerald-400">
            {title}
          </h2>

          {excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
              {excerpt}
            </p>
          )}

          <time
            dateTime={post.date}
            className="mt-3 block text-xs text-zinc-500"
          >
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </Link>
    </article>
  );
}
