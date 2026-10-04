"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { type Colors, Liquid } from "@/components/ui/liquid-gradient";

const COLORS: Colors = {
  color1: "#FFFFFF",
  color2: "#1E10C5",
  color3: "#9089E2",
  color4: "#FCFCFE",
  color5: "#F9F9FD",
  color6: "#B2B8E7",
  color7: "#0E2DCB",
  color8: "#0017E9",
  color9: "#4743EF",
  color10: "#7D7BF4",
  color11: "#0B06FC",
  color12: "#C5C1EA",
  color13: "#1403DE",
  color14: "#B6BAF6",
  color15: "#C1BEEB",
  color16: "#290ECB",
  color17: "#3F4CC0",
};

interface SegmentedControlProps {
  active: "list" | "highlights";
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className || ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LightBulbIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className || ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.7 3.5 6h7c2-1.3 3.5-3.5 3.5-6a7 7 0 0 0-7-7z" />
    </svg>
  );
}

const TABS = [
  { id: "list" as const, label: "List", href: "/", icon: ListIcon },
  { id: "highlights" as const, label: "Highlights", href: "/highlights", icon: LightBulbIcon },
];

export function SegmentedControl({ active }: SegmentedControlProps) {
  const [hoveredTab, setHoveredTab] = useState<"list" | "highlights" | null>(null);

  return (
    <nav
      className="relative flex rounded-full border-8 border-solid border-slate-100 bg-slate-200 select-none overflow-visible shadow-xs"
      role="tablist"
      aria-label="View mode"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        const isHovered = hoveredTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className="group relative z-10 flex w-32 items-center justify-center gap-1.5 rounded-full p-2 text-center text-sm font-semibold cursor-pointer outline-none"
          >
            {/* --- 1. DEFAULT BASE: Matches our clean UI/UX when not hovered --- */}
            {isActive && (
              <motion.div
                layoutId="segmented-pill"
                className="absolute inset-0 -z-10 rounded-full bg-slate-900 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}

            {/* Default Label & Icon */}
            <span
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                isActive ? "text-white" : "text-slate-700 group-hover:text-slate-900"
              } ${isHovered ? "opacity-0" : "opacity-100"}`}
            >
              <Icon />
              <span>{tab.label}</span>
            </span>

            {/* --- 2. HOVER ANIMATION STATE: Shows Liquid Gradient ONLY on hover --- */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 pointer-events-none rounded-full ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Outer Liquid Halo Glow */}
              <div className="absolute w-[115%] h-[135%] top-[8%] left-1/2 -translate-x-1/2 filter blur-[14px] opacity-75">
                <span className="absolute inset-0 rounded-full bg-[#d9d9d9] filter blur-[6px]"></span>
                <div className="relative w-full h-full overflow-hidden rounded-full">
                  {isHovered && <Liquid isHovered={true} colors={COLORS} />}
                </div>
              </div>

              {/* Ambient Dark Plate */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92%] h-[112%] rounded-full bg-[#010128] filter blur-[7px]"></div>

              {/* Inner Mask with Liquid Gradient */}
              <div className="relative w-full h-full overflow-hidden rounded-full border border-slate-700/60 shadow-md">
                <span className="absolute inset-0 rounded-full bg-[#d9d9d9]"></span>
                <span className="absolute inset-0 rounded-full bg-black"></span>
                {isHovered && <Liquid isHovered={true} colors={COLORS} />}
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={`spark-${i}`}
                    className={`absolute inset-0 rounded-full border-solid border-[2px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${
                      i <= 2 ? "blur-[2px]" : i === 3 ? "blur-[4px]" : "blur-xs"
                    }`}
                  ></span>
                ))}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70%] h-[42%] rounded-full filter blur-[15px] bg-[#006]"></span>

                {/* Glowing Icon + Text on Hover */}
                <span className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-full text-white text-sm font-semibold tracking-wide whitespace-nowrap z-10 drop-shadow-xs">
                  <Icon className="text-white drop-shadow-xs" />
                  <span>{tab.label}</span>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
