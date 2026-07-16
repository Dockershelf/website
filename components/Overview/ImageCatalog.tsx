import { ShelfSection } from "@components/Overview/ShelfSection";

import type { ImageCatalog as ImageCatalogType } from "@lib/images/types";

/** Format the fetchedAt ISO timestamp into a readable local string. */
function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

/**
 * Render the full image catalog on the overview page.
 * Shows a graceful message when live data is unavailable.
 */
export function ImageCatalog({ catalog }: { catalog: ImageCatalogType }) {
  const hasShelves = catalog.shelves.some((s) => s.images.length > 0);
  const totalActive = catalog.shelves.reduce(
    (sum, s) => sum + s.activeCount,
    0
  );
  const totalInactive = catalog.shelves.reduce(
    (sum, s) => sum + s.inactiveCount,
    0
  );

  return (
    <section aria-labelledby="overview-images-heading" className="mt-12">
      <h2
        id="overview-images-heading"
        className="font-main font-normal text-justify mt-10 mb-4 mx-auto w-full text-2xl leading-9 text-gray-1 lg:font-light lg:w-175 lg:text-3xl lg:leading-10"
      >
        Available images
      </h2>

      <div className="my-4 mx-auto w-full lg:w-175">
        {!hasShelves && catalog.error ? (
          <p className="text-xl font-light leading-relaxed text-black/60">
            Live image data is temporarily unavailable. The catalog refreshes
            hourly from GitHub Actions and Docker Hub — please check back
            shortly.
          </p>
        ) : (
          <>
            <p className="text-base font-light text-black/55 mb-6">
              {totalActive} active image
              {totalActive !== 1 ? "s" : ""}
              {totalInactive > 0
                ? ` · ${totalInactive} inactive (no longer receiving updates)`
                : ""}{" "}
              · Last updated {formatTimestamp(catalog.fetchedAt)}
            </p>
            {catalog.error ? (
              <p className="text-sm text-black/40 mb-4">
                Note: some data sources were unavailable ({catalog.error}).
                Showing partial results.
              </p>
            ) : null}
            <div className="space-y-2">
              {catalog.shelves.map((shelf) => (
                <ShelfSection
                  key={shelf.name}
                  shelf={shelf.name}
                  description={shelf.description}
                  images={shelf.images}
                  activeCount={shelf.activeCount}
                  inactiveCount={shelf.inactiveCount}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
