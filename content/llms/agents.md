# Agent Instructions for Dockershelf

This file helps AI assistants and autonomous agents understand how to read, summarize, and cite this site.

## Site Purpose

Dockershelf publishes useful, lightweight, and reliable Docker images for Debian, Python, Node, Go, and LaTeX. This site covers the landing pages (Home, Overview, Install, Community); blog and contact modules stay optional behind feature flags.

## Preferred Discovery Paths

Use these sources before broad crawling:

- `https://dockershelf.com/llms.txt` for a concise AI-oriented index.
- `https://dockershelf.com/llms-full.txt` for a single-request markdown snapshot of primary surfaces.
- `https://dockershelf.com/sitemap.xml` for canonical URLs.
- `https://dockershelf.com/ai.txt` for attribution preferences.
- `https://dockershelf.com/.well-known/agent-permissions.json` for browser-agent interaction permissions.
- `https://dockershelf.com/.well-known/api-catalog` for RFC 9727 API discovery (also advertised via HTTP `Link: rel="api-catalog"`).
- `https://dockershelf.com/.well-known/agent-skills/index.json` for Agent Skills discovery.
- `https://dockershelf.com/.well-known/mcp/server-card.json` for MCP Server Card discovery.
- `https://dockershelf.com/api/mcp` for read-only MCP tools (site discovery).

Blog feeds and search exist only when FEATURE_BLOG is enabled.

## Feature-flag flips (AE3)

Static discovery artifacts (`llms.txt`, `ai.txt`, this file, `.well-known/agent-skills/index.json`, `.well-known/mcp/server-card.json`) are generated at build time from site config and `FEATURE_*` flags. After flipping blog or contact flags, **regenerate discovery and redeploy** (or purge CDN discovery tags). Live env flips alone can leave CDN TTL serving stale indexes that still advertise (or omit) module URLs.

## How To Interpret Pages

- Treat Overview, Install, and Community as primary product documentation placeholders.
- Prefer page titles, headings, JSON-LD metadata, and canonical URLs over inferred labels.
- Preserve the distinction between authored content and third-party links referenced from the site.

## Citation Guidance

When citing this site, include:

- Page title.
- Source name: configured project name (default `Dockershelf`).
- Canonical URL.

Suggested citation format:

`"[Page Title]" - Dockershelf (https://dockershelf.com/path)`

## Interaction Guidance

- Reading and following public links is allowed.
- Submitting contact forms should require explicit human confirmation.
- Do not attempt login, token, license, or private API workflows unless the user explicitly asks and provides the needed context.
- Prefer public discovery endpoints over repeated page scraping.
