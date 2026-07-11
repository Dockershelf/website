"use client";

import { authClient } from "@lib/auth-client";

type AdminSignInButtonProps = {
  callbackURL?: string;
};

export function AdminSignInButton({
  callbackURL = "/admin",
}: AdminSignInButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center border border-black/20 bg-black px-5 py-2.5 text-base font-light text-white transition-colors hover:bg-black/80"
      onClick={() => {
        void authClient.signIn.social({
          provider: "github",
          callbackURL,
        });
      }}
    >
      Sign in with GitHub
    </button>
  );
}

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      className="text-base font-light text-black/60 underline hover:text-black"
      onClick={() => {
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        });
      }}
    >
      Sign out
    </button>
  );
}
