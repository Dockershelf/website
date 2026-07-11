import type { PublicPost, PublicPostSummary } from "@lib/blog/types";
import { stripHtmlToPlainText } from "@lib/plainText";
import {
  siteConfig as config,
  SITE_PROFILE_DATE_CREATED,
  SITE_PROFILE_DATE_MODIFIED,
} from "@lib/site-config";

function buildOrganizationNode() {
  return {
    "@type": "Organization",
    "@id": `${config.url}/#Organization`,
    name: config.name,
    url: config.url,
    description: config.description,
    email: `mailto:${config.author.email}`,
    sameAs: [
      `https://github.com/${config.author.github}`,
      ...(config.author.twitter
        ? [`https://x.com/${config.author.twitter}`]
        : []),
    ],
  };
}

export function generateHomepageJsonLd() {
  const orgId = `${config.url}/#Organization`;
  const websiteId = `${config.url}/#WebSite`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationNode(),
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: config.url,
        name: config.name,
        description: config.description,
        publisher: {
          "@id": orgId,
        },
        about: {
          "@id": orgId,
        },
        inLanguage: ["en"],
      },
      {
        "@type": "WebPage",
        "@id": `${config.url}/#WebPage`,
        url: config.url,
        name: config.name,
        description: config.description,
        dateCreated: SITE_PROFILE_DATE_CREATED,
        dateModified: SITE_PROFILE_DATE_MODIFIED,
        isPartOf: {
          "@id": websiteId,
        },
        about: {
          "@id": orgId,
        },
      },
    ],
  };
}

export function generateBlogJsonLd(posts: PublicPostSummary[]) {
  const blogPosts = posts.map((post) => {
    const keywords = post.category ? [post.category] : [];
    const blogPost: Record<string, unknown> = {
      "@type": "BlogPosting",
      "@id": `${config.url}/blog/posts/${post.slug}`,
      mainEntityOfPage: `${config.url}/blog/posts/${post.slug}`,
      headline: post.title,
      name: post.title,
      description: stripHtmlToPlainText(post.excerpt || "").substring(0, 160),
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Organization",
        "@id": `${config.url}/#Organization`,
        name: config.author.name,
        url: config.url,
      },
      url: `${config.url}/blog/posts/${post.slug}`,
      keywords,
    };

    return blogPost;
  });

  return {
    "@context": "https://schema.org/",
    "@type": "Blog",
    "@id": `${config.url}/blog`,
    mainEntityOfPage: `${config.url}/blog`,
    name: `${config.name} Blog`,
    description: config.description,
    publisher: {
      "@type": "Organization",
      "@id": `${config.url}/#Organization`,
      name: config.author.name,
      url: config.url,
    },
    blogPost: blogPosts,
  };
}

export function generateBlogPostingJsonLd(post: PublicPost) {
  const keywords = post.category ? [post.category] : [];
  const blogPosting: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "BlogPosting",
    "@id": `${config.url}/blog/posts/${post.slug}/#BlogPosting`,
    mainEntityOfPage: `${config.url}/blog/posts/${post.slug}`,
    headline: post.title,
    name: post.title,
    description: stripHtmlToPlainText(post.excerpt || "").substring(0, 160),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      "@id": `${config.url}/#Organization`,
      name: config.author.name,
      url: config.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${config.url}/#Organization`,
      name: config.author.name,
      logo: {
        "@type": "ImageObject",
        "@id": `${config.url}/images/logo.svg`,
        url: `${config.url}/images/logo.svg`,
      },
    },
    url: `${config.url}/blog/posts/${post.slug}`,
    isPartOf: {
      "@type": "Blog",
      "@id": `${config.url}/blog/#Blog`,
      name: `${config.name} Blog`,
      publisher: {
        "@type": "Organization",
        "@id": `${config.url}/#Organization`,
        name: config.author.name,
      },
    },
    about: keywords.map((category) => ({
      "@type": "Thing",
      name: category,
    })),
    keywords,
  };

  return blogPosting;
}
