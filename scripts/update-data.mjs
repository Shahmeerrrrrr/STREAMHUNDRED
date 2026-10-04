#!/usr/bin/env node
// scripts/update-data.mjs
//
// Daily data refresh: fetches top-100 stream counts from kworb.net (fallback:
// Wikipedia MediaWiki API), then enriches each track via the iTunes Search API
// (free, no key), and writes data/tracks.json + data/meta.json.
//
// Run manually:  node scripts/update-data.mjs
// Automated:     .github/workflows/update-data.yml (cron 06:00 UTC daily)

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

// Polite delay between iTunes requests to avoid rate-limiting.
const ITUNES_DELAY_MS = 250;

// ─── helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch with a timeout so the script never hangs indefinitely. */
async function fetchWithTimeout(url, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** Build the "open in Spotify" search URL (no API key required). */
function spotifySearchUrl(title, artist) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
}

/** Parse a raw stream-count string like "5,610,198,940" into a number. */
function parseCount(str) {
  if (!str) return null;
  const cleaned = str.replace(/,/g, "").trim();
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

/** Strip all HTML tags from a string. */
function stripTags(s) {
  return s.replace(/<[^>]+>/g, "").trim();
}

// ─── Step 1: fetch & parse kworb ────────────────────────────────────────────
// kworb table columns: Artist and Title | Streams | Daily
// Each data row looks like:
//   <tr><td class="text"><div>Artist - Title</div></td><td>5,614,652,279</td><td>1,532,605</td></tr>

async function fetchFromKworb() {
  console.log("Fetching kworb.net/spotify/songs.html …");
  const res = await fetchWithTimeout("https://kworb.net/spotify/songs.html");
  if (!res.ok) throw new Error(`kworb HTTP ${res.status}`);
  const html = await res.text();

  const rows = [];
  // Match each <tr> block.
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    // Extract all <td> cell contents.
    const cells = [];
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }

    // We need exactly 3 cells: [Artist - Title, Streams, Daily]
    if (cells.length < 2) continue;

    const combined = cells[0];
    // Streams column: must look like a big number.
    const streams = parseCount(cells[1]);
    if (!streams || streams < 100_000_000) continue;

    // Split "Artist - Title" — the separator is " - " (space-dash-space).
    const sepIdx = combined.indexOf(" - ");
    if (sepIdx === -1) continue; // skip rows without a separator

    const artist = combined.slice(0, sepIdx).trim();
    const title = combined.slice(sepIdx + 3).trim();
    const dailyStreams = parseCount(cells[2] ?? "");

    rows.push({ artist, title, streams, dailyStreams });
  }

  if (rows.length < 20) {
    throw new Error(`kworb parse yielded only ${rows.length} rows — suspicious`);
  }

  console.log(`  Parsed ${rows.length} tracks from kworb.`);
  return rows.slice(0, 100);
}

// ─── Step 2: Wikipedia fallback ──────────────────────────────────────────────

async function fetchFromWikipedia() {
  console.log("Falling back to Wikipedia MediaWiki API …");
  const apiUrl =
    "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_most-streamed_songs_on_Spotify&prop=text&format=json&origin=*&redirects=1";
  const res = await fetchWithTimeout(apiUrl);
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`);
  const json = await res.json();
  const html = json?.parse?.text?.["*"] ?? "";

  const rows = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = [];
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]).replace(/\[.*?\]/g, "").trim());
    }
    // Wikipedia table: Rank | Song | Artist(s) | Streams (billions) | Year
    if (cells.length < 4) continue;
    const rank = parseInt(cells[0], 10);
    if (isNaN(rank) || rank < 1 || rank > 200) continue;
    const title = cells[1];
    const artist = cells[2];
    // Streams expressed as "X.XX" (billions) — convert to integer.
    const streamsRaw = cells[3].replace(/[^\d.]/g, "");
    const streams = Math.round(parseFloat(streamsRaw) * 1_000_000_000);
    if (!streams || isNaN(streams)) continue;
    rows.push({ artist, title, streams, dailyStreams: null });
  }

  if (rows.length < 10) throw new Error("Wikipedia parse yielded too few rows");
  console.log(`  Parsed ${rows.length} tracks from Wikipedia.`);
  return rows.slice(0, 100);
}

// ─── Step 3: iTunes enrichment ───────────────────────────────────────────────

async function enrichViaItunes(artist, title) {
  const term = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`;
  try {
    const res = await fetchWithTimeout(url, 10_000);
    if (!res.ok) return null;
    const json = await res.json();
    const results = json?.results ?? [];
    if (results.length === 0) return null;

    // Score results: prefer exact artist+title match.
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normTitle = normalize(title);
    const normArtist = normalize(artist);

    let best = results[0];
    let bestScore = 0;
    for (const r of results) {
      let score = 0;
      if (normalize(r.trackName ?? "").includes(normTitle)) score += 2;
      if (normalize(r.artistName ?? "").includes(normArtist)) score += 2;
      if (score > bestScore) {
        bestScore = score;
        best = r;
      }
    }

    const raw = best.artworkUrl100 ?? null;
    return {
      artworkUrl: raw ? raw.replace("100x100", "600x600") : null,
      previewUrl: best.previewUrl ?? null,
      releaseDate: best.releaseDate ?? null,
      genre: best.primaryGenreName ?? null,
    };
  } catch {
    return null;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  let rawTracks;
  let source;

  try {
    rawTracks = await fetchFromKworb();
    source = "kworb";
  } catch (err) {
    console.warn("kworb failed:", err.message);
    rawTracks = await fetchFromWikipedia();
    source = "wikipedia";
  }

  const tracks = [];
  console.log(`Enriching ${rawTracks.length} tracks via iTunes Search API …`);

  for (let i = 0; i < rawTracks.length; i++) {
    const raw = rawTracks[i];
    const rank = i + 1;
    process.stdout.write(`  [${rank}/100] ${raw.artist} - ${raw.title} … `);

    const itunes = await enrichViaItunes(raw.artist, raw.title);
    process.stdout.write(itunes ? "ok\n" : "no match\n");

    tracks.push({
      rank,
      title: raw.title,
      artist: raw.artist,
      streams: raw.streams,
      dailyStreams: raw.dailyStreams,
      artworkUrl: itunes?.artworkUrl ?? null,
      previewUrl: itunes?.previewUrl ?? null,
      releaseDate: itunes?.releaseDate ?? null,
      genre: itunes?.genre ?? null,
      spotifySearchUrl: spotifySearchUrl(raw.title, raw.artist),
    });

    // Polite delay between requests.
    if (i < rawTracks.length - 1) await sleep(ITUNES_DELAY_MS);
  }

  // Build enrichment cache map keyed by "title|artist"
  const enrichmentCache = {};
  for (const t of tracks) {
    const key = `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`;
    if (t.artworkUrl || t.previewUrl || t.releaseDate || t.genre) {
      enrichmentCache[key] = {
        artworkUrl: t.artworkUrl,
        previewUrl: t.previewUrl,
        releaseDate: t.releaseDate,
        genre: t.genre,
      };
    }
  }

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(
    join(DATA_DIR, "enrichment-cache.json"),
    JSON.stringify(enrichmentCache, null, 2)
  );
  writeFileSync(join(DATA_DIR, "tracks.json"), JSON.stringify(tracks, null, 2));
  writeFileSync(
    join(DATA_DIR, "meta.json"),
    JSON.stringify({ lastUpdated: new Date().toISOString(), source }, null, 2)
  );

  console.log(`\nDone. Wrote data/enrichment-cache.json (${Object.keys(enrichmentCache).length} entries), data/tracks.json (${tracks.length} tracks), and data/meta.json.`);
  console.log(`Source: ${source}. Last updated: ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
