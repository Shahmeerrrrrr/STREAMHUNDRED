"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Track } from "@/lib/types";
import { Sticker } from "./Sticker";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Play, Pause, X } from "lucide-react";

export const THEMES = {
  warning: "from-amber-500 via-amber-600 to-amber-800",
  secondary: "from-blue-600 via-blue-700 to-blue-800",
  accent: "from-purple-600 via-purple-700 to-purple-800",
  success: "from-emerald-600 via-emerald-700 to-emerald-800",
  danger: "from-rose-600 via-rose-700 to-red-800",
  info: "from-cyan-600 via-cyan-700 to-cyan-800",
  primary: "from-slate-700 via-slate-800 to-slate-900",
  neutral: "from-gray-600 via-gray-700 to-gray-800",
} as const;

export type ThemeType = keyof typeof THEMES;

export type HighlightCardData = {
  id: string;
  badge: string;
  theme?: ThemeType;
  title: string;
  subject: string;
  numericValue: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  unit: string | null;
  value?: string;
  description: string;
  track?: Track | null;
  extraStats?: { label: string; value: string }[];
};

interface HighlightsCardsProps {
  cards: HighlightCardData[];
}

interface MousePos {
  readonly x: number;
  readonly y: number;
}

// 3D Card Item Component
interface Card3DItemProps {
  card: HighlightCardData;
  onClick: () => void;
}

const Card3DItem: React.FC<Card3DItemProps> = ({ card, onClick }) => {
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  const themeKey = card.theme || "secondary";
  const gradient = THEMES[themeKey] || THEMES.secondary;

  useEffect(() => {
    // Animate counter roll on mount
    const timeout = setTimeout(() => {
      setDisplayValue(card.numericValue);
    }, 100);
    return () => clearTimeout(timeout);
  }, [card.numericValue]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({
      x: (x / rect.width - 0.5) * 20,
      y: (y / rect.height - 0.5) * -20,
    });
  }, []);

  const handleEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(false);
    setMousePos({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      className={cn(
        "group relative w-full h-80 overflow-hidden rounded-2xl transform-gpu transition-all duration-300 ease-out cursor-pointer select-none",
        "shadow-lg hover:shadow-2xl border border-white/20"
      )}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      animate={{
        rotateX: mousePos.y,
        rotateY: mousePos.x,
        z: hovered ? 25 : 0,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
      whileTap={{
        scale: 0.98,
        rotateX: mousePos.y + 1,
        rotateY: mousePos.x + 1,
      }}
      onClick={onClick}
      style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
      role="button"
      tabIndex={0}
      aria-label={`View record details for ${card.title}`}
    >
      {/* Background Gradient matching Theme & Artwork Soft Underlay */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br",
          gradient
        )}
        animate={{ scale: hovered ? 1.03 : 1 }}
        transition={{ duration: 0.4 }}
        style={{ transform: "translateZ(-10px)" }}
      >
        {card.track?.artworkUrl && (
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <Image
              src={card.track.artworkUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </motion.div>

      {/* Subtle Dot Grid Accent */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`dot-grid-${card.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#FFFFFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dot-grid-${card.id})`} />
        </svg>
      </div>

      {/* Dark Vignette Overlay for Crisp Contrast */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.5) 100%)`,
          transform: "translateZ(5px)",
        }}
        animate={{ opacity: hovered ? 0.5 : 0.7 }}
        transition={{ duration: 0.3 }}
      />

      {/* Specular Light Glare following Mouse */}
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        style={{ transform: "translateZ(15px)" }}
      >
        <motion.div
          className="absolute -inset-full"
          style={{
            background: `linear-gradient(${mousePos.x + 135}deg, transparent 38%, rgba(255,255,255,0.24) 50%, transparent 62%)`,
          }}
          animate={{
            opacity: hovered ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Foreground Content with 3D Depth */}
      <motion.div
        className="relative z-20 flex h-full flex-col justify-between p-6 text-white"
        style={{ transform: "translateZ(20px)" }}
      >
        {/* Top Header: Badge + Pulsing Dot (No Icons) */}
        <div className="flex justify-between items-center">
          <span className="rounded-full bg-black/30 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-white/95 backdrop-blur-md border border-white/15 shadow-xs">
            {card.badge}
          </span>

          <div className="relative flex items-center justify-center h-4 w-4">
            <div className="h-2 w-2 rounded-full bg-white/80" />
            <motion.div
              className="absolute inset-0 rounded-full bg-white/80"
              animate={{
                scale: hovered ? [1, 1.8, 1] : 1,
                opacity: hovered ? [0.8, 0, 0.8] : 0.3,
              }}
              transition={{
                duration: 1.6,
                repeat: hovered ? Infinity : 0,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* Center: NumberTicker + Punchy Title (Clean & Less Texty) */}
        <div className="space-y-2 my-auto py-1">
          <motion.div
            animate={{ scale: hovered ? 1.02 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <NumberTicker
              value={displayValue}
              prefix={card.prefix}
              suffix={card.suffix}
              decimals={card.decimals ?? 0}
              showDot={false}
              label={card.unit || undefined}
              numberClassName="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md text-white"
              labelClassName="text-xs font-semibold text-white/80"
            />
          </motion.div>

          <div>
            <h3 className="text-base font-bold text-white leading-snug drop-shadow-xs">
              {card.title}
            </h3>
            <p className="text-xs text-white/80 line-clamp-1 mt-0.5 font-medium">
              {card.subject}
            </p>
          </div>
        </div>

        {/* Bottom Bar: Mini Track Preview & Clean CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="flex items-center gap-2 truncate max-w-[70%]">
            {card.track?.artworkUrl && (
              <Image
                src={card.track.artworkUrl}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-md object-cover border border-white/20 shrink-0"
                unoptimized
              />
            )}
            <span className="text-xs text-white/90 truncate font-medium">
              {card.track?.artist || card.badge}
            </span>
          </div>

          <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
            Details
          </span>
        </div>
      </motion.div>

      {/* Specular Edge Border Overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.1) 100%)`,
          transform: "translateZ(25px)",
        }}
        animate={{ opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export function HighlightsCards({ cards }: HighlightsCardsProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalAnimatedValue, setModalAnimatedValue] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeCard = cards.find((c) => c.id === activeCardId) || null;
  const activeThemeKey = (activeCard?.theme || "secondary") as ThemeType;
  const activeGradient = THEMES[activeThemeKey] || THEMES.secondary;

  // Animate modal NumberTicker when active card changes
  useEffect(() => {
    if (activeCard) {
      setModalAnimatedValue(0);
      const timer = setTimeout(() => {
        setModalAnimatedValue(activeCard.numericValue);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeCard]);

  // ESC key listener to dismiss modal
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
    }
    if (activeCardId) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeCardId]);

  const closeModal = () => {
    setActiveCardId(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
  };

  const handlePlayToggle = (previewUrl?: string | null) => {
    if (!previewUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setIsPlaying(true);

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });
  };

  return (
    <div className="flex w-full flex-col px-4 md:px-8 py-8">
      {/* Highlights Section Header */}
      <div className="relative flex w-full items-center justify-between border-b border-dashed border-zinc-300 pb-8 mb-8">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2">
            {/* <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Record Hall
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Spotify All-Time Milestones
            </span> */}
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl tracking-tight">
            Streaming Highlights
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Click any milestone card to open track details, live audio previews, and stream stats.
          </p>
        </div>

        {/* Star Sticker */}
        <div className="relative hidden sm:block shrink-0">
          <Sticker
            url="/svgs/spotify-sticker.svg"
            rotate="12deg"
            className="scale-90 md:scale-100 z-10 animate-float-a"
          />
        </div>
      </div>

      {/* Responsive 3D Cards Grid */}
      <div
        className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
      >
        {cards.map((card) => (
          <Card3DItem
            key={card.id}
            card={card}
            onClick={() => {
              setActiveCardId(card.id);
              setIsPlaying(false);
            }}
          />
        ))}
      </div>

      {/* Expanded Modal with SAME Card Gradient Background & NumberTicker */}
      <AnimatePresence>
        {activeCard && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={cn(
                "relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 border border-white/25",
                "bg-gradient-to-br",
                activeGradient
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle Album Artwork Blur Underlay */}
              {activeCard.track?.artworkUrl && (
                <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
                  <Image
                    src={activeCard.track.artworkUrl}
                    alt=""
                    fill
                    className="object-cover scale-110 filter blur-xs"
                    unoptimized
                  />
                </div>
              )}

              {/* Top Header: Badge + Close Button (No Icons, No Tech Text) */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-bold tracking-wider uppercase text-white/95 backdrop-blur-md border border-white/20">
                  {activeCard.badge}
                </span>

                <button
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/15"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Artwork + Title Hero */}
              <div className="relative z-10 mt-5 flex gap-4 items-center">
                {activeCard.track?.artworkUrl ? (
                  <div className="relative shrink-0">
                    <Image
                      src={activeCard.track.artworkUrl}
                      alt={activeCard.track.title}
                      width={88}
                      height={88}
                      className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl object-cover shadow-2xl border border-white/30"
                      unoptimized
                    />
                    <span className="absolute -top-1.5 -left-1.5 flex h-5 px-1.5 items-center justify-center rounded-full bg-white text-slate-950 text-[10px] font-black shadow-md">
                      #{activeCard.track.rank}
                    </span>
                  </div>
                ) : null}

                <div className="flex flex-col min-w-0">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight line-clamp-2 drop-shadow-md">
                    {activeCard.track?.title || activeCard.title}
                  </h3>
                  <p className="text-sm font-semibold text-white/90 line-clamp-1 mt-0.5">
                    {activeCard.track?.artist || activeCard.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/70 font-medium">
                    {activeCard.track?.genre && (
                      <span className="rounded-md bg-black/25 px-2 py-0.5 text-[11px] font-semibold text-white/90 border border-white/15">
                        {activeCard.track.genre}
                      </span>
                    )}
                    {activeCard.track?.releaseDate && (
                      <span>{new Date(activeCard.track.releaseDate).getFullYear()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat Card with Animated NumberTicker */}
              <div className="relative z-10 mt-5 rounded-2xl border border-white/20 bg-black/20 backdrop-blur-md p-4 flex flex-col justify-between gap-1 shadow-inner">
                <span className="text-[11px] font-bold tracking-wider uppercase text-white/70">
                  {activeCard.title}
                </span>
                <div className="mt-1">
                  <NumberTicker
                    value={modalAnimatedValue}
                    prefix={activeCard.prefix}
                    suffix={activeCard.suffix}
                    decimals={activeCard.decimals ?? 0}
                    showDot={true}
                    label={activeCard.unit || undefined}
                    numberClassName="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm"
                    labelClassName="text-sm font-semibold text-white/80"
                  />
                </div>
              </div>

              {/* 30-Second Audio Player */}
              {activeCard.track?.previewUrl && (
                <div className="relative z-10 mt-3 rounded-xl border border-white/20 bg-black/20 backdrop-blur-md p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayToggle(activeCard.track?.previewUrl)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 hover:bg-white/90 shadow-lg transition-transform active:scale-95 cursor-pointer font-bold shrink-0"
                      aria-label={isPlaying ? "Pause preview" : "Play preview"}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 ml-0.5 fill-current" />
                      )}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {isPlaying ? "Playing Audio Sample" : "30-Second Preview"}
                      </p>
                      <p className="text-[11px] text-white/70">
                        {isPlaying ? "Tap to pause" : "Official audio sample"}
                      </p>
                    </div>
                  </div>

                  {/* Soundwave Equalizer */}
                  {isPlaying && (
                    <div className="flex items-center gap-1 pr-2">
                      <span className="h-2.5 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-5 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-3 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="h-4 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "450ms" }} />
                    </div>
                  )}
                </div>
              )}

              {/* Punchy Narrative (Less Texty) */}
              <p className="relative z-10 mt-3.5 text-xs sm:text-sm leading-relaxed text-white/85">
                {activeCard.description}
              </p>

              {/* Extra Stats Row */}
              {activeCard.extraStats && activeCard.extraStats.length > 0 && (
                <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/15 bg-black/20 backdrop-blur-xs p-3 text-center">
                  {activeCard.extraStats.map((stat, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[10px] font-bold tracking-wider text-white/60 uppercase">
                        {stat.label}
                      </span>
                      <span className="mt-0.5 text-xs sm:text-sm font-bold text-white truncate">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer: Direct Spotify CTA */}
              {activeCard.track?.spotifySearchUrl && (
                <div className="relative z-10 mt-5 flex justify-end pt-3 border-t border-white/20">
                  <a
                    href={activeCard.track.spotifySearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-black/30 hover:bg-black/50 border border-white/25 px-4 py-2 text-xs font-bold text-white transition-colors shadow-lg cursor-pointer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.515 17.323c-.214.334-.675.44-1.01.224-2.766-1.689-6.25-2.071-10.35-1.134-.395.09-.79-.154-.88-.549-.09-.395.154-.79.549-.88 4.485-1.026 8.335-.585 11.44 1.31.334.214.44.675.251 1.029zm1.47-3.27c-.269.434-.84.57-1.275.3-3.164-1.945-7.987-2.508-11.733-1.373-.458.139-.943-.118-1.082-.576-.138-.458.119-.944.577-1.082 4.28-1.3 9.598-.67 13.238 1.566.433.267.57.839.275 1.165zm.127-3.404c-3.796-2.254-10.062-2.462-13.685-1.362-.552.167-1.135-.144-1.303-.696-.167-.552.144-1.135.696-1.303 4.163-1.265 11.088-1.02 15.456 1.572.495.294.657.934.363 1.428-.293.493-.932.656-1.527.361z" />
                    </svg>
                    <span>Open in Spotify</span>
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
