import FriendlyDate from "@components/Blog/FriendlyDate";

import type { ImageEntry, ShelfName } from "@lib/images/types";

/** Track label mapping for display. */
const TRACK_LABELS: Record<string, string> = {
  stable: "Stable",
  unstable: "Unstable",
  basic: "Basic",
  full: "Full",
  extras: "Extras",
  other: "",
};

/** Capitalize a shelf name for display. */
function shelfTitle(shelf: ShelfName): string {
  return shelf.charAt(0).toUpperCase() + shelf.slice(1);
}

/** Render a single image entry as a list item. */
function ImageEntryRow({ entry }: { entry: ImageEntry }) {
  return (
    <li className="flex flex-col gap-1 py-2 border-b border-black/5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <code className="font-mono text-base text-gray-1">{entry.name}</code>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            entry.active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              entry.active ? "bg-green-600" : "bg-gray-400"
            }`}
          />
          {entry.active ? "Active" : "Inactive"}
        </span>
        {entry.track !== "other" && TRACK_LABELS[entry.track] ? (
          <span className="text-xs text-black/50">
            {TRACK_LABELS[entry.track]}
          </span>
        ) : null}
      </div>
      {entry.aliases.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pl-1">
          {entry.aliases.map((alias) => (
            <code
              key={alias}
              className="font-mono text-xs text-black/50 bg-black/5 rounded px-1.5 py-0.5"
            >
              {alias}
            </code>
          ))}
        </div>
      ) : null}
      {!entry.active && entry.lastUpdated ? (
        <p className="text-xs text-black/40 pl-1">
          Last pushed <FriendlyDate dateString={entry.lastUpdated} />
        </p>
      ) : null}
    </li>
  );
}

/** Render a single shelf section with its image list. */
export function ShelfSection({
  shelf,
  description,
  images,
  activeCount,
  inactiveCount,
}: {
  shelf: ShelfName;
  description: string;
  images: ImageEntry[];
  activeCount: number;
  inactiveCount: number;
}) {
  if (images.length === 0) return null;

  return (
    <article className="mb-8">
      <h3 className="font-main font-normal text-xl leading-8 text-gray-1 mb-1 lg:font-light lg:text-lg">
        {shelfTitle(shelf)}
      </h3>
      <p className="text-base font-light text-black/60 mb-1">{description}</p>
      <p className="text-sm text-black/50 mb-3">
        {activeCount} active
        {inactiveCount > 0 ? ` · ${inactiveCount} inactive` : ""}
      </p>
      <ul className="divide-y divide-black/5">
        {images.map((entry) => (
          <ImageEntryRow key={entry.name} entry={entry} />
        ))}
      </ul>
    </article>
  );
}
