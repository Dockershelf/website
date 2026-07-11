import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import FriendlyDate from "@components/Blog/FriendlyDate";
import { Container } from "@components/common/Layout/Container";
import { getAdminSession } from "@lib/auth/session";
import { getPostById } from "@lib/blog/admin";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";
import markdownToHtml from "@lib/markdownToHtml";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Draft/published preview under /admin only (KTD6).
 * Never auth-gates the public slug route.
 */
export default async function AdminPostPreviewPage({ params }: PageProps) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const session = await getAdminSession();
  if (session.status === "unauthenticated" || session.status === "denied") {
    redirect("/admin");
  }

  const { id } = await params;

  let post: Awaited<ReturnType<typeof getPostById>>;
  try {
    post = await getPostById(id);
  } catch (error) {
    logError("admin-preview-post", error, { id });
    throw error;
  }

  if (!post) {
    notFound();
  }

  const html = await markdownToHtml(post.body);
  const updatedAt =
    post.updatedAt instanceof Date
      ? post.updatedAt.toISOString()
      : String(post.updatedAt);

  return (
    <Container className="pb-20 pt-12">
      <p className="mb-4 flex flex-wrap gap-4">
        <Link
          href={`/admin/posts/${post.id}`}
          className="text-base font-light text-black/60 underline hover:text-black"
        >
          ← Edit
        </Link>
        <span className="text-base font-light text-black/55">
          Admin preview · {post.status}
        </span>
      </p>
      <article className="flex w-full flex-col">
        {post.category ? (
          <p className="mb-3 text-sm uppercase tracking-wide text-black/55">
            {post.category}
          </p>
        ) : null}
        <h1 className="text-3xl font-light leading-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-3 text-base font-light text-black/55">
          Updated{" "}
          <time dateTime={updatedAt}>
            <FriendlyDate dateString={updatedAt} />
          </time>
        </p>
        <div
          className="prose prose-lg mt-10 max-w-none font-light text-black/85"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </Container>
  );
}
