import { Metadata } from "next";
import { League_Gothic, Poppins, Roboto } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import { ENV_NAME, GA_MEASUREMENT_ID } from "@constants/constants";
import { FEATURE_BLOG } from "@lib/features";
import { siteConfig } from "@lib/site-config";

import CookieConsentWrapper from "@side-effects/CookieConsentWrapper";
import MetaPixel from "@side-effects/MetaPixel";

import "@styles/tailwind.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const leagueGothic = League_Gothic({
  subsets: ["latin"],
  variable: "--font-league-gothic",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const siteTitle = siteConfig.name;
const siteDescription = siteConfig.description;

const feedAlternates: Record<string, { url: string; title: string }[]> =
  FEATURE_BLOG
    ? {
        "application/rss+xml": [
          {
            url: `${siteConfig.url}/blog/posts/feed.xml`,
            title: "RSS feed",
          },
        ],
        "application/atom+xml": [
          {
            url: `${siteConfig.url}/blog/posts/atom.xml`,
            title: "Atom feed",
          },
        ],
        "application/feed+json": [
          {
            url: `${siteConfig.url}/blog/posts/feed.json`,
            title: "JSON feed",
          },
        ],
      }
    : {};

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name }],
  generator: siteConfig.generator,
  applicationName: siteConfig.app_name,
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/favicon/android-chrome-512x512.png`,
        width: 512,
        height: 512,
        alt: siteConfig.app_name,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [`${siteConfig.url}/images/banner.png`],
    site: siteConfig.blog.twitter ? `@${siteConfig.blog.twitter}` : undefined,
    creator: siteConfig.author.twitter
      ? `@${siteConfig.author.twitter}`
      : undefined,
  },
  icons: {
    icon: [
      {
        url: `${siteConfig.url}/favicon/favicon.svg`,
        type: "image/svg+xml",
      },
      {
        url: `${siteConfig.url}/favicon/favicon.png`,
        type: "image/png",
      },
      {
        url: `${siteConfig.url}/favicon/favicon.ico`,
        type: "image/x-icon",
      },
      {
        url: `${siteConfig.url}/favicon/favicon-32x32.png`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: `${siteConfig.url}/favicon/favicon-16x16.png`,
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: `${siteConfig.url}/favicon/favicon.ico`,
    apple: [
      {
        url: `${siteConfig.url}/favicon/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: `${siteConfig.url}/favicon/safari-pinned-tab.svg`,
        color: "#000000",
      },
    ],
  },
  manifest: `${siteConfig.url}/favicon/site.webmanifest`,
  alternates: {
    canonical: siteConfig.url,
    types: {
      ...feedAlternates,
      "application/xml": [
        {
          url: `${siteConfig.url}/sitemap.xml`,
          title: "Sitemap",
        },
      ],
    },
  },
  other: {
    sitemap: `${siteConfig.url}/sitemap.xml`,
    "dcterms.title": siteTitle,
    "dcterms.description": siteDescription,
    "dcterms.language": "en",
    "dcterms.type": "Collection",
    "dcterms.source": siteConfig.url,
    "dcterms.creator": siteConfig.author.name,
    "dcterms.publisher": siteConfig.author.name,
    "msapplication-starturl": siteConfig.url,
    "msapplication-tooltip": siteConfig.app_name,
    "msapplication-window": "width=1024;height=768",
    "msapplication-task": `name=${siteConfig.app_name};action-uri=${siteConfig.url};icon-uri=${siteConfig.url}/favicon/favicon.ico`,
    "msapplication-square70x70logo": `${siteConfig.url}/favicon/mstile-70x70.png`,
    "msapplication-square144x144logo": `${siteConfig.url}/favicon/mstile-144x144.png`,
    "msapplication-square150x150logo": `${siteConfig.url}/favicon/mstile-150x150.png`,
    "msapplication-square310x310logo": `${siteConfig.url}/favicon/mstile-310x310.png`,
    "msapplication-wide310x150logo": `${siteConfig.url}/favicon/mstile-310x150.png`,
    "msapplication-TileImage": `${siteConfig.url}/favicon/mstile-310x310.png`,
    "msapplication-TileColor": "#f8d983",
    "msapplication-config": `${siteConfig.url}/favicon/browserconfig.xml`,
    "fb:app_id": siteConfig.blog.fb_app_id,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  userScalable: true,
  themeColor: "#f8d983",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${poppins.variable} ${leagueGothic.variable}`}
      prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# dcterms: http://purl.org/dc/terms/#"
    >
      <body className="bg-bright-gold text-gray-2 cursor-default overflow-x-hidden text-2xl font-main">
        {children}
        {GA_MEASUREMENT_ID && ENV_NAME !== "local" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <CookieConsentWrapper />
      </body>
    </html>
  );
}
