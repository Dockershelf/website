import { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@lib/site-config";

import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";

export const metadata: Metadata = {
  title: `Install | ${siteConfig.name}`,
  description: `Quickstart install steps for ${siteConfig.name}.`,
};

export default function InstallPage() {
  return (
    <>
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Container>
          <article className="flex flex-col w-full pt-15 pb-20">
            <Heading>Install / Quickstart</Heading>
            <SubHeading>
              Pull a Dockershelf image from Docker Hub, or use it as a base in
              your Dockerfile.
            </SubHeading>
            <div className="mt-8 space-y-4 text-xl font-light leading-relaxed text-black/80">
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  Pull an image, for example{" "}
                  <code className="text-lg">
                    docker pull dockershelf/python:3.13-stable
                  </code>
                  .
                </li>
                <li>
                  Run it interactively with{" "}
                  <code className="text-lg">
                    docker run -it dockershelf/python:3.13-stable bash
                  </code>
                  , or add{" "}
                  <code className="text-lg">
                    FROM dockershelf/debian:bookworm
                  </code>{" "}
                  to your Dockerfile.
                </li>
                <li>
                  To build locally, clone{" "}
                  <code className="text-lg">
                    https://github.com/Dockershelf/dockershelf
                  </code>{" "}
                  and run{" "}
                  <code className="text-lg">
                    bash build-image.sh &lt;image&gt;
                  </code>
                  .
                </li>
              </ol>
              <p>
                Need context first? Read the{" "}
                <Link href="/overview" className="underline hover:text-black">
                  overview
                </Link>
                .
              </p>
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
