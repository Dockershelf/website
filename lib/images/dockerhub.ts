import { logError } from "@lib/logger";

import type { DockerHubTag, ShelfName } from "./types";

/** ISR cache: refresh Docker Hub tags at most once per hour. */
const REVALIDATE_SECONDS = 3600;

/** Safety cap on pagination: at most 5 pages × 100 = 500 tags per shelf. */
const MAX_PAGES = 5;

/** The five Dockershelf shelf repos on Docker Hub. */
const SHELVES: readonly ShelfName[] = [
  "debian",
  "latex",
  "python",
  "node",
  "go",
];

/**
 * Fetch all tags for a single shelf from the Docker Hub API, following
 * pagination up to MAX_PAGES. Returns an empty array on error.
 */
export async function fetchDockerHubTags(
  shelf: ShelfName
): Promise<DockerHubTag[]> {
  const tags: DockerHubTag[] = [];
  let url: string | null =
    `https://hub.docker.com/v2/repositories/dockershelf/${shelf}/tags?page_size=100&ordering=last_updated`;

  for (let page = 0; page < MAX_PAGES && url; page++) {
    let response: Response;
    try {
      response = await fetch(url, {
        next: { revalidate: REVALIDATE_SECONDS, tags: [`dockerhub-${shelf}`] },
      });
    } catch (error) {
      logError("images-dockerhub-fetch", error, { shelf, url });
      return tags;
    }

    if (response.status === 429) {
      logError("images-dockerhub-fetch", new Error("rate limited (429)"), {
        shelf,
        url,
      });
      return tags;
    }

    if (!response.ok) {
      logError("images-dockerhub-fetch", new Error(`HTTP ${response.status}`), {
        shelf,
        url,
        status: response.status,
      });
      return tags;
    }

    let body: {
      results?: Array<{ name: string; last_updated: string | null }>;
      next?: string | null;
    };
    try {
      body = await response.json();
    } catch (error) {
      logError("images-dockerhub-parse", error, { shelf, url });
      return tags;
    }

    if (Array.isArray(body.results)) {
      for (const row of body.results) {
        if (row && typeof row.name === "string") {
          tags.push({ name: row.name, last_updated: row.last_updated ?? null });
        }
      }
    }

    url = body.next ?? null;
  }

  return tags;
}

/**
 * Fetch tags for all five shelves in parallel.
 * Returns a Map keyed by shelf name. Shelves that fail return an empty array.
 */
export async function fetchAllDockerHubTags(): Promise<
  Map<ShelfName, DockerHubTag[]>
> {
  const entries = await Promise.all(
    SHELVES.map(
      async (shelf) => [shelf, await fetchDockerHubTags(shelf)] as const
    )
  );
  return new Map(entries);
}
