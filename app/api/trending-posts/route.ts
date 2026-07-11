import { NextResponse } from "next/server";

import { getTrendingPublishedPosts } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";

export async function GET() {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const posts = await getTrendingPublishedPosts();
    return NextResponse.json({ response: posts });
  } catch (error) {
    logError("trending-posts-api", error);
    return NextResponse.json(
      { error: "Blog posts temporarily unavailable" },
      { status: 503 }
    );
  }
}
