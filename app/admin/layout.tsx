import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminSignInButton,
  AdminSignOutButton,
} from "@components/Admin/AdminAuthButtons";
import { Container } from "@components/common/Layout/Container";
import { getAdminSession } from "@lib/auth/session";
import { FEATURE_BLOG } from "@lib/features";
import { siteConfig } from "@lib/site-config";

export const metadata = {
  title: `Admin | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin"
              className="text-lg font-light text-black hover:text-black/70"
            >
              Admin
            </Link>
            <Link
              href="/"
              className="text-base font-light text-black/55 underline hover:text-black"
            >
              Public site
            </Link>
            {session.status === "admin" ? (
              <Link
                href="/admin/posts/new"
                className="text-base font-light text-black/55 underline hover:text-black"
              >
                New post
              </Link>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            {session.status === "unauthenticated" ? (
              <AdminSignInButton />
            ) : (
              <>
                <span className="text-sm font-light text-black/55">
                  {session.email ?? "Signed in"}
                </span>
                <AdminSignOutButton />
              </>
            )}
          </div>
        </Container>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
