import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { authDb } from "@lib/db/pool";
import * as schema from "@lib/db/schema";

/**
 * Better Auth instance (FEATURE_BLOG=1 only via lib/auth.ts DCE).
 * Fail-fast when OAuth/auth secrets are missing (KTD9).
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required when FEATURE_BLOG=1. Set Better Auth / GitHub OAuth secrets.`
    );
  }
  return value;
}

const secret = requireEnv("BETTER_AUTH_SECRET");
const baseURL = requireEnv("BETTER_AUTH_URL");
const githubClientId = requireEnv("GITHUB_CLIENT_ID");
const githubClientSecret = requireEnv("GITHUB_CLIENT_SECRET");

export const auth = betterAuth({
  secret,
  baseURL,
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      // GitHub includes user:email by default; keep explicit for operators.
      scope: ["read:user", "user:email"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Harden only: reject accounts with no usable email.
          // Non-allowlisted users may still complete OAuth (AE2); admin
          // protect-time deny is the CRUD gate (KTD2).
          if (!user.email?.trim()) {
            return false;
          }
          return { data: user };
        },
      },
    },
  },
});
