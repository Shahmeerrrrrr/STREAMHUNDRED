import type { Metadata } from "next";
import { getLiveTracks } from "@/lib/tracks-live";
import { Hero } from "@/components/Hero";
import { formatStreams, formatDailyStreams, ageInYears } from "@/lib/format";
import { HighlightsCards, type HighlightCardData } from "@/components/HighlightsCards";
import type { Track } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Highlights • StreamHundred",
  description: "Streaming milestones and records across the top 100 most streamed songs of all time on Spotify.",
};

function computeHighlights(tracks: Track[]): HighlightCardData[] {
  // 1. Most streamed
  const mostStreamed = tracks.reduce((best, t) => (t.streams > best.streams ? t : best), tracks[0]);

  // 2. Oldest
  const withDates = tracks.filter((t) => t.releaseDate);
  const oldest = withDates.reduce(
    (best, t) => ((t.releaseDate ?? "") < (best.releaseDate ?? "") ? t : best),
    withDates[0] || tracks[0]
  );

  // 3. Most recent
  const newest = withDates.reduce(
    (best, t) => ((t.releaseDate ?? "") > (best.releaseDate ?? "") ? t : best),
    withDates[0] || tracks[0]
  );

  // 4. Most streamed artist (combined across all their songs in top 100)
  const artistMap = new Map<string, number>();
  for (const t of tracks) {
    artistMap.set(t.artist, (artistMap.get(t.artist) ?? 0) + t.streams);
  }
  let topArtistName = "";
  let topArtistStreams = 0;
  for (const [artist, streams] of artistMap) {
    if (streams > topArtistStreams) {
      topArtistStreams = streams;
      topArtistName = artist;
    }
  }
  const topArtistTrack = tracks.find((t) => t.artist === topArtistName) || tracks[0];

  // 5. Most streamed decade
  const decadeMap = new Map<string, number>();
  const decadeCounts = new Map<string, number>();
  let totalStreamsWithDate = 0;
  for (const t of withDates) {
    const year = new Date(t.releaseDate!).getFullYear();
    if (!isNaN(year)) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeMap.set(decade, (decadeMap.get(decade) ?? 0) + t.streams);
      decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);
      totalStreamsWithDate += t.streams;
    }
  }
  let topDecade = "2010s";
  let topDecadeStreams = 0;
  for (const [decade, streams] of decadeMap) {
    if (streams > topDecadeStreams) {
      topDecadeStreams = streams;
      topDecade = decade;
    }
  }
  const topDecadeTrack = withDates.find(
    (t) => Math.floor(new Date(t.releaseDate!).getFullYear() / 10) * 10 === 2010
  ) || tracks[0];

  // 6. Biggest daily mover
  const withDaily = tracks.filter((t) => t.dailyStreams !== null);
  const dailyMover = withDaily.reduce(
    (best, t) => ((t.dailyStreams ?? 0) > (best.dailyStreams ?? 0) ? t : best),
    withDaily[0] || tracks[0]
  );

  return [
    {
      id: "most-streamed",
      badge: "ALL-TIME LEADER",
      theme: "warning",
      title: "Most Streamed Song",
      subject: `${mostStreamed.title} • ${mostStreamed.artist}`,
      numericValue: Number((mostStreamed.streams / 1_000_000_000).toFixed(2)),
      decimals: 2,
      suffix: "B",
      unit: "streams",
      value: formatStreams(mostStreamed.streams),
      description: `"${mostStreamed.title}" holds the #1 spot in Spotify history with continuous global momentum.`,
      track: mostStreamed,
      extraStats: [
        { label: "Rank", value: "#1" },
        { label: "Daily", value: mostStreamed.dailyStreams ? formatDailyStreams(mostStreamed.dailyStreams) : "—" },
        { label: "Genre", value: mostStreamed.genre || "Pop" },
      ],
    },
    {
      id: "daily-mover",
      badge: "HIGHEST VELOCITY",
      theme: "secondary",
      title: "Biggest Daily Mover",
      subject: `${dailyMover.title} • ${dailyMover.artist}`,
      numericValue: Number(((dailyMover.dailyStreams || 0) / 1_000_000).toFixed(2)),
      decimals: 2,
      prefix: "+",
      suffix: "M",
      unit: "daily",
      value: dailyMover.dailyStreams ? formatDailyStreams(dailyMover.dailyStreams) : "—",
      description: `Gaining momentum faster than any other all-time track on Spotify today.`,
      track: dailyMover,
      extraStats: [
        { label: "Rank", value: `#${dailyMover.rank}` },
        { label: "Total", value: formatStreams(dailyMover.streams) },
        { label: "Genre", value: dailyMover.genre || "Pop" },
      ],
    },
    {
      id: "oldest",
      badge: "TIME MACHINE",
      theme: "accent",
      title: "Oldest Track",
      subject: `${oldest.title} • ${oldest.artist}`,
      numericValue: oldest.releaseDate ? new Date(oldest.releaseDate).getFullYear() : 1975,
      decimals: 0,
      unit: oldest.releaseDate ? `(${ageInYears(oldest.releaseDate)}y old)` : "Classic",
      value: oldest.releaseDate ? String(new Date(oldest.releaseDate).getFullYear()) : "1975",
      description: `Released in ${oldest.releaseDate ? new Date(oldest.releaseDate).getFullYear() : "1975"}, bridging five decades of music.`,
      track: oldest,
      extraStats: [
        { label: "Rank", value: `#${oldest.rank}` },
        { label: "Total", value: formatStreams(oldest.streams) },
        { label: "Genre", value: oldest.genre || "Rock" },
      ],
    },
    {
      id: "most-recent",
      badge: "FRESH HIT",
      theme: "success",
      title: "Newest Entry",
      subject: `${newest.title} • ${newest.artist}`,
      numericValue: newest.releaseDate ? new Date(newest.releaseDate).getFullYear() : 2024,
      decimals: 0,
      unit: newest.releaseDate ? `(${ageInYears(newest.releaseDate)}y old)` : "Recent",
      value: newest.releaseDate ? String(new Date(newest.releaseDate).getFullYear()) : "2024",
      description: `The most recent release to join the all-time Top 100 hall of fame.`,
      track: newest,
      extraStats: [
        { label: "Rank", value: `#${newest.rank}` },
        { label: "Total", value: formatStreams(newest.streams) },
        { label: "Daily", value: newest.dailyStreams ? formatDailyStreams(newest.dailyStreams) : "—" },
      ],
    },
    {
      id: "top-artist",
      badge: "ARTIST SPOTLIGHT",
      theme: "danger",
      title: "Top Artist",
      subject: `${topArtistName} • Top 100`,
      numericValue: Number((topArtistStreams / 1_000_000_000).toFixed(2)),
      decimals: 2,
      suffix: "B",
      unit: "streams",
      value: formatStreams(topArtistStreams),
      description: `${topArtistName} commands the largest cumulative stream volume in the top 100.`,
      track: topArtistTrack,
      extraStats: [
        { label: "Songs in Top 100", value: `${tracks.filter((t) => t.artist.includes(topArtistName)).length} Tracks` },
        { label: "Top Hit", value: topArtistTrack.title },
        { label: "Total", value: formatStreams(topArtistStreams) },
      ],
    },
    {
      id: "top-decade",
      badge: "GOLDEN ERA",
      theme: "info",
      title: "Top Decade",
      subject: `${topDecade} Era`,
      numericValue: Number((topDecadeStreams / 1_000_000_000).toFixed(1)),
      decimals: 1,
      suffix: "B",
      unit: "streams",
      value: formatStreams(topDecadeStreams),
      description: `The decade with the largest combined streaming presence on Spotify.`,
      track: topDecadeTrack,
      extraStats: [
        { label: "Track Count", value: `${decadeCounts.get(topDecade) || 0} songs` },
        { label: "Share", value: `${Math.round((topDecadeStreams / (totalStreamsWithDate || 1)) * 100)}%` },
      ],
    },
  ];
}

export default async function HighlightsPage() {
  const { tracks, lastUpdated, source } = await getLiveTracks();
  const cards = computeHighlights(tracks);

  return (
    <>
      <Hero lastUpdated={lastUpdated} source={source} active="highlights" />
      <HighlightsCards cards={cards} />
    </>
  );
}
