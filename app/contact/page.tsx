import { notFound } from "next/navigation";

import { FEATURE_CONTACT } from "@lib/features";

import Contact from "@components/Contact/Contact";
import { Footer } from "@components/common/Layout/Footer";
import { HomeSiteHeader } from "@components/common/Layout/HomeSiteHeader";

export default function ContactPage() {
  if (!FEATURE_CONTACT) {
    notFound();
  }

  return (
    <div className="w-full mx-auto bg-bright-gold min-h-screen">
      <HomeSiteHeader />
      <main id="main-content" tabIndex={-1}>
        <div className="container pb-20"></div>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
