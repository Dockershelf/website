"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@lib/auth/session";
import {
  createPost,
  deletePost,
  getPostById,
  setPostStatus,
  updatePost,
  type AdminPostInput,
} from "@lib/blog/admin";
import { revalidateAfterPostChange } from "@lib/blog/revalidate-cache";
import { logError } from "@lib/logger";

export type AdminActionState = {
  ok: boolean;
  error?: string;
  postId?: string;
};

function formToInput(formData: FormData): AdminPostInput {
  const statusRaw = String(formData.get("status") ?? "draft");
  const status = statusRaw === "published" ? "published" : "draft";
  const category = String(formData.get("category") ?? "").trim();

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    body: String(formData.get("body") ?? ""),
    category: category || null,
    status,
  };
}

async function bumpAdminListCache() {
  revalidatePath("/admin");
}

export async function createPostAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    const input = formToInput(formData);
    const post = await createPost(input);
    await bumpAdminListCache();
    if (post.status === "published") {
      await revalidateAfterPostChange(post);
    }
    redirect(`/admin/posts/${post.id}`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    logError("admin-create-post", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

export async function updatePostAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    const id = String(formData.get("id") ?? "");
    if (!id) {
      return { ok: false, error: "Missing post id" };
    }

    const existing = await getPostById(id);
    if (!existing) {
      return { ok: false, error: "Post not found" };
    }

    const input = formToInput(formData);
    const post = await updatePost(id, input);
    await bumpAdminListCache();

    // Always revalidate on edit when published, or when status/slug changed
    // away from a previously published slug (KTD7).
    const shouldPurge =
      post.status === "published" ||
      existing.status === "published" ||
      existing.slug !== post.slug;

    if (shouldPurge) {
      await revalidateAfterPostChange({
        slug: post.slug,
        category: post.category,
      });
      if (existing.slug !== post.slug) {
        await revalidateAfterPostChange({
          slug: existing.slug,
          category: existing.category,
        });
      } else if (
        existing.category &&
        existing.category !== post.category
      ) {
        // Same slug, category changed — purge previous category path too.
        await revalidateAfterPostChange({
          slug: post.slug,
          category: existing.category,
        });
      }
    }

    return { ok: true, postId: post.id };
  } catch (error) {
    logError("admin-update-post", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update post",
    };
  }
}

export async function publishPostAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const post = await setPostStatus(id, "published");
  await bumpAdminListCache();
  await revalidateAfterPostChange(post);
  redirect(`/admin/posts/${post.id}`);
}

export async function unpublishPostAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const post = await setPostStatus(id, "draft");
  await bumpAdminListCache();
  await revalidateAfterPostChange(post);
  redirect(`/admin/posts/${post.id}`);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const existing = await getPostById(id);
  const deleted = await deletePost(id);
  await bumpAdminListCache();
  if (
    deleted &&
    (deleted.status === "published" || existing?.status === "published")
  ) {
    await revalidateAfterPostChange(deleted);
  }
  redirect("/admin");
}
