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
              Placeholder quickstart for {siteConfig.name}. Replace with your
              real install commands and prerequisites.
            </SubHeading>
            <div className="mt-8 space-y-4 text-xl font-light leading-relaxed text-black/80">
              <ol className="list-decimal list-inside space-y-3">
                <li>Clone the repository and install dependencies.</li>
                <li>
                  Copy <code className="text-lg">.env.example</code> to{" "}
                  <code className="text-lg">.env</code> and set identity vars.
                </li>
                <li>
                  Run the local server, then open{" "}
                  <code className="text-lg">http://localhost:3101</code>.
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
