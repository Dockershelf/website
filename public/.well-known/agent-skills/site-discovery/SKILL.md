---
name: site-discovery
description: Discover canonical Dockershelf surfaces for AI agents — llms.txt, sitemap, API catalog, Agent Skills, and MCP.
---

# Site Discovery

Use these read-only discovery endpoints before broad crawling:

- `https://dockershelf.com/llms.txt` — curated site index for agents
- `https://dockershelf.com/llms-full.txt` — single-request markdown corpus snapshot
- `https://dockershelf.com/agents.md` — agent instructions and API contracts
- `https://dockershelf.com/ai.txt` — AI attribution policy
- `https://dockershelf.com/.well-known/agent-permissions.json` — interaction policy
- `https://dockershelf.com/sitemap.xml` — canonical URLs
- `https://dockershelf.com/.well-known/api-catalog` — RFC 9727 machine API catalog
- `https://dockershelf.com/.well-known/agent-skills/index.json` — Agent Skills index
- `https://dockershelf.com/.well-known/mcp/server-card.json` — MCP server card
- `https://dockershelf.com/api/mcp` — read-only MCP transport

Canonical page URLs also support `Accept: text/markdown` content negotiation (same twins as `*.md` alternates).

Prefer `llms.txt` and MCP `get_site_discovery` over repeated HTML scraping.
