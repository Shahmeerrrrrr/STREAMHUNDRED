import type { Metadata } from "next";
import { getLiveTracks } from "@/lib/tracks-live";
import { Hero } from "@/components/Hero";
import { TrackTable } from "@/components/TrackTable";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "StreamHundred • Top 100 most streamed songs",
  description:
    "Explore the world's top 100 most streamed songs of all time on Spotify with real-time ranking data and 30-second previews.",
};

export default async function ListPage() {
  const { tracks, lastUpdated, source } = await getLiveTracks();

  return (
    <>
      <Hero lastUpdated={lastUpdated} source={source} active="list" />
      <TrackTable tracks={tracks} />
    </>
  );
}
