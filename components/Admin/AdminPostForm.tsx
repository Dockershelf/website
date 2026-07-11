"use client";

import { useActionState } from "react";

import {
  createPostAction,
  updatePostAction,
  type AdminActionState,
} from "@app/admin/actions";

type AdminPostFormProps = {
  mode: "create" | "edit";
  post?: {
    id: string;
    title: string;
    slug: string;
    body: string;
    category: string | null;
    status: "draft" | "published";
  };
};

const initialState: AdminActionState = { ok: false };

export function AdminPostForm({ mode, post }: AdminPostFormProps) {
  const action = mode === "create" ? createPostAction : updatePostAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      {mode === "edit" && post ? (
        <input type="hidden" name="id" value={post.id} />
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-light uppercase tracking-wide text-black/55">
          Title
        </span>
        <input
          name="title"
          required
          defaultValue={post?.title ?? ""}
          className="border border-black/15 bg-white px-3 py-2 text-lg font-light text-black outline-none focus:border-black/40"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-light uppercase tracking-wide text-black/55">
          Slug
        </span>
        <input
          name="slug"
          required
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and hyphens only"
          defaultValue={post?.slug ?? ""}
          className="border border-black/15 bg-white px-3 py-2 font-mono text-base font-light text-black outline-none focus:border-black/40"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-light uppercase tracking-wide text-black/55">
          Category (optional)
        </span>
        <input
          name="category"
          defaultValue={post?.category ?? ""}
          className="border border-black/15 bg-white px-3 py-2 text-base font-light text-black outline-none focus:border-black/40"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-light uppercase tracking-wide text-black/55">
          Status
        </span>
        <select
          name="status"
          defaultValue={post?.status ?? "draft"}
          className="border border-black/15 bg-white px-3 py-2 text-base font-light text-black outline-none focus:border-black/40"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-light uppercase tracking-wide text-black/55">
          Body (Markdown)
        </span>
        <textarea
          name="body"
          required
          rows={18}
          defaultValue={post?.body ?? ""}
          className="border border-black/15 bg-white px-3 py-2 font-mono text-base font-light text-black outline-none focus:border-black/40"
        />
      </label>

      {state.error ? (
        <p className="text-base font-light text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p className="text-base font-light text-green-800" role="status">
          Saved.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-fit items-center justify-center border border-black/20 bg-black px-5 py-2.5 text-base font-light text-white transition-colors hover:bg-black/80 disabled:opacity-50"
      >
        {pending
          ? "Saving…"
          : mode === "create"
            ? "Create post"
            : "Save changes"}
      </button>
    </form>
  );
}
