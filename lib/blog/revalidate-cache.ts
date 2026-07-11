import { revalidatePath } from "next/cache";

import { purgeByTags as purgeCloudflareByTags } from "@lib/cloudflare/purgeByTags";
import { logError } from "@lib/logger";
import { BLOG_PURGE_TAGS, purgeByTags } from "@lib/netlify/purgeByTags";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export type RevalidateBlogCacheInput = {
  posts?: Array<{ slug: string }>;
  categories?: Array<{ slug: string }>;
};

export type RevalidateBlogCacheResult = {
  revalidatedPaths: string[];
  purgedTags: string[];
  purgeOk: boolean;
  purgeError?: string;
  cfPurgeOk: boolean;
  cfPurgeError?: string;
};

function isValidPostSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/** Category URLs use encodeURIComponent of the free-text category string. */
function categoryPathSegment(category: string): string {
  return encodeURIComponent(category.trim());
}

/**
 * Shared Next.js revalidate + Netlify/CF tag purge (KTD7).
 * Used by POST /api/revalidate and admin publish/unpublish/edit actions.
 */
export async function revalidateBlogCache(
  input: RevalidateBlogCacheInput = {}
): Promise<RevalidateBlogCacheResult> {
  const revalidatedPaths: string[] = [];

  revalidatePath("/blog");
  revalidatedPaths.push("/blog");

  revalidatePath("/markdown-twin/blog");
  revalidatedPaths.push("/markdown-twin/blog");

  if (input.posts && Array.isArray(input.posts)) {
    for (const post of input.posts) {
      if (post.slug && isValidPostSlug(post.slug)) {
        const postPath = `/blog/posts/${post.slug}`;
        revalidatePath(postPath);
        revalidatedPaths.push(postPath);

        const twinPath = `/markdown-twin/blog/posts/${post.slug}`;
        revalidatePath(twinPath);
        revalidatedPaths.push(twinPath);
      }
    }
  }

  if (input.categories && Array.isArray(input.categories)) {
    for (const category of input.categories) {
      if (category.slug && category.slug.trim()) {
        const segment = categoryPathSegment(category.slug);
        const categoryPath = `/blog/category/${segment}`;
        revalidatePath(categoryPath);
        revalidatedPaths.push(categoryPath);

        const twinPath = `/markdown-twin/blog/category/${segment}`;
        revalidatePath(twinPath);
        revalidatedPaths.push(twinPath);
      }
    }
  }

  revalidatePath("/blog/category");
  revalidatedPaths.push("/blog/category");

  revalidatePath("/markdown-twin/blog/category");
  revalidatedPaths.push("/markdown-twin/blog/category");

  revalidatePath("/blog/posts/feed.xml");
  revalidatePath("/blog/posts/atom.xml");
  revalidatePath("/blog/posts/feed.json");
  revalidatePath("/sitemap.xml");
  revalidatedPaths.push(
    "/blog/posts/feed.xml",
    "/blog/posts/atom.xml",
    "/blog/posts/feed.json",
    "/sitemap.xml"
  );

  revalidatePath("/llms-full.txt");
  revalidatedPaths.push("/llms-full.txt");

  const purgedTags = [...BLOG_PURGE_TAGS];
  const [netlifyPurge, cfPurge] = await Promise.all([
    purgeByTags(purgedTags),
    purgeCloudflareByTags(purgedTags),
  ]);

  if (!netlifyPurge.ok) {
    logError(
      "revalidate-blog-cache-purge-netlify",
      new Error(`Netlify purge failed: ${netlifyPurge.reason ?? "unknown"}`),
      {
        purgedTags,
        status: netlifyPurge.status,
      }
    );
  }

  if (!cfPurge.ok && cfPurge.reason !== "missing_env") {
    logError(
      "revalidate-blog-cache-purge-cloudflare",
      new Error(`Cloudflare purge failed: ${cfPurge.reason ?? "unknown"}`),
      {
        purgedTags,
        status: cfPurge.status,
      }
    );
  }

  return {
    revalidatedPaths,
    purgedTags,
    purgeOk: netlifyPurge.ok,
    purgeError: netlifyPurge.ok ? undefined : netlifyPurge.reason,
    cfPurgeOk: cfPurge.ok,
    cfPurgeError: cfPurge.ok ? undefined : cfPurge.reason,
  };
}

/**
 * Convenience for admin mutations that touch one post (+ optional category).
 * Fail-closed when Netlify CDN purge is not configured or fails — otherwise
 * publish/unpublish can succeed while stale HTML remains on the CDN.
 */
export async function revalidateAfterPostChange(post: {
  slug: string;
  category?: string | null;
}): Promise<RevalidateBlogCacheResult> {
  const categories: Array<{ slug: string }> = [];
  if (post.category?.trim()) {
    categories.push({ slug: post.category });
  }

  const result = await revalidateBlogCache({
    posts: [{ slug: post.slug }],
    categories,
  });

  if (!result.purgeOk) {
    throw new Error(
      result.purgeError === "missing_env"
        ? "CDN purge is not configured (NETLIFY_PURGE_TOKEN / NETLIFY_SITE_ID). Refusing to complete publish/unpublish with stale CDN risk."
        : `CDN purge failed (${result.purgeError ?? "unknown"}). Refusing to complete with stale CDN risk.`
    );
  }

  return result;
}
