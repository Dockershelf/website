import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@lib/site-config";
import { generateHomepageJsonLd } from "@lib/structuredData";

import HighlightText from "@components/common/HighlightText";
import { Container } from "@components/common/Layout/Container";
import { Footer } from "@components/common/Layout/Footer";
import { Heading } from "@components/common/Layout/Heading";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";
import { SubHeading } from "@components/common/Layout/SubHeading";
import StyledLink from "@components/common/StyledLink";
import ButtonBar from "@components/Home/ButtonBar";
import { HomeContentSections } from "@components/Home/HomeContentSections";


export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  alternates: {
    types: {
      "text/markdown": [
        {
          url: "/index.md",
          title: "Markdown twin",
        },
      ],
    },
  },
};

export default async function HomePage() {
  const homepageJsonLd = generateHomepageJsonLd();

  return (
    <>
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homepageJsonLd),
          }}
        />
        <Container>
          <article className="flex flex-col items-center justify-center w-full h-full pt-15">
            <div className="home inline-block w-full">
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
              <Heading>
                Welcome to <HighlightText>{siteConfig.name}</HighlightText>.
              </Heading>
              <SubHeading>
                {siteConfig.description} Start with the{" "}
                <StyledLink href="/overview">overview</StyledLink>, follow the{" "}
                <StyledLink href="/install">install guide</StyledLink>, or join
                the <StyledLink href="/community">community</StyledLink>.
              </SubHeading>
              <HomeContentSections />
              <ButtonBar />
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
