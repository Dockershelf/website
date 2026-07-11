import { assertSafePathSegments } from "@lib/markdown/pathSafety";
import { buildBlogCategoryTwin } from "@lib/markdown/twins/blogCategory";
import { buildBlogPostTwin } from "@lib/markdown/twins/blogPost";
import {
  buildBlogCategoryIndexTwin,
  buildBlogIndexTwin,
  buildCommunityTwin,
  buildContactTwin,
  buildHomeTwin,
  buildInstallTwin,
  buildOverviewTwin,
} from "@lib/markdown/twins/marketing";
import { FEATURE_BLOG, FEATURE_CONTACT } from "@lib/features";

export async function resolveTwinMarkdown(
  pathSegments: string[]
): Promise<string | null> {
  if (pathSegments.length === 0) {
    return buildHomeTwin();
  }

  if (!assertSafePathSegments(pathSegments)) {
    return null;
  }

  const [first, second, third] = pathSegments;

  if (pathSegments.length === 1 && first === "index") {
    return buildHomeTwin();
  }

  if (pathSegments.length === 1 && first === "overview") {
    return buildOverviewTwin();
  }

  if (pathSegments.length === 1 && first === "install") {
    return buildInstallTwin();
  }

  if (pathSegments.length === 1 && first === "community") {
    return buildCommunityTwin();
  }

  if (pathSegments.length === 1 && first === "contact") {
    if (!FEATURE_CONTACT) {
      return null;
    }
    return buildContactTwin();
  }

  if (pathSegments.length === 1 && first === "blog") {
    if (!FEATURE_BLOG) {
      return null;
    }
    return buildBlogIndexTwin();
  }

  if (pathSegments.length === 2 && first === "blog" && second === "category") {
    if (!FEATURE_BLOG) {
      return null;
    }
    return buildBlogCategoryIndexTwin();
  }

  if (
    pathSegments.length === 3 &&
    first === "blog" &&
    second === "category" &&
    third
  ) {
    if (!FEATURE_BLOG) {
      return null;
    }
    return buildBlogCategoryTwin(third);
  }

  if (
    pathSegments.length === 3 &&
    first === "blog" &&
    second === "posts" &&
    third
  ) {
    if (!FEATURE_BLOG) {
      return null;
    }
    return buildBlogPostTwin(third);
  }

  return null;
}
