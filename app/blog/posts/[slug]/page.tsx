import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DisqusComments } from "@components/Blog/DisqusComments";
import FriendlyDate from "@components/Blog/FriendlyDate";
import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { getPublishedPostBySlug } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";
import markdownToHtml from "@lib/markdownToHtml";
import { canonicalHostnameUrl, siteConfig } from "@lib/site-config";
import { generateBlogPostingJsonLd } from "@lib/structuredData";

const DISQUS_SHORTNAME = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (!FEATURE_BLOG) {
    return { title: siteConfig.name };
  }

  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);
  if (!post) {
    return { title: `Post | ${siteConfig.name}` };
  }

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt || siteConfig.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPublishedPostBySlug>>;
  try {
    post = await getPublishedPostBySlug(slug);
  } catch (error) {
    logError("blog-post-page", error, { slug });
    throw error;
  }

  if (!post) {
    notFound();
  }

  const html = await markdownToHtml(post.body);
  const jsonLd = generateBlogPostingJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Container>
          <article className="flex w-full flex-col pb-20 pt-15">
            <p className="mb-4">
              <Link
                href="/blog"
                className="text-base font-light text-black/60 underline hover:text-black"
              >
                ← Blog
              </Link>
            </p>
            {post.category ? (
              <Link
                href={`/blog/category/${encodeURIComponent(post.category)}`}
                className="mb-3 inline-block text-sm uppercase tracking-wide text-black/55 hover:text-black"
                rel="tag"
              >
                {post.category}
              </Link>
            ) : null}
            <h1 className="text-3xl font-light leading-tight md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-3 text-base font-light text-black/55">
              Published{" "}
              <time dateTime={post.createdAt}>
                <FriendlyDate dateString={post.createdAt} />
              </time>
            </p>
            <div
              className="prose prose-lg mt-10 max-w-none font-light text-black/85"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {DISQUS_SHORTNAME ? (
              <DisqusComments
                shortname={DISQUS_SHORTNAME}
                identifier={post.id}
                url={`${canonicalHostnameUrl}/blog/posts/${post.slug}`}
                title={post.title}
              />
            ) : null}
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
