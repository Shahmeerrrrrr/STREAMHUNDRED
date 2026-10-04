import fs from "node:fs";
import path from "node:path";
import { Track, TracksResponse } from "./types";

// Server-only live fetch layer for StreamHundred.
// Fetches real-time rankings on every request window (revalidated hourly).
// Never renders a committed JSON file as the primary source.

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

function parseCount(str?: string | null): number | null {
  if (!str) return null;
  const cleaned = str.replace(/,/g, "").trim();
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

function spotifySearchUrl(title: string, artist: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
}

function normalizeKey(title: string, artist: string): string {
  return `${title.toLowerCase().trim()}|${artist.toLowerCase().trim()}`;
}

type Enrichment = {
  artworkUrl: string | null;
  previewUrl: string | null;
  releaseDate: string | null;
  genre: string | null;
};

function loadEnrichmentCache(): Record<string, Enrichment> {
  try {
    const cachePath = path.join(process.cwd(), "data", "enrichment-cache.json");
    if (fs.existsSync(cachePath)) {
      const raw = fs.readFileSync(cachePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to load enrichment-cache.json:", err);
  }
  return {};
}

function loadFallbackTracks(): { tracks: Track[]; lastUpdated: string } {
  try {
    const tracksPath = path.join(process.cwd(), "data", "tracks.json");
    const metaPath = path.join(process.cwd(), "data", "meta.json");
    if (fs.existsSync(tracksPath)) {
      const tracks: Track[] = JSON.parse(fs.readFileSync(tracksPath, "utf-8"));
      let lastUpdated = new Date().toISOString();
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
          if (meta.lastUpdated) lastUpdated = meta.lastUpdated;
        } catch {}
      }
      return { tracks, lastUpdated };
    }
  } catch (err) {
    console.error("Failed to load emergency fallback tracks.json:", err);
  }
  return { tracks: [], lastUpdated: new Date().toISOString() };
}

async function fetchLiveItunes(title: string, artist: string): Promise<Enrichment | null> {
  try {
    const term = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const results = data?.results;
    if (!results || results.length === 0) return null;

    const lowerTitle = title.toLowerCase();
    const lowerArtist = artist.toLowerCase();

    const match =
      results.find(
        (r: { trackName?: string; artistName?: string }) =>
          r.trackName?.toLowerCase().includes(lowerTitle) ||
          lowerTitle.includes(r.trackName?.toLowerCase() ?? "")
      ) ?? results[0];

    const artworkUrl = match.artworkUrl100
      ? match.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg")
      : null;

    return {
      artworkUrl: artworkUrl || null,
      previewUrl: match.previewUrl || null,
      releaseDate: match.releaseDate || null,
      genre: match.primaryGenreName || null,
    };
  } catch {
    return null;
  }
}

async function fetchKworbLive(): Promise<{ artist: string; title: string; streams: number; dailyStreams: number | null }[]> {
  const res = await fetch("https://kworb.net/spotify/songs.html", {
    headers: { "User-Agent": "StreamHundred/1.0" },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`kworb status: ${res.status}`);
  const html = await res.text();

  const rows: { artist: string; title: string; streams: number; dailyStreams: number | null }[] = [];
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }

    if (cells.length < 2) continue;

    const combined = cells[0];
    const streams = parseCount(cells[1]);
    if (!streams || streams < 100_000_000) continue;

    const sepIdx = combined.indexOf(" - ");
    if (sepIdx === -1) continue;

    const artist = combined.slice(0, sepIdx).trim();
    const title = combined.slice(sepIdx + 3).trim();
    const dailyStreams = parseCount(cells[2] ?? "");

    rows.push({ artist, title, streams, dailyStreams });
  }

  if (rows.length < 20) {
    throw new Error(`kworb returned too few rows: ${rows.length}`);
  }

  return rows.slice(0, 100);
}

async function fetchWikipediaLive(): Promise<{ artist: string; title: string; streams: number; dailyStreams: number | null }[]> {
  const url =
    "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_most-streamed_songs_on_Spotify&prop=text&format=json&redirects=1";
  const res = await fetch(url, {
    headers: { "User-Agent": "StreamHundred/1.0" },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Wikipedia status: ${res.status}`);
  const json = await res.json();
  const html = json?.parse?.text?.["*"] ?? "";

  const rows: { artist: string; title: string; streams: number; dailyStreams: number | null }[] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]).replace(/\[.*?\]/g, "").trim());
    }

    // Wikipedia table: Rank | Song | Artist(s) | Streams (billions) | Year
    if (cells.length < 4) continue;
    const rank = parseInt(cells[0], 10);
    if (isNaN(rank) || rank < 1 || rank > 200) continue;

    let title = cells[1].replace(/^["']|["']$/g, "").trim();
    const artist = cells[2];
    const streamsRaw = cells[3].replace(/[^\d.]/g, "");
    const streams = Math.round(parseFloat(streamsRaw) * 1_000_000_000);
    if (!streams || isNaN(streams)) continue;

    rows.push({ artist, title, streams, dailyStreams: null });
  }

  if (rows.length < 10) {
    throw new Error(`Wikipedia parsed too few rows: ${rows.length}`);
  }

  return rows.slice(0, 100);
}

/**
 * getLiveTracks: Server-only function.
 * Fetches real-time ranking data directly at request time.
 * Fallback chain: kworb-live -> wikipedia-live -> cache-stale.
 */
export async function getLiveTracks(): Promise<TracksResponse> {
  const enrichmentCache = loadEnrichmentCache();
  let liveRows: { artist: string; title: string; streams: number; dailyStreams: number | null }[] | null = null;
  let source: "kworb-live" | "wikipedia-live" | "cache-stale" = "kworb-live";

  // 1. Try Kworb Live
  try {
    liveRows = await fetchKworbLive();
    source = "kworb-live";
  } catch (kworbErr) {
    console.warn("kworb-live failed, trying wikipedia-live:", kworbErr);
    // 2. Try Wikipedia Live fallback
    try {
      liveRows = await fetchWikipediaLive();
      source = "wikipedia-live";
    } catch (wikiErr) {
      console.warn("wikipedia-live failed, falling back to cached tracks.json:", wikiErr);
      // 3. Fallback to committed data/tracks.json
      const fallback = loadFallbackTracks();
      return {
        tracks: fallback.tracks,
        lastUpdated: fallback.lastUpdated,
        source: "cache-stale",
      };
    }
  }

  // Merge live ranking with cached enrichment
  let liveItunesCalls = 0;
  const maxLiveItunesCalls = 10;

  const tracks: Track[] = [];
  for (let i = 0; i < liveRows.length; i++) {
    const row = liveRows[i];
    const rank = i + 1;
    const key = normalizeKey(row.title, row.artist);
    let enrichment = enrichmentCache[key];

    // If missing, try fuzzy matching on title and artist
    if (!enrichment) {
      const cleanTitle = row.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanArtist = row.artist.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const [cacheKey, val] of Object.entries(enrichmentCache)) {
        const [cTitle, cArtist] = cacheKey.split("|");
        const cleanCTitle = cTitle?.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanCArtist = cArtist?.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (
          cleanCTitle === cleanTitle &&
          (cleanCArtist?.includes(cleanArtist) || cleanArtist?.includes(cleanCArtist || ""))
        ) {
          enrichment = val;
          enrichmentCache[key] = val;
          break;
        }
      }
    }

    // If still missing from cache, attempt live iTunes lookup
    if (!enrichment && liveItunesCalls < maxLiveItunesCalls) {
      liveItunesCalls++;
      const liveEnrich = await fetchLiveItunes(row.title, row.artist);
      if (liveEnrich) {
        enrichment = liveEnrich;
        enrichmentCache[key] = liveEnrich; // keep in memory
        try {
          const cachePath = path.join(process.cwd(), "data", "enrichment-cache.json");
          fs.writeFileSync(cachePath, JSON.stringify(enrichmentCache, null, 2));
        } catch {}
      }
    }

    tracks.push({
      rank,
      title: row.title,
      artist: row.artist,
      streams: row.streams,
      dailyStreams: row.dailyStreams,
      artworkUrl: enrichment?.artworkUrl ?? null,
      previewUrl: enrichment?.previewUrl ?? null,
      releaseDate: enrichment?.releaseDate ?? null,
      genre: enrichment?.genre ?? null,
      spotifySearchUrl: spotifySearchUrl(row.title, row.artist),
    });
  }

  return {
    tracks,
    lastUpdated: new Date().toISOString(),
    source,
  };
}
