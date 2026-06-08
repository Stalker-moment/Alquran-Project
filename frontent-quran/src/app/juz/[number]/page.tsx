"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { animate, stagger, utils } from "animejs";
import Navbar from "@/components/Navbar";
import SettingsPanel from "@/components/SettingsPanel";
import AudioPlayer from "@/components/AudioPlayer";
import CustomSelect from "@/components/CustomSelect";
import { getJuzDetails, JuzDetail, JUZ_MAPPINGS, Ayah, getQuranComRecitationId, getSurahAudioSegments, getSurahTafsir, getSurahTafsirQuranCom, getJuzReciterAudioUrls } from "@/utils/api";
import { updateSurahProgress } from "@/utils/progress";
import { getCachedAudioUrl } from "@/utils/offline";
import { useLanguage } from "@/context/LanguageContext";
import { FaChevronLeft, FaPlay, FaPause, FaRegCopy, FaCheck, FaSlidersH, FaBookmark, FaRegBookmark, FaShareAlt } from "react-icons/fa";
import ShareModal from "@/components/ShareModal";
import { getVerseWords, QuranWord } from "@/utils/wordLookup";
import WordPopup from "@/components/WordPopup";

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

function cleanTajweed(text: string): string {
  return text.replace(/\[[a-z](?::\d+)?\[/g, "").replace(/\]/g, "");
}

function removeBismillah(text: string): string {
  const bismillahPlain = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
  let plainIdx = 0;
  let rawIdx = 0;
  
  while (plainIdx < bismillahPlain.length && rawIdx < text.length) {
    const char = text[rawIdx];
    if (char === '[') {
      const match = text.slice(rawIdx).match(/^\[[a-z](?::\d+)?\[/);
      if (match) {
        rawIdx += match[0].length;
        continue;
      }
    }
    if (char === ']') {
      rawIdx++;
      continue;
    }
    
    if (char === bismillahPlain[plainIdx]) {
      plainIdx++;
      rawIdx++;
    } else {
      return text;
    }
  }
  
  if (plainIdx === bismillahPlain.length) {
    return text.slice(rawIdx).trim();
  }
  return text;
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
  const [resolvedAudioUrls, setResolvedAudioUrls] = useState<Record<string, string>>({});

  // States for Reading Settings - use lazy initializers to read localStorage synchronously
  const [arabicSize, setArabicSize] = useState<number>(() => {
    if (typeof window === "undefined") return 36;
    return parseInt(localStorage.getItem("quran-arabic-size") || "36") || 36;
  });
  const [translationSize, setTranslationSize] = useState<number>(() => {
    if (typeof window === "undefined") return 16;
    return parseInt(localStorage.getItem("quran-translation-size") || "16") || 16;
  });
  const [selectedTranslation, setSelectedTranslation] = useState<string>(() => {
    if (typeof window === "undefined") return "id.indonesian";
    return localStorage.getItem("quran-translation") || "id.indonesian";
  });
  const [selectedReciter, setSelectedReciter] = useState<string>(() => {
    if (typeof window === "undefined") return "ar.alafasy";
    return localStorage.getItem("quran-reciter") || "ar.alafasy";
  });
  const [autoScroll, setAutoScroll] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("quran-auto-scroll");
    return v === null ? true : v === "true";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showLatin, setShowLatin] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("quran-show-latin");
    return v === null ? true : v === "true";
  });
  const [useTajweed, setUseTajweed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quran-use-tajweed") === "true";
  });
  const [showIsyarat, setShowIsyarat] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quran-show-isyarat") === "true";
  });
  const [arabicFont, setArabicFont] = useState<string>(() => {
    if (typeof window === "undefined") return "quran-uthmani";
    return localStorage.getItem("quran-arabic-font") || "quran-uthmani";
  });
  const [bookmarks, setBookmarks] = useState<{ surahNumber: number; surahName: string; indonesianName?: string; ayahNumber: number }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("quran-bookmarks") || "[]");
    } catch {
      return [];
    }
  });
  const [activeTajweedRule, setActiveTajweedRule] = useState<{ name: string; desc: string; targetRect: DOMRect } | null>(null);

  // States for Audio Player
  const [hasStartedAudio, setHasStartedAudio] = useState<boolean>(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [useWordHighlight, setUseWordHighlight] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("quran-word-highlight");
    return v === null ? true : v === "true";
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [segmentsData, setSegmentsData] = useState<Record<string, Record<string, number[][]>>>({});

  // States for Brief Tafsir & Quote Share
  const [showTafsirSingkat, setShowTafsirSingkat] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quran-show-tafsir-singkat") === "true";
  });
  const [selectedTafsirSource, setSelectedTafsirSource] = useState<string>(() => {
    if (typeof window === "undefined") return "kemenag";
    return localStorage.getItem("quran-tafsir-source") || "kemenag";
  });
  const [expandedAyahTafsirs, setExpandedAyahTafsirs] = useState<Record<number, boolean>>({});
  const [loadedTafsirData, setLoadedTafsirData] = useState<Record<string, Record<string, string>>>({});
  const [loadingTafsirSingkat, setLoadingTafsirSingkat] = useState<boolean>(false);
  const [activeShareAyah, setActiveShareAyah] = useState<{ arabic: string; translation: string; transliteration?: string; ayahNumber: number; surahName: string; surahNumber: number } | null>(null);

  // States for Duo Reciter
  const [useDuoReciter, setUseDuoReciter] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quran-use-duo-reciter") === "true";
  });
  const [selectedReciterB, setSelectedReciterB] = useState<string>(() => {
    if (typeof window === "undefined") return "ar.sudais";
    return localStorage.getItem("quran-reciter-b") || "ar.sudais";
  });
  const [reciterBAudioUrls, setReciterBAudioUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    async function loadSecondaryAudio() {
      if (!useDuoReciter || !juzNumber || !selectedReciterB) return;
      try {
        const mapping = await getJuzReciterAudioUrls(juzNumber, selectedReciterB);
        setReciterBAudioUrls(mapping);
      } catch (err) {
        console.error("Failed to load secondary reciter audio:", err);
      }
    }
    loadSecondaryAudio();
  }, [juzNumber, selectedReciterB, useDuoReciter]);

  // Asynchronously resolve cached local blob URLs
  useEffect(() => {
    let isMounted = true;
    async function resolveUrls() {
      if (!juzDetail) return;
      const urls: Record<string, string> = {};
      for (const ayah of juzDetail.ayahs) {
        if (ayah.audioUrl) {
          const cached = await getCachedAudioUrl(ayah.audioUrl);
          if (cached) {
            urls[ayah.audioUrl] = cached;
          }
        }
        const audioUrlB = reciterBAudioUrls[ayah.number];
        if (audioUrlB) {
          const cachedB = await getCachedAudioUrl(audioUrlB);
          if (cachedB) {
            urls[audioUrlB] = cachedB;
          }
        }
      }
      if (isMounted) {
        setResolvedAudioUrls(urls);
      }
    }
    resolveUrls();
    return () => {
      isMounted = false;
    };
  }, [juzDetail, reciterBAudioUrls]);

  // States for Word Lookup
  const [selectedWordLookup, setSelectedWordLookup] = useState<{
    location: string;
    arabic: string;
    transliteration: string;
    translationId: string;
    translationEn: string;
    audioUrl: string | null;
  } | null>(null);
  const [isWordLookupOpen, setIsWordLookupOpen] = useState<boolean>(false);

  const handleWordClick = async (surahNum: number, ayahNumberInSurah: number, wordIdx: number, localArabic: string) => {
    const location = `${surahNum}:${ayahNumberInSurah}:${wordIdx + 1}`;
    
    // Auto-pause main murottal playback if active to avoid overlapping audios
    if (isPlaying) {
      setIsPlaying(false);
    }

    setSelectedWordLookup({
      location,
      arabic: localArabic,
      transliteration: "Loading...",
      translationId: "Loading...",
      translationEn: "Loading...",
      audioUrl: null
    });
    setIsWordLookupOpen(true);

    try {
      const verseWords = await getVerseWords(surahNum, ayahNumberInSurah);
      const realWords = verseWords.filter(w => w.char_type_name === "word");
      const matchedWord = realWords[wordIdx];

      if (matchedWord) {
        setSelectedWordLookup({
          location,
          arabic: matchedWord.text_uthmani,
          transliteration: matchedWord.transliteration,
          translationId: matchedWord.translationId,
          translationEn: matchedWord.translationEn,
          audioUrl: matchedWord.audio_url
        });
      } else {
        setSelectedWordLookup({
          location,
          arabic: localArabic,
          transliteration: "Tidak tersedia",
          translationId: "Terjemahan tidak ditemukan",
          translationEn: "Translation not found",
          audioUrl: null
        });
      }
    } catch (err) {
      console.error("Failed to fetch word lookup details:", err);
      setSelectedWordLookup({
        location,
        arabic: localArabic,
        transliteration: "Gagal memuat",
        translationId: "Gagal memuat detail kata",
        translationEn: "Failed to load details",
        audioUrl: null
      });
    }
  };

  // Auto-persist settings to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-show-tafsir-singkat", String(showTafsirSingkat));
    }
  }, [showTafsirSingkat]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-use-duo-reciter", String(useDuoReciter));
    }
  }, [useDuoReciter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-reciter-b", selectedReciterB);
    }
  }, [selectedReciterB]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-tafsir-source", selectedTafsirSource);
    }
  }, [selectedTafsirSource]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-reciter", selectedReciter);
    }
  }, [selectedReciter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-translation", selectedTranslation);
    }
  }, [selectedTranslation]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-arabic-size", String(arabicSize));
    }
  }, [arabicSize]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-translation-size", String(translationSize));
    }
  }, [translationSize]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-show-latin", String(showLatin));
    }
  }, [showLatin]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-use-tajweed", String(useTajweed));
    }
  }, [useTajweed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-show-isyarat", String(showIsyarat));
    }
  }, [showIsyarat]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quran-word-highlight", String(useWordHighlight));
    }
  }, [useWordHighlight]);

  const toggleAyahTafsir = async (ayah: Ayah) => {
    const surahNum = ayah.surah?.number;
    if (!surahNum) return;
    
    const key = `${surahNum}:${ayah.numberInSurah}`;
    const isCurrentlyExpanded = !!expandedAyahTafsirs[ayah.number];
    
    if (!isCurrentlyExpanded) {
      if (selectedTafsirSource === "kemenag" && !loadedTafsirData["kemenag"]?.[key]) {
        try {
          setLoadingTafsirSingkat(true);
          const data = await getSurahTafsir(surahNum);
          const mapping: Record<string, string> = {};
          if (data && data.tafsir) {
            for (const t of data.tafsir) {
              mapping[`${surahNum}:${t.ayat}`] = t.teks;
            }
          }
          setLoadedTafsirData(prev => ({
            ...prev,
            kemenag: { ...(prev.kemenag || {}), ...mapping }
          }));
        } catch (err) {
          console.error("Failed to load Kemenag tafsir:", err);
        } finally {
          setLoadingTafsirSingkat(false);
        }
      } else if (selectedTafsirSource === "jalalain" && !loadedTafsirData["jalalain"]?.[key]) {
        try {
          setLoadingTafsirSingkat(true);
          const data = await getSurahTafsirQuranCom(520, surahNum);
          setLoadedTafsirData(prev => ({
            ...prev,
            jalalain: { ...(prev.jalalain || {}), ...data }
          }));
        } catch (err) {
          console.error("Failed to load Jalalain tafsir:", err);
        } finally {
          setLoadingTafsirSingkat(false);
        }
      } else if (selectedTafsirSource === "ibnkathir" && !loadedTafsirData["ibnkathir"]?.[key]) {
        try {
          setLoadingTafsirSingkat(true);
          const data = await getSurahTafsirQuranCom(169, surahNum);
          setLoadedTafsirData(prev => ({
            ...prev,
            ibnkathir: { ...(prev.ibnkathir || {}), ...data }
          }));
        } catch (err) {
          console.error("Failed to load Ibn Kathir tafsir:", err);
        } finally {
          setLoadingTafsirSingkat(false);
        }
      }
    }
    
    setExpandedAyahTafsirs(prev => ({
      ...prev,
      [ayah.number]: !prev[ayah.number]
    }));
  };

  const getAyahTafsirText = (ayah: Ayah): { text: string; isHtml: boolean } => {
    const surahNum = ayah.surah?.number;
    if (!surahNum) return { text: "", isHtml: false };
    const key = `${surahNum}:${ayah.numberInSurah}`;
    
    if (selectedTafsirSource === "kemenag") {
      return { text: loadedTafsirData["kemenag"]?.[key] || "", isHtml: false };
    }
    if (selectedTafsirSource === "jalalain") {
      return { text: loadedTafsirData["jalalain"]?.[key] || "", isHtml: true };
    }
    if (selectedTafsirSource === "ibnkathir") {
      return { text: loadedTafsirData["ibnkathir"]?.[key] || "", isHtml: true };
    }
    return { text: "", isHtml: false };
  };

  const handleSetArabicFont = (val: string) => {
    setArabicFont(val);
    localStorage.setItem("quran-arabic-font", val);
  };

  const fontClassMap: Record<string, string> = {
    "quran-uthmani": "font-amiri",
    "hafs": "font-hafs",
    "naskh": "font-naskh",
    "indopak": "font-indopak",
  };
  const selectedFontClass = fontClassMap[arabicFont] || "font-amiri";

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
        setExpandedAyahTafsirs({});
        
        const data = await getJuzDetails(juzNumber, selectedTranslation, selectedReciter, true);
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
  }, [juzNumber, selectedTranslation, selectedReciter, language, t]);

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
      <header className="sticky top-0 z-[60] w-full border-b border-card-border bg-background transition-colors duration-300">
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
              if (ayah.surah?.number !== 1 && ayah.numberInSurah === 1) {
                renderedArabic = removeBismillah(renderedArabic);
              }
              if (!useTajweed) {
                renderedArabic = cleanTajweed(renderedArabic);
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

                        {/* Share Ayah Card */}
                        <button
                          onClick={() => setActiveShareAyah({
                            arabic: renderedArabic,
                            translation: ayah.translation,
                            transliteration: ayah.transliteration,
                            ayahNumber: ayah.numberInSurah,
                            surahName: ayah.surah?.englishName || "Surah",
                            surahNumber: ayah.surah?.number || 1
                          })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-border text-muted hover:text-primary hover:bg-primary-glow transition-colors cursor-pointer"
                          title={t("bagikanAyat")}
                        >
                          <FaShareAlt className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Verse Text */}
                    <div 
                      onClick={handleArabicTextClick}
                      className="mb-6 text-right font-arabic selection:bg-primary-glow selection:text-primary"
                      dir="rtl"
                    >
                      <p
                        className={`arabic-text text-foreground tracking-wide select-text leading-loose ${selectedFontClass}`}
                        style={{ fontSize: `${arabicSize}px` }}
                      >
                        {(() => {
                          const words = parseVerseWords(renderedArabic);
                          let timingWordIdx = 0;
                          return words.map((word, wordIdx) => {
                            const isWaqf = word.text.replace(/[\u06D6-\u06DC]/g, "").trim().length === 0;
                            const currentWordIdx = isWaqf ? -1 : timingWordIdx++;
                            const isWordActive = isActive && isPlaying && useWordHighlight && activeWordIndex === currentWordIdx;
                            return (
                              <span
                                key={wordIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isWaqf && ayah.surah?.number) {
                                    handleWordClick(ayah.surah.number, ayah.numberInSurah, currentWordIdx, cleanTajweed(word.text));
                                  } else {
                                    handlePlayAyah(index);
                                  }
                                }}
                                className={`inline-block mx-1 rounded-md px-1 transition-all duration-150 cursor-pointer select-none ${
                                  isWordActive
                                    ? "bg-primary/20 text-primary scale-105 font-black ring-1 ring-primary/30"
                                    : "hover:bg-primary-glow/20"
                                }`}
                                dangerouslySetInnerHTML={useTajweed ? { __html: word.tajweedHtml } : undefined}
                              >
                                {useTajweed ? null : word.text}
                              </span>
                            );
                          });
                        })()}
                      </p>
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

                      {/* Brief Tafsir Section */}
                      {showTafsirSingkat && (
                        <div className="mt-4 pt-3 border-t border-card-border/30">
                          <button
                            onClick={() => toggleAyahTafsir(ayah)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer select-none animate-fade-in"
                          >
                            <span>{expandedAyahTafsirs[ayah.number] ? t("tutupTafsir") : t("bacaTafsir")}</span>
                            <span className="text-[10px]">{expandedAyahTafsirs[ayah.number] ? "▲" : "▼"}</span>
                          </button>
                          
                          {expandedAyahTafsirs[ayah.number] && (
                            <div className="mt-3 rounded-xl bg-background/40 border border-card-border p-4 text-xs sm:text-sm text-foreground/90 font-light leading-relaxed animate-fade-in select-all">
                              {(() => {
                                const tafsirObj = getAyahTafsirText(ayah);
                                if (loadingTafsirSingkat && !tafsirObj.text) {
                                  return (
                                    <div className="flex items-center gap-2 text-muted animate-pulse select-none">
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                      <span>Memuat Tafsir...</span>
                                    </div>
                                  );
                                }
                                if (!tafsirObj.text) {
                                  return <span className="text-muted italic select-none">Tafsir tidak ditemukan untuk ayat ini.</span>;
                                }
                                if (tafsirObj.isHtml) {
                                  return <div dangerouslySetInnerHTML={{ __html: tafsirObj.text }} className="space-y-2 select-text font-sans [&>h1]:font-bold [&>h1]:text-primary [&>h2]:font-bold [&>h2]:text-primary [&>p]:leading-relaxed" />;
                                }
                                return <p className="whitespace-pre-line select-text font-sans">{tafsirObj.text}</p>;
                              })()}
                              <div className="mt-3 border-t border-card-border/40 pt-2 text-[9px] uppercase font-bold tracking-wider text-muted flex items-center justify-between select-none">
                                <span>Sumber: {
                                  selectedTafsirSource === "kemenag" ? "Kemenag RI (Tafsir Wajiz)" :
                                  selectedTafsirSource === "jalalain" ? "Tafsir Jalalain" : "Tafsir Ibn Kathir"
                                }</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
        arabicFont={arabicFont}
        setArabicFont={handleSetArabicFont}
        showTafsirSingkat={showTafsirSingkat}
        setShowTafsirSingkat={setShowTafsirSingkat}
        selectedTafsirSource={selectedTafsirSource}
        setSelectedTafsirSource={setSelectedTafsirSource}
        useDuoReciter={useDuoReciter}
        setUseDuoReciter={setUseDuoReciter}
        selectedReciterB={selectedReciterB}
        setSelectedReciterB={setSelectedReciterB}
      />

      {/* Share Card Modal */}
      {activeShareAyah && (
        <ShareModal
          isOpen={!!activeShareAyah}
          onClose={() => setActiveShareAyah(null)}
          surahName={activeShareAyah.surahName}
          surahNumber={activeShareAyah.surahNumber}
          ayahNumber={activeShareAyah.ayahNumber}
          arabicText={activeShareAyah.arabic}
          transliteration={activeShareAyah.transliteration}
          translation={activeShareAyah.translation}
          arabicFont={arabicFont}
        />
      )}

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

      {/* Word Lookup Popup Modal */}
      {selectedWordLookup && (
        <WordPopup
          isOpen={isWordLookupOpen}
          onClose={() => {
            setIsWordLookupOpen(false);
            setSelectedWordLookup(null);
          }}
          location={selectedWordLookup.location}
          arabic={selectedWordLookup.arabic}
          transliteration={selectedWordLookup.transliteration}
          translationId={selectedWordLookup.translationId}
          translationEn={selectedWordLookup.translationEn}
          audioUrl={selectedWordLookup.audioUrl}
          arabicFontClass={selectedFontClass}
        />
      )}

      {/* Sticky Bottom Murottal Audio Player */}
      {hasStartedAudio && juzDetail && (
        <AudioPlayer
          surahName={juzTitle}
          ayahs={juzDetail.ayahs.map(ayah => {
            const rawAudioUrl = ayah.audioUrl;
            const rawAudioUrlB = reciterBAudioUrls[ayah.number];
            return {
              ...ayah,
              audioUrl: (rawAudioUrl && resolvedAudioUrls[rawAudioUrl]) || rawAudioUrl,
              audioUrlB: (rawAudioUrlB && resolvedAudioUrls[rawAudioUrlB]) || rawAudioUrlB
            };
          })}
          currentAyahIndex={currentAyahIndex}
          setCurrentAyahIndex={setCurrentAyahIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          autoScroll={autoScroll}
          onTimeUpdate={(time) => setCurrentTime(time)}
          isJuz={true}
          useDuoReciter={useDuoReciter}
          selectedReciter={selectedReciter}
          selectedReciterB={selectedReciterB}
        />
      )}
    </div>
  );
}
