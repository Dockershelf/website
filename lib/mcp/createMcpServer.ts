import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";

import { getLatestPublishedPosts, searchPublishedPosts } from "@lib/blog";
import { FEATURE_BLOG } from "@lib/features";
import { logError } from "@lib/logger";
import { getSiteDiscoveryMetadata } from "@lib/mcp/discoveryMetadata";
import { MAX_SEARCH_QUERY_LENGTH } from "@lib/searchQuery";
import { siteConfig } from "@lib/site-config";

import packageJson from "../../package.json";

export function createMcpServer() {
  const server = new McpServer(
    {
      name: siteConfig.app_name || "site-template",
      version: packageJson.version,
    },
    { capabilities: { tools: {} } }
  );

  // KTD12: register blog tools only when FEATURE_BLOG is on (omit stubs when off).
  // MCP stays read-only: published posts only; no auth/write tools.
  if (FEATURE_BLOG) {
    server.registerTool(
      "search_blog_posts",
      {
        title: "Search blog posts",
        description:
          "Search published blog posts by title, body, or category (read-only).",
        inputSchema: {
          q: z.string().max(MAX_SEARCH_QUERY_LENGTH).describe("Search query"),
        },
      },
      async ({ q }) => {
        const query = q?.trim() ?? "";
        if (!query) {
          return {
            content: [{ type: "text", text: JSON.stringify({ response: [] }) }],
          };
        }

        if (query.length > MAX_SEARCH_QUERY_LENGTH) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: "Query too long" }),
              },
            ],
            isError: true,
          };
        }

        try {
          const posts = await searchPublishedPosts(query);
          const response = posts.map((post) => ({
            title: post.title,
            slug: post.slug,
            metadata: {
              teaser: post.excerpt,
              category: post.category,
              published_at: post.createdAt,
            },
          }));

          return {
            content: [{ type: "text", text: JSON.stringify({ response }) }],
          };
        } catch (error) {
          logError("mcp-search", error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "upstream_search_unavailable",
                  message: "Blog search is temporarily unavailable",
                }),
              },
            ],
            isError: true,
          };
        }
      }
    );

    server.registerTool(
      "get_latest_posts",
      {
        title: "Get latest blog posts",
        description:
          "Returns the most recent published blog posts (read-only).",
        inputSchema: {
          limit: z
            .number()
            .min(1)
            .max(20)
            .optional()
            .describe("Number of posts to return (default: 5, max: 20)"),
        },
      },
      async ({ limit }) => {
        try {
          const posts = await getLatestPublishedPosts(limit ?? 5);
          const response = posts.map((post) => ({
            title: post.title,
            slug: post.slug,
            published_at: post.createdAt,
          }));

          return {
            content: [{ type: "text", text: JSON.stringify({ response }) }],
          };
        } catch (error) {
          logError("mcp-latest-posts", error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "upstream_fetch_unavailable",
                  message: "Blog posts are temporarily unavailable",
                }),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  server.registerTool(
    "get_site_discovery",
    {
      title: "Site discovery metadata",
      description:
        "Returns canonical discovery URLs for feeds, llms.txt, API catalog, and MCP.",
      inputSchema: {},
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(getSiteDiscoveryMetadata()),
          },
        ],
      };
    }
  );

  return server;
}
