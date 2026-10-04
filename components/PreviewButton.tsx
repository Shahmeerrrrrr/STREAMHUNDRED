"use client";

interface PreviewButtonProps {
  previewUrl: string | null;
  isPlaying: boolean;
  onToggle: () => void;
}

function PlayIcon() {
  return (
    <svg
      className="h-3 w-3 translate-x-0.5 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="h-3 w-3 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

export function PreviewButton({
  previewUrl,
  isPlaying,
  onToggle,
}: PreviewButtonProps) {
  const disabled = !previewUrl;

  return (
    <button
      type="button"
      className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all ${
        isPlaying
          ? "border-teal-500 bg-teal-500 text-white shadow-xs"
          : "border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-600"
      } ${disabled ? "cursor-not-allowed opacity-25 hover:border-slate-300 hover:text-slate-700" : ""}`}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      title={disabled ? "No preview available" : isPlaying ? "Pause preview" : "Play 30s preview"}
      aria-label={disabled ? "No preview available" : isPlaying ? "Pause preview" : "Play 30-second preview"}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}
