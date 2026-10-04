"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { Track } from "@/lib/types";
import { formatStreams, formatDailyStreams, ageInYears } from "@/lib/format";
import { PreviewButton } from "./PreviewButton";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";

interface TrackTableProps {
  tracks: Track[];
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-teal-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XMarkIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MagnifyingGlassIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function TrackTable({ tracks }: TrackTableProps) {
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showDaily, setShowDaily] = useState(false);
  const [showFullTitles, setShowFullTitles] = useState(false);

  // Preview audio state
  const [playingRank, setPlayingRank] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hover effect pill
  const [hoverEffect, setHoverEffect] = useState({ height: 0, top: 0, opacity: 0 });
  const topOfTableRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const el = topOfTableRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setHasScrolled(!entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Deduplicated genre list
  const genres = useMemo(() => {
    const set = new Set<string>();
    for (const t of tracks) {
      if (t.genre) set.add(t.genre);
    }
    return Array.from(set).sort();
  }, [tracks]);

  // Client-side filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tracks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.artist.toLowerCase().includes(q)) {
        return false;
      }
      if (selectedGenres.length > 0 && (!t.genre || !selectedGenres.includes(t.genre))) {
        return false;
      }
      return true;
    });
  }, [tracks, search, selectedGenres]);

  // Audio preview toggle
  const handlePreviewToggle = useCallback(
    (track: Track) => {
      if (!track.previewUrl) return;

      if (playingRank === track.rank) {
        audioRef.current?.pause();
        setPlayingRank(null);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(track.previewUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      setPlayingRank(track.rank);

      audio.addEventListener("ended", () => {
        setPlayingRank((prev) => (prev === track.rank ? null : prev));
      });
    },
    [playingRank]
  );

  const handleMouseEnterRow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    setHoverEffect({
      top: target.offsetTop,
      height: target.offsetHeight,
      opacity: 1,
    });
  };

  return (
    <section className="flex w-full flex-col px-4 md:px-8 py-6">
      {/* Filter bar matching GitHundred framed with dashed line */}
      <div className="grid w-full grid-cols-1 gap-2.5 pb-6 border-b border-dashed border-zinc-200 sm:grid-cols-2 md:flex md:items-center">
        <Input
          icon={<MagnifyingGlassIcon />}
          placeholder="Search by title or artist"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64"
        />

        <Select
          options={genres}
          value={selectedGenres}
          onChange={setSelectedGenres}
          placeholder="Genres"
          className="w-full md:w-48"
        />

        <Button
          onClick={() => setShowDaily((prev) => !prev)}
          className="w-full md:w-auto"
        >
          {showDaily ? <CheckIcon /> : <XMarkIcon />}
          <span>Show daily streams</span>
        </Button>

        <Button
          onClick={() => setShowFullTitles((prev) => !prev)}
          className="w-full md:w-auto"
        >
          {showFullTitles ? <CheckIcon /> : <XMarkIcon />}
          <span>Show full titles</span>
        </Button>
      </div>

      <div ref={topOfTableRef} className="h-0 w-full" />

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <div className="relative table w-full min-w-[760px] table-fixed">
          {/* Sticky Header */}
          <div
            className={`sticky top-0 z-20 table-header-group bg-slate-50/95 backdrop-blur-xs transition-shadow duration-200 ${
              hasScrolled ? "shadow-[0_1rem_1rem_-1.5rem_#94a3b8]" : ""
            }`}
          >
            <div className="relative table-row text-xs font-semibold text-slate-500 border-b border-slate-200 *:table-cell *:px-3 *:py-4">
              <div className="w-[8%] text-center">Rank</div>
              <div className={showDaily ? "w-[30%]" : "w-[38%]"}>Track</div>
              <div className="w-[14%]">Streams</div>
              {showDaily && <div className="w-[12%]">Daily</div>}
              <div className="w-[18%]">Artist</div>
              <div className="w-[14%]">Genre</div>
              <div className="w-[8%] text-right pr-4">Age</div>
            </div>
          </div>

          {/* Table Body */}
          <div
            className="relative table-row-group"
            onMouseLeave={() => setHoverEffect((prev) => ({ ...prev, opacity: 0 }))}
          >
            {/* Moving hover highlight background */}
            <div
              className="absolute z-[-1] pointer-events-none rounded-lg bg-white shadow-xs transition-all duration-150"
              style={{
                height: `${hoverEffect.height}px`,
                top: `${hoverEffect.top}px`,
                opacity: hoverEffect.opacity,
                width: "100%",
              }}
            />

            {filtered.length === 0 ? (
              <div className="table-row">
                <div className="py-12 text-center text-sm text-slate-400">
                  No songs match your filter.
                </div>
              </div>
            ) : (
              filtered.map((track) => (
                <a
                  key={track.rank}
                  href={track.spotifySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative table-row cursor-alias border-t border-slate-200/70 outline-none transition-colors *:table-cell *:px-3 *:py-3.5 *:align-middle"
                  onMouseEnter={handleMouseEnterRow}
                >
                  {/* Rank circled */}
                  <div>
                    <div className="relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 font-sans text-xs font-medium text-slate-600 group-hover:border-slate-400">
                      {track.rank}
                    </div>
                  </div>

                  {/* Track: preview button + artwork + title */}
                  <div>
                    <div className="flex items-center gap-3">
                      <PreviewButton
                        previewUrl={track.previewUrl}
                        isPlaying={playingRank === track.rank}
                        onToggle={() => handlePreviewToggle(track)}
                      />

                      {track.artworkUrl ? (
                        <Image
                          src={track.artworkUrl}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 shrink-0 rounded object-cover shadow-2xs"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-200 text-slate-400">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}

                      <h3
                        className={`text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors ${
                          showFullTitles ? "whitespace-normal" : "truncate"
                        }`}
                        title={track.title}
                      >
                        {track.title}
                      </h3>
                    </div>
                  </div>

                  {/* Streams */}
                  <div>
                    <span className="font-semibold text-slate-900">
                      {formatStreams(track.streams)}
                    </span>
                  </div>

                  {/* Daily Streams */}
                  {showDaily && (
                    <div>
                      {track.dailyStreams ? (
                        <span className="text-xs font-medium text-emerald-600">
                          {formatDailyStreams(track.dailyStreams)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  )}

                  {/* Artist */}
                  <div>
                    <span className="text-sm text-slate-600 line-clamp-1">
                      {track.artist}
                    </span>
                  </div>

                  {/* Genre */}
                  <div>
                    {track.genre ? (
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {track.genre}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </div>

                  {/* Age */}
                  <div className="text-right pr-4">
                    <span className="text-xs text-slate-400">
                      {track.releaseDate && ageInYears(track.releaseDate) !== null
                        ? `${ageInYears(track.releaseDate)} y.o.`
                        : "—"}
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
