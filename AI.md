# StreamHundred — System Architecture & AI Context Guide

> **For any AI agent or developer working on StreamHundred**:  
> This document details the complete end-to-end architecture, design system, live scraping pipeline, component structure, state management, and design philosophy of StreamHundred.

---

## 1. Project Overview & Vision

**StreamHundred** is a real-time, editorial tracking platform for the **Top 100 Most Streamed Songs of All Time on Spotify**.  
Inspired by the clean editorial framing and physical aesthetic of GitHundred, StreamHundred evolves the concept into a living music portal with:

1. **Live Scraping & 100% Free Enrichment Pipeline**:
   - Kworb live scraping with Wikipedia backup.
   - Zero-cost enrichment using Apple's public iTunes Search API (100% free, 0 API keys required).
   - High-resolution 600×600 artwork, genres, exact release years, and 30-second audio previews.
2. **Interactive Highlights (3D Physics & Themed Modals)**:
   - 3D card tilt physics driven by real-time mouse vectors with specular sheen reflections.
   - Dynamic modal dialog that **inherits the exact gradient background** of the clicked card.
   - Animated rolling digit counters powered by `@number-flow/react` (`NumberTicker`).
   - Clean, uncluttered editorial presentation (zero AI-template styling, zero tech-jargon).
3. **Audio Player Engine**:
   - Single-instance global audio playback.
   - Animated bounce soundwave equalizer bars in the matching theme accent.
   - Direct deep-links to Spotify search and streaming.

---

## 2. Directory Structure

```
STREAMHUNDRED/
├── .github/
│   └── workflows/
│       └── update-data.yml       # Scheduled GitHub Action to refresh offline backup data
├── app/
│   ├── api/
│   │   └── tracks/
│   │       └── route.ts          # JSON API endpoint exposing live tracks with ISR (1hr)
│   ├── highlights/
│   │   └── page.tsx              # Highlights page (computes milestones & renders 3D cards)
│   ├── globals.css               # Global CSS, dashed borders, Instrument Serif typography
│   ├── layout.tsx                # App frame, Dotted boundary frame, Liquid Spotify button
│   └── page.tsx                  # Main table page (TrackTable with search & filters)
├── components/
│   ├── Hero.tsx                  # Editorial header, live status indicator, sticker badge
│   ├── HighlightsCards.tsx       # 3D interactive physics cards & matching themed modal
│   ├── PixelsBackground.tsx      # Subtle floating pixel background texture
│   ├── PreviewButton.tsx         # 30-second audio preview button with play/pause state
│   ├── SegmentedControl.tsx      # Sliding pill tab navigation (List vs Highlights)
│   ├── SpotifyButton.tsx         # Header button with interactive liquid canvas gradient on hover
│   ├── Sticker.tsx               # Realistic die-cut sticker with rAF physics and tilt
│   ├── TrackTable.tsx            # Sticky-header data table with search, filters & hover slide
│   └── ui/
│       ├── button.tsx            # Reusable button with active toggle support
│       ├── input.tsx             # Styled input with inline icon support
│       ├── liquid-gradient.tsx   # WebGL/Canvas fluid liquid gradient animation
│       ├── number-ticker.tsx     # High-fidelity rolling stats counter via @number-flow/react
│       └── select.tsx            # Multi-select genre dropdown with search
├── data/
│   ├── enrichment-cache.json     # Pre-cached metadata (artwork, preview, genre, release date)
│   ├── meta.json                 # Last scrape timestamp and primary data source
│   └── tracks.json               # 100-track fallback data
├── lib/
│   ├── format.ts                 # Stream counts (B/M), daily delta (+X.XXM/day), track age
│   ├── tracks-live.ts            # Server-side live scraper (Kworb -> Wiki -> Cache)
│   ├── types.ts                  # Core TypeScript types (Track, Meta, HighlightCardData)
│   └── utils.ts                  # Tailwind clsx/twMerge utility
├── public/
│   ├── images/
│   │   └── noise.png             # Fine grain overlay for physical texture
│   └── svgs/
│       ├── 100-sticker.svg       # Bold italic "100" sticker
│       ├── spotify-sticker.svg   # Spotify die-cut sticker
│       └── star-sticker.svg      # Die-cut star sticker
├── scripts/
│   └── update-data.mjs           # Standalone CLI scraper and iTunes enrichment script
├── AI.md                         # Master AI context and architecture reference
├── package.json                  # Next.js 16, React 19, Motion, @number-flow/react
└── tsconfig.json                 # Strict TypeScript configuration
```

---

## 3. Data Pipeline & Scraper Engine

### 3.1. Zero-Cost Architecture
The application runs without any paid Spotify API keys, developer tokens, or billing setup.
1. **Primary Scraper (`kworb-live`)**:
   - Scrapes `https://kworb.net/spotify/songs.html`.
   - Parses the HTML table rows containing rank, artist, title, streams, and daily streams.
   - Built with a 6-second timeout and custom User-Agent.
2. **Secondary Scraper (`wikipedia-live`)**:
   - Fallback to Wikipedia's *List of most-streamed songs on Spotify* via MediaWiki API.
3. **Enrichment Engine (Apple iTunes Search API)**:
   - Queries `https://itunes.apple.com/search?term={title}+{artist}&entity=song&limit=1`.
   - Extracts:
     - High-res 600×600 artwork (`artworkUrl100.replace("100x100bb", "600x600bb")`).
     - 30-second AAC audio preview URL (`previewUrl`).
     - Primary genre name (`primaryGenreName`).
     - Release date (`releaseDate`).
4. **Fuzzy Matching & Auto-Persistence**:
   - `lib/tracks-live.ts` uses normalized key lookup: lowercased, punctuation stripped, matching primary artists.
   - When new tracks appear in live charts, live iTunes enrichments are automatically written back to `data/enrichment-cache.json` on disk.

---

## 4. UI / UX Design System

### 4.1. Visual Identity & Frame
- **Dotted Boundary Axis Frame**:
  - Defined in `app/layout.tsx`. A vintage coordinate-ruled frame with dotted border lines and tick indicators (`0`, `X`, `Y`) framing the entire viewport.
- **Custom Cursor**:
  - Blue cursor arrow matching the site's brand accent (`cursor: url("data:image/svg+xml,..."), auto`).
- **Liquid Gradient Hover**:
  - `components/SpotifyButton.tsx` and `components/SegmentedControl.tsx` utilize `components/ui/liquid-gradient.tsx` for dynamic multi-color fluid gradient animations activated exclusively on hover.

### 4.2. 3D Highlights Cards (`components/HighlightsCards.tsx`)
- **Physics**:
  - On mouse move, calculates normalized offsets `(x, y)` to dynamically tilt the card in 3D perspective (`rotateX`, `rotateY`, `z` depth).
  - Uses Framer Motion spring physics (`stiffness: 350, damping: 30`).
  - Specular sheen reflection follows mouse angle across the surface.
- **Themed Color Palette (`THEMES`)**:
  - `warning`: `from-amber-500 via-amber-600 to-amber-800` (All-Time Leader)
  - `secondary`: `from-blue-600 via-blue-700 to-blue-800` (Highest Velocity)
  - `accent`: `from-purple-600 via-purple-700 to-purple-800` (Time Machine)
  - `success`: `from-emerald-600 via-emerald-700 to-emerald-800` (Fresh Hit)
  - `danger`: `from-rose-600 via-rose-700 to-red-800` (Artist Spotlight)
  - `info`: `from-cyan-600 via-cyan-700 to-cyan-800` (Golden Era)
- **1:1 Modal Color Inheritance**:
  - When a user clicks a 3D card, the popup modal container dynamically applies the **exact same gradient background** as the card itself (`bg-gradient-to-br ${THEMES[themeKey]}`).
  - Creates visual continuity — the card physically feels like it expands into the dialog.
- **NumberTicker (@number-flow/react)**:
  - Digit rolling animation on card load and modal reveal.
  - Accompanied by a live pulsing green indicator dot.

### 4.3. Track Table (`components/TrackTable.tsx`)
- **Sticky Header**: Scroll detection applies a subtle depth shadow when the table scrolls beneath the sticky rank/track header.
- **Hover Physics**: Floating background pill smoothly slides behind rows to follow the user's cursor.
- **Interactive Controls**:
  - Live search input filtering across track titles and artists in real-time.
  - Multi-select genre dropdown filter with live badge count and individual clearing.
  - "Show daily streams" toggle (`+X.XXM/day`).
  - "Show full titles" toggle.
  - Audio preview play/pause button on every row with shared audio instance.

---

## 5. Important Maintenance Rules & Gotchas

1. **Next.js Version**:
   - Next.js 16 with Turbopack and React 19.
   - Always verify build with `npm run build` after editing components.
2. **Animation Values in Framer Motion**:
   - Do NOT animate between color strings and `"transparent"` directly on `background`. Animate `opacity` between `1` and `0` to prevent Framer Motion console warnings.
3. **Live Revalidation**:
   - Both `/` and `/highlights` export `revalidate = 3600` (1-hour ISR).
   - If Kworb is temporarily down, the app fails over transparently to Wikipedia live or committed offline cache.

---

## 6. How to Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Update offline data cache via Kworb + iTunes API
node scripts/update-data.mjs

# Run production build
npm run build
```
