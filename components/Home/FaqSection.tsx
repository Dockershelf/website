import Link from "next/link";

import {
  faqItems,
  sectionTitles,
  type FaqAnswerSegment,
} from "@constants/homepageContent";

import { HomeSectionHeading } from "@components/Home/HomeSectionHeading";

function FaqAnswer({ segments }: { segments: FaqAnswerSegment[] }) {
  return (
    <p className="text-xl font-normal leading-relaxed text-justify text-gray-1 lg:font-light lg:text-lg">
      {segments.map((segment, index) => {
        switch (segment.type) {
          case "bold":
            return (
              <strong key={index} className="font-semibold">
                {segment.value}
              </strong>
            );
          case "command":
            return (
              <code key={index} className="font-mono text-lg">
                {segment.value}
              </code>
            );
          case "link":
            return (
              <Link
                key={index}
                href={segment.href}
                className="underline hover:text-black"
              >
                {segment.value}
              </Link>
            );
          default:
            return <span key={index}>{segment.value}</span>;
        }
      })}
    </p>
  );
}

export function FaqSection() {
  return (
    <section aria-labelledby="home-faq-heading">
      <HomeSectionHeading id="home-faq-heading">
        {sectionTitles.faq}
      </HomeSectionHeading>
      <div className="my-4 mx-auto w-full lg:w-175 space-y-6">
        {faqItems.map(({ question, answer }) => (
          <article key={question}>
            <h3 className="font-main font-normal text-xl leading-8 text-gray-1 mb-2 lg:font-light lg:text-lg">
              {question}
            </h3>
            <FaqAnswer segments={answer} />
          </article>
        ))}
      </div>
    </section>
  );
}
