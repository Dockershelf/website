import { listPublishedPostsByCategory } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { formatTwin } from "@lib/markdown/formatTwin";
import { canonicalHostnameUrl } from "@lib/site-config";

/** Published posts for a category. Empty/missing → null. */
export async function buildBlogCategoryTwin(
  categorySlug: string
): Promise<string | null> {
  if (!FEATURE_BLOG) {
    return null;
  }

  const category = decodeURIComponent(categorySlug);
  const posts = await listPublishedPostsByCategory(category);
  if (posts.length === 0) {
    return null;
  }

  const list = posts
    .map(
      (post) =>
        `- [${post.title}](${canonicalHostnameUrl}/blog/posts/${post.slug})`
    )
    .join("\n");

  return formatTwin(
    `Category: ${category}`,
    `${canonicalHostnameUrl}/blog/category/${encodeURIComponent(category)}`,
    list
  );
}
