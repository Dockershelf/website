/**
 * Types for the Dockershelf image catalog.
 *
 * The catalog is built at request time (ISR, 1h revalidate) by combining:
 *  - the active build matrix from the GitHub Actions workflow (schedule-master.yml)
 *  - all published tags from the Docker Hub API for each shelf repo
 *
 * Images present in the workflow are `active: true`; images that exist on Docker
 * Hub but are no longer in the workflow are `active: false` (inactive / retired).
 */

/** The five Dockershelf shelf repos on Docker Hub. */
export type ShelfName = "debian" | "latex" | "python" | "node" | "go";

/** Build track derived from the image tag suffix. */
export type Track =
  "stable" | "unstable" | "basic" | "full" | "extras" | "other";

/** A single Docker image entry (one version of a shelf). */
export type ImageEntry = {
  /** Primary image reference, e.g. "dockershelf/python:3.13-trixie". */
  name: string;
  /** Short tag without the shelf prefix, e.g. "3.13-trixie". */
  tag: string;
  /** Version key used for grouping aliases, e.g. "3.13". */
  versionKey: string;
  track: Track;
  /** Additional tags that point to the same image, e.g. ["3.13-stable"]. */
  aliases: string[];
  /** True when the image is in the current weekly build workflow. */
  active: boolean;
  /** ISO timestamp of the last push to Docker Hub (inactive images only). */
  lastUpdated?: string;
};

/** Catalog for a single shelf. */
export type ShelfCatalog = {
  name: ShelfName;
  description: string;
  images: ImageEntry[];
  activeCount: number;
  inactiveCount: number;
};

/** Top-level catalog returned by fetchImageCatalog(). */
export type ImageCatalog = {
  shelves: ShelfCatalog[];
  /** ISO timestamp of when the catalog was assembled. */
  fetchedAt: string;
  source: "workflow+dockerhub";
  /** Set when a data source was unreachable; shelves may be partial/empty. */
  error?: string;
};

/** Internal: an active image parsed from the workflow matrix. */
export type ActiveImage = {
  /** Full image name, e.g. "dockershelf/python:3.13-trixie". */
  fullName: string;
  shelf: ShelfName;
  tag: string;
  versionKey: string;
  track: Track;
  /** Raw alias tags from docker-image-extra-tags (space-separated in YAML). */
  aliases: string[];
};

/** Internal: a tag row from the Docker Hub API. */
export type DockerHubTag = {
  name: string;
  last_updated: string | null;
};
