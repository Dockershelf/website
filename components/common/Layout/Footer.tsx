import { siteConfig } from "@lib/site-config";

export function Footer() {
  return (
    <footer className="footer flex justify-center items-center max-w-7xl mx-auto text-black/40 mb-5 font-light font-main text-base">
      &copy; {new Date().getFullYear()}{" "}
      <a
        href="https://luisalejandro.org"
        className="underline hover:text-black/60 ml-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        {siteConfig.author.name}
      </a>
      . All rights reserved.
    </footer>
  );
}
