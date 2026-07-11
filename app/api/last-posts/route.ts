import { NextResponse } from "next/server";

import { getLatestPublishedPosts } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";

export async function GET() {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const posts = await getLatestPublishedPosts();
    // Bare-array contract for legacy clients; search/trending use { response }.
    return NextResponse.json(posts, {
      headers: {
        Deprecation: "true",
        Warning:
          '299 - "GET /api/last-posts bare array is deprecated; prefer {\\"response\\":[]} like /api/search-posts"',
      },
    });
  } catch (error) {
    logError("last-posts-api", error);
    return NextResponse.json(
      { error: "Blog posts temporarily unavailable" },
      { status: 503 }
    );
  }
}
