/**
 * Central site identity for the Dockershelf website.
 * Operators override via env; discovery and metadata consume this module.
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
  "https://dockershelf.com";

export const canonicalHostnameUrl =
  ENV_NAME === "local" ? "http://localhost:3101" : DEFAULT_CANONICAL;

export const SITE_PROFILE_DATE_CREATED =
  process.env.SITE_PROFILE_DATE_CREATED || "2016-06-08T00:00:00+00:00";
export const SITE_PROFILE_DATE_MODIFIED =
  process.env.SITE_PROFILE_DATE_MODIFIED || "2026-07-11T00:00:00+00:00";

export const siteConfig: SiteConfig = {
  name: process.env.APP_SITE_NAME || "Dockershelf",
  app_name: process.env.SITE_APP_NAME || "Dockershelf",
  description:
    process.env.SITE_DESCRIPTION ||
    "Useful, lightweight, and reliable Docker images for Debian, Python, Node, Go, and LaTeX — rebuilt and tested weekly.",
  keywords: (
    process.env.SITE_KEYWORDS ||
    "docker, debian, python, node, go, latex, docker images, containers, dockershelf"
  )
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean),
  author: {
    name: process.env.SITE_AUTHOR_NAME || "Luis Alejandro",
    first_name: process.env.SITE_AUTHOR_FIRST_NAME || "Luis",
    last_name: process.env.SITE_AUTHOR_LAST_NAME || "Alejandro",
    email: process.env.SITE_AUTHOR_EMAIL || "luis@luisalejandro.org",
    github: process.env.SITE_AUTHOR_GITHUB || "Dockershelf/dockershelf",
    twitter: process.env.SITE_AUTHOR_TWITTER || "LuisAlejandro",
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
