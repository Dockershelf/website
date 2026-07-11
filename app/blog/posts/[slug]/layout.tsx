import { Metadata } from "next";

import { siteConfig } from "@lib/site-config";

export const metadata: Metadata = {
  title: `Post | ${siteConfig.name}`,
  description: siteConfig.description,
};

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
