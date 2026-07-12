import { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@lib/site-config";

import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";

export const metadata: Metadata = {
  title: `Overview | ${siteConfig.name}`,
  description: `What ${siteConfig.name} is and who it is for.`,
};

export default function OverviewPage() {
  return (
    <>
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Container>
          <article className="flex flex-col w-full pt-15 pb-20">
            <Heading>Overview</Heading>
            <SubHeading>
              {siteConfig.name} is a collector of universal, efficient, and slim
              Docker recipes — shelves for Debian, Python, Node, Go, and LaTeX.
            </SubHeading>
            <div className="mt-8 space-y-4 text-xl font-light leading-relaxed text-black/80">
              <p>
                Images rebuild and test weekly via GitHub Actions, publish to
                Docker Hub, and target amd64 and arm64. Most shelves offer
                stable tracks (Debian stable — suited to production) and
                unstable tracks (Debian sid — suited to development).
              </p>
              <p>
                Next: follow the{" "}
                <Link href="/install" className="underline hover:text-black">
                  install guide
                </Link>{" "}
                or visit the{" "}
                <Link href="/community" className="underline hover:text-black">
                  community
                </Link>{" "}
                page to contribute.
              </p>
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
