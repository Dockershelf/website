import { Feed } from "feed";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { listPublishedPosts } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";
import { canonicalHostnameUrl, siteConfig } from "@lib/site-config";

export async function GET() {
  if (!FEATURE_BLOG) {
    notFound();
  }

  try {
    const allPosts = await listPublishedPosts();

    const feed = new Feed({
      title: `Blog | ${siteConfig.name}`,
      description: siteConfig.description,
      language: "en",
      id: canonicalHostnameUrl,
      link: canonicalHostnameUrl,
      image: `${canonicalHostnameUrl}/favicon/android-chrome-512x512.png`,
      favicon: `${canonicalHostnameUrl}/favicon/favicon.png`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.author.name}`,
      updated: new Date(),
      generator: siteConfig.generator,
      feedLinks: {
        rss2: `${canonicalHostnameUrl}/blog/posts/feed.xml`,
        atom: `${canonicalHostnameUrl}/blog/posts/atom.xml`,
        json: `${canonicalHostnameUrl}/blog/posts/feed.json`,
      },
      author: {
        name: siteConfig.author.name,
        email: siteConfig.author.email,
        link: canonicalHostnameUrl,
      },
    });

    for (const post of allPosts) {
      feed.addItem({
        title: post.title,
        id: `${canonicalHostnameUrl}/blog/posts/${post.slug}`,
        link: `${canonicalHostnameUrl}/blog/posts/${post.slug}`,
        description: post.excerpt,
        date: new Date(post.createdAt),
      });
    }

    return new NextResponse(feed.atom1(), {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    logError("atom-feed", error);
    return new NextResponse("Error generating Atom feed", { status: 500 });
  }
}
