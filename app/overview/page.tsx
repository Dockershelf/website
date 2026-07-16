import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { fetchImageCatalog } from "@lib/images/catalog";
import { siteConfig } from "@lib/site-config";

import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";
import ButtonBar from "@components/Home/ButtonBar";
import { ImageCatalog } from "@components/Overview/ImageCatalog";

export const metadata: Metadata = {
  title: `Overview | ${siteConfig.name}`,
  description: `What ${siteConfig.name} is and who it is for.`,
};

export default async function OverviewPage() {
  const catalog = await fetchImageCatalog();

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
            <Heading>Overview</Heading>
            <SubHeading>
              {siteConfig.name} is a collector of universal, efficient, and slim
              Docker recipes — shelves for Debian, Python, Node, Go, and LaTeX.
            </SubHeading>
            <div className="mt-8 space-y-4 text-xl font-light leading-relaxed text-black/80 w-full lg:w-175 mx-auto">
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
            <ImageCatalog catalog={catalog} />
            <ButtonBar />
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
