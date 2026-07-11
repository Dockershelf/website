# Hybrid site template

Reusable Next.js starter: always-on marketing landing, optional Neon-backed blog with GitHub OAuth admin, optional contact via Resend. AI/LLM discovery and CDN cache headers stay parametrized by site identity and feature flags.

Current version: 3.2.9

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Sass
- **Blog (optional):** Neon Postgres, Drizzle, Better Auth (GitHub OAuth)
- **Contact (optional):** Resend + reCAPTCHA (Mailchimp / Google Sheets side effects optional)
- **Monitoring:** Sentry (`@sentry/nextjs`) — env-optional
- **Package manager:** npm (`package-lock.json`)

## Feature flags

| Flag | Client mirror | Effect when `0` |
| ---- | ------------- | --------------- |
| `FEATURE_BLOG` | `NEXT_PUBLIC_FEATURE_BLOG` | No Neon/auth load, no `/blog` or `/admin`, discovery omits blog |
| `FEATURE_CONTACT` | `NEXT_PUBLIC_FEATURE_CONTACT` | No contact UI/API; discovery omits contact |

Set server `FEATURE_*` and matching `NEXT_PUBLIC_*` mirrors to the same value when enabling a module — server flags gate routes/APIs; public mirrors drive client nav only. Defaults in `.env.example` are landing-only (`0`).

## Quick start (landing-only)

No Neon, OAuth, or Resend required.

```bash
cp .env.example .env
# Keep FEATURE_BLOG=0 FEATURE_CONTACT=0 (and NEXT_PUBLIC_* mirrors)
# Fill SITE_* / CANONICAL_SITE_URL / NEXT_PUBLIC_SITE_URL
npm install
PORT=3101 npm run dev
```

Open [http://localhost:3101](http://localhost:3101).

Discovery artifacts regenerate on `npm run build` (`prebuild` → `scripts/generate-agent-discovery.mjs`). For a one-off regen without a full build:

```bash
node scripts/generate-agent-discovery.mjs
```

## Blog on

1. Create a Neon project. Copy the **pooled** connection string to `DATABASE_URL` (public reads) and the **direct/unpooled** string to `DATABASE_URL_UNPOOLED` (required for migrations and the Better Auth WebSocket pool).
2. Set Better Auth + GitHub OAuth (fail-fast when blog is on and any are missing):

   | Variable | Notes |
   | -------- | ----- |
   | `BETTER_AUTH_SECRET` | Random secret |
   | `BETTER_AUTH_URL` | App origin, e.g. `http://localhost:3101` |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App |
   | `ADMIN_EMAIL_ALLOWLIST` | Comma-separated emails, case-insensitive. Empty/unset ⇒ deny all admin (fail-closed) |

3. Register the GitHub OAuth callback for local dev:

   `http://localhost:3101/api/auth/callback/github`

   Production: `{BETTER_AUTH_URL}/api/auth/callback/github`. Admins need a primary email on the GitHub account (`user:email` scope).

4. Flip flags and migrate:

```bash
# In .env
FEATURE_BLOG=1
NEXT_PUBLIC_FEATURE_BLOG=1

npm run db:migrate
PORT=3101 npm run dev
```

Admin UI: `/admin` (allowlisted session only). Draft preview stays under `/admin`; public `/blog` routes serve published posts only.

## Contact on

1. Verify a Resend sending domain. Set `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `CONTACT_TO`.
2. Set reCAPTCHA: `NEXT_PUBLIC_RECAPTCHA_API_KEY`, `RECAPTCHA_API_SECRET`, and `NEXT_PUBLIC_JWT_SECRET` (contact form token signing).
3. Flip flags:

```bash
FEATURE_CONTACT=1
NEXT_PUBLIC_FEATURE_CONTACT=1
```

Optional side effects (non-blocking for contact success): Mailchimp (`MAILCHIMP_*`) and Google Sheets (`GOOGLE_*`) — see `.env.example`.

## Flag flip and CDN

Discovery/sitemap and markdown-twin surfaces cache with roughly **1 hour** CDN TTL (`s-maxage=3600`) and **24 hour** SWR (`stale-while-revalidate=86400`). Flipping `FEATURE_BLOG` or `FEATURE_CONTACT` is not enough for live CDN alone:

1. Update env flags (server + `NEXT_PUBLIC_*` mirrors).
2. Regenerate discovery: `node scripts/generate-agent-discovery.mjs` (also runs on `npm run build`).
3. Redeploy, **or** purge CDN tags / wait for TTL.

Publish/unpublish of blog posts triggers revalidate + Netlify/Cloudflare tag purge. Netlify purge env (`NETLIFY_PURGE_TOKEN`, `NETLIFY_SITE_ID`) must be set in production — admin publish/unpublish fails closed if purge is missing or fails.

## Analytics keepers

| Integration | Status |
| ----------- | ------ |
| Google Analytics (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) | Optional — loaded when set and `NEXT_PUBLIC_ENV_NAME` ≠ `local` |
| Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`) | Optional — same gate |
| AdSense | Removed — do not add publisher/slot IDs |

## Environment matrix

Full placeholder list: `.env.example`. Credentials stay in env / secrets manager only (never commit real secrets).

| Area | Required when | Key variables |
| ---- | ------------- | ------------- |
| Site identity | Always | `SITE_*`, `CANONICAL_SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ENV_NAME` |
| Blog | `FEATURE_BLOG=1` | `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_*`, `GITHUB_*`, `ADMIN_EMAIL_ALLOWLIST` |
| Contact | `FEATURE_CONTACT=1` | `RESEND_*` / `EMAIL_*` / `CONTACT_TO`, reCAPTCHA, `NEXT_PUBLIC_JWT_SECRET` |
| Cache purge | Deploy with revalidate | `REVALIDATE_SECRET`, `NETLIFY_*` and/or `CLOUDFLARE_*` |
| Sentry | Optional | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| Disqus | Optional (blog comments) | `NEXT_PUBLIC_DISQUS_SHORTNAME`, `DISQUS_API_KEY` |

## Local development (Docker)

```bash
cp .env.example .env
make image
make dependencies
make serve
```

App: [http://localhost:3101](http://localhost:3101). `make console` opens a shell in the app container.

Override image name with `DOCKER_IMAGE` and compose project with `PROJECT_NAME` (defaults: `hybrid-site-template`). Container user is `app` with home `/home/app/app`.

### Host commands (npm)

| Command | Description |
| ------- | ----------- |
| `PORT=3101 npm run dev` | Dev server |
| `npm run build` | Production build (regenerates discovery) |
| `npm run lint` | ESLint |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run type-check` | `tsc --noEmit` |
| `npm run db:migrate` | Drizzle migrate (blog on) |
| `npm run agent-readiness:smoke` | Discovery/agent readiness smoke |

### Make targets (Docker)

| Command | Description |
| ------- | ----------- |
| `make serve` | Next.js dev server in Docker |
| `make build` | Production build in container |
| `make lint` / `make format` / `make test` | Lint, Prettier, type-check |
| `make dependencies` | `npm ci` in container |
| `make release-preflight` | lint + format + test before tag |

## Production stack (recommended)

| Service | Role | Repo config |
| ------- | ---- | ----------- |
| **Netlify** | Host / CDN / Functions | [`netlify.toml`](netlify.toml), [`public/_headers`](public/_headers) |
| **Neon** | Postgres (blog) | [`drizzle.config.ts`](drizzle.config.ts), `drizzle/` migrations |
| **GitHub OAuth** | Admin login | Env only (`GITHUB_*`, `BETTER_AUTH_*`) |
| **Resend** | Contact email | Env only (`RESEND_*`, `EMAIL_*`, `CONTACT_TO`) |
| **Google reCAPTCHA** | Contact spam gate | Env only (`NEXT_PUBLIC_RECAPTCHA_*`, `RECAPTCHA_API_SECRET`) |
| **Cloudflare DNS** | DNS (+ optional Cache-Tag purge) | Env only (`CLOUDFLARE_*`); DNS itself is dashboard-only |
| **Sentry** | Errors / traces | [`instrumentation.ts`](instrumentation.ts), [`instrumentation-client.ts`](instrumentation-client.ts), `withSentryConfig` in [`next.config.ts`](next.config.ts) |
| **Disqus** | Blog comments | Env only (`NEXT_PUBLIC_DISQUS_SHORTNAME`) |
| **GA / Meta Pixel** | Analytics | Env only (`NEXT_PUBLIC_GA_*`, `NEXT_PUBLIC_META_PIXEL_ID`) |

Set secrets in the Netlify UI (or CLI), not in git. Node **22** is pinned via [`netlify.toml`](netlify.toml) and [`.node-version`](.node-version). Do not pin `@netlify/plugin-nextjs` — Netlify’s OpenNext adapter applies automatically.

Blog admin publish/unpublish requires `NETLIFY_PURGE_TOKEN` + `NETLIFY_SITE_ID` (fail-closed). Cloudflare purge is optional.

## CI and releases

PRs to `develop` run Docker + production build and Semgrep in `.github/workflows/pr.yml`. Release process: `MAINTAINER.md`; changelog: `HISTORY.md`.
