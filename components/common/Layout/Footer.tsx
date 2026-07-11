import { siteConfig } from "@lib/site-config";

export function Footer() {
  return (
    <footer className="footer flex justify-center items-center mx-auto text-black/40 mb-5 font-light font-main text-base">
      &copy; {new Date().getFullYear()} {siteConfig.author.name}. All rights
      reserved.
    </footer>
  );
}
