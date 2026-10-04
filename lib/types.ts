// Shape of a single track in StreamHundred
export type Track = {
  rank: number;
  title: string;
  artist: string;
  streams: number;
  dailyStreams: number | null;
  artworkUrl: string | null;
  previewUrl: string | null;
  releaseDate: string | null;
  genre: string | null;
  spotifySearchUrl: string; // https://open.spotify.com/search/<encoded "song artist">
};

// Response from getLiveTracks() and /api/tracks
export type TracksResponse = {
  tracks: Track[];
  lastUpdated: string; // ISO timestamp
  source: "kworb-live" | "wikipedia-live" | "cache-stale";
};

export type Meta = {
  lastUpdated: string;
  source: string;
};
