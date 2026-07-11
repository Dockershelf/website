import { listPublishedCategories, listPublishedPosts } from "@lib/blog";
import { formatTwin } from "@lib/markdown/formatTwin";
import { readSection } from "@lib/markdown/readSection";
import { canonicalHostnameUrl } from "@lib/site-config";

export async function buildHomeTwin(): Promise<string> {
  return formatTwin("Home", `${canonicalHostnameUrl}/`, readSection("home.md"));
}

export async function buildOverviewTwin(): Promise<string> {
  return formatTwin(
    "Overview",
    `${canonicalHostnameUrl}/overview`,
    readSection("overview.md")
  );
}

export async function buildInstallTwin(): Promise<string> {
  return formatTwin(
    "Install",
    `${canonicalHostnameUrl}/install`,
    readSection("install.md")
  );
}

export async function buildCommunityTwin(): Promise<string> {
  return formatTwin(
    "Community",
    `${canonicalHostnameUrl}/community`,
    readSection("community.md")
  );
}

export async function buildContactTwin(): Promise<string> {
  return formatTwin(
    "Contact",
    `${canonicalHostnameUrl}/contact`,
    readSection("contact.md")
  );
}

/** Published posts only — drafts never appear in twins. */
export async function buildBlogIndexTwin(): Promise<string> {
  const posts = await listPublishedPosts();
  const body =
    posts.length === 0
      ? "_No posts available._"
      : posts
          .map(
            (post) =>
              `- [${post.title}](${canonicalHostnameUrl}/blog/posts/${post.slug})`
          )
          .join("\n");

  return formatTwin("Blog Index", `${canonicalHostnameUrl}/blog`, body);
}

/** Published categories only. */
export async function buildBlogCategoryIndexTwin(): Promise<string> {
  const categories = await listPublishedCategories();
  const body =
    categories.length === 0
      ? "_No categories available._"
      : categories
          .map(
            (category) =>
              `- [${category}](${canonicalHostnameUrl}/blog/category/${encodeURIComponent(category)})`
          )
          .join("\n");

  return formatTwin(
    "Blog Categories",
    `${canonicalHostnameUrl}/blog/category`,
    body
  );
}
