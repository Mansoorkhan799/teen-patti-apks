import Link from "next/link";
import PostCard from "@/components/PostCard";
import type { WPPost } from "@/types/wordpress";

interface PostColumnProps {
  title: string;
  description: string;
  categorySlug: string;
  posts: WPPost[];
}

export default function PostColumn({
  title,
  description,
  categorySlug,
  posts,
}: PostColumnProps) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        </div>
        <Link
          href={`/category/${categorySlug}`}
          className="shrink-0 text-xs font-medium text-emerald-400 hover:text-emerald-300"
        >
          View all →
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-5 text-center text-xs text-zinc-500">
          New guides coming soon.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} compact />
          ))}
        </div>
      )}
    </div>
  );
}
