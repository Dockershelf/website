import { NextResponse } from "next/server";

import { FEATURE_BLOG } from "@lib/features";
import { canonicalHostnameUrl } from "@lib/site-config";
import { logError } from "@lib/logger";

const serviceDocs = [
  { href: `${canonicalHostnameUrl}/llms.txt` },
  { href: `${canonicalHostnameUrl}/llms-full.txt` },
  { href: `${canonicalHostnameUrl}/.well-known/agent-permissions.json` },
  { href: `${canonicalHostnameUrl}/.well-known/agent-skills/index.json` },
  { href: `${canonicalHostnameUrl}/.well-known/mcp/server-card.json` },
  { href: `${canonicalHostnameUrl}/sitemap.xml` },
];

const baseItems = [{ href: `${canonicalHostnameUrl}/api/mcp` }];

const blogItems = FEATURE_BLOG
  ? [
      { href: `${canonicalHostnameUrl}/api/search-posts` },
      { href: `${canonicalHostnameUrl}/blog/posts/feed.xml` },
      { href: `${canonicalHostnameUrl}/blog/posts/atom.xml` },
      { href: `${canonicalHostnameUrl}/blog/posts/feed.json` },
    ]
  : [];

const catalogLinkset = {
  linkset: [
    {
      anchor: canonicalHostnameUrl,
      "service-doc": serviceDocs,
      item: [...baseItems, ...blogItems],
    },
  ],
};

export async function GET() {
  try {
    return new NextResponse(JSON.stringify(catalogLinkset), {
      headers: {
        "Content-Type": "application/linkset+json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        "Netlify-CDN-Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        "Cache-Tag": "api-catalog, content",
        "Netlify-Cache-Tag": "api-catalog, content",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    logError("api-catalog", error);
    return NextResponse.json(
      { error: "Error generating API catalog" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
