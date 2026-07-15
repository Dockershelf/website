import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostList } from "@components/Blog/BlogPostList";
import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";
import ButtonBar from "@components/Home/ButtonBar";
import { listPublishedPostsByCategory } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";
import { siteConfig } from "@lib/site-config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  return {
    title: `${category} | Blog | ${siteConfig.name}`,
    description: `Published posts in ${category}.`,
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const { slug } = await params;
  const category = decodeURIComponent(slug);

  let posts: Awaited<ReturnType<typeof listPublishedPostsByCategory>>;
  try {
    posts = await listPublishedPostsByCategory(category);
  } catch (error) {
    logError("blog-category-page", error, { category });
    throw error;
  }

  if (posts.length === 0) {
    notFound();
  }

  return (
    <>
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Container>
          <article className="flex w-full flex-col items-center pt-15">
            <Link href="/">
              <Image
                alt=""
                className="mx-auto"
                src="/images/logomin.svg"
                height={200}
                width={200}
                sizes="(max-width: 768px) 150px, 200px"
              />
            </Link>
            <p className="mb-4 w-full">
              <Link
                href="/blog/category"
                className="text-base font-light text-black/60 underline hover:text-black"
              >
                ← Categories
              </Link>
            </p>
            <Heading>{category}</Heading>
            <SubHeading>Published posts in this category.</SubHeading>
            <div className="mt-10">
              <BlogPostList posts={posts} />
            </div>
            <ButtonBar />
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
