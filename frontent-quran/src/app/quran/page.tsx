"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SurahCard from "@/components/SurahCard";
import { getSurahs, Surah } from "@/utils/api";
import { useLanguage } from "@/context/LanguageContext";
import { FaSearch, FaQuran, FaHeart } from "react-icons/fa";
import { animate, stagger, utils } from "animejs";

export default function QuranPage() {
  const { t, language } = useLanguage();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Surahs on Mount
  useEffect(() => {
    async function loadSurahs() {
      try {
        setLoading(true);
        const data = await getSurahs();
        setSurahs(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(t("failedLoad"));
      } finally {
        setLoading(false);
      }
    }
    loadSurahs();
  }, [t]);

  // Filter Surahs based on Search Query
  const filteredSurahs = surahs.filter((surah) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      surah.number.toString() === query ||
      surah.englishName.toLowerCase().includes(query) ||
      surah.englishNameTranslation.toLowerCase().includes(query) ||
      (surah.indonesianName && surah.indonesianName.toLowerCase().includes(query)) ||
      surah.name.includes(query)
    );
  });

  // Stagger entry animation for Surah cards using Anime.js
  useEffect(() => {
    if (!loading && filteredSurahs.length > 0) {
      utils.remove(".surah-card-anim");
      animate(".surah-card-anim", {
        opacity: [0, 1],
        translateY: [24, 0],
        delay: stagger(30, { start: 50 }),
        duration: 700,
        ease: "outQuint",
      });
    }
  }, [loading, searchQuery, surahs, filteredSurahs.length]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/40 via-card-bg/50 to-transparent p-8 md:p-12 mb-10 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-glow/85 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              <FaQuran className="h-3 w-3" />
              {t("appName")} Online
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {t("heroTitle").split("Dalam")[0]} <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                {t("heroTitle").substring(t("heroTitle").indexOf("Dalam") !== -1 ? t("heroTitle").indexOf("Dalam") : t("heroTitle").indexOf("In"))}
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted max-w-lg">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="relative hidden md:flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-primary/25 to-accent/25 border border-primary/20 text-primary animate-pulse">
            <FaQuran className="h-24 w-24 opacity-80" />
            <div className="absolute inset-0 rounded-2xl border border-primary/10 scale-105" />
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="relative max-w-xl mx-auto mb-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <FaSearch className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-card-border bg-card-bg/60 py-4.5 pl-11 pr-4 text-base text-foreground shadow-xs transition-all duration-300 placeholder:text-muted focus:border-primary/80 focus:bg-card-bg focus:ring-2 focus:ring-primary-glow focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs text-muted hover:text-primary transition-colors"
            >
              {t("clear")}
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-500 max-w-md mx-auto">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
            >
              {t("tryAgain")}
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse flex items-center justify-between rounded-2xl border border-card-border/60 bg-card-bg/40 p-5 h-[88px]"
              >
                <div className="flex items-center gap-4 w-3/4">
                  <div className="h-10 w-10 rounded-lg bg-card-border" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-card-border rounded-sm w-1/2" />
                    <div className="h-3 bg-card-border rounded-sm w-3/4" />
                  </div>
                </div>
                <div className="h-6 bg-card-border rounded-sm w-12" />
              </div>
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {!loading && filteredSurahs.length === 0 && !error && (
          <div className="text-center py-16 border border-dashed border-card-border rounded-2xl">
            <FaQuran className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground mb-1">{t("notFound")}</h3>
            <p className="text-sm text-muted">{t("notFoundSub")}</p>
          </div>
        )}

        {/* Surahs Grid */}
        {!loading && filteredSurahs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                className="surah-card-anim opacity-0"
              >
                <SurahCard surah={surah} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border py-8 mt-16 bg-card-bg/10 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <span>{language === "id" ? "Dibuat dengan" : "Made with"}</span>
              <FaHeart className="h-3 w-3 text-rose-500 animate-pulse" />
              <span>{language === "id" ? "oleh" : "by"}</span>
              <a
                href="https://tierkun.com"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-primary hover:text-accent transition-colors"
              >
                sinyo @ tierkun
              </a>
            </div>
            <span className="hidden sm:block text-card-border">·</span>
            <div className="flex items-center gap-4">
              <a
                href="https://alquran.cloud"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
              >
                {t("sumberApi")}
              </a>
              <span>•</span>
              <span className="text-primary font-medium">{t("readListenTadabbur")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
