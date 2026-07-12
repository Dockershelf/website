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

/** Neutral landing gallery — replace paths with product screenshots when available. */
export const homeGalleryImages: HomeGalleryImage[] = [
  { src: "/images/home/placeholder-1.svg", alt: "Dockershelf preview panel 1" },
  { src: "/images/home/placeholder-2.svg", alt: "Dockershelf preview panel 2" },
  { src: "/images/home/placeholder-3.svg", alt: "Dockershelf preview panel 3" },
  { src: "/images/home/placeholder-4.svg", alt: "Dockershelf preview panel 4" },
  { src: "/images/home/placeholder-5.svg", alt: "Dockershelf preview panel 5" },
  { src: "/images/home/placeholder-6.svg", alt: "Dockershelf preview panel 6" },
];

export const philosophy = `${siteConfig.name} collects universal, efficient, and slim Docker recipes into “shelves” for popular languages and tools. Images ship for amd64 and arm64, rebuild weekly through GitHub Actions, and stay available on Docker Hub.`;

export const proofPoints: ProofPoint[] = [
  {
    metric: "Weekly rebuilds",
    project: "GitHub Actions → Docker Hub",
    context:
      "because base packages and language runtimes move; fresh, tested images keep your FROM lines trustworthy.",
  },
  {
    metric: "Stable and unstable tracks",
    project: "Debian stable vs sid",
    context:
      "because production wants security updates without surprise majors, while development wants the latest packages.",
  },
  {
    metric: "Shelves that match the stack",
    project: "Debian, Python, Node, Go, LaTeX",
    context:
      "because one collector covers the bases most teams reach for when they start a container.",
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "What is Dockershelf?",
    answer:
      "An open-source collector of lightweight Docker images for Debian, Python, Node, Go, and LaTeX. Pull from Docker Hub or use them as base images in your own Dockerfiles.",
  },
  {
    question: "Stable or unstable — which should I use?",
    answer:
      "Prefer stable (Debian stable–based) for production. Prefer unstable (Debian sid–based) when you need the newest language or package versions during development. Debian and LaTeX shelves follow their own tagging rules.",
  },
  {
    question: "How do I pull an image?",
    answer:
      "Use docker pull dockershelf/<shelf>:<tag>, for example docker pull dockershelf/python:3.13-stable, then run it or FROM it in a Dockerfile.",
  },
  {
    question: "Where do I contribute?",
    answer: `Visit ${siteConfig.url}/community for Discord, issues, and contribution pointers, or open a PR on the Dockershelf GitHub repository.`,
  },
];

export const sectionTitles = {
  philosophy: "Why Dockershelf",
  proof: "What you get",
  faq: "Frequently asked questions",
};
