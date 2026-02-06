"use client";

import type { Catch } from "@/types";

function getScoreEmoji(score: number): string {
  if (score >= 90) return "[S]";
  if (score >= 70) return "[A]";
  if (score >= 50) return "[B]";
  if (score >= 30) return "[C]";
  return "[D]";
}

export default function ShareableCard({ data }: { data: Catch }) {
  const shareText = `${getScoreEmoji(data.fish_score)} FishAI Score: ${data.fish_score}/100\n${data.species_guess || "Unknown"}\n${data.meme_line || ""}\n\nCatch scored by FishAI — your Rust NPC fishing buddy`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareText);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Shareable card preview */}
      <div className="rust-card p-0 overflow-hidden max-w-sm mx-auto">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-rust-500 via-npc-accent to-rust-500" />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-game text-[10px] text-npc-accent">
                FishAI
              </span>
            </div>
            <span className="font-game text-sm">
              <span className={data.fish_score >= 70 ? "text-npc-accent" : "text-npc-text/60"}>
                {data.fish_score}
              </span>
              <span className="text-npc-text/30">/100</span>
            </span>
          </div>

          {/* Photo */}
          <img
            src={data.photo_url}
            alt="Catch"
            className="w-full h-48 object-cover rounded-lg mb-3"
          />

          {/* Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-npc-text text-sm">
                {data.species_guess || "Unknown"}
              </p>
              <p className="text-xs text-npc-text/40">
                {data.estimated_weight_kg
                  ? `~${data.estimated_weight_kg}kg`
                  : ""}
                {data.estimated_weight_kg && data.estimated_length_cm
                  ? " · "
                  : ""}
                {data.estimated_length_cm
                  ? `~${data.estimated_length_cm}cm`
                  : ""}
              </p>
            </div>
            <span className="text-2xl">{getScoreEmoji(data.fish_score)}</span>
          </div>

          {/* Meme line */}
          {data.meme_line && (
            <p className="text-xs text-npc-text/50 italic mt-2 border-t border-rust-700/20 pt-2">
              &ldquo;{data.meme_line}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-3 justify-center">
        <button onClick={copyToClipboard} className="btn-rust-outline text-xs !px-4 !py-2">
          COPY
        </button>
        <button onClick={shareToTwitter} className="btn-rust-outline text-xs !px-4 !py-2">
          TWITTER
        </button>
        <button onClick={shareToTelegram} className="btn-rust-outline text-xs !px-4 !py-2">
          TELEGRAM
        </button>
      </div>
    </div>
  );
}
