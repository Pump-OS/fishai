"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import type { WaterType, WeatherAdviceResponse } from "@/types";

const WATER_TYPES: { value: WaterType; label: string }[] = [
  { value: "lake", label: "Lake" },
  { value: "river", label: "River" },
  { value: "sea", label: "Sea" },
  { value: "ocean", label: "Ocean" },
  { value: "pond", label: "Pond" },
  { value: "stream", label: "Stream" },
];

export default function WeatherPage() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [waterType, setWaterType] = useState<WaterType | "">("");
  const [targetSpecies, setTargetSpecies] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeatherAdviceResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/weather-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.trim(),
          country: country.trim() || undefined,
          water_type: waterType || undefined,
          target_species: targetSpecies.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Maybe the weather API got raided.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-game text-xl text-npc-accent mb-2">
          Weather & Forecast
        </h1>
        <p className="text-sm text-npc-text/50">
          Enter your location. The NPC checks the sky and gives fishing intel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-npc-text/50 mb-1">
              City *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Miami"
              className="input-rust"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-npc-text/50 mb-1">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. US"
              className="input-rust"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-npc-text/50 mb-1">
              Water Type
            </label>
            <select
              value={waterType}
              onChange={(e) => setWaterType(e.target.value as WaterType)}
              className="select-rust"
            >
              <option value="">Any</option>
              {WATER_TYPES.map((wt) => (
                <option key={wt.value} value={wt.value}>
                  {wt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-npc-text/50 mb-1">
              Target Species
            </label>
            <input
              type="text"
              value={targetSpecies}
              onChange={(e) => setTargetSpecies(e.target.value)}
              placeholder="e.g. Bass, Trout"
              className="input-rust"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="btn-rust w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Checking the forecast...
            </>
          ) : (
            "Get Fishing Forecast"
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          {/* Current weather */}
          <div className="rust-card p-5">
            <h3 className="text-sm font-bold text-npc-accent mb-3">
              Current Weather — {result.forecast.city}, {result.forecast.country}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-npc-bg rounded-lg p-3 text-center">
                <p className="text-xs text-npc-text/40">Temp</p>
                <p className="text-lg font-bold text-npc-accent">
                  {result.forecast.current.temp_c}°C
                </p>
              </div>
              <div className="bg-npc-bg rounded-lg p-3 text-center">
                <p className="text-xs text-npc-text/40">Humidity</p>
                <p className="text-lg font-bold text-npc-text">
                  {result.forecast.current.humidity}%
                </p>
              </div>
              <div className="bg-npc-bg rounded-lg p-3 text-center">
                <p className="text-xs text-npc-text/40">Wind</p>
                <p className="text-lg font-bold text-npc-text">
                  {result.forecast.current.wind_speed_kmh} km/h
                </p>
              </div>
              <div className="bg-npc-bg rounded-lg p-3 text-center">
                <p className="text-xs text-npc-text/40">Conditions</p>
                <p className="text-sm font-bold text-npc-text capitalize">
                  {result.forecast.current.description}
                </p>
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          {result.forecast.daily.length > 0 && (
            <div className="rust-card p-5">
              <h3 className="text-sm font-bold text-npc-accent mb-3">
                5-Day Forecast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {result.forecast.daily.map((day) => (
                  <div
                    key={day.date}
                    className="bg-npc-bg rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-npc-text/40 mb-1">{day.date}</p>
                    <p className="text-sm text-npc-text capitalize mb-1">
                      {day.description}
                    </p>
                    <p className="text-xs text-npc-text/60">
                      {day.temp_min_c}° / {day.temp_max_c}°
                    </p>
                    <p className="text-xs text-npc-text/40">
                      {day.wind_speed_kmh}km/h
                    </p>
                    {day.pop > 0 && (
                      <p className="text-xs text-blue-400">{day.pop}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Fishing Advice */}
          <div className="rust-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-npc-accent">
              NPC Fishing Intel
            </h3>

            {result.meme_line && (
              <div className="npc-quote">
                <p className="text-npc-text text-sm">
                  {result.meme_line}
                </p>
              </div>
            )}

            <p className="text-sm text-npc-text/70">{result.reasoning}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-npc-text/40 mb-2">Best Times</h4>
                <div className="flex flex-wrap gap-1">
                  {result.best_times?.map((t, i) => (
                    <Badge key={i}>{t}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs text-npc-text/40 mb-2">
                  Recommended Bait
                </h4>
                <div className="flex flex-wrap gap-1">
                  {result.recommended_bait?.map((b, i) => (
                    <Badge key={i} variant="score">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-npc-text/40 mb-1">Depth</h4>
                <p className="text-sm text-npc-text">{result.recommended_depth}</p>
              </div>
              <div>
                <h4 className="text-xs text-npc-text/40 mb-1">Technique</h4>
                <p className="text-sm text-npc-text">
                  {result.recommended_technique}
                </p>
              </div>
            </div>

            {result.disclaimers && result.disclaimers.length > 0 && (
              <div className="border-t border-rust-700/20 pt-3">
                {result.disclaimers.map((d, i) => (
                  <p key={i} className="text-xs text-npc-text/30 italic">
                    ! {d}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
