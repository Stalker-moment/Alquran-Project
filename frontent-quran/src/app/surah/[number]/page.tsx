"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { animate, stagger, utils } from "animejs";
import Navbar from "@/components/Navbar";
import SettingsPanel from "@/components/SettingsPanel";
import AudioPlayer from "@/components/AudioPlayer";
import { getSurahDetails, SurahDetail, getSurahs, Surah, getSurahTafsir, getQuranComRecitationId, getSurahAudioSegments, getSurahTafsirQuranCom, getReciterAudioUrls } from "@/utils/api";
import { updateSurahProgress } from "@/utils/progress";
import { isSurahDownloaded, downloadSurahAudio, deleteSurahAudio, getCachedAudioUrl } from "@/utils/offline";
import { useLanguage } from "@/context/LanguageContext";
import { FaChevronLeft, FaPlay, FaPause, FaRegCopy, FaCheck, FaSlidersH, FaBookmark, FaRegBookmark, FaBookOpen, FaShareAlt, FaDownload, FaTrash, FaTimes } from "react-icons/fa";
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

export default function SurahPage() {
  const params = useParams();
  const router = useRouter();
  const surahNumber = Number(params.number);
  const { language, t } = useLanguage();

  // States for Surah Details
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Offline Audio Download
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [resolvedAudioUrls, setResolvedAudioUrls] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({ visible: false, message: "", type: "success" });

  // States for Tafsir
  const [activeTab, setActiveTab] = useState<"baca" | "tafsir">("baca");
  const [tafsirDetail, setTafsirDetail] = useState<any>(null);
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(false);

  // States for Reading Settings — use lazy initializers to read localStorage synchronously
  // (avoids race condition where loadSurah fires before the localStorage useEffect runs)
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
  const [useWordHighlight, setUseWordHighlight] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("quran-word-highlight");
    return v === null ? true : v === "true";
  });
  const [arabicFont, setArabicFont] = useState<string>(() => {
    if (typeof window === "undefined") return "quran-uthmani";
    return localStorage.getItem("quran-arabic-font") || "quran-uthmani";
  });
  const [isMushafMode, setIsMushafMode] = useState<boolean>(false);
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
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [segmentsData, setSegmentsData] = useState<Record<string, number[][]>>({});

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
  const [activeShareAyah, setActiveShareAyah] = useState<{ arabic: string; translation: string; transliteration?: string; ayahNumber: number } | null>(null);

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
      if (!useDuoReciter || !surahNumber || !selectedReciterB) return;
      try {
        const mapping = await getReciterAudioUrls(surahNumber, selectedReciterB);
        setReciterBAudioUrls(mapping);
      } catch (err) {
        console.error("Failed to load secondary reciter audio:", err);
      }
    }
    loadSecondaryAudio();
  }, [surahNumber, selectedReciterB, useDuoReciter]);

  // Sync offline audio download status and handle cleanup on unmount/change
  useEffect(() => {
    if (!loading && surahDetail) {
      setIsDownloaded(isSurahDownloaded(surahNumber, selectedReciter));
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsDownloading(false);
      setDownloadProgress(0);
    };
  }, [surahNumber, selectedReciter, loading, surahDetail]);

  // Asynchronously resolve cached local blob URLs
  useEffect(() => {
    let isMounted = true;
    async function resolveUrls() {
      if (!surahDetail) return;
      const urls: Record<string, string> = {};
      for (const ayah of surahDetail.ayahs) {
        if (ayah.audioUrl) {
          const cached = await getCachedAudioUrl(ayah.audioUrl);
          if (cached) {
            urls[ayah.audioUrl] = cached;
          }
        }
        const audioUrlB = reciterBAudioUrls[ayah.numberInSurah];
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
  }, [surahDetail, reciterBAudioUrls, isDownloaded]);

  // Handle download, cancel, or delete offline audio files
  const handleDownloadAudio = async () => {
    if (!surahDetail) return;

    if (isDownloading) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsDownloading(false);
      setDownloadProgress(0);
      return;
    }

    if (isDownloaded) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await downloadSurahAudio(
        surahNumber,
        surahDetail.ayahs,
        selectedReciter,
        language === "id" ? surahDetail.indonesianName || surahDetail.englishName : surahDetail.englishName,
        (percent) => {
          setDownloadProgress(percent);
        },
        controller.signal
      );
      setIsDownloaded(true);
      setIsDownloading(false);
      setDownloadToast({ visible: true, message: t("downloadSuccess"), type: "success" });
      setTimeout(() => setDownloadToast(p => ({ ...p, visible: false })), 4000);
    } catch (err: any) {
      if (err.name === "AbortError" || (err instanceof DOMException && err.name === "AbortError")) {
        console.log("Download aborted by user");
      } else {
        console.error("Download failed:", err);
        setDownloadToast({ visible: true, message: language === "id" ? "Gagal mengunduh audio. Periksa koneksi internet Anda." : "Failed to download audio. Check your internet connection.", type: "error" });
        setTimeout(() => setDownloadToast(p => ({ ...p, visible: false })), 5000);
      }
      setIsDownloading(false);
      setDownloadProgress(0);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

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

  const handleWordClick = async (ayahNumberInSurah: number, wordIdx: number, localArabic: string) => {
    const location = `${surahNumber}:${ayahNumberInSurah}:${wordIdx + 1}`;
    
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
      const verseWords = await getVerseWords(surahNumber, ayahNumberInSurah);
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

  const toggleAyahTafsir = async (ayahNum: number) => {
    const key = `${surahNumber}:${ayahNum}`;
    const isCurrentlyExpanded = !!expandedAyahTafsirs[ayahNum];
    
    if (!isCurrentlyExpanded) {
      if (selectedTafsirSource === "kemenag" && !tafsirDetail) {
        try {
          setLoadingTafsirSingkat(true);
          const data = await getSurahTafsir(surahNumber);
          setTafsirDetail(data);
        } catch (err) {
          console.error("Failed to load Kemenag tafsir:", err);
        } finally {
          setLoadingTafsirSingkat(false);
        }
      } else if (selectedTafsirSource === "jalalain" && !loadedTafsirData["jalalain"]?.[key]) {
        try {
          setLoadingTafsirSingkat(true);
          const data = await getSurahTafsirQuranCom(520, surahNumber);
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
          const data = await getSurahTafsirQuranCom(169, surahNumber);
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
      [ayahNum]: !prev[ayahNum]
    }));
  };

  const getAyahTafsirText = (ayahNum: number): { text: string; isHtml: boolean } => {
    const key = `${surahNumber}:${ayahNum}`;
    if (selectedTafsirSource === "kemenag") {
      const teks = tafsirDetail?.tafsir?.find((t: any) => t.ayat === ayahNum)?.teks || "";
      return { text: teks, isHtml: false };
    }
    if (selectedTafsirSource === "jalalain") {
      return { text: loadedTafsirData["jalalain"]?.[key] || "", isHtml: true };
    }
    if (selectedTafsirSource === "ibnkathir") {
      return { text: loadedTafsirData["ibnkathir"]?.[key] || "", isHtml: true };
    }
    return { text: "", isHtml: false };
  };

  // Keyboard listener for toggling mushaf mode (F/f key) & Esc to exit
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMushafMode(false);
      }
      if (e.key === "f" || e.key === "F") {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
          return;
        }
        setIsMushafMode(prev => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Anime.js transition trigger for mushaf mode
  useEffect(() => {
    if (isMushafMode) {
      utils.remove(".mushaf-container-anim");
      animate(".mushaf-container-anim", {
        opacity: [0, 1],
        scale: [0.98, 1],
        duration: 500,
        ease: "outQuad",
      });
    }
  }, [isMushafMode]);

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

  // Load non-critical state from localStorage on mount (bookmarks are already initialized via lazy useState)
  // Note: settings that affect API fetching (useTajweed, selectedTranslation, selectedReciter) are
  // loaded synchronously via lazy useState initializers above to prevent race conditions.

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
        setActiveTab("baca");
        setTafsirDetail(null);
        setExpandedAyahTafsirs({});
        
    // Always fetch quran-tajweed edition so switching tajweed on/off
        // doesn't interrupt audio playback — cleanTajweed() strips formatting when needed.
        const data = await getSurahDetails(surahNumber, selectedTranslation, selectedReciter, true);
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
  }, [surahNumber, selectedTranslation, selectedReciter]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Fetch Tafsir when tab changes
  useEffect(() => {
    async function loadTafsir() {
      if (activeTab === "tafsir" && surahNumber && !tafsirDetail) {
        try {
          setLoadingTafsir(true);
          const data = await getSurahTafsir(surahNumber);
          setTafsirDetail(data);
        } catch (err) {
          console.error("Failed to load tafsir:", err);
        } finally {
          setLoadingTafsir(false);
        }
      }
    }
    loadTafsir();
  }, [activeTab, surahNumber, tafsirDetail]);

  // Stagger entry animation for Ayah cards using Anime.js
  useEffect(() => {
    if (!loading && surahDetail && activeTab === "baca") {
      utils.remove(".ayah-card-anim");
      animate(".ayah-card-anim", {
        opacity: [0, 1],
        translateY: [16, 0],
        delay: stagger(25),
        duration: 600,
        ease: "outQuad",
      });
    }
  }, [loading, surahDetail, isMushafMode, activeTab]);

  // Save Last Read position & update progress
  useEffect(() => {
    if (!loading && surahDetail) {
      localStorage.setItem("quran-last-read", JSON.stringify({
        surahNumber: surahDetail.number,
        surahName: surahDetail.englishName,
        indonesianName: surahDetail.indonesianName,
        ayahNumber: currentAyahIndex + 1,
        timestamp: Date.now()
      }));
      // Update Tadarus Progress
      updateSurahProgress(surahDetail.number, currentAyahIndex + 1);
    }
  }, [loading, surahDetail, currentAyahIndex]);

  // Load word timing segments from Quran.com
  useEffect(() => {
    async function loadSegments() {
      if (!surahNumber) return;
      try {
        const recitationId = getQuranComRecitationId(selectedReciter);
        const data = await getSurahAudioSegments(recitationId, surahNumber);
        setSegmentsData(data);
      } catch (e) {
        console.error("Failed to load audio segments", e);
      }
    }
    loadSegments();
  }, [surahNumber, selectedReciter]);

  // Sync activeWordIndex based on currentTime
  useEffect(() => {
    if (!isPlaying || !hasStartedAudio || !useWordHighlight) {
      setActiveWordIndex(-1);
      return;
    }
    const currentAyah = surahDetail?.ayahs[currentAyahIndex];
    if (!currentAyah) return;
    const verseKey = `${surahNumber}:${currentAyah.numberInSurah}`;
    const segments = segmentsData[verseKey];
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
  }, [currentTime, isPlaying, hasStartedAudio, useWordHighlight, currentAyahIndex, surahDetail, surahNumber, segmentsData]);

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

  const handleConfirmDeleteOffline = async () => {
    if (!surahDetail) return;
    try {
      await deleteSurahAudio(surahNumber, surahDetail.ayahs, selectedReciter);
      setIsDownloaded(false);
    } catch (err) {
      console.error("Failed to delete offline audio:", err);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${hasStartedAudio ? "pb-32" : "pb-12"}`}>
      
      {/* ── Delete Offline Audio Confirmation Modal ─────────────────────────── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-card-border bg-card-bg shadow-2xl p-6 sm:p-8 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-card-border/50 transition-all duration-200 cursor-pointer"
            >
              <FaTimes className="h-3.5 w-3.5" />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-red-500/10 border-red-500/25 text-red-500">
              <FaTrash className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-foreground mb-1.5 pr-6">
                {language === "id" ? `Hapus Audio Offline?` : `Delete Offline Audio?`}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t("deleteOfflineConfirm")}
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-2xl border border-card-border bg-card-bg/50 px-4 py-2.5 text-sm font-bold text-muted hover:text-foreground hover:bg-card-border/30 transition-all duration-200 cursor-pointer"
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmDeleteOffline}
                className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                {language === "id" ? "Ya, Hapus" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Download Status Toast ─────────────────────────────────────────── */}
      {downloadToast.visible && (
        <div className="fixed bottom-6 left-1/2 z-[9998] -translate-x-1/2 px-4 w-full max-w-sm pointer-events-none">
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-xl text-sm font-bold pointer-events-auto ${
            downloadToast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}>
            <span className="truncate">{downloadToast.message}</span>
          </div>
        </div>
      )}

      {isMushafMode ? (
        /* Mushaf / Fullscreen Reading Mode */
        <div className="mushaf-container-anim flex-1 flex flex-col min-h-screen bg-background">
          {/* Mushaf Header — compact on mobile */}
          <div className="sticky top-0 z-30 w-full flex items-center justify-between border-b border-card-border/60 bg-background/95 backdrop-blur-sm px-4 py-3 sm:px-8 sm:py-4 select-none gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="hidden sm:inline text-xs font-bold text-primary uppercase tracking-widest bg-primary-glow/50 px-2.5 py-1 rounded-lg shrink-0">
                {surahDetail?.revelationType === "Meccan" ? t("meccan") : t("medinan")} • {surahDetail?.numberOfAyahs} {t("ayat")}
              </span>
              <h1 className="text-base sm:text-xl font-extrabold text-foreground truncate">
                {language === "id" ? surahDetail?.indonesianName || surahDetail?.englishName : surahDetail?.englishName}
              </h1>
              <span className="text-xs font-bold text-primary bg-primary-glow/50 px-2 py-0.5 rounded-md shrink-0 sm:hidden">
                {surahDetail?.numberOfAyahs} {t("ayat")}
              </span>
            </div>
            <button
              onClick={() => setIsMushafMode(false)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-card-border bg-card-bg px-2.5 py-1.5 text-xs sm:text-sm font-extrabold text-muted hover:text-primary hover:border-primary/45 transition-all duration-200 cursor-pointer shadow-xs select-none"
              title={t("exitMushafMode")}
            >
              <span>{language === "id" ? "Keluar" : "Exit"}</span>
              <span className="hidden sm:inline-block text-[10px] bg-card-border px-1 py-0.5 rounded-sm ml-1">Esc / F</span>
            </button>
          </div>

          {/* Scrollable Reading Area */}
          <div className={`flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 ${hasStartedAudio ? "pb-28" : "pb-8"}`}>
            <div className="w-full max-w-4xl mx-auto">

            {/* Bismillah Header (if applicable) */}
            {showBismillahHeader && (
              <div className="text-center py-4 mb-6 select-none">
                <p className="font-arabic text-2xl sm:text-3xl md:text-4xl text-foreground">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {/* Continuous Flow Text */}
            {surahDetail && (
              <div
                onClick={handleArabicTextClick}
                className={`w-full mushaf-text select-text text-center ${selectedFontClass} leading-[2.4] sm:leading-[2.6] md:leading-[3]`}
                style={{ fontSize: `${Math.min(arabicSize, 40)}px`, lineHeight: undefined } as React.CSSProperties}
                dir="rtl"
              >
                {surahDetail.ayahs.map((ayah, index) => {
                  const isActive = currentAyahIndex === index && isPlaying;
                  let renderedArabic = ayah.text;
                  if (surahNumber !== 1 && index === 0) {
                    renderedArabic = removeBismillah(renderedArabic);
                  }
                  // When tajweed is off, strip the bracket formatting
                  if (!useTajweed) {
                    renderedArabic = cleanTajweed(renderedArabic);
                  }

                  return (
                    <React.Fragment key={ayah.number}>
                      {(() => {
                        const words = parseVerseWords(renderedArabic);
                        let timingWordIdx = 0;
                        return words.map((word, wordIdx) => {
                          const isWaqf = word.text.replace(/[\u06D6-\u06DC]/g, "").trim().length === 0;
                          const currentWordIdx = isWaqf ? -1 : timingWordIdx++;
                          const isWordActive = currentAyahIndex === index && isPlaying && useWordHighlight && activeWordIndex === currentWordIdx;
                          return (
                            <span
                              key={wordIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isWaqf) {
                                  handleWordClick(ayah.numberInSurah, currentWordIdx, cleanTajweed(word.text));
                                } else {
                                  handlePlayAyah(index);
                                }
                              }}
                              className={`inline-block mx-0.5 sm:mx-1 rounded-md px-0.5 sm:px-1 transition-all duration-150 cursor-pointer select-none ${
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

                      {/* Verse number ornament — smaller on mobile */}
                      <span
                        onClick={() => handlePlayAyah(index)}
                        className="inline-flex items-center justify-center border-2 border-primary/50 text-primary rounded-full w-6 h-6 sm:w-8 sm:h-8 mx-1 sm:mx-2 text-[10px] sm:text-xs font-sans font-bold select-none align-middle cursor-pointer hover:bg-primary hover:text-white transition-all duration-300"
                        title={t("playAyah")}
                      >
                        {ayah.numberInSurah}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            </div>
          </div>

          {/* Mini audio indicator when audio active in mushaf mode */}
          {hasStartedAudio && surahDetail && (
            <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-3 border-t border-card-border bg-card-bg/95 backdrop-blur-sm px-4 py-2 text-xs text-muted select-none">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:scale-105 transition-all"
              >
                {isPlaying ? <FaPause className="h-3 w-3" /> : <FaPlay className="h-3 w-3 translate-x-px" />}
              </button>
              <span className="truncate font-medium">
                {language === "id" ? surahDetail.indonesianName || surahDetail.englishName : surahDetail.englishName} — {t("ayat")} {currentAyahIndex + 1}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Normal Mode — Sticky header + main content */
        <>
          {/* Navbar hidden in mushaf, visible in normal mode */}
          <Navbar />
          <header className="sticky top-[60px] z-[40] w-full border-b border-card-border bg-background transition-colors duration-300">
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

          {/* Right: Settings Toggle & Mushaf Mode */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMushafMode(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xs cursor-pointer"
              title={t("mushafMode")}
              aria-label="Open Mushaf Mode"
            >
              <FaBookOpen className="h-4 w-4" />
            </button>
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

              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {/* Play Murottal Surah Action Button */}
                <button
                  onClick={handlePlaySurahHeader}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-glow hover:scale-105 active:scale-95 transition-all duration-300"
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

                {/* Mode Mushaf Button */}
                <button
                  onClick={() => setIsMushafMode(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary-glow/20 px-6 py-2.5 text-sm font-bold text-primary hover:bg-primary-glow/40 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <FaBookOpen className="h-3.5 w-3.5" />
                  <span>{t("mushafMode")}</span>
                </button>

                {/* Download Offline Button */}
                {isDownloading ? (
                  <button
                    onClick={handleDownloadAudio}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-6 py-2.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <FaTimes className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                    <span>{t("downloadingAudio", { progress: downloadProgress })}</span>
                  </button>
                ) : isDownloaded ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-green-500/50 bg-green-500/10 px-5 py-2.5 text-sm font-bold text-green-600 dark:text-green-400 select-none animate-fade-in">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span>{t("downloadedOffline")}</span>
                    </div>
                    <button
                      onClick={handleDownloadAudio}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-fade-in"
                      title={language === "id" ? "Hapus audio offline" : "Delete offline audio"}
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleDownloadAudio}
                    className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary-glow/20 px-6 py-2.5 text-sm font-bold text-primary hover:bg-primary-glow/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <FaDownload className="h-3.5 w-3.5" />
                    <span>{t("downloadAudio")}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs Selector: Baca Ayat vs Tafsir */}
            <div className="flex justify-center border-b border-card-border/60 pb-px mb-6 gap-6">
              <button
                onClick={() => setActiveTab("baca")}
                className={`pb-3 text-sm font-bold transition-all border-b-2 relative cursor-pointer ${
                  activeTab === "baca"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {t("bacaTab")}
              </button>
              <button
                onClick={() => setActiveTab("tafsir")}
                className={`pb-3 text-sm font-bold transition-all border-b-2 relative cursor-pointer ${
                  activeTab === "tafsir"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {t("tafsirTab")}
              </button>
            </div>

            {activeTab === "baca" ? (
              <>
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
                    if (surahNumber !== 1 && index === 0) {
                      renderedArabic = removeBismillah(renderedArabic);
                    }
                    if (!useTajweed) {
                      renderedArabic = cleanTajweed(renderedArabic);
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

                            {/* Share Ayah Card */}
                            <button
                              onClick={() => setActiveShareAyah({
                                arabic: renderedArabic,
                                translation: ayah.translation,
                                transliteration: ayah.teksLatin || ayah.transliteration,
                                ayahNumber: ayah.numberInSurah
                              })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-border text-muted hover:text-primary hover:bg-primary-glow transition-colors cursor-pointer"
                              title={t("bagikanAyat")}
                            >
                              <FaShareAlt className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Arabic Verse Text (renders HTML spans if Tajweed highlighting is enabled, or word highlight if playing) */}
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
                                const isWordActive = isActive && useWordHighlight && activeWordIndex === currentWordIdx;
                                return (
                                  <span
                                    key={wordIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isWaqf) {
                                        handleWordClick(ayah.numberInSurah, currentWordIdx, cleanTajweed(word.text));
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

                        {/* Brief Tafsir Section */}
                        {showTafsirSingkat && (
                          <div className="mt-4 pt-3 border-t border-card-border/30">
                            <button
                              onClick={() => toggleAyahTafsir(ayah.numberInSurah)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer select-none animate-fade-in"
                            >
                              <span>{expandedAyahTafsirs[ayah.numberInSurah] ? t("tutupTafsir") : t("bacaTafsir")}</span>
                              <span className="text-[10px]">{expandedAyahTafsirs[ayah.numberInSurah] ? "▲" : "▼"}</span>
                            </button>
                            
                            {expandedAyahTafsirs[ayah.numberInSurah] && (
                              <div className="mt-3 rounded-xl bg-background/40 border border-card-border p-4 text-xs sm:text-sm text-foreground/90 font-light leading-relaxed animate-fade-in select-all">
                                {(() => {
                                  const tafsirObj = getAyahTafsirText(ayah.numberInSurah);
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
                    );
                  })}
                </div>
              </>
            ) : (
              /* Tafsir View */
              <div className="space-y-6 select-all">
                {/* Description Banner */}
                <div className="rounded-2xl border border-card-border bg-card-bg/40 p-6 md:p-8 text-center text-xs text-muted leading-relaxed">
                  <p className="font-bold text-sm text-foreground mb-3">{t("deskripsiSurah")}</p>
                  <div 
                    className="max-w-2xl mx-auto text-sm text-muted leading-relaxed text-left md:text-center whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: tafsirDetail?.deskripsi || "..." }}
                  />
                  <div className="mt-4 border-t border-card-border/50 pt-4 text-[10px] uppercase font-bold tracking-wider text-primary">
                    {t("tafsirSource")}
                  </div>
                </div>

                {/* Loading skeletons for Tafsir */}
                {loadingTafsir && (
                  <div className="space-y-5">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="animate-pulse rounded-2xl border border-card-border/50 bg-card-bg/20 p-6 space-y-4">
                        <div className="h-5 bg-card-border rounded-sm w-16" />
                        <div className="h-4 bg-card-border rounded-sm w-full" />
                        <div className="h-4 bg-card-border rounded-sm w-5/6" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Tafsir List */}
                {!loadingTafsir && tafsirDetail && (
                  <div className="space-y-6">
                    {tafsirDetail.tafsir.map((taf: any) => {
                      const matchingAyah = surahDetail?.ayahs?.[taf.ayat - 1];
                      return (
                        <div
                          key={taf.ayat}
                          className="rounded-2xl border border-card-border bg-card-bg/50 p-6 md:p-8 hover:bg-card-bg hover:border-card-border/80 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-4 select-none">
                            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                              QS. {surahDetail?.englishName} : {taf.ayat}
                            </span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card-border text-xs font-bold text-foreground">
                              {taf.ayat}
                            </div>
                          </div>

                          {matchingAyah && (
                            <div className="mb-6 text-right font-arabic">
                              <p 
                                className={`text-foreground leading-loose ${selectedFontClass}`}
                                style={{ fontSize: `${arabicSize * 0.85}px` }}
                              >
                                {cleanTajweed(matchingAyah.text)}
                              </p>
                            </div>
                          )}

                          <div 
                            className="text-left leading-relaxed text-foreground font-light whitespace-pre-line"
                            style={{ fontSize: `${translationSize}px` }}
                          >
                            {taf.teks}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!loadingTafsir && !tafsirDetail && (
                  <div className="text-center py-12 text-muted select-none border border-dashed border-card-border rounded-2xl">
                    Gagal memuat data Tafsir. Silakan periksa koneksi internet Anda.
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>
    </>
  )}

      {/* Persistent bottom Audio Player - Rendered outside of main for full-viewport alignments */}
      {!loading && surahDetail && surahDetail.ayahs.length > 0 && hasStartedAudio && (
        <AudioPlayer
          surahName={language === "id" ? surahDetail.indonesianName || surahDetail.englishName : surahDetail.englishName}
          ayahs={surahDetail.ayahs.map(ayah => {
            const rawAudioUrl = ayah.audioUrl;
            const rawAudioUrlB = reciterBAudioUrls[ayah.numberInSurah];
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
          useDuoReciter={useDuoReciter}
          selectedReciter={selectedReciter}
          selectedReciterB={selectedReciterB}
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
          surahName={surahDetail?.englishName || ""}
          surahNumber={surahNumber}
          ayahNumber={activeShareAyah.ayahNumber}
          arabicText={activeShareAyah.arabic}
          transliteration={activeShareAyah.transliteration}
          translation={activeShareAyah.translation}
          arabicFont={arabicFont}
        />
      )}

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
