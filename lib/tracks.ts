// Loads track and meta data from the committed JSON files.
// Used by server components; pages call these and pass data to client components.

import type { Track, Meta } from "./types";

// Fallback meta when data/meta.json doesn't exist yet (first deploy before cron runs).
const FALLBACK_META: Meta = {
  lastUpdated: new Date(0).toISOString(),
  source: "kworb",
};

// Fallback track list: empty array — the UI handles the empty-state gracefully.
const FALLBACK_TRACKS: Track[] = [];

export async function loadTracks(): Promise<Track[]> {
  try {
    // Dynamic import works at build-time and runtime in Next.js App Router.
    const data = await import("../data/tracks.json");
    return data.default as Track[];
  } catch {
    // data/tracks.json doesn't exist yet (before first cron run).
    return FALLBACK_TRACKS;
  }
}

export async function loadMeta(): Promise<Meta> {
  try {
    const data = await import("../data/meta.json");
    return data.default as Meta;
  } catch {
    return FALLBACK_META;
  }
}
