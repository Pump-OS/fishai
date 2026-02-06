"use client";

import type { Catch } from "@/types";
import Badge from "@/components/ui/Badge";

function getScoreClass(score: number): string {
  if (score >= 90) return "score-legendary";
  if (score >= 70) return "score-epic";
  if (score >= 50) return "score-rare";
  return "score-common";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "LEGENDARY";
  if (score >= 70) return "EPIC";
  if (score >= 50) return "RARE";
  if (score >= 30) return "COMMON";
  return "JUNK";
}

export default function FishResultCard({ data }: { data: Catch }) {
  return (
    <div className="rust-card overflow-hidden">
      {/* Photo */}
      <div className="relative">
        <img
          src={data.photo_url}
          alt={data.species_guess || "Fish catch"}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-3 right-3">
          <div
            className={`px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm font-game text-sm ${getScoreClass(data.fish_score)}`}
          >
            {data.fish_score}/100
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge variant="score">{getScoreLabel(data.fish_score)}</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        {/* Species & Confidence */}
        <div>
          <h3 className="text-xl font-bold text-npc-text">
            {data.species_guess || "Unknown Species"}
          </h3>
          {data.confidence != null && (
            <p className="text-sm text-npc-text/50">
              Confidence: {Math.round(data.confidence * 100)}%
            </p>
          )}
        </div>

        {/* Estimates */}
        <div className="flex gap-4">
          {data.estimated_weight_kg != null && (
            <div className="flex-1 bg-npc-bg rounded-lg p-3 text-center">
              <p className="text-xs text-npc-text/40 mb-1">Weight</p>
              <p className="text-lg font-bold text-npc-accent">
                {data.estimated_weight_kg} kg
              </p>
            </div>
          )}
          {data.estimated_length_cm != null && (
            <div className="flex-1 bg-npc-bg rounded-lg p-3 text-center">
              <p className="text-xs text-npc-text/40 mb-1">Length</p>
              <p className="text-lg font-bold text-npc-accent">
                {data.estimated_length_cm} cm
              </p>
            </div>
          )}
        </div>

        {/* Meme line */}
        {data.meme_line && (
          <div className="npc-quote">
            <p className="text-npc-text text-sm">{data.meme_line}</p>
          </div>
        )}

        {/* Reasoning */}
        {data.reasoning_short && (
          <p className="text-sm text-npc-text/70">{data.reasoning_short}</p>
        )}

        {/* Tips */}
        {data.tips && data.tips.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-npc-accent mb-2">
              How to catch this again:
            </h4>
            <ul className="space-y-1">
              {data.tips.map((tip, i) => (
                <li key={i} className="text-sm text-npc-text/60 flex gap-2">
                  <span className="text-rust-400">▸</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Location & Gear */}
        <div className="flex flex-wrap gap-2">
          {data.location_text && (
            <Badge>{data.location_text}</Badge>
          )}
          {data.water_type && (
            <Badge>{data.water_type}</Badge>
          )}
          {data.gear_notes && (
            <Badge>{data.gear_notes}</Badge>
          )}
        </div>

        {/* Disclaimers */}
        {data.disclaimers && data.disclaimers.length > 0 && (
          <div className="border-t border-rust-700/20 pt-3">
            {data.disclaimers.map((d, i) => (
              <p key={i} className="text-xs text-npc-text/30 italic">
                ! {d}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
