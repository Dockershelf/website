import { siteConfig } from "@lib/site-config";

export type ProofPoint = {
  metric: string;
  project: string;
  context: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type HomeGalleryImage = {
  src: string;
  alt: string;
};

/** Neutral landing gallery — replace paths in a fork with product screenshots. */
export const homeGalleryImages: HomeGalleryImage[] = [
  { src: "/images/home/placeholder-1.svg", alt: "Template preview panel 1" },
  { src: "/images/home/placeholder-2.svg", alt: "Template preview panel 2" },
  { src: "/images/home/placeholder-3.svg", alt: "Template preview panel 3" },
  { src: "/images/home/placeholder-4.svg", alt: "Template preview panel 4" },
  { src: "/images/home/placeholder-5.svg", alt: "Template preview panel 5" },
  { src: "/images/home/placeholder-6.svg", alt: "Template preview panel 6" },
];

export const philosophy = `${siteConfig.name} is an open-source project template. Replace this philosophy section with your product principles, design goals, and contribution values. Keep the landing story short and focused on what operators get out of the box.`;

export const proofPoints: ProofPoint[] = [
  {
    metric: "Landing always on",
    project: "Home + Overview + Install + Community",
    context:
      "because every fork needs a usable shell before optional blog or contact modules are enabled.",
  },
  {
    metric: "Optional modules",
    project: "FEATURE_BLOG / FEATURE_CONTACT",
    context:
      "because not every site needs Neon, OAuth, or email — flags keep those surfaces out until configured.",
  },
  {
    metric: "Agent discovery",
    project: "llms.txt + MCP + sitemap",
    context:
      "because AI assistants should discover identity-driven defaults without personal portfolio residue.",
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "What is this template for?",
    answer:
      "A reusable hybrid site starter: always-on landing and OSS placeholder pages, with optional blog and contact modules behind feature flags.",
  },
  {
    question: "How do I customize the site identity?",
    answer:
      "Set SITE_NAME, SITE_DESCRIPTION, CANONICAL_SITE_URL, and related SITE_* variables in .env. Discovery generators and metadata read from lib/site-config.",
  },
  {
    question: "How do I enable the blog or contact form?",
    answer:
      "Set FEATURE_BLOG=1 and/or FEATURE_CONTACT=1 (plus NEXT_PUBLIC_* mirrors for nav). Blog uses Neon + admin UI; contact uses Resend when those modules are enabled.",
  },
  {
    question: "Where do I start contributing?",
    answer: `Visit ${siteConfig.url}/community for placeholder contribution guidance, then replace it with your project's real docs.`,
  },
];

export const sectionTitles = {
  philosophy: "Why this template",
  proof: "What you get",
  faq: "Frequently asked questions",
};
