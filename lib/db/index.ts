/**
 * DCE-safe DB entry (KTD4).
 * Webpack/turbopack can drop the unused require branch when
 * process.env.FEATURE_BLOG is a build-time literal "0" or "1".
 *
 * Use a direct FEATURE_BLOG === "1" check here — do not import
 * @lib/features (that ORs NEXT_PUBLIC_* and breaks DCE purity).
 */
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import type * as schema from "./schema";

export type AppDb = NeonHttpDatabase<typeof schema>;

type DbModule = {
  db: AppDb | null;
};

function loadDbModule(): DbModule {
  if (process.env.FEATURE_BLOG === "1") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./client") as DbModule;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./noop") as DbModule;
}

const dbModule = loadDbModule();

export const db = dbModule.db;

export {
  account,
  posts,
  postStatusEnum,
  session,
  user,
  verification,
} from "./schema";
export type { NewPost, Post } from "./schema";
