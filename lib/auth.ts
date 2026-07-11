/**
 * DCE-safe Better Auth entry (KTD4).
 * Use a direct FEATURE_BLOG === "1" check — do not import @lib/features
 * (that ORs NEXT_PUBLIC_* and breaks DCE purity).
 *
 * Real instance: lib/auth/server.ts. Stub: lib/auth/noop.ts.
 */
import type { auth as AuthInstance } from "./auth/server";

type AuthModule = {
  auth: typeof AuthInstance | null;
};

function loadAuthModule(): AuthModule {
  if (process.env.FEATURE_BLOG === "1") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./auth/server") as AuthModule;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./auth/noop") as AuthModule;
}

const authModule = loadAuthModule();

export const auth = authModule.auth;

export {
  isAllowlistedAdminEmail,
  parseAdminEmailAllowlist,
} from "./auth/allowlist";
