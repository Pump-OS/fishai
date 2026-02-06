"use client";

import { useState } from "react";
import PhotoUpload from "@/components/catch/PhotoUpload";
import FishResultCard from "@/components/catch/FishResultCard";
import ShareableCard from "@/components/catch/ShareableCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Catch, WaterType } from "@/types";

const WATER_TYPES: { value: WaterType; label: string }[] = [
  { value: "lake", label: "Lake" },
  { value: "river", label: "River" },
  { value: "sea", label: "Sea" },
  { value: "ocean", label: "Ocean" },
  { value: "pond", label: "Pond" },
  { value: "stream", label: "Stream" },
  { value: "other", label: "Other" },
];

export default function CatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [locationText, setLocationText] = useState("");
  const [waterType, setWaterType] = useState<WaterType | "">("");
  const [gearNotes, setGearNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Catch | null>(null);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("photo", file);
    if (locationText) formData.append("location_text", locationText);
    if (waterType) formData.append("water_type", waterType);
    if (gearNotes) formData.append("gear_notes", gearNotes);

    try {
      const res = await fetch("/api/ai/evaluate-fish", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data.catch);
    } catch {
      setError("Network error. Check your connection, survivor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-game text-xl text-npc-accent mb-2">
          Fish Scanner
        </h1>
        <p className="text-sm text-npc-text/50">
          Upload your catch. The NPC will judge it.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <PhotoUpload onFileSelected={setFile} disabled={loading} />

          {/* Optional context fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-npc-text/50 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Lake Tahoe, CA"
                className="input-rust"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs text-npc-text/50 mb-1">
                Water Type (optional)
              </label>
              <select
                value={waterType}
                onChange={(e) => setWaterType(e.target.value as WaterType)}
                className="select-rust"
                disabled={loading}
              >
                <option value="">Select...</option>
                {WATER_TYPES.map((wt) => (
                  <option key={wt.value} value={wt.value}>
                    {wt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-npc-text/50 mb-1">
              Gear / Notes (optional)
            </label>
            <input
              type="text"
              value={gearNotes}
              onChange={(e) => setGearNotes(e.target.value)}
              placeholder="e.g. 7ft medium spinning rod, 10lb braid"
              className="input-rust"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="npc-quote">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="btn-rust w-full flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                NPC is judging your fish...
              </>
            ) : (
              "Evaluate My Catch"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Toggle between full result and share card */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowShare(false)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                !showShare
                  ? "bg-rust-600 text-white"
                  : "border border-rust-700/50 text-npc-text/60 hover:text-npc-text"
              }`}
            >
              Full Result
            </button>
            <button
              onClick={() => setShowShare(true)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                showShare
                  ? "bg-rust-600 text-white"
                  : "border border-rust-700/50 text-npc-text/60 hover:text-npc-text"
              }`}
            >
              Share Card
            </button>
          </div>

          {showShare ? (
            <ShareableCard data={result} />
          ) : (
            <FishResultCard data={result} />
          )}

          <button
            onClick={() => {
              setResult(null);
              setFile(null);
              setShowShare(false);
            }}
            className="w-full px-4 py-3 rounded-lg border border-rust-700/50 text-npc-text/60 hover:text-npc-text hover:border-npc-accent/50 transition-all text-center"
          >
            Upload Another Catch
          </button>
        </div>
      )}
    </div>
  );
}
