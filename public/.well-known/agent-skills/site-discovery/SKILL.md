---
name: site-discovery
description: Discover canonical Project Name surfaces for AI agents — llms.txt, sitemap, API catalog, Agent Skills, and MCP.
---

# Site Discovery

Use these read-only discovery endpoints before broad crawling:

- `https://example.com/llms.txt` — curated site index for agents
- `https://example.com/llms-full.txt` — single-request markdown corpus snapshot
- `https://example.com/agents.md` — agent instructions and API contracts
- `https://example.com/ai.txt` — AI attribution policy
- `https://example.com/.well-known/agent-permissions.json` — interaction policy
- `https://example.com/sitemap.xml` — canonical URLs
- `https://example.com/.well-known/api-catalog` — RFC 9727 machine API catalog
- `https://example.com/.well-known/agent-skills/index.json` — Agent Skills index
- `https://example.com/.well-known/mcp/server-card.json` — MCP server card
- `https://example.com/api/mcp` — read-only MCP transport

Canonical page URLs also support `Accept: text/markdown` content negotiation (same twins as `*.md` alternates).

Prefer `llms.txt` and MCP `get_site_discovery` over repeated HTML scraping.
