/**
 * Feature flags for hybrid template modules.
 * Use direct process.env comparisons at DCE require sites (KTD4).
 * Server FEATURE_* gate routes/APIs; NEXT_PUBLIC_* mirrors are for client nav only.
 * When enabling a module, set both the server flag and its NEXT_PUBLIC_* mirror.
 */

export const FEATURE_BLOG = process.env.FEATURE_BLOG === "1";

export const FEATURE_CONTACT = process.env.FEATURE_CONTACT === "1";

/** Client-safe mirrors (inlined at build). Prefer these in client components. */
export const PUBLIC_FEATURE_BLOG = process.env.NEXT_PUBLIC_FEATURE_BLOG === "1";

export const PUBLIC_FEATURE_CONTACT =
  process.env.NEXT_PUBLIC_FEATURE_CONTACT === "1";
