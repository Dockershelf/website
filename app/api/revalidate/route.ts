import { NextRequest, NextResponse } from "next/server";

import { revalidateBlogCache } from "@lib/blog/revalidate-cache";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";

const MAX_REVALIDATE_ITEMS = 50;

interface RevalidateRequestBody {
  secret?: string;
  posts?: Array<{
    slug: string;
  }>;
  categories?: Array<{
    slug: string;
  }>;
}

function extractSecret(
  request: NextRequest,
  body: RevalidateRequestBody
): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  if (typeof body.secret === "string" && body.secret.length > 0) {
    return body.secret;
  }
  // Query-param secrets are rejected (appear in logs/referrers).
  return null;
}

export async function POST(request: NextRequest) {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body: RevalidateRequestBody = await request.json();
    const secret = extractSecret(request, body);

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const result = await revalidateBlogCache({
      posts: body.posts?.slice(0, MAX_REVALIDATE_ITEMS),
      categories: body.categories?.slice(0, MAX_REVALIDATE_ITEMS),
    });

    const purgeFullyOk = result.purgeOk;
    const status = purgeFullyOk ? 200 : 502;

    console.log(`[revalidate-api] Revalidation completed`, {
      revalidatedPaths: result.revalidatedPaths,
      purgeOk: result.purgeOk,
      purgeError: result.purgeError,
      cfPurgeOk: result.cfPurgeOk,
      cfPurgeError: result.cfPurgeError,
      status,
    });

    return NextResponse.json(
      {
        message: purgeFullyOk
          ? "Revalidation completed successfully"
          : "Revalidation completed but CDN purge failed",
        revalidatedPaths: result.revalidatedPaths,
        purgedTags: result.purgedTags,
        purgeOk: result.purgeOk,
        purgeError: result.purgeError,
        cfPurgeOk: result.cfPurgeOk,
        cfPurgeError: result.cfPurgeError,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  } catch (error) {
    logError("revalidate-api", error, {
      hasSecret: !!process.env.REVALIDATE_SECRET,
    });
    return NextResponse.json(
      {
        message: "Error during revalidation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
