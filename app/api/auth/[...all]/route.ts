import { notFound } from "next/navigation";

import { auth } from "@lib/auth";
import { FEATURE_BLOG } from "@lib/features";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth catch-all. Soft-gated when blog is off (KTD4 / AE7).
 */
function createHandlers() {
  if (!FEATURE_BLOG || !auth) {
    const disabled = async () => {
      notFound();
    };
    return { GET: disabled, POST: disabled };
  }
  return toNextJsHandler(auth);
}

export const { GET, POST } = createHandlers();
