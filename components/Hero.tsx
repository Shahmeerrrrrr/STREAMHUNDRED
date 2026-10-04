"use client";

import { Sticker } from "./Sticker";
import { SegmentedControl } from "./SegmentedControl";
import { formatRelativeTime } from "@/lib/format";

interface HeroProps {
  lastUpdated: string;
  source: "kworb-live" | "wikipedia-live" | "cache-stale";
  active: "list" | "highlights";
}

function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "h-4 w-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

export function Hero({ lastUpdated, source, active }: HeroProps) {
  const relativeTime = formatRelativeTime(lastUpdated);

  return (
    <div className="flex w-full flex-col items-center gap-8 md:gap-10 border-b border-dashed border-zinc-300 py-10 md:py-12 px-4 relative">
      {/* Title & Stickers Container */}
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 px-4">
        {/* Spotify sticker framing top-right of title (only 2 stickers on hero section now)
        <Sticker
          url="/svgs/spotify-sticker.svg"
          rotate="14deg"
          className="!absolute -top-3 right-0 md:-top-5 md:-right-8 max-md:scale-[75%] z-10 animate-float-b"
        /> */}

        <h1 className="text-center font-serif text-5xl italic font-normal text-slate-900 md:text-6xl tracking-tight leading-[1.2]">
          <strong>
            <span className="inline-block">
              Top{" "}
              <span className="relative inline-block mx-1.5 align-baseline">
                <span className="invisible select-none">100</span>
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Sticker
                    url="/svgs/100-sticker.svg"
                    className="-top-2 scale-[1.25] md:scale-[1.35] z-10 animate-float-a"
                  />
                </span>
              </span>{" "}
              most <span className="">streamed</span>
            </span>{" "}
            <span className="inline-block">songs of all time</span>
          </strong>
        </h1>

        {/* Freshness stamp */}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <ArrowPathIcon className="h-4 w-4" />
          <p>
            Last updated {relativeTime} · via{" "}
            {source === "kworb-live" ? (
              <a
                href="https://kworb.net/spotify/songs.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-800"
              >
                kworb
              </a>
            ) : source === "wikipedia-live" ? (
              <a
                href="https://en.wikipedia.org/wiki/List_of_Spotify_streaming_records"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-800"
              >
                Wikipedia
              </a>
            ) : (
              <span>cached backup</span>
            )}
            {source === "cache-stale" && (
              <span className="ml-1.5 font-medium text-amber-600">
                (showing cached data)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Segmented Control */}
      <SegmentedControl active={active} />
    </div>
  );
}
