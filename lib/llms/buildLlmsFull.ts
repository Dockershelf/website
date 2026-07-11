import { listPublishedPosts } from "@lib/blog";
import { FEATURE_BLOG, FEATURE_CONTACT } from "@lib/features";
import { readSection } from "@lib/markdown/readSection";
import { canonicalHostnameUrl } from "@lib/site-config";

function formatSection(title: string, url: string, body: string): string {
  return `# ${title}\n\nCanonical URL: ${url}\n\n${body}`;
}

/**
 * Single-request markdown corpus of enabled public surfaces.
 * Published blog posts only when FEATURE_BLOG is on; drafts never included.
 */
export async function buildLlmsFull(): Promise<string> {
  const sections = [
    formatSection("Home", `${canonicalHostnameUrl}/`, readSection("home.md")),
    formatSection(
      "Overview",
      `${canonicalHostnameUrl}/overview`,
      readSection("overview.md")
    ),
    formatSection(
      "Install",
      `${canonicalHostnameUrl}/install`,
      readSection("install.md")
    ),
    formatSection(
      "Community",
      `${canonicalHostnameUrl}/community`,
      readSection("community.md")
    ),
  ];

  if (FEATURE_CONTACT) {
    sections.push(
      formatSection(
        "Contact",
        `${canonicalHostnameUrl}/contact`,
        readSection("contact.md")
      )
    );
  }

  if (FEATURE_BLOG) {
    const posts = await listPublishedPosts();
    const blogBody =
      posts.length === 0
        ? "_No posts available._"
        : posts
            .map(
              (post) =>
                `- [${post.title}](${canonicalHostnameUrl}/blog/posts/${post.slug})${post.excerpt ? ` — ${post.excerpt}` : ""}`
            )
            .join("\n");

    sections.push(
      formatSection("Blog Index", `${canonicalHostnameUrl}/blog`, blogBody)
    );
  }

  const generatedAt = new Date().toISOString();

  return `${sections.join("\n\n---\n\n")}\n\n---\n\n## Generated\n\nSnapshot generated at: ${generatedAt}\n`;
}
