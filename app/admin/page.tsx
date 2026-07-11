import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deletePostAction,
  publishPostAction,
  unpublishPostAction,
} from "@app/admin/actions";
import { AdminSignInButton } from "@components/Admin/AdminAuthButtons";
import FriendlyDate from "@components/Blog/FriendlyDate";
import { Container } from "@components/common/Layout/Container";
import { Heading } from "@components/common/Layout/Heading";
import { SubHeading } from "@components/common/Layout/SubHeading";
import { getAdminSession } from "@lib/auth/session";
import { listAllPosts } from "@lib/blog/admin";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";

export default async function AdminPage() {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const session = await getAdminSession();

  if (session.status === "unauthenticated") {
    return (
      <Container className="pb-20 pt-12">
        <Heading>Blog admin</Heading>
        <SubHeading>
          Sign in with GitHub to manage posts. Access is limited to allowlisted
          emails.
        </SubHeading>
        <div className="mt-8">
          <AdminSignInButton />
        </div>
      </Container>
    );
  }

  if (session.status === "denied") {
    return (
      <Container className="pb-20 pt-12">
        <Heading>Access denied</Heading>
        <SubHeading>
          You are signed in
          {session.email ? ` as ${session.email}` : ""}, but this account is not
          on the admin allowlist. You cannot create, edit, publish, or delete
          posts.
        </SubHeading>
        <p className="mt-6 text-base font-light text-black/60">
          Ask an operator to add your email to{" "}
          <code className="font-mono text-sm">ADMIN_EMAIL_ALLOWLIST</code>, then
          refresh this page.
        </p>
      </Container>
    );
  }

  let posts: Awaited<ReturnType<typeof listAllPosts>>;
  try {
    posts = await listAllPosts();
  } catch (error) {
    logError("admin-list-posts", error);
    throw error;
  }

  return (
    <Container className="pb-20 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading>Posts</Heading>
          <SubHeading>Create, edit, publish, and unpublish.</SubHeading>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center border border-black/20 bg-black px-5 py-2.5 text-base font-light text-white transition-colors hover:bg-black/80"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 text-xl font-light text-black/70" role="status">
          No posts yet.
        </p>
      ) : (
        <ul className="mt-10 flex list-none flex-col gap-6 p-0 m-0">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border-b border-black/10 pb-6 last:border-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-light uppercase tracking-wide text-black/55">
                    {post.status}
                    {post.category ? ` · ${post.category}` : ""}
                  </p>
                  <h2 className="mt-1 text-2xl font-light">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-black hover:text-black/70"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-1 font-mono text-sm font-light text-black/55">
                    /{post.slug}
                  </p>
                  <p className="mt-1 text-sm font-light text-black/55">
                    Updated{" "}
                    <time
                      dateTime={
                        post.updatedAt instanceof Date
                          ? post.updatedAt.toISOString()
                          : String(post.updatedAt)
                      }
                    >
                      <FriendlyDate
                        dateString={
                          post.updatedAt instanceof Date
                            ? post.updatedAt.toISOString()
                            : String(post.updatedAt)
                        }
                      />
                    </time>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-base font-light underline hover:text-black/70"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}/preview`}
                    className="text-base font-light underline hover:text-black/70"
                  >
                    Preview
                  </Link>
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
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
