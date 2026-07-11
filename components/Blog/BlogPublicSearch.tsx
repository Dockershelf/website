"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

import FriendlyDate from "@components/Blog/FriendlyDate";
import type { PublicPostSummary } from "@lib/blog/types";
import { MAX_SEARCH_QUERY_LENGTH } from "@lib/searchQuery";

type BlogPublicSearchProps = {
  posts: PublicPostSummary[];
};

export function BlogPublicSearch({ posts }: BlogPublicSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicPostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResults(null);
      setError(null);
      return;
    }

    if (trimmed.length > MAX_SEARCH_QUERY_LENGTH) {
      setError("Query too long");
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/search-posts?q=${encodeURIComponent(trimmed)}`
      );
      const data = await response.json();
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Search failed");
        setResults([]);
        return;
      }
      setResults((data.response as PublicPostSummary[]) || []);
    } catch {
      setError("Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const showingSearch = results !== null;
  const list = showingSearch ? results : posts;

  return (
    <div className="w-full">
      <form
        className="mb-10 flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch(query);
        }}
        role="search"
      >
        <label htmlFor="blog-search" className="sr-only">
          Search posts
        </label>
        <input
          id="blog-search"
          type="search"
          value={query}
          maxLength={MAX_SEARCH_QUERY_LENGTH}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            if (!next.trim()) {
              setResults(null);
              setError(null);
            }
          }}
          placeholder="Search posts"
          className="min-w-[220px] flex-1 rounded border border-black/20 bg-white px-3 py-2 text-base font-light text-black"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-base font-light text-white hover:bg-black/80"
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error ? (
        <p className="mb-6 text-base text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {showingSearch ? (
        <p className="mb-6 text-base font-light text-black/60">
          {list.length === 0
            ? `No results for “${query.trim()}”.`
            : `${list.length} result${list.length === 1 ? "" : "s"} for “${query.trim()}”.`}
        </p>
      ) : null}

      {list.length === 0 && !showingSearch ? (
        <p className="text-xl font-light text-black/70" role="status">
          No published posts yet.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-8 p-0">
          {list.map((post) => (
            <li
              key={post.id}
              className="border-b border-black/10 pb-8 last:border-0"
            >
              <article>
                {post.category ? (
                  <Link
                    href={`/blog/category/${encodeURIComponent(post.category)}`}
                    className="mb-2 inline-block text-sm uppercase tracking-wide text-black/55 hover:text-black"
                    rel="tag"
                  >
                    {post.category}
                  </Link>
                ) : null}
                <h2 className="text-2xl font-light leading-tight md:text-3xl">
                  <Link
                    href={`/blog/posts/${post.slug}`}
                    className="text-black transition-colors hover:text-black/75"
                    rel="bookmark"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt ? (
                  <p className="mt-2 text-lg font-light leading-relaxed text-black/75">
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
      )}
    </div>
  );
}
