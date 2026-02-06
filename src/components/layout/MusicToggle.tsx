"use client";

import { useMusic } from "@/hooks/useMusic";

export default function MusicToggle() {
  const { isPlaying, toggle } = useMusic();

  return (
    <button
      onClick={toggle}
      className="relative group w-8 h-8 flex items-center justify-center transition-all"
      style={{
        background: "rgba(60, 55, 45, 0.6)",
        border: "1px solid rgba(80, 72, 58, 0.4)",
      }}
      title={isPlaying ? "Mute" : "Play music"}
    >
      {isPlaying ? (
        <svg
          className="w-4 h-4 text-[#c8b06a] music-playing"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M9.75 4.459L5.6 7.5H2.25v9h3.35l4.15 3.041V4.459z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-[#666]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 4.459L5.6 7.5H2.25v9h3.35l4.15 3.041V4.459zM17.25 9.75l-4.5 4.5m0-4.5l4.5 4.5"
          />
        </svg>
      )}
    </button>
  );
}
