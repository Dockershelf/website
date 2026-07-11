---
name: blog-search
description: Read-only blog post search via GET /api/search-posts?q=
---

# Blog Search

Search published blog posts by title, body, or category. Drafts are never returned.

## HTTP API

```
GET https://example.com/api/search-posts?q={query}
```

Replace `https://example.com` with the site canonical URL (`CANONICAL_SITE_URL`).

## Contract (Neon DTO)

Envelope: `{"response": PublicPostSummary[]}`.

Each item is a Neon `PublicPostSummary`:

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | string | Post id |
| `slug` | string | URL slug |
| `title` | string | |
| `excerpt` | string | Derived from body |
| `category` | string \| null | Free-text category |
| `createdAt` | string | ISO timestamp |
| `updatedAt` | string | ISO timestamp |

`GET /api/trending-posts` uses the same `{ "response": PublicPostSummary[] }` envelope.

`GET /api/last-posts` still returns a **bare** `PublicPostSummary[]` with `Deprecation: true` and a `Warning` header. Prefer `/api/search-posts` or `/api/trending-posts` for the `{ response }` envelope.

## Status codes

- Empty or whitespace `q` → `{"response":[]}`
- `q` longer than 128 characters → HTTP 400 `{"error":"Query too long"}` (MCP: tool `isError` with `{"error":"Query too long"}`)
- Upstream/DB failure → HTTP 503 `{"error":"Blog search temporarily unavailable"}` (MCP: tool `isError` with `{"error":"upstream_search_unavailable","message":"Blog search is temporarily unavailable"}`)
- Feature off → HTTP 404 `{"error":"Not found"}`
- Success → `{"response":[...]}` with published post summaries only

## MCP

The MCP tool `search_blog_posts` exposes the same read-only semantics at `https://example.com/api/mcp`. MCP may project a compact `{ title, slug, metadata: { teaser, category, published_at } }` view for agents; the HTTP API returns the flat Neon DTO above.

This skill and the MCP blog tools are registered only when `FEATURE_BLOG=1` (after regenerate + redeploy — see `agents.md`).

MCP HTTP requests are rate-limited to 120 per hour per client IP (see `agent-permissions.json`). Over limit → HTTP 429 JSON-RPC error with `Retry-After`.

Do not use this API for spam or high-frequency automated scraping beyond `agent-permissions.json` rate limits.
