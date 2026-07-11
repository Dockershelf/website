import { notFound } from "next/navigation";

import { BlogPublicSearch } from "@components/Blog/BlogPublicSearch";
import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";
import { listPublishedPosts } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";
import { siteConfig } from "@lib/site-config";
import { generateBlogJsonLd } from "@lib/structuredData";

export default async function BlogPage() {
  if (!FEATURE_BLOG) {
    notFound();
  }

  let posts: Awaited<ReturnType<typeof listPublishedPosts>>;

  try {
    posts = await listPublishedPosts();
  } catch (error) {
    logError("blog-page", error);
    throw error;
  }

  const blogJsonLd = generateBlogJsonLd(posts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd),
        }}
      />
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Container>
          <article className="flex w-full flex-col pb-20 pt-15">
            <Heading>Blog</Heading>
            <SubHeading>Updates and notes from {siteConfig.name}.</SubHeading>
            <div className="mt-10">
              <BlogPublicSearch posts={posts} />
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
