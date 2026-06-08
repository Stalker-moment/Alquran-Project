"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface FlashCardProps {
  verseKey: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  fontClass: string;
  arabicSize: number;
}

export default function FlashCard({
  verseKey,
  arabicText,
  transliteration,
  translation,
  fontClass,
  arabicSize,
}: FlashCardProps) {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);

  // Automatically reset card flip state when the verse changes
  useEffect(() => {
    setIsFlipped(false);
  }, [verseKey]);

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* 3D Card Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full max-w-2xl h-80 sm:h-96 cursor-pointer group"
        style={{ perspective: "1000px" }}
      >
        {/* Flipping wrapper */}
        <div 
          className="relative w-full h-full text-center transition-transform duration-500 rounded-3xl border border-card-border/70 shadow-lg bg-card-bg/40 backdrop-blur-xs"
          style={{ 
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >
          {/* FRONT FACE (Arabic Text) */}
          <div 
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl"
            style={{ 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
          >
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-6">
              ARABIC
            </span>
            <p 
              className={`text-foreground leading-loose text-center ${fontClass} max-h-56 overflow-y-auto w-full px-2 scrollbar-thin`}
              style={{ fontSize: `${arabicSize}px` }}
            >
              {arabicText}
            </p>
            <span className="text-[10px] text-muted font-bold mt-6 opacity-60 flex items-center gap-1">
              🔄 Click to reveal translation
            </span>
          </div>

          {/* BACK FACE (Translation & Transliteration) */}
          <div 
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl overflow-y-auto scrollbar-thin"
            style={{ 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-4">
              MEANING & TRANSLITERATION
            </span>
            
            {/* Transliteration */}
            <p className="text-xs sm:text-sm text-primary font-bold italic leading-relaxed text-center max-w-lg mb-4">
              {transliteration}
            </p>

            {/* Translation */}
            <p className="text-sm sm:text-base text-foreground font-light leading-relaxed text-center max-w-lg">
              {translation}
            </p>

            <span className="text-[10px] text-muted font-bold mt-6 opacity-60 flex items-center gap-1">
              🔄 Click to return to Arabic
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
