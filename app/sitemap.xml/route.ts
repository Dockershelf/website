import { NextResponse } from "next/server";

import { listPublishedPosts } from "@lib/blog";
import { FEATURE_BLOG, FEATURE_CONTACT } from "@lib/features";
import { logError } from "@lib/logger";
import { canonicalHostnameUrl } from "@lib/site-config";

export async function GET() {
  try {
    const staticUrls = [
      { path: "", priority: "1.0" },
      { path: "/overview", priority: "0.8" },
      { path: "/install", priority: "0.8" },
      { path: "/community", priority: "0.7" },
    ];

    if (FEATURE_CONTACT) {
      staticUrls.push({ path: "/contact", priority: "0.6" });
    }

    const urls = staticUrls.map(
      ({ path, priority }) => `<url>
  <loc>${canonicalHostnameUrl}${path}</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>${priority}</priority>
</url>`
    );

    if (FEATURE_BLOG) {
      urls.push(`<url>
  <loc>${canonicalHostnameUrl}/blog</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>`);

      try {
        const posts = await listPublishedPosts();
        for (const post of posts) {
          urls.push(`<url>
  <loc>${canonicalHostnameUrl}/blog/posts/${post.slug}</loc>
  <lastmod>${post.updatedAt}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>`);
        }
      } catch (error) {
        logError("sitemap-blog-posts", error);
      }
    }

    const sitemapTemplate = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${urls.join("")}
  </urlset>`;

    return new NextResponse(sitemapTemplate, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        "Netlify-CDN-Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        "Cache-Tag": "discovery, content",
        "Netlify-Cache-Tag": "discovery, content",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    logError("sitemap", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
