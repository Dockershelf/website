/**
 * Admin email allowlist (KTD2). Fail-closed: empty/unset ⇒ deny all.
 */

export function parseAdminEmailAllowlist(
  raw: string | undefined = process.env.ADMIN_EMAIL_ALLOWLIST
): Set<string> {
  if (!raw || !raw.trim()) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAllowlistedAdminEmail(
  email: string | null | undefined,
  allowlist: Set<string> = parseAdminEmailAllowlist()
): boolean {
  if (!email || allowlist.size === 0) {
    return false;
  }
  return allowlist.has(email.trim().toLowerCase());
}
