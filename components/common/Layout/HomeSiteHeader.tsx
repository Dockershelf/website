"use client";

import Image from "next/image";
import Link from "next/link";

import { PUBLIC_FEATURE_BLOG, PUBLIC_FEATURE_CONTACT } from "@lib/features";

import { SkipToContentLink } from "@components/common/Layout/SkipToContentLink";

export function HomeSiteHeader() {
  return (
    <header className="w-full bg-bright-gold">
      <SkipToContentLink />
      <div className="mx-auto flex max-w-[94%] flex-wrap items-center justify-between gap-4 py-4 font-main">
        <Link href="/" className="flex items-center">
          <Image
            alt=""
            src="/images/logomin.svg"
            height={48}
            width={48}
            sizes="48px"
          />
        </Link>
        <nav aria-label="Main Navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-lg font-light">
            <li>
              <Link
                href="/"
                className="text-black/75 transition-all duration-400 ease-in-out hover:cursor-pointer hover:text-black"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/overview"
                className="text-black/75 transition-all duration-400 ease-in-out hover:cursor-pointer hover:text-black"
              >
                Overview
              </Link>
            </li>
            <li>
              <Link
                href="/install"
                className="text-black/75 transition-all duration-400 ease-in-out hover:cursor-pointer hover:text-black"
              >
                Install
              </Link>
            </li>
            {PUBLIC_FEATURE_BLOG && (
              <li>
                <Link
                  href="/blog"
                  className="text-black/75 transition-all duration-400 ease-in-out hover:cursor-pointer hover:text-black"
                >
                  Blog
                </Link>
              </li>
            )}
            {PUBLIC_FEATURE_CONTACT && (
              <li>
                <Link
                  href="/contact"
                  className="text-black/75 transition-all duration-400 ease-in-out hover:cursor-pointer hover:text-black"
                >
                  Contact
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
