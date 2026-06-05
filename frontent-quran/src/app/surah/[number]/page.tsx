"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { animate, stagger, utils } from "animejs";
import Navbar from "@/components/Navbar";
import SettingsPanel from "@/components/SettingsPanel";
import AudioPlayer from "@/components/AudioPlayer";
import { getSurahDetails, SurahDetail, getSurahs, Surah } from "@/utils/api";
import { useLanguage } from "@/context/LanguageContext";
import { FaChevronLeft, FaPlay, FaPause, FaRegCopy, FaCheck, FaSlidersH, FaBookmark, FaRegBookmark } from "react-icons/fa";

const TAJWEED_RULES_INFO: Record<string, Record<string, { name: string; desc: string }>> = {
  id: {
    h: { name: "Hamzah Wasal", desc: "Wajib dibaca jika memulai bacaan, samar jika di tengah." },
    s: { name: "Silent / Senyap", desc: "Huruf tertulis tetapi tidak dilafalkan." },
    l: { name: "Lam Shamsiyyah", desc: "Huruf lam dibaca melebur langsung ke huruf berikutnya." },
    n: { name: "Mad Normal (Thabi'i)", desc: "Dibaca panjang sepanjang 2 harakat." },
    q: { name: "Qalqalah", desc: "Bunyi memantul ketika huruf qalqalah sukun/mati." },
    g: { name: "Ghunnah", desc: "Dengung hidung ditahan sepanjang 2 harakat." },
    m: { name: "Mad Wajib Muttashil", desc: "Mad bertemu hamzah dalam satu kata, dibaca 4-5 harakat." },
    o: { name: "Mad Jaiz Munfashil", desc: "Mad bertemu hamzah di lain kata, dibaca 2, 4, atau 5 harakat." },
    w: { name: "Waqf / Tempat Berhenti", desc: "Penanda tempat berhenti membaca ayat." },
    c: { name: "Ikhfa' Haqiqi", desc: "Menyamarkan bacaan nun mati/tanwin dengan dengung." },
    f: { name: "Ikhfa' Shafawi", desc: "Menyamarkan bacaan mim mati bertemu huruf ba." },
    x: { name: "Idgham", desc: "Memasukkan bunyi nun mati/tanwin ke huruf berikutnya." },
    y: { name: "Idgham Shafawi", desc: "Memasukkan bunyi mim mati bertemu mim." },
    z: { name: "Iqlab", desc: "Mengubah bunyi nun mati/tanwin menjadi bunyi mim." },
    p: { name: "Tafkhim", desc: "Huruf dibaca tebal dengan mengangkat pangkal lidah." },
    u: { name: "Tarqiq", desc: "Huruf dibaca tipis dengan menurunkan pangkal lidah." },
  },
  en: {
    h: { name: "Hamzatul Wasl", desc: "Pronounced when starting recitation, silent in intermediate." },
    s: { name: "Silent", desc: "The letter is written but not pronounced." },
    l: { name: "Lam Shamsiyyah", desc: "The lam letter is silent and merged into the next letter." },
    n: { name: "Normal Maddah", desc: "Prolonged for 2 harakat." },
    q: { name: "Qalaqah", desc: "Echoing/bouncing sound when the letter is silent/sukun." },
    g: { name: "Ghunnah", desc: "Nasal sound held for 2 harakat." },
    m: { name: "Obligatory Maddah", desc: "Maddah before hamzah in the same word, held for 4-5 harakat." },
    o: { name: "Permissible Maddah", desc: "Maddah before hamzah in separate words, held for 2, 4, or 5 harakat." },
    w: { name: "Waqf / Pause", desc: "Indicates a place to pause or stop recitation." },
    c: { name: "Ikhfa", desc: "Concealment of nun sakinah/tanwin with nasalization." },
    f: { name: "Ikhfa Shafawi", desc: "Concealment of mim sakinah before the letter ba." },
    x: { name: "Idgham", desc: "Merging of nun sakinah/tanwin into the following letter." },
    y: { name: "Idgham Shafawi", desc: "Merging of mim sakinah into another mim." },
    z: { name: "Iqlab", desc: "Conversion of nun sakinah/tanwin sound to mim." },
    p: { name: "Tafkhim", desc: "Thick pronunciation by raising the back of the tongue." },
    u: { name: "Tarqiq", desc: "Thin pronunciation by lowering the back of the tongue." },
  }
};

/**
 * Parses bracketed Tajweed rules from api.alquran.cloud (quran-tajweed)
 * and converts them into colored HTML spans.
 */
function parseTajweed(text: string): string {
  const regex = /\[([a-z])(?::([0-9]+))?\[([^\[\]]+)\]/g;
  
  let current = text;
  let prev;
  const ruleClassMap: Record<string, string> = {
    h: "tajweed-ham-wasl",
    s: "tajweed-silent",
    l: "tajweed-lam-shamsiyyah",
    n: "tajweed-madda-normal",
    q: "tajweed-qalaqah",
    g: "tajweed-ghunnah",
    m: "tajweed-madda-obligatory",
    o: "tajweed-madda-permissible",
    w: "tajweed-waqf",
    c: "tajweed-ikhfa",
    f: "tajweed-ikhfa-shafawi",
    x: "tajweed-idgham",
    y: "tajweed-idgham-shafawi",
    z: "tajweed-iqlab",
    p: "tajweed-tafkhim",
    u: "tajweed-tarqiq",
  };

  let iterations = 0;
  while (iterations < 10) {
    prev = current;
    current = current.replace(regex, (match, rule, color, chars) => {
      const className = ruleClassMap[rule] || "tajweed-default";
      return `<span class="${className}" data-rule="${rule}" data-color="${color || ""}" class="cursor-help transition-opacity hover:opacity-85">${chars}</span>`;
    });
    if (current === prev) break;
    iterations++;
  }
  
  return current;
}

export default function SurahPage() {
  const params = useParams();
  const router = useRouter();
  const surahNumber = Number(params.number);
  const { language, t } = useLanguage();

  // States for Surah Details
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Reading Settings
  const [arabicSize, setArabicSize] = useState<number>(36);
  const [translationSize, setTranslationSize] = useState<number>(16);
  const [selectedTranslation, setSelectedTranslation] = useState<string>("id.indonesian");
  const [selectedReciter, setSelectedReciter] = useState<string>("ar.alafasy");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [useTajweed, setUseTajweed] = useState<boolean>(false);
  const [showIsyarat, setShowIsyarat] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<{ surahNumber: number; surahName: string; indonesianName?: string; ayahNumber: number }[]>([]);
  const [activeTajweedRule, setActiveTajweedRule] = useState<{ name: string; desc: string; targetRect: DOMRect } | null>(null);

  // States for Audio Player
  const [hasStartedAudio, setHasStartedAudio] = useState<boolean>(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Fetch Surah List for sticky header dropdown navigation
  const [surahList, setSurahList] = useState<Surah[]>([]);
  useEffect(() => {
    async function loadSurahList() {
      try {
        const data = await getSurahs();
        setSurahList(data);
      } catch (err) {
        console.error("Failed to load surah list for navigation:", err);
      }
    }
    loadSurahList();
  }, []);

  const [isSurahSelectOpen, setIsSurahSelectOpen] = useState(false);
  const [isAyahSelectOpen, setIsAyahSelectOpen] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState("");

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedShowLatin = localStorage.getItem("quran-show-latin");
      if (savedShowLatin !== null) setShowLatin(savedShowLatin === "true");

      const savedUseTajweed = localStorage.getItem("quran-use-tajweed");
      if (savedUseTajweed !== null) setUseTajweed(savedUseTajweed === "true");

      const savedShowIsyarat = localStorage.getItem("quran-show-isyarat");
      if (savedShowIsyarat !== null) setShowIsyarat(savedShowIsyarat === "true");

      const savedBookmarks = localStorage.getItem("quran-bookmarks");
      if (savedBookmarks !== null) {
        try {
          setBookmarks(JSON.parse(savedBookmarks));
        } catch (e) {
          console.error("Failed to parse bookmarks", e);
        }
      }
    }
  }, []);

  const handleSetShowLatin = (val: boolean) => {
    setShowLatin(val);
    localStorage.setItem("quran-show-latin", String(val));
  };

  const handleSetUseTajweed = (val: boolean) => {
    setUseTajweed(val);
    localStorage.setItem("quran-use-tajweed", String(val));
  };

  const handleSetShowIsyarat = (val: boolean) => {
    setShowIsyarat(val);
    localStorage.setItem("quran-show-isyarat", String(val));
  };

  const handleToggleBookmark = (ayahNum: number) => {
    if (!surahDetail) return;
    
    const isBookmarked = bookmarks.some(b => b.surahNumber === surahDetail.number && b.ayahNumber === ayahNum);
    let updatedBookmarks;
    
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter(b => !(b.surahNumber === surahDetail.number && b.ayahNumber === ayahNum));
    } else {
      updatedBookmarks = [
        ...bookmarks,
        {
          surahNumber: surahDetail.number,
          surahName: surahDetail.englishName,
          indonesianName: surahDetail.indonesianName,
          ayahNumber: ayahNum
        }
      ];
    }
    
    setBookmarks(updatedBookmarks);
    localStorage.setItem("quran-bookmarks", JSON.stringify(updatedBookmarks));
  };

  const handleArabicTextClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === "SPAN" && target.hasAttribute("data-rule")) {
      e.stopPropagation();
      const rule = target.getAttribute("data-rule") || "";
      const ruleInfo = TAJWEED_RULES_INFO[language][rule];
      if (ruleInfo) {
        const rect = target.getBoundingClientRect();
        setActiveTajweedRule({
          name: ruleInfo.name,
          desc: ruleInfo.desc,
          targetRect: rect
        });
      }
    } else {
      setActiveTajweedRule(null);
    }
  };

  // Load Surah Details based on route and configuration
  useEffect(() => {
    async function loadSurah() {
      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        setError(t("invalidSurah"));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Reset player index when switching surah
        setCurrentAyahIndex(0);
        setIsPlaying(false);
        setHasStartedAudio(false);
        
        const data = await getSurahDetails(surahNumber, selectedTranslation, selectedReciter, useTajweed);
        setSurahDetail(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(t("loadingDetails"));
      } finally {
        setLoading(false);
      }
    }
    loadSurah();
  }, [surahNumber, selectedTranslation, selectedReciter, useTajweed]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Stagger entry animation for Ayah cards using Anime.js
  useEffect(() => {
    if (!loading && surahDetail) {
      utils.remove(".ayah-card-anim");
      animate(".ayah-card-anim", {
        opacity: [0, 1],
        translateY: [16, 0],
        delay: stagger(25),
        duration: 600,
        ease: "outQuad",
      });
    }
  }, [loading, surahDetail]);

  // Save Last Read position
  useEffect(() => {
    if (!loading && surahDetail) {
      localStorage.setItem("quran-last-read", JSON.stringify({
        surahNumber: surahDetail.number,
        surahName: surahDetail.englishName,
        indonesianName: surahDetail.indonesianName,
        ayahNumber: currentAyahIndex + 1,
        timestamp: Date.now()
      }));
    }
  }, [loading, surahDetail, currentAyahIndex]);

  // Scroll to ayah from hash or query param on load
  useEffect(() => {
    if (!loading && surahDetail) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryAyah = urlParams.get("ayah");
      const hash = window.location.hash;
      
      let targetAyahNum = null;
      if (queryAyah) {
        targetAyahNum = parseInt(queryAyah);
      } else if (hash && hash.startsWith("#ayah-")) {
        targetAyahNum = parseInt(hash.replace("#ayah-", ""));
      }

      if (targetAyahNum && !isNaN(targetAyahNum)) {
        setTimeout(() => {
          const element = document.getElementById(`ayah-${targetAyahNum}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setCurrentAyahIndex(targetAyahNum - 1);
          }
        }, 500);
      }
    }
  }, [loading, surahDetail]);

  // Copy Ayah text to clipboard (Arabic & Translation)
  const handleCopyAyah = (arabic: string, translation: string, num: number) => {
    // Clean Tajweed formatting brackets from clipboard copy text
    const cleanArabic = arabic.replace(/\[[a-z](:\d+)?\[/g, "").replace(/\]/g, "");
    const displayName = language === "id" ? surahDetail?.indonesianName || surahDetail?.englishName : surahDetail?.englishName;
    const textToCopy = `${cleanArabic}\n\n${translation}\n\n(QS. ${displayName}: ${num})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(num);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Play a specific Ayah directly
  const handlePlayAyah = (index: number) => {
    if (!hasStartedAudio) {
      setHasStartedAudio(true);
    }
    
    if (currentAyahIndex === index) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAyahIndex(index);
      setIsPlaying(true);
    }
  };

  // Play the entire Surah from the header
  const handlePlaySurahHeader = () => {
    if (!hasStartedAudio) {
      setHasStartedAudio(true);
      setCurrentAyahIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md border border-card-border bg-card-bg/60 p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-red-500 mb-2">{t("errorTitle")}</h2>
            <p className="text-muted mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/95 transition-all"
            >
              <FaChevronLeft /> {t("backToHome")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Bismillah is not shown for Surah 1 (already in Ayah 1) and Surah 9 (At-Tawbah)
  const showBismillahHeader = surahNumber !== 1 && surahNumber !== 9;

  // Dynamic vertical offset for floating settings button to prevent overlap with AudioPlayer
  const settingsButtonBottomClass = hasStartedAudio ? "bottom-20" : "bottom-6";

  return (
    <div className={`flex flex-col min-h-screen ${hasStartedAudio ? "pb-32" : "pb-12"}`}>
      
      {/* Sticky Reading Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 select-none">
          {/* Left: Back Button */}
          <Link
            href="/quran"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-card-bg/50 border border-card-border px-3 text-xs sm:text-sm font-semibold text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xs shrink-0 animate-fade-in"
            title={t("backToSurahs")}
          >
            <FaChevronLeft className="h-3 w-3 shrink-0" />
            <span className="hidden xs:inline">{t("surahList")}</span>
          </Link>

          {/* Center: Quick Selectors (Surah & Ayah) */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-[65%] xs:max-w-none justify-center">
            
            {/* Surah Custom Select */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSurahSelectOpen(!isSurahSelectOpen);
                  setIsAyahSelectOpen(false);
                  setSurahSearchQuery(""); // Reset search on open
                }}
                className="flex items-center justify-between gap-1.5 rounded-xl border border-card-border bg-card-bg px-2.5 py-1.5 text-xs sm:text-sm font-extrabold text-foreground hover:border-primary/45 transition-all duration-200 cursor-pointer shadow-xs max-w-[105px] xs:max-w-[160px] truncate select-none text-left"
              >
                <span className="truncate">
                  {surahDetail ? `${surahDetail.number}. ${language === "id" ? surahDetail.indonesianName || surahDetail.englishName : surahDetail.englishName}` : surahNumber}
                </span>
                <span className="text-muted text-[8px] sm:text-[10px] shrink-0">▼</span>
              </button>

              {isSurahSelectOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsSurahSelectOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 z-20 w-56 max-h-72 overflow-y-auto rounded-xl border border-card-border bg-card-bg p-2 shadow-xl flex flex-col gap-1.5 select-none animate-fade-in">
                    {/* Search Input */}
                    <div className="px-1 py-0.5 sticky top-0 bg-card-bg z-10">
                      <input
                        type="text"
                        placeholder={language === "id" ? "Cari Surah..." : "Search Surah..."}
                        value={surahSearchQuery}
                        onChange={(e) => setSurahSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-card-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/80 focus:outline-hidden"
                        autoFocus
                      />
                    </div>
                    
                    {/* Filtered Scroll list */}
                    <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5">
                      {(surahList.length > 0 ? surahList : (surahDetail ? [surahDetail] : [])).filter(s => {
                        const query = surahSearchQuery.toLowerCase().trim();
                        if (!query) return true;
                        return (
                          s.number.toString() === query ||
                          s.englishName.toLowerCase().includes(query) ||
                          (s.indonesianName && s.indonesianName.toLowerCase().includes(query)) ||
                          s.englishNameTranslation.toLowerCase().includes(query) ||
                          (s.indonesianNameTranslation && s.indonesianNameTranslation.toLowerCase().includes(query)) ||
                          s.name.includes(query)
                        );
                      }).map((s) => (
                        <button
                          key={s.number}
                          type="button"
                          onClick={() => {
                            router.push(`/surah/${s.number}`);
                            setIsSurahSelectOpen(false);
                          }}
                          className={`w-full text-left rounded-lg px-2 py-1.5 text-xs transition-colors cursor-pointer flex justify-between items-center ${
                            surahNumber === s.number
                                ? "bg-primary text-white font-bold"
                                : "text-foreground hover:bg-primary-glow hover:text-primary"
                          }`}
                        >
                          <span className="truncate">{s.number}. {language === "id" ? s.indonesianName || s.englishName : s.englishName}</span>
                          <span className="font-arabic text-[10px] shrink-0 opacity-80">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Ayah Custom Select */}
            {surahDetail && surahDetail.ayahs.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsAyahSelectOpen(!isAyahSelectOpen);
                    setIsSurahSelectOpen(false);
                  }}
                  className="flex items-center justify-between gap-1.5 rounded-xl border border-card-border bg-card-bg px-2.5 py-1.5 text-xs sm:text-sm font-extrabold text-foreground hover:border-primary/45 transition-all duration-200 cursor-pointer shadow-xs shrink-0 select-none text-left"
                >
                  <span>{t("ayat")} {currentAyahIndex + 1}</span>
                  <span className="text-muted text-[8px] sm:text-[10px] shrink-0">▼</span>
                </button>

                {isAyahSelectOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsAyahSelectOpen(false)} />
                    <div className="absolute top-full right-0 mt-1 z-20 w-32 max-h-60 overflow-y-auto rounded-xl border border-card-border bg-card-bg p-1.5 shadow-xl flex flex-col gap-0.5 select-none animate-fade-in">
                      {surahDetail.ayahs.map((ayah) => (
                        <button
                          key={ayah.numberInSurah}
                          type="button"
                          onClick={() => {
                            setCurrentAyahIndex(ayah.numberInSurah - 1);
                            setIsAyahSelectOpen(false);
                            // Scroll to target Ayah
                            const element = document.getElementById(`ayah-${ayah.numberInSurah}`);
                            if (element) {
                              element.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                            currentAyahIndex === ayah.numberInSurah - 1
                              ? "bg-primary text-white font-bold"
                              : "text-foreground hover:bg-primary-glow hover:text-primary"
                          }`}
                        >
                          {t("ayat")} {ayah.numberInSurah}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

          {/* Right: Settings Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xs cursor-pointer"
              title={t("settingsTitle")}
              aria-label="Open settings"
            >
              <FaSlidersH className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="animate-pulse h-48 rounded-3xl border border-card-border bg-card-bg/30 flex flex-col items-center justify-center space-y-3" />
            {/* Verses skeletons */}
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-2xl border border-card-border/50 bg-card-bg/20 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-6 rounded-full bg-card-border" />
                    <div className="h-8 bg-card-border rounded-sm w-1/3 text-right" />
                  </div>
                  <div className="h-4 bg-card-border rounded-sm w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surah Reading View */}
        {!loading && surahDetail && (
          <div className="space-y-8">
            
            {/* Surah Header Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/30 via-card-bg/40 to-transparent p-8 text-center shadow-sm flex flex-col items-center">
              <div className="absolute inset-0 -z-10 bg-linear-to-tr from-accent-glow/5 via-transparent to-transparent" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5 block">
                {surahDetail.revelationType === "Meccan" ? t("meccan") : t("medinan")} • {surahDetail.numberOfAyahs} {t("ayat")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">
                {language === "id" ? surahDetail.indonesianName || surahDetail.englishName : surahDetail.englishName}
              </h2>
              <p className="text-sm text-muted italic mb-4">
                "{language === "id" ? surahDetail.indonesianNameTranslation || surahDetail.englishNameTranslation : surahDetail.englishNameTranslation}"
              </p>
              
              <div className="w-full max-w-xs border-t border-card-border/60 pt-4 pb-1">
                <p className="font-arabic text-3xl font-bold text-primary leading-normal">
                  {surahDetail.name}
                </p>
              </div>

              {/* Play Murottal Surah Action Button */}
              <button
                onClick={handlePlaySurahHeader}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-glow hover:scale-105 active:scale-95 transition-all duration-300 mt-4"
              >
                {isPlaying ? (
                  <>
                    <FaPause className="h-3.5 w-3.5" />
                    <span>{t("pauseSurah")}</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="h-3.5 w-3.5 translate-x-0.5" />
                    <span>{t("playSurah")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Bismillah Header (if applicable) */}
            {showBismillahHeader && (
              <div className="text-center py-6">
                <p className="font-arabic text-3xl md:text-4xl text-foreground select-none">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {/* Ayahs List */}
            <div className="space-y-6">
              {surahDetail.ayahs.map((ayah, index) => {
                const isActive = currentAyahIndex === index && isPlaying;
                
                // Clean up Bismillah from the first verse text if it starts with it (except for Surah Fatihah 1:1)
                let renderedArabic = ayah.text;
                if (surahNumber !== 1 && index === 0 && renderedArabic.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")) {
                  renderedArabic = renderedArabic.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
                }

                return (
                  <div
                    key={ayah.number}
                    id={`ayah-${ayah.numberInSurah}`}
                    className={`ayah-card-anim opacity-0 rounded-2xl border p-6 md:p-8 transition-all duration-300 ${
                      isActive
                        ? "border-primary/60 bg-primary-glow/20 shadow-md shadow-primary-glow glow-pulse"
                        : "border-card-border bg-card-bg/50 hover:bg-card-bg hover:border-card-border/80"
                    }`}
                  >
                    {/* Top Row: Ayah Info & Actions */}
                    <div className="flex items-center justify-between gap-4 mb-6 select-none">
                      {/* Verse Tag */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card-border text-xs font-bold text-foreground">
                        {surahNumber}:{ayah.numberInSurah}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Play Ayah */}
                        <button
                          onClick={() => handlePlayAyah(index)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary text-white"
                              : "bg-card-border text-muted hover:text-primary hover:bg-primary-glow"
                          }`}
                          title={isActive ? t("pauseSurah") : t("playAyah")}
                        >
                          {isActive ? (
                            <FaPause className="h-3 w-3" />
                          ) : (
                            <FaPlay className="h-3 w-3 translate-x-px" />
                          )}
                        </button>

                        {/* Copy Ayah */}
                        <button
                          onClick={() => handleCopyAyah(ayah.text, ayah.translation, ayah.numberInSurah)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-border text-muted hover:text-primary hover:bg-primary-glow transition-colors"
                          title={t("copyAyah")}
                        >
                          {copiedAyah === ayah.numberInSurah ? (
                            <FaCheck className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <FaRegCopy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Bookmark Ayah */}
                        <button
                          onClick={() => handleToggleBookmark(ayah.numberInSurah)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah)
                              ? "bg-primary text-white"
                              : "bg-card-border text-muted hover:text-primary hover:bg-primary-glow"
                          }`}
                          title={t("bookmarksTitle")}
                        >
                          {bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah) ? (
                            <FaBookmark className="h-3.5 w-3.5" />
                          ) : (
                            <FaRegBookmark className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Verse Text (renders HTML spans if Tajweed highlighting is enabled) */}
                    <div 
                      onClick={handleArabicTextClick}
                      className="mb-6 text-right font-arabic selection:bg-primary-glow selection:text-primary"
                    >
                      {useTajweed ? (
                        <p
                          className="arabic-text text-foreground tracking-wide select-all cursor-help"
                          style={{ fontSize: `${arabicSize}px` }}
                          dangerouslySetInnerHTML={{ __html: parseTajweed(renderedArabic) }}
                        />
                      ) : (
                        <p
                          className="arabic-text text-foreground tracking-wide select-all"
                          style={{ fontSize: `${arabicSize}px` }}
                        >
                          {renderedArabic}
                        </p>
                      )}
                    </div>

                    {/* Quran Isyarat (Sign Language) */}
                    {showIsyarat && (
                      <div className="mt-4 mb-6 text-right select-all">
                        <p
                          className="font-isyarat text-foreground/95 tracking-wide leading-loose"
                          style={{ fontSize: `${arabicSize * 1.1}px` }}
                        >
                          {renderedArabic.replace(/\[[a-z](:\d+)?\[/g, "").replace(/\]/g, "")}
                        </p>
                      </div>
                    )}

                    {/* Latin / Transliteration Text — styled differently for ID vs EN */}
                    {showLatin && (
                      <div className="mb-4 text-left select-all">
                        {language === "id" ? (
                          /* Indonesian: NU-style Latin from equran.id */
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 rounded-md border border-primary/20 bg-primary-glow/50 px-1.5 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide leading-none">
                              Latin
                            </span>
                            <p className="text-primary/85 font-sans text-sm sm:text-base font-normal leading-relaxed antialiased italic">
                              {ayah.teksLatin || ayah.transliteration || "—"}
                            </p>
                          </div>
                        ) : (
                          /* English: Academic transliteration from alquran.cloud */
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 rounded-md border border-accent/20 bg-accent-glow/50 px-1.5 py-0.5 text-[9px] font-bold text-accent uppercase tracking-wide leading-none">
                              Translit.
                            </span>
                            <p className="text-accent/80 font-sans text-sm sm:text-base font-light leading-relaxed antialiased tracking-wide">
                              {ayah.transliteration || "—"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Translation Text */}
                    <div className="border-t border-card-border/60 pt-4 text-left select-all">
                      <p
                        className="text-foreground font-normal leading-relaxed selection:bg-primary-glow selection:text-primary"
                        style={{ fontSize: `${translationSize}px` }}
                      >
                        {ayah.translation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </main>

      {/* Persistent bottom Audio Player - Rendered outside of main for full-viewport alignments */}
      {!loading && surahDetail && surahDetail.ayahs.length > 0 && hasStartedAudio && (
        <AudioPlayer
          surahName={language === "id" ? surahDetail.indonesianName || surahDetail.englishName : surahDetail.englishName}
          ayahs={surahDetail.ayahs}
          currentAyahIndex={currentAyahIndex}
          setCurrentAyahIndex={setCurrentAyahIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          autoScroll={autoScroll}
        />
      )}

      {/* Slide-out Settings Panel - Rendered outside of main for full-viewport overlay */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        arabicSize={arabicSize}
        setArabicSize={setArabicSize}
        translationSize={translationSize}
        setTranslationSize={setTranslationSize}
        selectedTranslation={selectedTranslation}
        setSelectedTranslation={setSelectedTranslation}
        selectedReciter={selectedReciter}
        setSelectedReciter={setSelectedReciter}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        showLatin={showLatin}
        setShowLatin={handleSetShowLatin}
        useTajweed={useTajweed}
        setUseTajweed={handleSetUseTajweed}
        showIsyarat={showIsyarat}
        setShowIsyarat={handleSetShowIsyarat}
      />

      {/* Floating Action Button for Settings - Rendered outside of main */}
      {!loading && surahDetail && (
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`fixed right-6 ${settingsButtonBottomClass} z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary-glow hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer`}
          title={t("floatingSettings")}
          aria-label="Open settings"
        >
          <FaSlidersH className="h-5 w-5 animate-pulse" />
        </button>
      )}

      {/* Tajweed rule description tooltip */}
      {activeTajweedRule && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveTajweedRule(null)} />
          <div 
            className="fixed z-50 bg-card-bg border border-card-border p-3 rounded-xl shadow-xl max-w-xs animate-fade-in text-xs font-sans text-left transition-all duration-300 select-none"
            style={{
              top: `${activeTajweedRule.targetRect.top - 85}px`,
              left: `${Math.max(16, Math.min(window.innerWidth - 216, activeTajweedRule.targetRect.left + (activeTajweedRule.targetRect.width / 2) - 100))}px`,
              width: "200px"
            }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-card-bg border-r border-b border-card-border" />
            <h4 className="font-bold text-primary mb-1">{activeTajweedRule.name}</h4>
            <p className="text-muted leading-relaxed">{activeTajweedRule.desc}</p>
          </div>
        </>
      )}
    </div>
  );
}
