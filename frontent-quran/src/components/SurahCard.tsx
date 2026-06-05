"use client";

import React from "react";
import Link from "next/link";
import { Surah } from "@/utils/api";
import { FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

interface SurahCardProps {
  surah: Surah;
}

export default function SurahCard({ surah }: SurahCardProps) {
  const { language } = useLanguage();
  const isMeccan = surah.revelationType === "Meccan";
  const displayName = language === "id" ? (surah as any).indonesianName || surah.englishName : surah.englishName;
  const displayMeaning = language === "id" ? (surah as any).indonesianNameTranslation || surah.englishNameTranslation : surah.englishNameTranslation;

  return (
    <Link
      href={`/surah/${surah.number}`}
      className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-card-border bg-card-bg p-5 shadow-card-shadow transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary-glow"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary-glow/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center gap-4">
        {/* Surah Number Icon */}
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center font-bold text-sm text-foreground transition-all duration-300 group-hover:bg-primary-glow group-hover:text-primary">
          <div className="absolute inset-0 rotate-45 rounded-lg border-2 border-card-border/80 transition-all duration-300 group-hover:rotate-90 group-hover:border-primary/50" />
          <span className="relative z-10">{surah.number}</span>
        </div>

        {/* Name and Translation */}
        <div className="flex flex-col">
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-300">
            {displayName}
          </h3>
          <span className="text-xs text-muted mb-1">
            {displayMeaning}
          </span>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-md bg-card-border/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
              {surah.numberOfAyahs} Ayat
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${
                isMeccan
                  ? "bg-accent-glow/50 text-accent"
                  : "bg-primary-glow/50 text-primary"
              }`}
            >
              {isMeccan ? "Makkiyah" : "Madaniyah"}
            </span>
          </div>
        </div>
      </div>

      {/* Arabic Name & Play Icon */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-arabic text-xl font-bold text-primary group-hover:scale-105 transition-transform duration-300 leading-normal">
            {surah.name}
          </p>
        </div>
        <FaChevronRight className="h-4 w-4 text-muted opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
      </div>
    </Link>
  );
}
