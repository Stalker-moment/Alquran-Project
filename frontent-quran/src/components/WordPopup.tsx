import React, { useEffect, useState, useRef } from "react";
import { FaTimes, FaVolumeUp, FaPlay, FaPause, FaSpinner } from "react-icons/fa";
import { getWordMorphology, WordMorphology } from "@/utils/wordLookup";
import { useLanguage } from "@/context/LanguageContext";
import { animate } from "animejs";

interface WordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  location: string; // "1:1:1"
  arabic: string;
  transliteration: string;
  translationId: string;
  translationEn: string;
  audioUrl: string | null;
  arabicFontClass?: string;
}

export default function WordPopup({
  isOpen,
  onClose,
  location,
  arabic,
  transliteration,
  translationId,
  translationEn,
  audioUrl,
  arabicFontClass = "font-amiri",
}: WordPopupProps) {
  const { language, t } = useLanguage();
  const [morphology, setMorphology] = useState<WordMorphology | null>(null);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Initialize and load morphology details
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setMorphology(null);

    getWordMorphology(location)
      .then((data) => {
        if (isMounted) {
          setMorphology(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location, isOpen]);

  // Audio Playback handler
  useEffect(() => {
    if (audioUrl) {
      const fullAudioUrl = `https://audio.qurancdn.com/${audioUrl}`;
      const newAudio = new Audio(fullAudioUrl);
      
      newAudio.onplay = () => setIsPlayingAudio(true);
      newAudio.onended = () => setIsPlayingAudio(false);
      newAudio.onerror = () => setIsPlayingAudio(false);
      newAudio.onpause = () => setIsPlayingAudio(false);

      setAudio(newAudio);

      return () => {
        newAudio.pause();
        setAudio(null);
        setIsPlayingAudio(false);
      };
    } else {
      setAudio(null);
      setIsPlayingAudio(false);
    }
  }, [audioUrl]);

  // Anime.js entry animation
  useEffect(() => {
    if (isOpen && backdropRef.current && modalRef.current) {
      // Animate backdrop fade
      animate(backdropRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: "outQuad",
      });

      // Animate modal scale and slide up
      animate(modalRef.current, {
        opacity: [0, 1],
        scale: [0.93, 1],
        translateY: [15, 0],
        duration: 350,
        ease: "outBack",
      });
    }
  }, [isOpen]);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audio) return;

    if (isPlayingAudio) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play().catch((err) => console.error("Audio playback error:", err));
    }
  };

  const handleClose = () => {
    if (backdropRef.current && modalRef.current) {
      // Exit animations
      animate(backdropRef.current, {
        opacity: 0,
        duration: 250,
        ease: "inQuad",
      });

      animate(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        translateY: 10,
        duration: 250,
        ease: "inQuad",
        complete: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Split location info (e.g. 1:1:1 -> Surah 1, Ayah 1, Word 1)
  const locParts = location.split(":");
  const labelText = language === "id"
    ? `QS. ${locParts[0]}:${locParts[1]} • Kata ${locParts[2]}`
    : `Surah ${locParts[0]}:${locParts[1]} • Word ${locParts[2]}`;

  // Badge mapping for Part of Speech
  const getPosBadge = (pos: string | null) => {
    if (!pos) return null;

    let colorClasses = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    let posLabel = pos;

    if (pos === "Isim") {
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-350 dark:border-blue-800/40";
      posLabel = language === "id" ? "Isim (Kata Benda / Noun)" : "Isim (Noun)";
    } else if (pos === "Fi'il") {
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-350 dark:border-amber-800/40";
      posLabel = language === "id" ? "Fi'il (Kata Kerja / Verb)" : "Fi'il (Verb)";
    } else if (pos === "Harf") {
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-350 dark:border-emerald-800/40";
      posLabel = language === "id" ? "Harf (Partikel / Particle)" : "Harf (Particle)";
    }

    return (
      <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold select-none ${colorClasses}`}>
        {posLabel}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-card-border bg-card-bg/95 backdrop-blur-md p-6 shadow-2xl transition-all z-10 select-none animate-fade-in"
      >
        {/* Header Label & Close Icon */}
        <div className="flex items-center justify-between pb-3 border-b border-card-border/50 mb-5">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            {labelText}
          </span>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-card-border transition-colors cursor-pointer"
            aria-label="Close word lookup"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Word Presentation Section */}
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="flex items-center gap-4 mb-2.5">
            <h3
              className={`${arabicFontClass} text-5xl md:text-6xl text-foreground select-all leading-normal tracking-wide`}
              dir="rtl"
            >
              {arabic}
            </h3>
            
            {transliteration === "Loading..." ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-card-border bg-card-bg/25 text-muted animate-pulse">
                <FaSpinner className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : audioUrl ? (
              <button
                onClick={handlePlayAudio}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary-glow/20 text-primary shadow-sm hover:scale-105 hover:bg-primary-glow/40 transition-all duration-300 cursor-pointer"
                title={language === "id" ? "Putar pelafalan kata" : "Play word pronunciation"}
              >
                {isPlayingAudio ? (
                  <FaPause className="h-4 w-4" />
                ) : (
                  <FaVolumeUp className="h-4 w-4" />
                )}
              </button>
            ) : null}
          </div>

          {transliteration === "Loading..." ? (
            <div className="h-5 w-24 rounded bg-card-border animate-pulse mt-1.5" />
          ) : (
            <p className="text-primary font-sans text-base font-semibold italic select-all">
              {transliteration}
            </p>
          )}
        </div>

        {/* Translations Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-b border-card-border/60 py-4 my-4">
          <div className="border-r border-card-border/50 pr-2 select-all">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted mb-1">
              Bahasa Indonesia
            </span>
            {transliteration === "Loading..." ? (
              <div className="h-4 w-28 rounded bg-card-border animate-pulse mt-1" />
            ) : (
              <p className="text-sm font-medium text-foreground leading-normal">
                {translationId || "—"}
              </p>
            )}
          </div>
          <div className="pl-2 select-all">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted mb-1">
              English
            </span>
            {transliteration === "Loading..." ? (
              <div className="h-4 w-28 rounded bg-card-border animate-pulse mt-1" />
            ) : (
              <p className="text-sm font-medium text-foreground leading-normal">
                {translationEn || "—"}
              </p>
            )}
          </div>
        </div>

        {/* Morphology / Grammatical Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
            {language === "id" ? "Info Gramatikal & Akar Kata" : "Grammatical & Root Info"}
          </h4>

          {loading ? (
            /* Morphology Skeleton Screen */
            <div className="space-y-3 animate-pulse">
              <div className="h-7 w-48 rounded bg-card-border" />
              <div className="h-4 w-32 rounded bg-card-border" />
              <div className="h-6 w-full rounded bg-card-border" />
            </div>
          ) : morphology ? (
            /* Morphology Details */
            <div className="space-y-3.5 select-all text-left">
              {/* POS Badge */}
              {morphology.pos && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted font-medium">
                    {language === "id" ? "Jenis Kata:" : "Word Type:"}
                  </span>
                  {getPosBadge(morphology.pos)}
                </div>
              )}

              {/* Root Letters */}
              {morphology.root && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-medium">
                    {language === "id" ? "Huruf Asal (Root):" : "Root Letters:"}
                  </span>
                  <span className="font-arabic text-xl font-bold bg-primary-glow/40 border border-primary/20 px-3 py-0.5 rounded-lg text-primary select-all">
                    {morphology.root.split("").join(" - ")}
                  </span>
                </div>
              )}

              {/* POS Details */}
              {morphology.posDetails && (
                <div className="text-xs text-muted font-medium leading-relaxed">
                  <span className="font-bold text-foreground">
                    {language === "id" ? "Detail:" : "Details:"}
                  </span>{" "}
                  {morphology.posDetails}
                </div>
              )}

              {/* Fallback if no specific POS and Root available */}
              {!morphology.pos && !morphology.root && (
                <p className="text-xs text-muted italic">
                  {language === "id"
                    ? "Informasi morfologi tidak teridentifikasi secara mendetail."
                    : "No detailed morphological tags identified."}
                </p>
              )}
            </div>
          ) : (
            /* Morphology Load Failed */
            <p className="text-xs text-muted italic">
              {language === "id"
                ? "Informasi gramatikal tidak tersedia untuk tanda wakaf / nomor ayat."
                : "Grammatical details are not available for waqf marks / end signs."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
