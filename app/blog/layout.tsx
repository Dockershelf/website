import { Metadata } from "next";
import { notFound } from "next/navigation";

import { FEATURE_BLOG } from "@lib/features";
import { siteConfig } from "@lib/site-config";

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: siteConfig.description,
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!FEATURE_BLOG) {
    notFound();
  }
  return children;
}
