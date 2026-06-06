"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { MdSpeed } from "react-icons/md";
import { animate } from "animejs";
import { useLanguage } from "@/context/LanguageContext";

interface PlayerAyah {
  number?: number;
  numberInSurah: number;
  audioUrl?: string;
}

interface AudioPlayerProps {
  surahName: string;
  ayahs: PlayerAyah[];
  currentAyahIndex: number;
  setCurrentAyahIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  autoScroll: boolean;
}

type RepeatMode = "none" | "ayah" | "surah" | "range";

export default function AudioPlayer({
  surahName,
  ayahs,
  currentAyahIndex,
  setCurrentAyahIndex,
  isPlaying,
  setIsPlaying,
  autoScroll,
}: AudioPlayerProps) {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(ayahs.length || 1);
  const [verseRepeatCount, setVerseRepeatCount] = useState<number>(1);
  const [currentRepeatIteration, setCurrentRepeatIteration] = useState<number>(1);
  const [isRepeatOpen, setIsRepeatOpen] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Sync rangeEnd when ayahs length changes
  useEffect(() => {
    setRangeEnd(ayahs.length || 1);
  }, [ayahs.length]);

  // Reset repeat iteration when active verse changes
  useEffect(() => {
    setCurrentRepeatIteration(1);
  }, [currentAyahIndex]);

  // Initialize Audio Element
  useEffect(() => {
    audioRef.current = new Audio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Combined robust audio playback engine controller
  // Resolves AbortError by handling the play() promise and consolidating triggers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentAyah = ayahs[currentAyahIndex];
    if (!currentAyah || !currentAyah.audioUrl) {
      setIsPlaying(false);
      return;
    }

    // 1. Sync Audio Source URL
    const cleanSrc = currentAyah.audioUrl;
    if (audio.src !== cleanSrc) {
      audio.src = cleanSrc;
      audio.load();
    }

    // 2. Sync Properties
    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;

    // 3. Play or Pause safely handling Promises
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Playback error occurred:", err);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [currentAyahIndex, ayahs, isPlaying, volume, isMuted, playbackRate, setIsPlaying]);

  // Handle ended, time updates, and metadata load events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === "ayah") {
        // Repeat single verse: if not exceeded repeat count, play again
        if (currentRepeatIteration < verseRepeatCount) {
          setCurrentRepeatIteration(prev => prev + 1);
          audio.currentTime = 0;
          audio.play().catch((err) => {
            if (err.name !== "AbortError") console.error(err);
          });
        } else {
          setCurrentRepeatIteration(1);
          if (currentAyahIndex < ayahs.length - 1) {
            setCurrentAyahIndex(currentAyahIndex + 1);
          } else {
            setIsPlaying(false);
            setCurrentAyahIndex(0);
          }
        }
      } else if (repeatMode === "range") {
        // Range repeat mode
        const rangeStartIdx = Math.max(0, rangeStart - 1);
        const rangeEndIdx = Math.min(ayahs.length - 1, rangeEnd - 1);
        if (currentAyahIndex < rangeEndIdx) {
          setCurrentAyahIndex(currentAyahIndex + 1);
        } else {
          setCurrentAyahIndex(rangeStartIdx);
        }
      } else if (currentAyahIndex < ayahs.length - 1) {
        setCurrentAyahIndex(currentAyahIndex + 1);
      } else {
        // Last ayah in surah
        if (repeatMode === "surah") {
          setCurrentAyahIndex(0);
        } else {
          setIsPlaying(false);
          setCurrentAyahIndex(0);
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentAyahIndex, ayahs, repeatMode, rangeStart, rangeEnd, verseRepeatCount, currentRepeatIteration, setCurrentAyahIndex, setIsPlaying]);

  // Auto-scroll logic using Anime.js
  useEffect(() => {
    if (!autoScroll || !isPlaying) return;

    const currentAyah = ayahs[currentAyahIndex];
    if (!currentAyah) return;

    const element = currentAyah.number 
      ? (document.getElementById(`ayah-${currentAyah.number}`) || document.getElementById(`ayah-${currentAyah.numberInSurah}`))
      : document.getElementById(`ayah-${currentAyah.numberInSurah}`);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.scrollY;
      const middleOffset = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

      const scrollObj = { y: window.scrollY };
      animate(scrollObj, {
        y: middleOffset,
        duration: 900,
        ease: "outQuad",
        onRender: () => {
          window.scrollTo(0, scrollObj.y);
        }
      });
    }
  }, [currentAyahIndex, autoScroll, isPlaying, ayahs]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex(currentAyahIndex + 1);
    } else {
      setCurrentAyahIndex(0); // Wrap around
    }
  };

  const playPrevious = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(currentAyahIndex - 1);
    } else {
      setCurrentAyahIndex(ayahs.length - 1); // Wrap around
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const cycleRepeatMode = () => {
    if (repeatMode === "none") setRepeatMode("ayah");
    else if (repeatMode === "ayah") setRepeatMode("surah");
    else if (repeatMode === "surah") setRepeatMode("range");
    else setRepeatMode("none");
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper labels for repeat modes
  const repeatModeLabel: Record<RepeatMode, string> = {
    none: t("repeatNone"),
    ayah: t("repeatAyah"),
    surah: t("repeatSurah"),
    range: t("loopRange"),
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-card-border bg-card-bg shadow-2xl transition-all duration-300">
      {/* Progress Bar */}
      <div className="relative w-full h-1 group cursor-pointer select-none">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="absolute inset-0 bg-card-border h-full w-full" />
        <div
          className="absolute left-0 top-0 bottom-0 bg-primary h-full transition-all duration-75"
          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
        />
      </div>

      {/* Grid Layout - Optimized for Precise Centering on Mobile & Desktop */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-3 sm:px-6 lg:px-8 grid grid-cols-3 items-center gap-3 select-none">
        
        {/* 1. Left Section: Info (Occupies Column 1, truncates safely on mobile) */}
        <div className="flex flex-col items-start min-w-0 max-w-[85px] xs:max-w-[130px] sm:max-w-xs col-span-1">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider hidden sm:inline">
            {t("murottal")}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-foreground truncate w-full leading-tight">
            {surahName}
          </span>
          <span className="text-[9px] sm:text-xs text-muted truncate w-full leading-none mt-0.5">
            {t("ayahOf", { current: ayahs[currentAyahIndex]?.numberInSurah || 1, total: ayahs.length })}
          </span>
        </div>

        {/* 2. Center Section: Playback Controls (Occupies Column 2, mathematically centered) */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 col-start-2 justify-self-center">
          {/* Previous Button */}
          <button
            onClick={playPrevious}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-card-border/50 transition-all duration-300 active:scale-90"
            title={t("prevAyah")}
          >
            <FaStepBackward className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-white hover:scale-105 active:scale-95 shadow-md shadow-primary-glow hover:shadow-lg transition-all duration-300 shrink-0"
            title={isPlaying ? t("pauseSurah") : t("playSurah")}
          >
            {isPlaying ? (
              <FaPause className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <FaPlay className="h-4 w-4 sm:h-5 sm:w-5 translate-x-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-card-border/50 transition-all duration-300 active:scale-90"
            title={t("nextAyah")}
          >
            <FaStepForward className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* 3. Right Section: Repeat & Speed / Volume (Occupies Column 3, aligned right) */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 col-start-3 justify-self-end">
          {/* Repeat Button */}
          <button
            onClick={cycleRepeatMode}
            className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-transparent transition-all duration-300 active:scale-90 ${
              repeatMode !== "none"
                ? "bg-primary-glow text-primary border-primary/20"
                : "text-muted hover:text-foreground hover:bg-card-border/50"
            }`}
            title={repeatModeLabel[repeatMode]}
          >
            <FaRedo className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {repeatMode === "ayah" && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white shadow-xs">
                1
              </span>
            )}
            {repeatMode === "surah" && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white shadow-xs">
                ∞
              </span>
            )}
            {repeatMode === "range" && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[7px] font-bold text-white shadow-xs">
                ↔
              </span>
            )}
          </button>

          {/* Range Controls (shown when range mode active) */}
          {repeatMode === "range" && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted border-l border-card-border/60 pl-2">
              <span className="shrink-0">{t("startAyah")}:</span>
              <input
                type="number"
                min={1}
                max={ayahs.length}
                value={rangeStart}
                onChange={e => setRangeStart(Math.max(1, Math.min(ayahs.length, parseInt(e.target.value) || 1)))}
                className="w-10 rounded bg-card-border px-1 py-0.5 text-center text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="shrink-0">–</span>
              <input
                type="number"
                min={1}
                max={ayahs.length}
                value={rangeEnd}
                onChange={e => setRangeEnd(Math.max(1, Math.min(ayahs.length, parseInt(e.target.value) || ayahs.length)))}
                className="w-10 rounded bg-card-border px-1 py-0.5 text-center text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Speed Selector (Hidden on Mobile) */}
          <div className="relative group hidden sm:block">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-card-border/50 transition-all duration-300"
              title={t("speed")}
            >
              <MdSpeed className="h-5 w-5" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-card-bg border border-card-border rounded-lg shadow-xl overflow-hidden min-w-[70px] z-50">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-3 py-1.5 text-xs text-center hover:bg-primary-glow hover:text-primary transition-colors ${
                    playbackRate === rate ? "bg-primary text-white font-bold" : "text-foreground"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Timings (Hidden on Mobile) */}
          <div className="text-[10px] text-muted hidden sm:flex flex-col items-center leading-none min-w-[60px] mr-1">
            <span>{formatTime(currentTime)}</span>
            <span className="h-px w-6 bg-card-border my-1" />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Volume Control (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2 border-l border-card-border/60 pl-3">
            <button
              onClick={toggleMute}
              className="text-muted hover:text-foreground transition-colors"
              title={isMuted ? t("unmute") : t("mute")}
            >
              {isMuted || volume === 0 ? (
                <FaVolumeMute className="h-4 w-4" />
              ) : (
                <FaVolumeUp className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
