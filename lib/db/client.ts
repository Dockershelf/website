import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Neon HTTP client for public blog reads (KTD3).
 * Loaded only when FEATURE_BLOG=1 via lib/db/index.ts DCE boundary.
 * Fail-fast when blog is on but DATABASE_URL is missing (KTD9).
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required when FEATURE_BLOG=1. Set the pooled Neon connection string."
  );
}

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql, schema });
