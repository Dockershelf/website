import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminPostForm } from "@components/Admin/AdminPostForm";
import { Container } from "@components/common/Layout/Container";
import { Heading } from "@components/common/Layout/Heading";
import { getAdminSession } from "@lib/auth/session";
import { FEATURE_BLOG } from "@lib/features";

export default async function AdminNewPostPage() {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const session = await getAdminSession();
  if (session.status === "unauthenticated") {
    redirect("/admin");
  }
  if (session.status === "denied") {
    redirect("/admin");
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
      <Heading>New post</Heading>
      <div className="mt-8">
        <AdminPostForm mode="create" />
      </div>
    </Container>
  );
}
