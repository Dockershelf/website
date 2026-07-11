import { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@lib/site-config";

import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";

export const metadata: Metadata = {
  title: `Community | ${siteConfig.name}`,
  description: `How to contribute to ${siteConfig.name}.`,
};

export default function CommunityPage() {
  const github = siteConfig.author.github;

  return (
    <>
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Container>
          <article className="flex flex-col w-full pt-15 pb-20">
            <Heading>Community / Contribute</Heading>
            <SubHeading>
              Placeholder community guide for {siteConfig.name}. Point
              contributors to issues, chat, and contribution docs.
            </SubHeading>
            <div className="mt-8 space-y-4 text-xl font-light leading-relaxed text-black/80">
              <p>
                Open an issue or pull request on{" "}
                <a
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="underline hover:text-black"
                >
                  GitHub
                </a>
                . Replace this copy with your CODE_OF_CONDUCT and contributing
                guide links.
              </p>
              <p>
                Back to the{" "}
                <Link href="/overview" className="underline hover:text-black">
                  overview
                </Link>{" "}
                or{" "}
                <Link href="/install" className="underline hover:text-black">
                  install
                </Link>{" "}
                pages.
              </p>
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
