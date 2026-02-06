"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "fishai-music-enabled";

export function useMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Try to pick up the audio instance started by LoadingScreen
    const globalAudio = (window as unknown as Record<string, unknown>).__fishai_audio as HTMLAudioElement | undefined;

    if (globalAudio) {
      audioRef.current = globalAudio;
      setIsPlaying(!globalAudio.paused);
      setIsLoaded(true);
    } else {
      // Fallback: create our own (if user navigated directly past loading)
      const audio = new Audio("/music/rust-fishing-village.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
      audio.addEventListener("canplaythrough", () => setIsLoaded(true));
    }

    // Listen for loading screen starting music
    const onMusicStarted = () => {
      const audio = (window as unknown as Record<string, unknown>).__fishai_audio as HTMLAudioElement | undefined;
      if (audio) {
        audioRef.current = audio;
        setIsPlaying(!audio.paused);
        setIsLoaded(true);
      }
    };

    window.addEventListener("fishai-music-started", onMusicStarted);

    return () => {
      window.removeEventListener("fishai-music-started", onMusicStarted);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      localStorage.setItem(STORAGE_KEY, "false");
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem(STORAGE_KEY, "true");
      }).catch(() => {});
    }
  }, [isPlaying]);

  return { isPlaying, isLoaded, toggle };
}
