import { headers } from "next/headers";

import { auth, isAllowlistedAdminEmail } from "@lib/auth";
import { logError } from "@lib/logger";

export type AdminSessionResult =
  | { status: "unauthenticated" }
  | { status: "denied"; email: string | null; name: string | null }
  | {
      status: "admin";
      email: string;
      name: string | null;
      userId: string;
    };

/**
 * Protect-time allowlist check (KTD2).
 * Empty ADMIN_EMAIL_ALLOWLIST ⇒ always denied when signed in.
 */
export async function getAdminSession(): Promise<AdminSessionResult> {
  if (!auth) {
    return { status: "unauthenticated" };
  }

  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    logError("admin-session", error);
    return { status: "unauthenticated" };
  }

  if (!session?.user) {
    return { status: "unauthenticated" };
  }

  const email = session.user.email ?? null;
  const name = session.user.name ?? null;

  if (!isAllowlistedAdminEmail(email)) {
    return { status: "denied", email, name };
  }

  return {
    status: "admin",
    email: email!,
    name,
    userId: session.user.id,
  };
}

/** Throws if caller is not an allowlisted admin. Use in server actions. */
export async function requireAdminSession() {
  const result = await getAdminSession();
  if (result.status !== "admin") {
    throw new Error(
      result.status === "unauthenticated"
        ? "Authentication required"
        : "Admin access denied"
    );
  }
  return result;
}
