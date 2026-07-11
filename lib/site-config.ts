/**
 * Central site identity for the hybrid template.
 * Operators replace placeholders via env; discovery and metadata consume this module.
 */

export type SiteAuthor = {
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  github: string;
  twitter: string;
  facebook: string;
};

export type SiteConfig = {
  name: string;
  app_name: string;
  description: string;
  keywords: string[];
  author: SiteAuthor;
  blog: {
    twitter: string;
    facebook: string;
    fb_app_id: string;
  };
  url: string;
  generator: string;
};

export const ENV_NAME = process.env.NEXT_PUBLIC_ENV_NAME;

const DEFAULT_CANONICAL =
  process.env.CANONICAL_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://example.com";

export const canonicalHostnameUrl =
  ENV_NAME === "local" ? "http://localhost:3101" : DEFAULT_CANONICAL;

export const SITE_PROFILE_DATE_CREATED =
  process.env.SITE_PROFILE_DATE_CREATED || "2026-01-01T00:00:00+00:00";
export const SITE_PROFILE_DATE_MODIFIED =
  process.env.SITE_PROFILE_DATE_MODIFIED || "2026-07-11T00:00:00+00:00";

export const siteConfig: SiteConfig = {
  name: process.env.SITE_NAME || "Project Name",
  app_name: process.env.SITE_APP_NAME || "Project Name",
  description:
    process.env.SITE_DESCRIPTION ||
    "An open-source project. Replace this placeholder with your product description.",
  keywords: (
    process.env.SITE_KEYWORDS || "open source, software, documentation"
  )
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean),
  author: {
    name: process.env.SITE_AUTHOR_NAME || "Project Maintainers",
    first_name: process.env.SITE_AUTHOR_FIRST_NAME || "Project",
    last_name: process.env.SITE_AUTHOR_LAST_NAME || "Maintainers",
    email: process.env.SITE_AUTHOR_EMAIL || "maintainers@example.com",
    github: process.env.SITE_AUTHOR_GITHUB || "example",
    twitter: process.env.SITE_AUTHOR_TWITTER || "example",
    facebook: process.env.SITE_AUTHOR_FACEBOOK || "",
  },
  blog: {
    twitter: process.env.SITE_BLOG_TWITTER || "",
    facebook: process.env.SITE_BLOG_FACEBOOK || "",
    fb_app_id: process.env.SITE_BLOG_FB_APP_ID || "",
  },
  url: canonicalHostnameUrl,
  generator: "Next.js",
};

/** @deprecated Prefer siteConfig — kept as `config` for gradual migration. */
export const config = siteConfig;
