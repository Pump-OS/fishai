"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import type { TackleAdviceResponse, WaterType } from "@/types";

const WATER_TYPES: { value: WaterType; label: string }[] = [
  { value: "lake", label: "Lake" },
  { value: "river", label: "River" },
  { value: "sea", label: "Sea" },
  { value: "ocean", label: "Ocean" },
  { value: "pond", label: "Pond" },
  { value: "stream", label: "Stream" },
];

function getScoreClass(score: number): string {
  if (score >= 90) return "score-legendary";
  if (score >= 70) return "score-epic";
  if (score >= 50) return "score-rare";
  return "score-common";
}

// ─── Calculator helpers ──────────────────────────────────────
function calcLineStrength(fishWeightKg: number): string {
  const lbTest = Math.ceil(fishWeightKg * 2.205 * 1.5);
  return `~${lbTest} lb test (${(lbTest * 0.4536).toFixed(1)} kg)`;
}

function calcHookSize(fishWeightKg: number): string {
  if (fishWeightKg < 0.5) return "#10 – #14 (panfish hooks)";
  if (fishWeightKg < 2) return "#4 – #8 (standard)";
  if (fishWeightKg < 5) return "#1 – #2/0 (medium game)";
  if (fishWeightKg < 15) return "#3/0 – #6/0 (large game)";
  return "#7/0 – #12/0 (heavy game)";
}

function calcLureWeight(rodRatingMin: number, rodRatingMax: number): string {
  const sweet = (rodRatingMin + rodRatingMax) / 2;
  return `Sweet spot: ${sweet.toFixed(1)}g (range: ${rodRatingMin}g – ${rodRatingMax}g)`;
}

export default function TacklePage() {
  // Advisor state
  const [rod, setRod] = useState("");
  const [reel, setReel] = useState("");
  const [lineType, setLineType] = useState("");
  const [lineStrength, setLineStrength] = useState("");
  const [hookType, setHookType] = useState("");
  const [hookSize, setHookSize] = useState("");
  const [baitOrLure, setBaitOrLure] = useState("");
  const [targetSpecies, setTargetSpecies] = useState("");
  const [waterType, setWaterType] = useState<WaterType | "">("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TackleAdviceResponse | null>(null);
  const [error, setError] = useState("");

  // Calculator state
  const [calcFishWeight, setCalcFishWeight] = useState("");
  const [calcRodMin, setCalcRodMin] = useState("");
  const [calcRodMax, setCalcRodMax] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/tackle-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rod: rod || undefined,
          reel: reel || undefined,
          line_type: lineType || undefined,
          line_strength_lb: lineStrength ? parseFloat(lineStrength) : undefined,
          hook_type: hookType || undefined,
          hook_size: hookSize || undefined,
          bait_or_lure: baitOrLure || undefined,
          target_species: targetSpecies || undefined,
          water_type: waterType || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data.advice);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fishWeightNum = parseFloat(calcFishWeight) || 0;
  const rodMinNum = parseFloat(calcRodMin) || 0;
  const rodMaxNum = parseFloat(calcRodMax) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-game text-xl text-npc-accent mb-2">
          Tackle Advisor
        </h1>
        <p className="text-sm text-npc-text/50">
          Tell the NPC your gear. Get roasted and improved.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Advisor form */}
        <div>
          <h2 className="text-sm font-bold text-npc-accent mb-4">
            Loadout Evaluator
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={rod}
              onChange={(e) => setRod(e.target.value)}
              placeholder="Rod (e.g. 7ft Medium Spinning)"
              className="input-rust"
            />
            <input
              type="text"
              value={reel}
              onChange={(e) => setReel(e.target.value)}
              placeholder="Reel (e.g. Shimano Sedona 2500)"
              className="input-rust"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={lineType}
                onChange={(e) => setLineType(e.target.value)}
                placeholder="Line type (braid/mono/fluoro)"
                className="input-rust"
              />
              <input
                type="text"
                value={lineStrength}
                onChange={(e) => setLineStrength(e.target.value)}
                placeholder="Line strength (lb)"
                className="input-rust"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={hookType}
                onChange={(e) => setHookType(e.target.value)}
                placeholder="Hook type"
                className="input-rust"
              />
              <input
                type="text"
                value={hookSize}
                onChange={(e) => setHookSize(e.target.value)}
                placeholder="Hook size"
                className="input-rust"
              />
            </div>
            <input
              type="text"
              value={baitOrLure}
              onChange={(e) => setBaitOrLure(e.target.value)}
              placeholder="Bait / Lure (e.g. worm, crankbait)"
              className="input-rust"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={targetSpecies}
                onChange={(e) => setTargetSpecies(e.target.value)}
                placeholder="Target species"
                className="input-rust"
              />
              <select
                value={waterType}
                onChange={(e) => setWaterType(e.target.value as WaterType)}
                className="select-rust"
              >
                <option value="">Water type</option>
                {WATER_TYPES.map((wt) => (
                  <option key={wt.value} value={wt.value}>
                    {wt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-rust w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  NPC evaluating loadout...
                </>
              ) : (
                "Evaluate Loadout"
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="rust-card p-5 mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-npc-accent">
                  Loadout Score
                </h3>
                <span className={`font-game text-xl ${getScoreClass(result.loadout_score)}`}>
                  {result.loadout_score}/100
                </span>
              </div>

              {result.meme_line && (
                <div className="npc-quote">
                  <p className="text-npc-text text-sm">
                    {result.meme_line}
                  </p>
                </div>
              )}

              <p className="text-sm text-npc-text/70">{result.summary}</p>

              {result.improvements.length > 0 && (
                <div>
                  <h4 className="text-xs text-npc-text/40 mb-2">
                    Improvements
                  </h4>
                  <ul className="space-y-1">
                    {result.improvements.map((imp, i) => (
                      <li
                        key={i}
                        className="text-sm text-npc-text/60 flex gap-2"
                      >
                        <span className="text-rust-400">▸</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommended_setup && (
                <div>
                  <h4 className="text-xs text-npc-text/40 mb-2">
                    NPC Recommended Setup
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.recommended_setup)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <Badge key={k} variant="score">
                          {k}: {v}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Calculators */}
        <div id="calculator">
          <h2 className="text-sm font-bold text-npc-accent mb-4">
            Tackle Calculators
          </h2>

          {/* Line Strength Calculator */}
          <div className="rust-card p-5 mb-4">
            <h3 className="text-sm font-bold text-npc-text mb-3">
              Line Strength vs Fish Weight
            </h3>
            <div>
              <label className="block text-xs text-npc-text/40 mb-1">
                Target Fish Weight (kg)
              </label>
              <input
                type="number"
                value={calcFishWeight}
                onChange={(e) => setCalcFishWeight(e.target.value)}
                placeholder="e.g. 5"
                className="input-rust mb-3"
                step="0.1"
                min="0"
              />
              {fishWeightNum > 0 && (
                <div className="space-y-2">
                  <div className="bg-npc-bg rounded-lg p-3">
                    <p className="text-xs text-npc-text/40">
                      Recommended Line Strength
                    </p>
                    <p className="text-npc-accent font-bold">
                      {calcLineStrength(fishWeightNum)}
                    </p>
                  </div>
                  <div className="bg-npc-bg rounded-lg p-3">
                    <p className="text-xs text-npc-text/40">
                      Recommended Hook Size
                    </p>
                    <p className="text-npc-accent font-bold">
                      {calcHookSize(fishWeightNum)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lure Weight Calculator */}
          <div className="rust-card p-5">
            <h3 className="text-sm font-bold text-npc-text mb-3">
              Lure Weight Range by Rod Rating
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-npc-text/40 mb-1">
                  Rod Min (g)
                </label>
                <input
                  type="number"
                  value={calcRodMin}
                  onChange={(e) => setCalcRodMin(e.target.value)}
                  placeholder="e.g. 5"
                  className="input-rust"
                  step="0.5"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-npc-text/40 mb-1">
                  Rod Max (g)
                </label>
                <input
                  type="number"
                  value={calcRodMax}
                  onChange={(e) => setCalcRodMax(e.target.value)}
                  placeholder="e.g. 28"
                  className="input-rust"
                  step="0.5"
                  min="0"
                />
              </div>
            </div>
            {rodMinNum > 0 && rodMaxNum > rodMinNum && (
              <div className="bg-npc-bg rounded-lg p-3">
                <p className="text-xs text-npc-text/40">
                  Recommended Lure Weight
                </p>
                <p className="text-npc-accent font-bold">
                  {calcLureWeight(rodMinNum, rodMaxNum)}
                </p>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="npc-quote mt-4">
            <p className="text-npc-text/60 text-xs">
              These calculators use general rules of thumb. 1.5x fish weight
              for line, basic hook sizing chart. Real conditions may vary. Don&apos;t
              blame the NPC if a fish breaks your line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
