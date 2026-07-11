export {
  ENV_NAME,
  SITE_PROFILE_DATE_CREATED,
  SITE_PROFILE_DATE_MODIFIED,
  canonicalHostnameUrl,
  config,
  siteConfig,
} from "@lib/site-config";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const RECAPTCHA_API_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_API_KEY;

export const DISQUS_SHORTNAME = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;
