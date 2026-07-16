import { fetchAllDockerHubTags } from "./dockerhub";
import { fetchActiveImagesFromWorkflow } from "./workflow";

import type {
  ActiveImage,
  DockerHubTag,
  ImageCatalog,
  ImageEntry,
  ShelfCatalog,
  ShelfName,
  Track,
} from "./types";

/** The five shelves, in display order. */
const SHELF_ORDER: readonly ShelfName[] = [
  "debian",
  "python",
  "node",
  "go",
  "latex",
];

/** Short human-readable description for each shelf. */
const SHELF_DESCRIPTIONS: Record<ShelfName, string> = {
  debian: "Debian base images — stable, testing, and unstable suites.",
  python: "Python runtime images — stable and unstable tracks per version.",
  node: "Node.js runtime images — stable and unstable tracks per version.",
  go: "Go toolchain images — stable and unstable tracks per version.",
  latex: "LaTeX images — basic, full, and extras variants.",
};

/**
 * Extract a version key from a Docker Hub tag name for grouping.
 * Mirrors the logic in workflow.ts but works on bare tag names.
 */
function extractVersionKey(shelf: ShelfName, tag: string): string {
  if (shelf === "debian" || shelf === "latex") {
    return tag.replace(/-(?:stable|unstable)$/, "");
  }
  const match = tag.match(/^([\d.]+)/);
  return match ? match[1] : tag;
}

/** Derive the build track from a tag suffix. */
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
  return "other";
}

/**
 * Compare version keys for descending sort.
 * Handles numeric (3.13 > 3.9) and non-numeric (bookworm, trixie) keys.
 */
function compareVersionKeys(a: string, b: string): number {
  // Try numeric comparison first (split on dots).
  const aParts = a.split(".");
  const bParts = b.split(".");
  const aNumeric = aParts.every((p) => /^\d+$/.test(p));
  const bNumeric = bParts.every((p) => /^\d+$/.test(p));
  if (aNumeric && bNumeric) {
    const len = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < len; i++) {
      const av = parseInt(aParts[i] ?? "0", 10);
      const bv = parseInt(bParts[i] ?? "0", 10);
      if (av !== bv) return bv - av;
    }
    return 0;
  }
  // Non-numeric: reverse alphabetical (newer suite names tend to sort later).
  return b.localeCompare(a);
}

/**
 * Build the list of ImageEntry for a single shelf by combining active images
 * from the workflow with all tags from Docker Hub.
 */
function buildShelfImages(
  shelf: ShelfName,
  activeForShelf: ActiveImage[],
  dockerHubTags: DockerHubTag[]
): ImageEntry[] {
  const entries: ImageEntry[] = [];

  // Collect ALL active tag names (primary + aliases + their -dev counterparts).
  // The -dev suffix tags are the development branch counterparts of master
  // branch images and are also considered active.
  const allActiveTagNames = new Set<string>();
  for (const img of activeForShelf) {
    // Extract the bare tag from the full name (e.g. "bookworm" from "dockershelf/debian:bookworm").
    allActiveTagNames.add(img.tag);
    allActiveTagNames.add(`${img.tag}-dev`);
    for (const alias of img.aliases) {
      // Aliases are full names like "dockershelf/debian:oldstable" — extract the tag.
      const colonIdx = alias.indexOf(":");
      const bareTag = colonIdx >= 0 ? alias.slice(colonIdx + 1) : alias;
      allActiveTagNames.add(bareTag);
      allActiveTagNames.add(`${bareTag}-dev`);
    }
  }

  // Build a set of Docker Hub tag names for quick lookup.
  const dockerHubTagSet = new Set(dockerHubTags.map((t) => t.name));

  // Active entries from the workflow.
  // For each active image, also include its -dev counterpart (and -dev
  // counterparts of its aliases) as aliases if they exist on Docker Hub.
  const activeVersionKeys = new Set<string>();
  for (const img of activeForShelf) {
    activeVersionKeys.add(img.versionKey);

    // Collect -dev aliases that exist on Docker Hub.
    const devAliases: string[] = [];
    if (dockerHubTagSet.has(`${img.tag}-dev`)) {
      devAliases.push(`dockershelf/${shelf}:${img.tag}-dev`);
    }
    for (const alias of img.aliases) {
      const colonIdx = alias.indexOf(":");
      const bareTag = colonIdx >= 0 ? alias.slice(colonIdx + 1) : alias;
      if (dockerHubTagSet.has(`${bareTag}-dev`)) {
        devAliases.push(`dockershelf/${shelf}:${bareTag}-dev`);
      }
    }

    entries.push({
      name: img.fullName,
      tag: img.tag,
      versionKey: img.versionKey,
      track: img.track,
      aliases: [...img.aliases, ...devAliases],
      active: true,
    });
  }

  // Filter Docker Hub tags: exclude any tag that is already known active
  // (either as a primary tag or as an alias of an active image).
  const inactiveDHtags = dockerHubTags.filter(
    (t) => !allActiveTagNames.has(t.name)
  );

  // Group remaining Docker Hub tags by version key to find inactive versions.
  const dockerHubByVersion = new Map<string, DockerHubTag[]>();
  for (const tag of inactiveDHtags) {
    const key = extractVersionKey(shelf, tag.name);
    if (!dockerHubByVersion.has(key)) {
      dockerHubByVersion.set(key, []);
    }
    dockerHubByVersion.get(key)!.push(tag);
  }

  // Inactive entries: version keys on Docker Hub not in the active set.
  // Also skip version keys that match an active key (e.g. "3.13" has active
  // entries from the workflow; any remaining Docker Hub tags for "3.13" are
  // dev/old variants that should be collapsed under that version key).
  for (const [versionKey, tags] of dockerHubByVersion) {
    if (activeVersionKeys.has(versionKey)) continue;

    // Pick the most descriptive tag as the representative.
    // Prefer -stable/-trixie variants, then the plain version, then any.
    const representative =
      tags.find((t) => t.name.endsWith("-stable")) ??
      tags.find((t) => t.name.endsWith("-trixie")) ??
      tags.find((t) => t.name === versionKey) ??
      tags[0];

    if (!representative) continue;

    const aliases = tags
      .map((t) => t.name)
      .filter((n) => n !== representative.name);

    entries.push({
      name: `dockershelf/${shelf}:${representative.name}`,
      tag: representative.name,
      versionKey,
      track: deriveTrack(representative.name),
      aliases,
      active: false,
      lastUpdated: representative.last_updated ?? undefined,
    });
  }

  // Sort: active first (version desc), then inactive (version desc).
  entries.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return compareVersionKeys(a.versionKey, b.versionKey);
  });

  return entries;
}

/**
 * Fetch and assemble the full image catalog.
 *
 * Combines the active build matrix from the GitHub Actions workflow with all
 * published tags from Docker Hub, then diffs them to mark active vs inactive.
 * Uses ISR (1h revalidate) on both data sources. Degrades gracefully: if one
 * or both sources fail, returns a partial catalog with an error flag.
 */
export async function fetchImageCatalog(): Promise<ImageCatalog> {
  const [workflowResult, dockerHubResult] = await Promise.all([
    fetchActiveImagesFromWorkflow(),
    fetchAllDockerHubTags(),
  ]);

  const errors: string[] = [];
  if (workflowResult.error) errors.push(workflowResult.error);

  // Group active images by shelf.
  const activeByShelf = new Map<ShelfName, ActiveImage[]>();
  for (const img of workflowResult.images.values()) {
    if (!activeByShelf.has(img.shelf)) {
      activeByShelf.set(img.shelf, []);
    }
    activeByShelf.get(img.shelf)!.push(img);
  }

  const shelves: ShelfCatalog[] = SHELF_ORDER.map((shelf) => {
    const active = activeByShelf.get(shelf) ?? [];
    const dockerHubTags = dockerHubResult.get(shelf) ?? [];
    const images = buildShelfImages(shelf, active, dockerHubTags);
    const activeCount = images.filter((i) => i.active).length;
    const inactiveCount = images.length - activeCount;
    return {
      name: shelf,
      description: SHELF_DESCRIPTIONS[shelf],
      images,
      activeCount,
      inactiveCount,
    };
  });

  return {
    shelves,
    fetchedAt: new Date().toISOString(),
    source: "workflow+dockerhub",
    error: errors.length > 0 ? errors.join(", ") : undefined,
  };
}
