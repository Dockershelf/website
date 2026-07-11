import { desc, eq } from "drizzle-orm";

import { db, posts, type NewPost, type Post } from "@lib/db";

function requireDb() {
  if (!db) {
    throw new Error(
      'Blog database is unavailable. FEATURE_BLOG must be "1" and DATABASE_URL set.'
    );
  }
  return db;
}

export type AdminPostInput = {
  title: string;
  slug: string;
  body: string;
  category?: string | null;
  status?: "draft" | "published";
};

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** All posts including drafts (admin only). */
export async function listAllPosts(): Promise<Post[]> {
  const database = requireDb();
  return database.select().from(posts).orderBy(desc(posts.updatedAt));
}

export async function getPostById(id: string): Promise<Post | null> {
  const database = requireDb();
  const rows = await database
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createPost(input: AdminPostInput): Promise<Post> {
  const database = requireDb();
  const slug = normalizeSlug(input.slug);
  if (!slug) {
    throw new Error("Slug is required");
  }
  if (!input.title.trim()) {
    throw new Error("Title is required");
  }

  const values: NewPost = {
    title: input.title.trim(),
    slug,
    body: input.body,
    category: input.category?.trim() || null,
    status: input.status ?? "draft",
  };

  const rows = await database.insert(posts).values(values).returning();
  const post = rows[0];
  if (!post) {
    throw new Error("Failed to create post");
  }
  return post;
}

export async function updatePost(
  id: string,
  input: AdminPostInput
): Promise<Post> {
  const database = requireDb();
  const slug = normalizeSlug(input.slug);
  if (!slug) {
    throw new Error("Slug is required");
  }
  if (!input.title.trim()) {
    throw new Error("Title is required");
  }

  const rows = await database
    .update(posts)
    .set({
      title: input.title.trim(),
      slug,
      body: input.body,
      category: input.category?.trim() || null,
      status: input.status ?? "draft",
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  const post = rows[0];
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
}

export async function setPostStatus(
  id: string,
  status: "draft" | "published"
): Promise<Post> {
  const database = requireDb();
  const rows = await database
    .update(posts)
    .set({ status, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();

  const post = rows[0];
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
}

export async function deletePost(id: string): Promise<Post | null> {
  const database = requireDb();
  const rows = await database.delete(posts).where(eq(posts.id, id)).returning();
  return rows[0] ?? null;
}
