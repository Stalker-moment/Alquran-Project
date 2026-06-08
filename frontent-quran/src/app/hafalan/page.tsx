"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSurahs, getSurahDetails, Surah, SurahDetail, Ayah } from "@/utils/api";
import {
  getMemorizedVerses,
  toggleVerseMemorized,
  isVerseMemorized,
  getSurahMemorizedStats,
  getTotalMemorizedCount,
} from "@/utils/hafalan";
import { useLanguage } from "@/context/LanguageContext";
import FlashCard from "@/components/FlashCard";
import {
  FaChevronLeft,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaRegCheckCircle,
  FaSearch,
  FaBrain,
  FaBookOpen,
  FaGraduationCap,
} from "react-icons/fa";

export default function HafalanPage() {
  const { language, t } = useLanguage();
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<"flashcard" | "cloze" | "fullhide">("flashcard");
  const [revealedClozeWords, setRevealedClozeWords] = useState<number[]>([]);
  const [isFullHideRevealed, setIsFullHideRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalMemorized, setTotalMemorized] = useState(0);
  const [localProgress, setLocalProgress] = useState<Record<number, number[]>>({});

  // Font settings
  const [arabicSize] = useState(36);
  const [arabicFont] = useState("quran-uthmani");

  // Load surahs list & overall stats on mount
  useEffect(() => {
    async function initPage() {
      try {
        setLoading(true);
        const list = await getSurahs();
        setSurahList(list);
        setTotalMemorized(getTotalMemorizedCount());
        setLocalProgress(getMemorizedVerses());
      } catch (err) {
        console.error("Failed to load surahs list for hafalan:", err);
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, []);

  // Fetch Surah details when a Surah is selected
  useEffect(() => {
    if (!selectedSurahNumber) return;
    const surahNum = selectedSurahNumber;
    async function loadSurah() {
      try {
        setLoading(true);
        const data = await getSurahDetails(surahNum);
        setSurahDetail(data);
        setCurrentAyahIndex(0);
        setRevealedClozeWords([]);
        setIsFullHideRevealed(false);
      } catch (err) {
        console.error("Failed to load surah details for hafalan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSurah();
  }, [selectedSurahNumber]);

  // Reset cloze / fullhide states when changing verse
  useEffect(() => {
    setRevealedClozeWords([]);
    setIsFullHideRevealed(false);
  }, [currentAyahIndex]);

  const handleSurahSelect = (num: number) => {
    setSelectedSurahNumber(num);
  };

  const handleBackToSelect = () => {
    setSelectedSurahNumber(null);
    setSurahDetail(null);
    setTotalMemorized(getTotalMemorizedCount());
    setLocalProgress(getMemorizedVerses());
  };

  const cleanTajweed = (text: string): string => {
    return text.replace(/\[[a-z](?::\d+)?\[/g, "").replace(/\]/g, "");
  };

  const handleToggleMemorized = () => {
    if (!surahDetail) return;
    const activeAyah = surahDetail.ayahs[currentAyahIndex];
    if (!activeAyah) return;
    
    toggleVerseMemorized(surahDetail.number, activeAyah.numberInSurah);
    setLocalProgress(getMemorizedVerses());
  };

  const isCurrentVerseMemorized = () => {
    if (!surahDetail) return false;
    const activeAyah = surahDetail.ayahs[currentAyahIndex];
    if (!activeAyah) return false;
    return localProgress[surahDetail.number]?.includes(activeAyah.numberInSurah) || false;
  };

  // Filter surahs based on query
  const filteredSurahs = surahList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.number.toString() === q ||
      s.englishName.toLowerCase().includes(q) ||
      (s.indonesianName && s.indonesianName.toLowerCase().includes(q)) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  });

  const fontClassMap: Record<string, string> = {
    "quran-uthmani": "font-amiri",
    "hafs": "font-hafs",
    "naskh": "font-naskh",
    "indopak": "font-indopak",
  };
  const selectedFontClass = fontClassMap[arabicFont] || "font-amiri";

  const getPercentTotal = () => {
    return Math.round((totalMemorized / 6236) * 1000) / 10;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: Selection Screen & Stats Dashboard */}
        {!selectedSurahNumber ? (
          <div className="space-y-8 animate-fade-in select-none">
            
            {/* Header / Intro */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-glow border border-primary/20 text-primary mb-2">
                <FaBrain className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t("hafalanTitle")}
              </h1>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                {t("hafalanSubtitle")}
              </p>
            </div>

            {/* Overall Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Memorized */}
              <div className="rounded-2xl border border-card-border bg-card-bg/40 backdrop-blur-xs p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">
                    {t("totalHafalanLabel")}
                  </span>
                  <p className="text-3xl font-black text-primary mt-2">
                    {totalMemorized} <span className="text-sm text-muted font-bold">/ 6236</span>
                  </p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-card-border h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (totalMemorized / 6236) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted font-bold mt-1.5 block">
                    {getPercentTotal()}% Selesai
                  </span>
                </div>
              </div>

              {/* Progress Title description */}
              <div className="rounded-2xl border border-card-border bg-card-bg/40 backdrop-blur-xs p-6 md:col-span-2 flex items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FaGraduationCap className="text-primary h-4.5 w-4.5" />
                    Cara Kerja Asisten Hafalan
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Pilih surah di bawah. Gunakan <strong>Flashcard</strong> untuk mengingat makna, 
                    <strong>Tebak Kata (Cloze)</strong> untuk melatih rangkaian kata secara bertahap, dan 
                    <strong>Sembunyi Penuh</strong> untuk menguji hafalan lafal secara utuh. Tandai ayat yang sudah hafal untuk melacak progress Anda!
                  </p>
                </div>
                <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-glow border border-primary/10 text-primary text-3xl font-extrabold shadow-inner select-none">
                  🎯
                </div>
              </div>
            </div>

            {/* Surah List & Search */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FaBookOpen className="text-primary h-4 w-4" />
                  {t("selectSurahHafalan")}
                </h2>
                <div className="relative max-w-sm w-full">
                  <input
                    type="text"
                    placeholder={language === "id" ? "Cari Surah..." : "Search Surah..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-card-border bg-card-bg/30 pl-9 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-3.5 w-3.5" />
                </div>
              </div>

              {/* Grid of Surahs */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="animate-pulse rounded-2xl border border-card-border bg-card-bg/25 p-5 h-24" />
                  ))}
                </div>
              ) : filteredSurahs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSurahs.map((surah) => {
                    const stats = getSurahMemorizedStats(surah.number, surah.numberOfAyahs);
                    return (
                      <button
                        key={surah.number}
                        onClick={() => handleSurahSelect(surah.number)}
                        className="w-full text-left rounded-2xl border border-card-border bg-card-bg/40 backdrop-blur-xs p-5 hover:border-primary/40 hover:bg-card-bg transition-all duration-300 shadow-xs group flex justify-between items-center cursor-pointer"
                      >
                        <div className="min-w-0 pr-4 flex items-center gap-3.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card-border text-xs font-extrabold text-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                            {surah.number}
                          </span>
                          <div className="min-w-0">
                            <span className="block text-sm font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                              {language === "id" ? surah.indonesianName || surah.englishName : surah.englishName}
                            </span>
                            <span className="block text-[10px] text-muted truncate">
                              {surah.numberOfAyahs} {t("ayat")}
                            </span>
                          </div>
                        </div>

                        {/* Progress display */}
                        <div className="flex flex-col items-end shrink-0">
                          {stats.count > 0 ? (
                            <>
                              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                <FaCheck className="h-2.5 w-2.5" />
                                {stats.count} Ayah
                              </span>
                              <span className="text-[9px] text-muted font-bold mt-0.5">
                                {stats.percent}% Hafal
                              </span>
                            </>
                          ) : (
                            <span className="text-[9px] text-muted font-semibold bg-card-border px-2 py-0.5 rounded-md">
                              0%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-card-border rounded-3xl text-muted text-sm">
                  {t("notFound")}
                </div>
              )}
            </div>
          </div>
        ) : (
          
          /* VIEW 2: Active Memorization Screen */
          <div className="space-y-6 animate-fade-in">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-card-border/60 pb-4 gap-4 select-none">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToSelect}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-foreground hover:bg-card-border transition-all cursor-pointer"
                  title="Kembali"
                >
                  <FaChevronLeft className="h-4 w-4" />
                </button>
                {surahDetail && (
                  <div>
                    <h1 className="text-xl font-extrabold text-foreground">
                      {language === "id" ? surahDetail.indonesianName || surahDetail.englishName : surahDetail.englishName}
                    </h1>
                    <p className="text-xs text-muted">
                      {surahDetail.revelationType === "Meccan" ? t("meccan") : t("medinan")} • {surahDetail.numberOfAyahs} {t("ayat")}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats Bar in Active Surah */}
              {surahDetail && (
                <div className="flex items-center gap-3 text-right max-w-xs w-full sm:w-auto">
                  <div className="flex-1 sm:flex-initial min-w-[100px]">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted mb-1">
                      <span>{t("hafalanStatsLabel")}</span>
                      <span className="text-primary">
                        {getSurahMemorizedStats(surahDetail.number, surahDetail.numberOfAyahs).percent}%
                      </span>
                    </div>
                    <div className="w-full sm:w-32 bg-card-border h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${getSurahMemorizedStats(surahDetail.number, surahDetail.numberOfAyahs).percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mode selection overlay */}
            <div className="flex justify-center select-none">
              <div className="inline-flex rounded-xl bg-card-bg/50 border border-card-border p-1 gap-1">
                <button
                  onClick={() => setActiveMode("flashcard")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "flashcard"
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t("modeFlashcard")}
                </button>
                <button
                  onClick={() => setActiveMode("cloze")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "cloze"
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t("modeCloze")}
                </button>
                <button
                  onClick={() => setActiveMode("fullhide")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "fullhide"
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t("modeFullHide")}
                </button>
              </div>
            </div>

            {/* Tips panel */}
            <div className="rounded-xl bg-primary-glow border border-primary/10 p-3 text-center text-xs text-muted max-w-lg mx-auto select-none">
              {activeMode === "flashcard" && t("flashcardClickTip")}
              {activeMode === "cloze" && t("clozeClickTip")}
              {activeMode === "fullhide" && t("fullHideClickTip")}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-xs text-muted animate-pulse">Memuat Ayat...</span>
              </div>
            )}

            {/* Main Interactive Play area */}
            {!loading && surahDetail && surahDetail.ayahs[currentAyahIndex] && (
              <div className="flex flex-col items-center gap-6">
                
                {/* 1. Flashcard Mode view */}
                {activeMode === "flashcard" && (
                  <FlashCard
                    verseKey={`${surahDetail.number}:${surahDetail.ayahs[currentAyahIndex].numberInSurah}`}
                    arabicText={cleanTajweed(surahDetail.ayahs[currentAyahIndex].text)}
                    transliteration={surahDetail.ayahs[currentAyahIndex].teksLatin || surahDetail.ayahs[currentAyahIndex].transliteration}
                    translation={surahDetail.ayahs[currentAyahIndex].translation}
                    fontClass={selectedFontClass}
                    arabicSize={arabicSize}
                  />
                )}

                {/* 2. Cloze Test Mode view */}
                {activeMode === "cloze" && (
                  <div className="w-full max-w-2xl min-h-60 rounded-3xl border border-card-border/70 bg-card-bg/40 backdrop-blur-xs p-6 md:p-8 flex flex-col justify-center items-center">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-6 select-none">
                      CLOZE TEST (FILL IN THE BLANKS)
                    </span>
                    <div 
                      className={`text-foreground leading-loose text-center ${selectedFontClass} flex flex-wrap gap-x-2 gap-y-3 justify-center max-w-xl pr-2`}
                      style={{ fontSize: `${arabicSize}px`, direction: "rtl" }}
                    >
                      {cleanTajweed(surahDetail.ayahs[currentAyahIndex].text)
                        .split(/\s+/)
                        .map((word, wIdx) => {
                          // Hide every 3rd word by default
                          const isHidden = (wIdx + 1) % 3 === 0;
                          const isRevealed = revealedClozeWords.includes(wIdx);
                          
                          if (isHidden && !isRevealed) {
                            return (
                              <button
                                key={wIdx}
                                onClick={() => setRevealedClozeWords((prev) => [...prev, wIdx])}
                                className="inline-flex items-center justify-center border-2 border-dashed border-primary/40 bg-primary-glow/20 rounded-lg h-9 w-12 text-center text-xs font-bold text-primary align-middle cursor-pointer hover:border-primary hover:bg-primary-glow transition-all duration-200"
                                title="Klik untuk tebak"
                              >
                                ?
                              </button>
                            );
                          }

                          return (
                            <span 
                              key={wIdx}
                              className={`transition-all duration-300 px-1 rounded-md ${
                                isHidden && isRevealed 
                                  ? "bg-primary/20 text-primary scale-105 font-bold" 
                                  : ""
                              }`}
                            >
                              {word}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 3. Full Hide Mode view */}
                {activeMode === "fullhide" && (
                  <div 
                    onClick={() => setIsFullHideRevealed(!isFullHideRevealed)}
                    className="w-full max-w-2xl min-h-60 rounded-3xl border border-card-border/70 bg-card-bg/40 backdrop-blur-xs p-6 md:p-8 flex flex-col justify-center items-center cursor-pointer group hover:border-primary/30 transition-all duration-300"
                  >
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-6 select-none">
                      FULL HIDE TEST
                    </span>
                    <div 
                      className={`text-foreground leading-loose text-center ${selectedFontClass} max-w-xl transition-all duration-500 ${
                        isFullHideRevealed 
                          ? "blur-none opacity-100 scale-100" 
                          : "blur-md opacity-25 scale-98 select-none"
                      }`}
                      style={{ fontSize: `${arabicSize}px` }}
                    >
                      {cleanTajweed(surahDetail.ayahs[currentAyahIndex].text)}
                    </div>
                    <span className="text-[10px] text-muted font-bold mt-8 opacity-60 flex items-center gap-1 select-none">
                      {isFullHideRevealed ? "👁️ Click to blur text" : "👁️ Click anywhere to reveal text"}
                    </span>
                  </div>
                )}

                {/* Control Panel: Checkbox "Mark as Memorized" */}
                <div className="flex flex-col items-center gap-3 select-none">
                  <button
                    onClick={handleToggleMemorized}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border ${
                      isCurrentVerseMemorized()
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary-glow"
                        : "bg-background border-card-border hover:border-primary/45 text-foreground"
                    }`}
                  >
                    {isCurrentVerseMemorized() ? (
                      <>
                        <FaRegCheckCircle className="h-4.5 w-4.5" />
                        <span>{t("memorizedBadge")}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-muted" />
                        <span>{t("markMemorized")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Navigation Toolbar */}
                <div className="flex items-center justify-between max-w-lg w-full bg-card-bg/40 border border-card-border rounded-2xl p-4 shadow-sm select-none">
                  {/* Prev Button */}
                  <button
                    disabled={currentAyahIndex === 0}
                    onClick={() => setCurrentAyahIndex((prev) => prev - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-card-border transition-all cursor-pointer"
                  >
                    <FaArrowLeft className="h-3.5 w-3.5" />
                  </button>

                  {/* Tracker label */}
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    QS. {surahDetail.englishName} • {t("ayahOf", { current: currentAyahIndex + 1, total: surahDetail.numberOfAyahs })}
                  </span>

                  {/* Next Button */}
                  <button
                    disabled={currentAyahIndex === surahDetail.ayahs.length - 1}
                    onClick={() => setCurrentAyahIndex((prev) => prev + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-card-border transition-all cursor-pointer"
                  >
                    <FaArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
