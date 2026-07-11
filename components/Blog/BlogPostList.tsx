import Link from "next/link";

import FriendlyDate from "@components/Blog/FriendlyDate";
import type { PublicPostSummary } from "@lib/blog/types";

type BlogPostListProps = {
  posts: PublicPostSummary[];
  emptyMessage?: string;
};

export function BlogPostList({
  posts,
  emptyMessage = "No published posts yet.",
}: BlogPostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-xl font-light text-black/70" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-8 list-none p-0 m-0">
      {posts.map((post) => (
        <li
          key={post.id}
          className="border-b border-black/10 pb-8 last:border-0"
        >
          <article>
            {post.category ? (
              <Link
                href={`/blog/category/${encodeURIComponent(post.category)}`}
                className="inline-block text-sm uppercase tracking-wide text-black/55 hover:text-black mb-2"
                rel="tag"
              >
                {post.category}
              </Link>
            ) : null}
            <h2 className="text-2xl md:text-3xl font-light leading-tight">
              <Link
                href={`/blog/posts/${post.slug}`}
                className="text-black hover:text-black/75 transition-colors"
                rel="bookmark"
              >
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p className="mt-2 text-lg font-light text-black/75 leading-relaxed">
                {post.excerpt}
              </p>
            ) : null}
            <p className="mt-2 text-base font-light text-black/55">
              Published{" "}
              <time dateTime={post.createdAt}>
                <FriendlyDate dateString={post.createdAt} />
              </time>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
