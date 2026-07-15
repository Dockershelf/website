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
import { listPublishedCategories } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";

export default async function BlogCategoryIndexPage() {
  if (!FEATURE_BLOG) {
    notFound();
  }

  let categories: string[];
  try {
    categories = await listPublishedCategories();
  } catch (error) {
    logError("blog-category-index", error);
    throw error;
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
            <Heading>Categories</Heading>
            <SubHeading>Browse published posts by category.</SubHeading>
            <div className="mt-10">
              {categories.length === 0 ? (
                <BlogPostList posts={[]} emptyMessage="No categories yet." />
              ) : (
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {categories.map((category) => (
                    <li key={category}>
                      <Link
                        href={`/blog/category/${encodeURIComponent(category)}`}
                        className="text-xl font-light text-black underline hover:text-black/70"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <ButtonBar />
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
