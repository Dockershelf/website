import { NextResponse } from "next/server";

import { logError } from "@lib/logger";
import { readSection } from "@lib/markdown/readSection";

export async function GET() {
  try {
    const body = readSection("agents.md");

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control":
          "public, max-age=3600, stale-while-revalidate=86400",
        "Netlify-CDN-Cache-Control":
          "public, max-age=3600, stale-while-revalidate=86400",
        "Cache-Tag": "discovery, content",
        "Netlify-Cache-Tag": "discovery, content",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    logError("agents-md", error);
    return new NextResponse("Error generating agents.md", { status: 500 });
  }
}
