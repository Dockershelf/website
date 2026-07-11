import { getPublishedPostBySlug } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { formatTwin } from "@lib/markdown/formatTwin";
import { canonicalHostnameUrl } from "@lib/site-config";

/** Published-only blog post twin. Drafts and missing slugs → null. */
export async function buildBlogPostTwin(slug: string): Promise<string | null> {
  if (!FEATURE_BLOG) {
    return null;
  }

  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return null;
  }

  const categoryLine = post.category ? `\n\nCategory: ${post.category}` : "";

  return formatTwin(
    post.title,
    `${canonicalHostnameUrl}/blog/posts/${post.slug}`,
    `${post.body}${categoryLine}\n\nPublished: ${post.createdAt}`
  );
}
