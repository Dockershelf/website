import { parse as parseYaml } from "yaml";

import { logError } from "@lib/logger";

import type { ActiveImage, ShelfName, Track } from "./types";

/**
 * URL of the Dockershelf master schedule workflow on the develop branch.
 * This workflow's build matrix defines every image that is actively rebuilt
 * and pushed weekly. If the branch or path changes, update here (or override
 * via the DOCKERSHELF_WORKFLOW_URL env var).
 */
const WORKFLOW_URL =
  process.env.DOCKERSHELF_WORKFLOW_URL ||
  "https://raw.githubusercontent.com/Dockershelf/dockershelf/refs/heads/develop/.github/workflows/schedule-master.yml";

/** ISR cache: refresh the workflow at most once per hour. */
const REVALIDATE_SECONDS = 3600;

/** The five shelves, used to classify parsed image names. */
const SHELVES: readonly ShelfName[] = [
  "debian",
  "latex",
  "python",
  "node",
  "go",
];

export type FetchActiveImagesResult = {
  images: Map<string, ActiveImage>;
  error?: string;
};

/**
 * Derive the build track from an image tag suffix.
 *
 * - `*-trixie` / `*-stable` / suite names like `bookworm` → stable
 * - `*-sid` / `*-unstable` → unstable
 * - `basic` / `full` / `extras` (LaTeX) → those tracks
 * - anything else → other
 */
function deriveTrack(tag: string): Track {
  const lower = tag.toLowerCase();
  if (
    lower.endsWith("-sid") ||
    lower.endsWith("-unstable") ||
    lower === "sid"
  ) {
    return "unstable";
  }
  if (
    lower.endsWith("-trixie") ||
    lower.endsWith("-stable") ||
    lower === "stable"
  ) {
    return "stable";
  }
  if (lower === "basic" || lower.endsWith("-basic")) return "basic";
  if (lower === "full" || lower.endsWith("-full")) return "full";
  if (lower === "extras" || lower.endsWith("-extras")) return "extras";
  // Debian suite names (bookworm, trixie, forky, sid, oldstable, testing, etc.)
  return "other";
}

/**
 * Extract a version key from a tag for grouping aliases.
 *
 * Examples:
 *   python:3.13-trixie  → "3.13"
 *   python:3.13-sid     → "3.13"
 *   node:22-trixie      → "22"
 *   go:1.25-trixie      → "1.25"
 *   debian:bookworm     → "bookworm"
 *   latex:basic         → "basic"
 */
function extractVersionKey(shelf: ShelfName, tag: string): string {
  if (shelf === "debian" || shelf === "latex") {
    // Debian and LaTeX use suite/variant names as the version key.
    // Strip a trailing -stable/-unstable if present.
    return tag.replace(/-(?:stable|unstable)$/, "");
  }
  // Language shelves: version is the leading numeric segment before the first dash.
  const match = tag.match(/^([\d.]+)/);
  return match ? match[1] : tag;
}

/** Parse a single matrix include entry into an ActiveImage. */
function parseMatrixEntry(entry: {
  "docker-image-name"?: string;
  "docker-image-extra-tags"?: string;
}): ActiveImage | null {
  const fullName = entry["docker-image-name"];
  if (!fullName || typeof fullName !== "string") return null;

  // Split "dockershelf/python:3.13-trixie" → shelf="python", tag="3.13-trixie"
  const withoutPrefix = fullName.replace(/^dockershelf\//, "");
  const [shelfPart, tagPart] = withoutPrefix.split(":");
  if (!shelfPart || !tagPart) return null;

  const shelf = SHELVES.find((s) => s === shelfPart);
  if (!shelf) return null;

  const extraTagsRaw = entry["docker-image-extra-tags"];
  const aliases =
    typeof extraTagsRaw === "string" && extraTagsRaw.trim()
      ? extraTagsRaw
          .trim()
          .split(/\s+/)
          .filter((a) => a !== fullName)
      : [];

  return {
    fullName,
    shelf,
    tag: tagPart,
    versionKey: extractVersionKey(shelf, tagPart),
    track: deriveTrack(tagPart),
    aliases,
  };
}

/**
 * Fetch the schedule-master.yml workflow and extract the active build matrix.
 *
 * Uses Next.js ISR (1h revalidate) so the workflow is re-fetched at most once
 * per hour. On fetch or parse failure, returns an empty map with an error
 * string — callers should degrade gracefully.
 */
export async function fetchActiveImagesFromWorkflow(): Promise<FetchActiveImagesResult> {
  const images = new Map<string, ActiveImage>();

  let response: Response;
  try {
    response = await fetch(WORKFLOW_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    logError("images-workflow-fetch", error, { url: WORKFLOW_URL });
    return { images, error: "workflow-fetch-failed" };
  }

  if (!response.ok) {
    logError("images-workflow-fetch", new Error(`HTTP ${response.status}`), {
      url: WORKFLOW_URL,
      status: response.status,
    });
    return { images, error: `workflow-http-${response.status}` };
  }

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    logError("images-workflow-read", error);
    return { images, error: "workflow-read-failed" };
  }

  let doc: unknown;
  try {
    doc = parseYaml(text);
  } catch (error) {
    logError("images-workflow-parse", error, { textLength: text.length });
    return { images, error: "workflow-parse-failed" };
  }

  // Navigate to jobs.build.strategy.matrix.include[]
  const root = doc as Record<string, unknown> | null;
  const jobs = root?.jobs as Record<string, unknown> | undefined;
  const buildJob = jobs?.build as Record<string, unknown> | undefined;
  const strategy = buildJob?.strategy as Record<string, unknown> | undefined;
  const matrix = strategy?.matrix as Record<string, unknown> | undefined;
  const include = matrix?.include;

  if (!Array.isArray(include)) {
    logError(
      "images-workflow-parse",
      new Error("matrix.include not found or not an array")
    );
    return { images, error: "workflow-matrix-missing" };
  }

  for (const entry of include) {
    if (entry && typeof entry === "object") {
      const parsed = parseMatrixEntry(
        entry as Record<string, unknown> as {
          "docker-image-name"?: string;
          "docker-image-extra-tags"?: string;
        }
      );
      if (parsed) {
        images.set(parsed.fullName, parsed);
      }
    }
  }

  return { images };
}
