"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { animate, stagger, utils } from "animejs";
import Navbar from "@/components/Navbar";
import SettingsPanel from "@/components/SettingsPanel";
import AudioPlayer from "@/components/AudioPlayer";
import CustomSelect from "@/components/CustomSelect";
import { getJuzDetails, JuzDetail, JUZ_MAPPINGS, Ayah, getQuranComRecitationId, getSurahAudioSegments } from "@/utils/api";
import { updateSurahProgress } from "@/utils/progress";
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

function parseTajweed(text: string): string {
  const regex = /\[([a-z])(::[0-9]+)?\[([^\[\]]+)\]/g;
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

interface WordToken {
  text: string;
  tajweedHtml: string;
}

function parseVerseWords(rawText: string): WordToken[] {
  const words: WordToken[] = [];
  let currentText = "";
  let currentHtml = "";
  
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

  const activeRules: { rule: string; className: string }[] = [];
  
  let i = 0;
  while (i < rawText.length) {
    const char = rawText[i];
    
    if (char === '[') {
      const match = rawText.slice(i).match(/^\[([a-z])(?::+\d+)?\[/);
      if (match) {
        const rule = match[1];
        const className = ruleClassMap[rule] || "tajweed-default";
        activeRules.push({ rule, className });
        i += match[0].length;
        continue;
      }
    }
    
    if (char === ']') {
      if (activeRules.length > 0) {
        activeRules.pop();
      }
      i++;
      continue;
    }
    
    if (/\s/.test(char)) {
      if (currentText.length > 0) {
        words.push({ text: currentText, tajweedHtml: currentHtml });
        currentText = "";
        currentHtml = "";
      }
      i++;
      continue;
    }
    
    currentText += char;
    
    let charHtml = char;
    for (let r = activeRules.length - 1; r >= 0; r--) {
      const active = activeRules[r];
      charHtml = `<span class="${active.className}" data-rule="${active.rule}">${charHtml}</span>`;
    }
    currentHtml += charHtml;
    
    i++;
  }
  
  if (currentText.length > 0) {
    words.push({ text: currentText, tajweedHtml: currentHtml });
  }
  
  return words;
}

export default function JuzPage() {
  const params = useParams();
  const router = useRouter();
  const juzNumber = Number(params.number);
  const { language, t } = useLanguage();

  // States for Juz Details
  const [juzDetail, setJuzDetail] = useState<JuzDetail | null>(null);
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
  const [useWordHighlight, setUseWordHighlight] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [segmentsData, setSegmentsData] = useState<Record<string, Record<string, number[][]>>>({});

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
      const savedWordHighlight = localStorage.getItem("quran-word-highlight");
      if (savedWordHighlight !== null) setUseWordHighlight(savedWordHighlight === "true");
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

  const handleSetUseWordHighlight = (val: boolean) => {
    setUseWordHighlight(val);
    localStorage.setItem("quran-word-highlight", String(val));
  };

  const handleToggleBookmark = (ayah: Ayah) => {
    if (!ayah.surah) return;
    const isBookmarked = bookmarks.some(b => b.surahNumber === ayah.surah!.number && b.ayahNumber === ayah.numberInSurah);
    let updatedBookmarks;
    
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter(b => !(b.surahNumber === ayah.surah!.number && b.ayahNumber === ayah.numberInSurah));
    } else {
      updatedBookmarks = [
        ...bookmarks,
        {
          surahNumber: ayah.surah.number,
          surahName: ayah.surah.englishName,
          indonesianName: ayah.surah.name, // fallback
          ayahNumber: ayah.numberInSurah
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

  // Load Juz Details based on route
  useEffect(() => {
    async function loadJuz() {
      if (isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
        setError(t("invalidJuz"));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setCurrentAyahIndex(0);
        setIsPlaying(false);
        setHasStartedAudio(false);
        
        const data = await getJuzDetails(juzNumber, selectedTranslation, selectedReciter, useTajweed);
        setJuzDetail(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(language === "id" ? "Gagal memuat detail Juz. Periksa koneksi internet Anda." : "Failed to load Juz details. Check your internet connection.");
      } finally {
        setLoading(false);
      }
    }
    loadJuz();
  }, [juzNumber, selectedTranslation, selectedReciter, useTajweed, language, t]);

  // Stagger entry animation for Ayah cards
  useEffect(() => {
    if (!loading && juzDetail) {
      utils.remove(".ayah-card-anim");
      animate(".ayah-card-anim", {
        opacity: [0, 1],
        translateY: [16, 0],
        delay: stagger(25),
        duration: 600,
        ease: "outQuad",
      });
    }
  }, [loading, juzDetail]);

  // Save Last Read position & update progress
  useEffect(() => {
    if (!loading && juzDetail && juzDetail.ayahs[currentAyahIndex]) {
      const activeAyah = juzDetail.ayahs[currentAyahIndex];
      localStorage.setItem("quran-last-read", JSON.stringify({
        juzNumber: juzDetail.juzNumber,
        surahNumber: activeAyah.surah?.number,
        surahName: activeAyah.surah?.englishName,
        ayahNumber: activeAyah.numberInSurah,
        timestamp: Date.now()
      }));
      // Update Tadarus Progress
      if (activeAyah.surah?.number) {
        updateSurahProgress(activeAyah.surah.number, activeAyah.numberInSurah);
      }
    }
  }, [loading, juzDetail, currentAyahIndex]);

  // Load word timing segments dynamically based on active ayah's Surah
  useEffect(() => {
    async function loadSegments() {
      if (!juzDetail) return;
      const activeAyah = juzDetail.ayahs[currentAyahIndex];
      if (!activeAyah || !activeAyah.surah?.number) return;
      const surahNum = activeAyah.surah.number;
      
      const recitationId = getQuranComRecitationId(selectedReciter);
      const cacheKey = `${recitationId}-${surahNum}`;
      
      // If already loaded/loading, skip
      if (segmentsData[cacheKey] !== undefined) return;
      
      try {
        const data = await getSurahAudioSegments(recitationId, surahNum);
        setSegmentsData(prev => ({
          ...prev,
          [cacheKey]: data
        }));
      } catch (e) {
        console.error("Failed to load audio segments for surah", surahNum, e);
      }
    }
    loadSegments();
  }, [juzDetail, currentAyahIndex, selectedReciter, segmentsData]);

  // Sync activeWordIndex based on currentTime
  useEffect(() => {
    if (!isPlaying || !hasStartedAudio || !useWordHighlight) {
      setActiveWordIndex(-1);
      return;
    }
    const currentAyah = juzDetail?.ayahs[currentAyahIndex];
    if (!currentAyah || !currentAyah.surah?.number) return;
    const recitationId = getQuranComRecitationId(selectedReciter);
    const cacheKey = `${recitationId}-${currentAyah.surah.number}`;
    const surahSegments = segmentsData[cacheKey];
    if (!surahSegments) {
      setActiveWordIndex(-1);
      return;
    }
    const verseKey = `${currentAyah.surah.number}:${currentAyah.numberInSurah}`;
    const segments = surahSegments[verseKey];
    if (!segments) {
      setActiveWordIndex(-1);
      return;
    }
    const timeMs = currentTime * 1000;
    const activeSeg = segments.find(seg => timeMs >= seg[2] && timeMs <= seg[3]);
    if (activeSeg) {
      setActiveWordIndex(activeSeg[0]);
    } else {
      setActiveWordIndex(-1);
    }
  }, [currentTime, isPlaying, hasStartedAudio, useWordHighlight, currentAyahIndex, juzDetail, selectedReciter, segmentsData]);

  // Scroll to ayah from hash on load
  useEffect(() => {
    if (!loading && juzDetail) {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#ayah-")) {
        const targetAyahNum = parseInt(hash.replace("#ayah-", ""));
        if (!isNaN(targetAyahNum)) {
          const matchedIndex = juzDetail.ayahs.findIndex(a => a.numberInSurah === targetAyahNum);
          if (matchedIndex !== -1) {
            setTimeout(() => {
              const element = document.getElementById(`ayah-${juzDetail.ayahs[matchedIndex].number}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                setCurrentAyahIndex(matchedIndex);
              }
            }, 500);
          }
        }
      }
    }
  }, [loading, juzDetail]);

  // Copy Ayah text to clipboard
  const handleCopyAyah = (ayah: Ayah) => {
    const cleanArabic = ayah.text.replace(/\[[a-z](::[0-9]+)?\[/g, "").replace(/\]/g, "");
    const displayName = language === "id" ? ayah.surah?.name || ayah.surah?.englishName : ayah.surah?.englishName;
    const textToCopy = `${cleanArabic}\n\n${ayah.translation}\n\n(QS. ${displayName}: ${ayah.numberInSurah})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.number);
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

  // Play from header
  const handlePlayJuzHeader = () => {
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
              href="/quran"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/95 transition-all"
            >
              <FaChevronLeft /> {t("backToSurahs")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentJuzMapping = JUZ_MAPPINGS.find(j => j.juzNumber === juzNumber);
  const juzTitle = `Juz ${juzNumber}`;
  const juzSub = currentJuzMapping ? (language === "id" ? currentJuzMapping.descriptionId : currentJuzMapping.descriptionEn) : "";

  // Dropdown list for Juz 1-30 selection
  const juzOptions = Array.from({ length: 30 }).map((_, i) => ({
    value: String(i + 1),
    label: `Juz ${i + 1}`,
  }));

  // Dropdown list for Ayah selection in this Juz
  const ayahOptions = juzDetail
    ? juzDetail.ayahs.map((ayah, idx) => ({
        value: String(idx),
        label: `${ayah.surah?.englishName || "Surah"} - Ayat ${ayah.numberInSurah}`,
      }))
    : [];

  const handleJuzSelect = (val: string) => {
    router.push(`/juz/${val}`);
  };

  const handleAyahSelect = (val: string) => {
    const idx = parseInt(val);
    if (!isNaN(idx) && juzDetail && juzDetail.ayahs[idx]) {
      setCurrentAyahIndex(idx);
      const element = document.getElementById(`ayah-${juzDetail.ayahs[idx].number}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${hasStartedAudio ? "pb-32" : "pb-12"}`}>
      
      {/* Sticky Reading Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 select-none">
          {/* Left: Back Button */}
          <Link
            href="/quran"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xs"
            title={t("backToSurahs")}
          >
            <FaChevronLeft className="h-4 w-4" />
          </Link>

          {/* Middle: Custom Select Dropdowns */}
          <div className="flex flex-1 items-center justify-center gap-2 max-w-md min-w-0">
            <div className="w-1/2 min-w-[100px]">
              <CustomSelect
                options={juzOptions}
                value={String(juzNumber)}
                onChange={handleJuzSelect}
              />
            </div>
            {juzDetail && (
              <div className="w-1/2 min-w-[120px]">
                <CustomSelect
                  options={ayahOptions}
                  value={String(currentAyahIndex)}
                  onChange={handleAyahSelect}
                  placeholder={language === "id" ? "Pilih Ayat..." : "Go to Verse..."}
                />
              </div>
            )}
          </div>

          {/* Right: Settings Toggle */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xs cursor-pointer"
            title={t("settingsTitle")}
          >
            <FaSlidersH className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        
        {/* Juz Header Card */}
        {juzDetail && (
          <div className="relative overflow-hidden rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/30 via-card-bg/60 to-transparent p-8 md:p-10 mb-10 text-center shadow-xs">
            {/* Header next/prev links */}
            <div className="absolute inset-x-6 top-6 flex items-center justify-between text-xs font-bold text-muted select-none">
              {juzNumber > 1 ? (
                <Link href={`/juz/${juzNumber - 1}`} className="hover:text-primary transition-colors flex items-center gap-1">
                  ← {language === "id" ? "Juz Sebelumnya" : "Prev Juz"}
                </Link>
              ) : <span />}
              
              <span className="uppercase tracking-widest text-primary/75">
                {t("juzOf", { current: juzNumber, total: 30 })}
              </span>

              {juzNumber < 30 ? (
                <Link href={`/juz/${juzNumber + 1}`} className="hover:text-primary transition-colors flex items-center gap-1">
                  {language === "id" ? "Juz Selanjutnya" : "Next Juz"} →
                </Link>
              ) : <span />}
            </div>

            <div className="mt-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl font-black text-foreground">
                {juzTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed uppercase tracking-wider font-semibold">
                {juzSub}
              </p>
              
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handlePlayJuzHeader}
                  className="inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary-glow hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  {isPlaying && hasStartedAudio ? (
                    <>
                      <FaPause className="h-3 w-3" />
                      <span>{t("pauseSurah")}</span>
                    </>
                  ) : (
                    <>
                      <FaPlay className="h-3 w-3 translate-x-px" />
                      <span>{language === "id" ? "Putar Juz" : "Play Juz"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted font-medium animate-pulse">
              {language === "id" ? "Memuat halaman Juz..." : "Loading Juz page..."}
            </p>
          </div>
        )}

        {/* Verses Content List */}
        {!loading && juzDetail && (
          <div className="space-y-6">
            {juzDetail.ayahs.map((ayah, index) => {
              const isActive = hasStartedAudio && currentAyahIndex === index;
              const showBismillahBeforeAyah = ayah.numberInSurah === 1 && ayah.surah?.number !== 1 && ayah.surah?.number !== 9;
              let renderedArabic = ayah.text;
              
              // Clean first verse Bismillah if it's not Surah 1 and not already cleaned
              if (ayah.surah?.number !== 1 && ayah.numberInSurah === 1 && renderedArabic.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")) {
                renderedArabic = renderedArabic.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
              }

              return (
                <React.Fragment key={ayah.number}>
                  {/* Bismillah Header between Surahs */}
                  {showBismillahBeforeAyah && (
                    <div className="py-8 text-center select-none animate-fade-in">
                      <div className="inline-block border-b border-card-border/60 pb-3 mb-2 text-xs font-semibold text-primary uppercase tracking-widest">
                        {language === "id" ? `Memasuki Surat ${ayah.surah?.name}` : `Entering Surah ${ayah.surah?.englishName}`}
                      </div>
                      <p className="font-arabic text-2xl text-foreground/80 leading-normal">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </p>
                    </div>
                  )}

                  <div
                    id={`ayah-${ayah.number}`}
                    className={`ayah-card-anim opacity-0 rounded-2xl border p-6 md:p-8 transition-all duration-300 ${
                      isActive
                        ? "border-primary/60 bg-primary-glow/20 shadow-md shadow-primary-glow glow-pulse"
                        : "border-card-border bg-card-bg/50 hover:bg-card-bg hover:border-card-border/80"
                    }`}
                  >
                    {/* Top Row: Ayah Info & Actions */}
                    <div className="flex items-center justify-between gap-4 mb-6 select-none">
                      {/* Verse Tag: QS. SurahName : AyahNum */}
                      <div className="flex items-center gap-2 rounded-xl bg-card-border px-3 py-1.5 text-xs font-bold text-foreground">
                        <span className="text-primary">{ayah.surah?.englishName || "Surah"}</span>
                        <span className="text-muted/65">•</span>
                        <span>{ayah.numberInSurah}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Play Ayah */}
                        <button
                          onClick={() => handlePlayAyah(index)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
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
                          onClick={() => handleCopyAyah(ayah)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-border text-muted hover:text-primary hover:bg-primary-glow transition-colors cursor-pointer"
                          title={t("copyAyah")}
                        >
                          {copiedAyah === ayah.number ? (
                            <FaCheck className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <FaRegCopy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Bookmark Ayah */}
                        <button
                          onClick={() => handleToggleBookmark(ayah)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                            ayah.surah && bookmarks.some(b => b.surahNumber === ayah.surah!.number && b.ayahNumber === ayah.numberInSurah)
                              ? "bg-primary text-white"
                              : "bg-card-border text-muted hover:text-primary hover:bg-primary-glow"
                          }`}
                          title={t("bookmarksTitle")}
                        >
                          {ayah.surah && bookmarks.some(b => b.surahNumber === ayah.surah!.number && b.ayahNumber === ayah.numberInSurah) ? (
                            <FaBookmark className="h-3.5 w-3.5" />
                          ) : (
                            <FaRegBookmark className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Verse Text */}
                    <div 
                      onClick={handleArabicTextClick}
                      className="mb-6 text-right font-arabic selection:bg-primary-glow selection:text-primary"
                      dir="rtl"
                    >
                      {isActive && isPlaying && useWordHighlight ? (
                        <p
                          className="arabic-text text-foreground tracking-wide select-all leading-loose"
                          style={{ fontSize: `${arabicSize}px` }}
                        >
                          {(() => {
                            const words = parseVerseWords(renderedArabic);
                            let timingWordIdx = 0;
                            return words.map((word, wordIdx) => {
                              const isWaqf = word.text.replace(/[\u06D6-\u06DC]/g, "").trim().length === 0;
                              const currentWordIdx = isWaqf ? -1 : timingWordIdx++;
                              const isWordActive = activeWordIndex === currentWordIdx;
                              return (
                                <span
                                  key={wordIdx}
                                  className={`inline-block mx-1 rounded-md px-1 transition-all duration-150 cursor-pointer ${
                                    isWordActive
                                      ? "bg-primary/20 text-primary scale-105 font-black ring-1 ring-primary/30"
                                      : ""
                                  }`}
                                  dangerouslySetInnerHTML={useTajweed ? { __html: word.tajweedHtml } : undefined}
                                >
                                  {useTajweed ? null : word.text}
                                </span>
                              );
                            });
                          })()}
                        </p>
                      ) : useTajweed ? (
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
                          {renderedArabic}
                        </p>
                      </div>
                    )}

                    {/* Latin & Translation Box */}
                    <div className="space-y-2.5 border-t border-card-border/40 pt-4 text-left">
                      {/* NU-style Latin Transliteration */}
                      {showLatin && (
                        <p 
                          className="text-xs sm:text-sm text-primary/85 font-light italic leading-relaxed select-all"
                          style={{ fontSize: `${translationSize * 0.95}px` }}
                        >
                          {ayah.transliteration}
                        </p>
                      )}

                      {/* Indonesian/English Translation */}
                      <p 
                        className="text-sm sm:text-base text-muted font-medium leading-relaxed select-all"
                        style={{ fontSize: `${translationSize}px` }}
                      >
                        {ayah.translation}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Settings Drawer Panel */}
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
        useWordHighlight={useWordHighlight}
        setUseWordHighlight={handleSetUseWordHighlight}
      />

      {/* Floating Tajweed Tooltip */}
      {activeTajweedRule && (
        <div 
          className="fixed z-50 rounded-xl border border-card-border bg-card-bg/95 p-3 shadow-xl backdrop-blur-xs max-w-xs animate-scale-in text-xs leading-normal select-none"
          style={{
            top: `${activeTajweedRule.targetRect.top - 76}px`,
            left: `${Math.max(16, activeTajweedRule.targetRect.left + (activeTajweedRule.targetRect.width / 2) - 100)}px`,
          }}
        >
          <p className="font-extrabold text-primary mb-1">{activeTajweedRule.name}</p>
          <p className="text-muted font-medium leading-relaxed">{activeTajweedRule.desc}</p>
          <div className="absolute left-[92px] bottom-[-6px] h-3.5 w-3.5 rotate-45 border-r border-b border-card-border bg-card-bg" />
        </div>
      )}

      {/* Sticky Bottom Murottal Audio Player */}
      {hasStartedAudio && juzDetail && (
        <AudioPlayer
          surahName={juzTitle}
          ayahs={juzDetail.ayahs}
          currentAyahIndex={currentAyahIndex}
          setCurrentAyahIndex={setCurrentAyahIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          autoScroll={autoScroll}
          onTimeUpdate={(time) => setCurrentTime(time)}
          isJuz={true}
        />
      )}
    </div>
  );
}
