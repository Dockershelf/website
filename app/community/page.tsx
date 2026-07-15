import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@lib/site-config";

import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";
import ButtonBar from "@components/Home/ButtonBar";

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
          <article className="flex flex-col items-center w-full pt-15">
            <Link href="/">
              <Image
                alt=""
                className="mx-auto"
                src="/images/logomin.svg"
                height={200}
                width={200}
                sizes="(max-width: 768px) 150px, 200px"
              />
            </Link>
            <Heading>Community / Contribute</Heading>
            <SubHeading>
              Join Discord, open issues, or send pull requests to keep the
              shelves useful.
            </SubHeading>
            <div className="mt-8 space-y-4 text-xl font-light leading-relaxed text-black/80 w-full lg:w-175 mx-auto">
              <p>
                Chat on{" "}
                <a
                  href="https://discord.gg/4Wc7xphH5e"
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="underline hover:text-black"
                >
                  Discord
                </a>
                , or open an issue or pull request on{" "}
                <a
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="underline hover:text-black"
                >
                  GitHub
                </a>
                . Read{" "}
                <a
                  href={`https://github.com/${github}/blob/develop/CONTRIBUTING.md`}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="underline hover:text-black"
                >
                  CONTRIBUTING.md
                </a>{" "}
                and the{" "}
                <a
                  href={`https://github.com/${github}/blob/develop/CLA.md`}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="underline hover:text-black"
                >
                  CLA
                </a>{" "}
                before contributing.
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
            <ButtonBar />
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
