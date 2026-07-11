import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

/**
 * Neon WebSocket Pool for Better Auth writes (KTD3).
 * neon-http cannot run interactive transactions; auth session/account
 * writes need this path. Public blog reads keep lib/db/client.ts.
 *
 * Use DATABASE_URL_UNPOOLED (direct Neon URL). Pooled HTTP URLs are
 * unsuitable for a long-lived WebSocket Pool. Lifetime is process-scoped
 * via globalThis so Better Auth handlers share one pool safely.
 */
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is required when FEATURE_BLOG=1 for the auth WebSocket pool. Set Neon's direct (unpooled) connection string."
  );
}

type GlobalAuthPool = typeof globalThis & {
  __authNeonPool?: Pool;
};

function getAuthPool(): Pool {
  const g = globalThis as GlobalAuthPool;
  if (!g.__authNeonPool) {
    g.__authNeonPool = new Pool({ connectionString });
  }
  return g.__authNeonPool;
}

export const authDb = drizzle({ client: getAuthPool(), schema });
