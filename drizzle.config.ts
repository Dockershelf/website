import { defineConfig } from "drizzle-kit";

/**
 * Migrations require the unpooled Neon URL (direct connection).
 * Runtime public reads use pooled DATABASE_URL via neon-http;
 * auth WebSocket pool also uses DATABASE_URL_UNPOOLED.
 */
const unpooledUrl = process.env.DATABASE_URL_UNPOOLED;

if (!unpooledUrl) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is required for drizzle migrations. Set Neon's direct (unpooled) connection string."
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: unpooledUrl,
  },
});
