"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const MUSIC_KEY = "fishai-music-enabled";

// In-memory flag: survives SPA navigation, resets on page reload/refresh
let hasEnteredThisSession = false;

export default function LoadingScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(() => !hasEnteredThisSession);
  const [fading, setFading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!visible) return;

    const steps = [
      { target: 20, delay: 200 },
      { target: 45, delay: 500 },
      { target: 65, delay: 300 },
      { target: 80, delay: 400 },
      { target: 95, delay: 300 },
      { target: 100, delay: 200 },
    ];

    let timeout: NodeJS.Timeout;
    let currentStep = 0;

    const runStep = () => {
      if (currentStep >= steps.length) {
        setReady(true);
        return;
      }
      const step = steps[currentStep];
      timeout = setTimeout(() => {
        setProgress(step.target);
        currentStep++;
        runStep();
      }, step.delay);
    };

    runStep();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const audio = new Audio("/music/rust-fishing-village.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {};
  }, []);

  const handleEnter = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => {
        localStorage.setItem(MUSIC_KEY, "true");
        (window as unknown as Record<string, unknown>).__fishai_audio = audio;
        window.dispatchEvent(new CustomEvent("fishai-music-started"));
      }).catch(() => {});
    }

    // Remember that user entered (in-memory only — resets on reload)
    hasEnteredThisSession = true;

    setFading(true);
    setTimeout(() => {
      setVisible(false);
      // Always navigate to home page after loading screen
      router.push("/");
    }, 600);
  }, [router]);

  if (!visible) return null;

  return (
    <div className={`loading-screen ${fading ? "loading-screen-exit" : ""}`}>
      {/* Video background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
        >
          <source src="/video/fishing-village.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Fish logo */}
        <div className="mb-6">
          <img
            src="/images/fish-logo.png"
            alt="FishAI"
            className="w-56 h-auto loading-fish drop-shadow-[0_0_12px_rgba(200,176,106,0.2)]"
          />
        </div>

        {/* Title */}
        <h1 className="font-game text-3xl sm:text-5xl text-[#c8b06a] mb-3 tracking-wider">
          FishAI
        </h1>
        <p className="text-base sm:text-lg text-[#777] mb-10 tracking-wide">
          Fishing Village
        </p>

        {/* Progress bar */}
        <div className="w-72 sm:w-96 mb-8">
          <div className="h-3 overflow-hidden rounded-sm" style={{ background: "rgba(60, 55, 45, 0.6)", border: "1px solid rgba(80, 72, 58, 0.3)" }}>
            <div
              className="h-full loading-bar-fill transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-game text-[#555]">
              {ready ? "READY" : "LOADING..."}
            </span>
            <span className="text-xs font-game text-[#555]">
              {progress}%
            </span>
          </div>
        </div>

        {/* Enter button */}
        <div className={`transition-all duration-500 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          <button
            onClick={handleEnter}
            className="group relative px-12 py-5 font-bold text-lg text-[#c8b06a] uppercase tracking-widest transition-all"
            style={{
              background: "rgba(55, 50, 42, 0.7)",
              border: "1px solid rgba(200, 176, 106, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(200, 176, 106, 0.6)";
              e.currentTarget.style.background = "rgba(65, 58, 48, 0.85)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(200, 176, 106, 0.3)";
              e.currentTarget.style.background = "rgba(55, 50, 42, 0.7)";
            }}
          >
            <span className="flex items-center gap-3">
              <span className="loading-enter-arrow">&#9654;</span>
              Enter
            </span>
          </button>

          <p className="text-center text-xs text-[#555] mt-4 tracking-wide">
            click to enter &amp; enable sound
          </p>
        </div>
      </div>
    </div>
  );
}
