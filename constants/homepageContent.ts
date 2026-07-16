import { siteConfig } from "@lib/site-config";

export type ProofPoint = {
  metric: string;
  project: string;
  context: string;
};

export type FaqAnswerSegment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "command"; value: string }
  | { type: "link"; href: string; value: string };

export type FaqItem = {
  question: string;
  answer: FaqAnswerSegment[];
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
    answer: [
      {
        type: "text",
        value:
          "An open-source collector of lightweight Docker images for Debian, Python, Node, Go, and LaTeX. ",
      },
      {
        type: "bold",
        value: "Pull from Docker Hub",
      },
      {
        type: "text",
        value: " or use them as base images in your own Dockerfiles.",
      },
    ],
  },
  {
    question: "Stable or unstable — which should I use?",
    answer: [
      {
        type: "bold",
        value: "Prefer stable",
      },
      {
        type: "text",
        value: " (Debian stable–based) for production. ",
      },
      {
        type: "bold",
        value: "Prefer unstable",
      },
      {
        type: "text",
        value:
          " (Debian sid–based) when you need the newest language or package versions during development. Debian and LaTeX shelves follow their own tagging rules.",
      },
    ],
  },
  {
    question: "How do I pull an image?",
    answer: [
      { type: "text", value: "Use " },
      { type: "command", value: "docker pull dockershelf/<shelf>:<tag>" },
      { type: "text", value: ", for example " },
      {
        type: "command",
        value: "docker pull dockershelf/python:3.13-stable",
      },
      { type: "text", value: ", then run it or " },
      { type: "command", value: "FROM" },
      { type: "text", value: " it in a Dockerfile." },
    ],
  },
  {
    question: "Where do I contribute?",
    answer: [
      { type: "text", value: "Visit the " },
      {
        type: "link",
        href: `${siteConfig.url}/community`,
        value: "community page",
      },
      {
        type: "text",
        value:
          " for Discord, issues, and contribution pointers, or open a PR on the ",
      },
      {
        type: "link",
        href: "https://github.com/Dockershelf/dockershelf",
        value: "Dockershelf GitHub repository",
      },
      { type: "text", value: "." },
    ],
  },
];

export const sectionTitles = {
  philosophy: "Why Dockershelf",
  proof: "What you get",
  faq: "Frequently asked questions",
};
