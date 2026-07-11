import { NextResponse } from "next/server";

import { buildLlmsFull } from "@lib/llms/buildLlmsFull";
import { logError } from "@lib/logger";

export async function GET() {
  try {
    const body = await buildLlmsFull();

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        "Netlify-CDN-Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        "Cache-Tag": "llms-full, content",
        "Netlify-Cache-Tag": "llms-full, content",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    logError("llms-full-txt", error);
    return new NextResponse("Error generating llms-full.txt", { status: 500 });
  }
}
