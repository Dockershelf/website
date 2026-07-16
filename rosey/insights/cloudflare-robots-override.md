---
title: Cloudflare managed robots.txt overrides origin AI crawler policy
module: agent-discovery
problem_type: workflow_issue
component: robots.txt
tags:
  - robots
  - cloudflare
  - ai-crawlers
  - seo
  - infrastructure
applies_when:
  - Site serves a permissive robots.txt for AI crawlers behind Cloudflare
  - AI SEO endpoints return correct content but crawlers still blocked
  - Localhost or disallow rules appear in production robots.txt
severity: high
---

## Insight

- Cloudflare's "AI Audit" / "AI Labyrinth" managed bot features inject a
  **prepend block** into the served `robots.txt` that `Disallow: /` for
  `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`,
  `Bytespider`, `meta-externalagent`, `Amazonbot`, and others.
- This prepend overrides the site's own permissive `Allow: /` policy for
  those same crawlers (robots.txt parsers use the most specific match).
- The origin `app/robots.txt/route.ts` content is still appended below the
  Cloudflare block, so the route is not broken — it is shadowed by the CDN.

## When It Applies

- The site intentionally allows AI crawlers with `Content-Signal` directives
  (search=yes, ai-input=yes, ai-train=no) but Cloudflare is in front.
- Symptom: `curl https://site/robots.txt` shows a `# BEGIN Cloudflare Managed
  content` block with `Disallow: /` entries above the site's own rules.

## What To Do

- This **cannot be fixed from origin code**. It is a Cloudflare zone setting.
- Disable the managed robots.txt injection in Cloudflare dashboard:
  Security → Bots → Bot Fight Mode / AI Audit / AI Labyrinth → turn off
  robots.txt modification (or disable the features entirely if the site
  wants AI crawlers).
- Alternatively, serve robots.txt from a path Cloudflare does not modify and
  reference it via the `Host:` header — but the simpler fix is the dashboard
  toggle.
- After disabling, purge the CDN cache for `/robots.txt` and re-verify.

## Avoid

- Do not try to "win" the robots.txt ordering by adding more rules at origin —
  Cloudflare's prepend always wins for the crawlers it blocks.
- Do not assume the origin route is broken when you see unexpected `Disallow`
  entries; always check for the `# BEGIN Cloudflare Managed content` marker.

## Evidence

- 2026-07-16 production test of `dockershelf.com/robots.txt`: Cloudflare
  block prepended `Disallow: /` for GPTBot, ClaudeBot, Google-Extended, etc.,
  contradicting the site's `Allow: /` policy in the same file.
