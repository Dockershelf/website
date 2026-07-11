import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db, posts, type Post } from "@lib/db";
import { excerptFromBody } from "@lib/blog/excerpt";
import type { PublicPost, PublicPostSummary } from "@lib/blog/types";

function requireDb() {
  if (!db) {
    throw new Error(
      'Blog database is unavailable. FEATURE_BLOG must be "1" and DATABASE_URL set.'
    );
  }
  return db;
}

function toIso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function toPublicPost(post: Post): PublicPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    body: post.body,
    excerpt: excerptFromBody(post.body),
    category: post.category,
    createdAt: toIso(post.createdAt),
    updatedAt: toIso(post.updatedAt),
  };
}

function toPublicSummary(post: Post): PublicPostSummary {
  const full = toPublicPost(post);
  const { body: _body, ...summary } = full;
  return summary;
}

const published = eq(posts.status, "published");

/** All published posts, newest first. Never includes drafts. */
export async function listPublishedPosts(): Promise<PublicPostSummary[]> {
  const database = requireDb();
  const rows = await database
    .select()
    .from(posts)
    .where(published)
    .orderBy(desc(posts.createdAt));

  return rows.map(toPublicSummary);
}

/** Published post by slug, or null. Drafts return null (public notFound). */
export async function getPublishedPostBySlug(
  slug: string
): Promise<PublicPost | null> {
  const database = requireDb();
  const rows = await database
    .select()
    .from(posts)
    .where(and(published, eq(posts.slug, slug)))
    .limit(1);

  const post = rows[0];
  return post ? toPublicPost(post) : null;
}

/** Latest published posts (home widgets / last-posts API). */
export async function getLatestPublishedPosts(
  limit = 10
): Promise<PublicPostSummary[]> {
  const database = requireDb();
  const rows = await database
    .select()
    .from(posts)
    .where(published)
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return rows.map(toPublicSummary);
}

/**
 * "Trending" without engagement metrics: recently updated published posts.
 * Distinct from last-posts only by sort key (updatedAt).
 */
export async function getTrendingPublishedPosts(
  limit = 10
): Promise<PublicPostSummary[]> {
  const database = requireDb();
  const rows = await database
    .select()
    .from(posts)
    .where(published)
    .orderBy(desc(posts.updatedAt))
    .limit(limit);

  return rows.map(toPublicSummary);
}

/** Escape `%` / `_` / `\` so user input is literal in ILIKE patterns. */
function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Case-insensitive search over title, body, and category. Published only. */
export async function searchPublishedPosts(
  query: string
): Promise<PublicPostSummary[]> {
  const database = requireDb();
  const pattern = `%${escapeIlikePattern(query)}%`;

  const rows = await database
    .select()
    .from(posts)
    .where(
      and(
        published,
        or(
          ilike(posts.title, pattern),
          ilike(posts.body, pattern),
          ilike(posts.category, pattern)
        )
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(50);

  return rows.map(toPublicSummary);
}

/** Distinct non-null categories among published posts. */
export async function listPublishedCategories(): Promise<string[]> {
  const database = requireDb();
  const rows = await database
    .selectDistinct({ category: posts.category })
    .from(posts)
    .where(and(published, sql`${posts.category} is not null`))
    .orderBy(posts.category);

  return rows
    .map((row) => row.category)
    .filter((value): value is string => Boolean(value));
}

/** Published posts for a category slug (exact match on stored category string). */
export async function listPublishedPostsByCategory(
  category: string
): Promise<PublicPostSummary[]> {
  const database = requireDb();
  const rows = await database
    .select()
    .from(posts)
    .where(and(published, eq(posts.category, category)))
    .orderBy(desc(posts.createdAt));

  return rows.map(toPublicSummary);
}
