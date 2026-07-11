import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  deletePostAction,
  publishPostAction,
  unpublishPostAction,
} from "@app/admin/actions";
import { AdminPostForm } from "@components/Admin/AdminPostForm";
import { Container } from "@components/common/Layout/Container";
import { Heading } from "@components/common/Layout/Heading";
import { getAdminSession } from "@lib/auth/session";
import { getPostById } from "@lib/blog/admin";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPostPage({ params }: PageProps) {
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
    logError("admin-edit-post", error, { id });
    throw error;
  }

  if (!post) {
    notFound();
  }

  return (
    <Container className="pb-20 pt-12">
      <p className="mb-4">
        <Link
          href="/admin"
          className="text-base font-light text-black/60 underline hover:text-black"
        >
          ← Posts
        </Link>
      </p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading>Edit post</Heading>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/admin/posts/${post.id}/preview`}
            className="text-base font-light underline hover:text-black/70"
          >
            Preview
          </Link>
          {post.status === "published" ? (
            <Link
              href={`/blog/posts/${post.slug}`}
              className="text-base font-light underline hover:text-black/70"
            >
              View public
            </Link>
          ) : null}
          {post.status === "draft" ? (
            <form action={publishPostAction}>
              <input type="hidden" name="id" value={post.id} />
              <button
                type="submit"
                className="text-base font-light underline hover:text-black/70"
              >
                Publish
              </button>
            </form>
          ) : (
            <form action={unpublishPostAction}>
              <input type="hidden" name="id" value={post.id} />
              <button
                type="submit"
                className="text-base font-light underline hover:text-black/70"
              >
                Unpublish
              </button>
            </form>
          )}
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="text-base font-light text-red-700 underline hover:text-red-900"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
      <div className="mt-8">
        <AdminPostForm
          mode="edit"
          post={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            body: post.body,
            category: post.category,
            status: post.status,
          }}
        />
      </div>
    </Container>
  );
}
