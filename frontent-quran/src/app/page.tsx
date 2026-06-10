"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getRandomInspirationalAyah, QuoteAyah, getSurahs } from "@/utils/api";
import { calculateLocalHijri } from "@/utils/hijri";
import { useLanguage } from "@/context/LanguageContext";
import { animate, stagger } from "animejs";
import {
  FaQuran, FaBookmark, FaVolumeUp, FaGlobe, FaSearch,
  FaArrowRight, FaChevronDown, FaStar, FaRedo, FaHeart,
  FaRegClock, FaLock, FaMoon, FaExternalLinkAlt, FaBrain,
  FaDownload, FaShareAlt, FaListUl, FaBookOpen
} from "react-icons/fa";
import {
  MdOutlineTranslate, MdOutlineFormatSize, MdOutlineColorLens,
  MdOutlineBookmarks, MdOutlineHistory, MdOutlineLayers,
  MdOutlineShare, MdOutlineSchool, MdOutlineDownload,
  MdOutlineSpeed, MdOutlineFormatListBulleted, MdOutlineSpatialTracking,
  MdOutlineWifi, MdOutlineNotifications, MdOutlineAnalytics, MdOutlineGroups,
  MdOutlineMenuBook
} from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";

// ── Feature Data ──────────────────────────────────────────────────────────────

type Feature = {
  icon: React.ReactNode;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  gradient: string;
};

const ACTIVE_FEATURES: Feature[] = [
  {
    icon: <FaQuran />,
    title_id: "Al-Qur'an Digital",
    title_en: "Digital Al-Qur'an",
    desc_id: "114 surah dengan teks Arab Uthmani, transliterasi NU, terjemahan 10 bahasa, dan audio murottal 6 Qori ternama.",
    desc_en: "114 surahs with Uthmani Arabic text, NU transliteration, 10-language translations, and 6 Qari audio.",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: <MdOutlineColorLens />,
    title_id: "Highlight Tajwid Interaktif",
    title_en: "Interactive Tajweed",
    desc_id: "Pewarnaan tajwid per kata dengan 10 aturan hukum bacaan — Ghunnah, Qalaqah, Idgham, Ikhfa, dan lainnya.",
    desc_en: "Per-word tajweed color coding with 10 recitation rules — Ghunnah, Qalaqah, Idgham, Ikhfa, and more.",
    gradient: "from-orange-500/20 to-amber-500/10",
  },
  {
    icon: <FaMoon />,
    title_id: "Jadwal Shalat, Kiblat & Hijriah",
    title_en: "Prayer, Qibla & Hijriah",
    desc_id: "Jadwal shalat + imsakiyah se-Indonesia dengan deteksi GPS, kompas arah kiblat interaktif (gyroscope/vibrate), serta kalender Hijriah & konverter tanggal offline.",
    desc_en: "Accurate prayer + imsakiyah schedules, real-time Qibla compass (gyro/vibrate), and Hijri calendar with offline converter.",
    gradient: "from-yellow-500/20 to-amber-500/10",
  },
  {
    icon: <HiOutlineSparkles />,
    title_id: "Doa Harian Lengkap",
    title_en: "Daily Du'a Library",
    desc_id: "Kumpulan doa harian shahih dengan teks Arab, transliterasi, terjemahan, dan referensi hadits lengkap.",
    desc_en: "Authentic daily prayers with Arabic text, transliteration, translation, and full hadith references.",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: <MdOutlineSchool />,
    title_id: "Tafsir 3 Sumber",
    title_en: "Multi-Source Tafsir",
    desc_id: "Tafsir per ayat dari Kemenag RI, Tafsir Jalalain, dan Tafsir Ibn Kathir (ringkasan) — on-demand.",
    desc_en: "Per-verse tafsir from Kemenag RI, Tafsir Jalalain, and Ibn Kathir — loaded on demand.",
    gradient: "from-pink-500/20 to-rose-500/10",
  },
  {
    icon: <MdOutlineSpatialTracking />,
    title_id: "Progress Tadarus",
    title_en: "Tadarus Progress",
    desc_id: "Pantau persentase baca Al-Qur'an, kelengkapan 114 surah, dan streak tadarus harian secara visual.",
    desc_en: "Visually track reading progress, 114-surah completion, and daily reading streaks.",
    gradient: "from-rose-500/20 to-pink-500/10",
  },
  {
    icon: <span className="text-xl">✨</span>,
    title_id: "Word-by-Word Highlight",
    title_en: "Word-by-Word Sync",
    desc_id: "Sorotan kata demi kata secara real-time sinkron dengan audio murottal yang sedang diputar.",
    desc_en: "Real-time per-word highlight synchronized with playing murottal audio.",
    gradient: "from-sky-500/20 to-cyan-500/10",
  },
  {
    icon: <FaBrain />,
    title_id: "Asisten Hafalan",
    title_en: "Memorization Mode",
    desc_id: "Flashcard interaktif, cloze test, dan mode sembunyi penuh untuk membantu hafalan Al-Qur'an secara mandiri.",
    desc_en: "Interactive flashcards, cloze tests, and full-hide mode to assist self-paced Quran memorization.",
    gradient: "from-indigo-500/20 to-purple-500/10",
  },
  {
    icon: <FaShareAlt />,
    title_id: "Kartu Ayat Share",
    title_en: "Verse Share Cards",
    desc_id: "Generate kartu ayat indah dengan gradien kustom untuk dibagikan ke Instagram, WhatsApp, dan media sosial lainnya.",
    desc_en: "Generate beautiful verse cards with custom gradients to share on Instagram, WhatsApp, and social media.",
    gradient: "from-fuchsia-500/20 to-pink-500/10",
  },
  {
    icon: <FaDownload />,
    title_id: "Audio Offline",
    title_en: "Offline Audio",
    desc_id: "Unduh murottal surah pilihan untuk didengarkan tanpa koneksi internet kapan saja dan di mana saja.",
    desc_en: "Download surah murottal for offline listening anytime, anywhere without an internet connection.",
    gradient: "from-teal-500/20 to-emerald-500/10",
  },
  {
    icon: <FaBookOpen />,
    title_id: "Kamus Kata Arab",
    title_en: "Arabic Word Lookup",
    desc_id: "Klik kata Arab manapun untuk melihat arti, transliterasi, dan info gramatikal dari Quran Corpus API.",
    desc_en: "Click any Arabic word to see its meaning, transliteration, and grammatical info from Quran Corpus API.",
    gradient: "from-lime-500/20 to-green-500/10",
  },
  {
    icon: <FaListUl />,
    title_id: "Navigasi Juz 1–30",
    title_en: "Juz 1–30 Navigator",
    desc_id: "Navigasi berdasarkan 30 Juz Al-Qur'an lengkap dengan daftar kustom, prev/next Juz, dan lompat per ayat.",
    desc_en: "Navigate by all 30 Juz of the Quran with a custom list, prev/next Juz navigation, and verse jumping.",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  {
    icon: <span className="text-xl">🖥️</span>,
    title_id: "Mode Mushaf Full Screen",
    title_en: "Mushaf Full Screen",
    desc_id: "Mode baca imersif tanpa distraksi — hanya teks Arab besar dengan navigasi minimal.",
    desc_en: "Immersive reading mode without distractions — just large Arabic text with minimal navigation.",
    gradient: "from-slate-500/20 to-zinc-500/10",
  },
  {
    icon: <span className="text-xl">☪️</span>,
    title_id: "Asmaul Husna",
    title_en: "Asmaul Husna",
    desc_id: "99 nama-nama Allah dengan arti 4 bahasa (ID, EN, TR, Urdu), keutamaan, dan referensi Al-Qur'an.",
    desc_en: "99 names of Allah with meanings in 4 languages (ID, EN, TR, Urdu), virtues, and Quran references.",
    gradient: "from-amber-500/20 to-yellow-500/10",
  },
  {
    icon: <span className="text-xl">🔀</span>,
    title_id: "Duo Reciter Mode",
    title_en: "Duo Reciter Mode",
    desc_id: "Dengarkan 2 Qori secara bergantian per ayat untuk membandingkan makhraj dan gaya tilawah.",
    desc_en: "Listen to 2 Qaris alternately per verse to compare makhraj pronunciation and recitation styles.",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: <FaSearch />,
    title_id: "Pencarian Global",
    title_en: "Global Search",
    desc_id: "Cari ayat di seluruh Al-Qur'an berdasarkan kata kunci dalam bahasa Arab atau terjemahan.",
    desc_en: "Search verses across the entire Quran by keyword in Arabic or translation.",
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: <MdOutlineWifi />,
    title_id: "PWA Installable App",
    title_en: "Installable PWA",
    desc_id: "Install aplikasi langsung ke layar utama HP atau desktop untuk akses super cepat dan dukungan offline penuh.",
    desc_en: "Install the app directly to your home screen or desktop for fast loading and full offline support.",
    gradient: "from-purple-500/20 to-violet-500/10",
  },
  {
    icon: <MdOutlineNotifications />,
    title_id: "Notifikasi Waktu Shalat",
    title_en: "Prayer Time Notifications",
    desc_id: "Dapatkan pengingat push browser otomatis tepat waktu ketika waktu shalat tiba.",
    desc_en: "Receive automatic browser push notifications right on time when prayer times arrive.",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
];

type ComingSoon = {
  icon: React.ReactNode;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
};

const COMING_SOON_FEATURES: ComingSoon[] = [
  {
    icon: <MdOutlineAnalytics />,
    title_id: "Statistik Tadarus Lanjutan",
    title_en: "Advanced Reading Analytics",
    desc_id: "Grafik heatmap aktivitas tadarus per bulan, rata-rata durasi baca, dan laporan mingguan.",
    desc_en: "Monthly tadarus activity heatmap, average reading duration, and weekly reading reports."
  },
  {
    icon: <MdOutlineGroups />,
    title_id: "Halaqah Digital",
    title_en: "Digital Halaqah",
    desc_id: "Buat grup tadarus bersama — pantau progress teman, beri semangat, dan tadarus berjamaah secara online.",
    desc_en: "Create group tadarus — track friends' progress, give encouragement, and read Quran together online."
  },
];

// ── Stat Counter ─────────────────────────────────────────────────────────────

function StatCounter({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
        {value}
      </span>
      <span className="text-xs sm:text-sm text-muted font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { language, t } = useLanguage();
  const [quote, setQuote] = useState<QuoteAyah | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<{ totalVersesRead: number; totalPercent: number; completedSurahs: number; inProgressSurahs: number } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [hijriTodayStr, setHijriTodayStr] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const res = calculateLocalHijri(today);
    setHijriTodayStr(`${res.day} ${language === "id" ? res.monthNameId : res.monthNameEn} ${res.year} H`);
  }, [language]);


  // Fetch a random inspirational ayah
  const loadQuote = async () => {
    setQuoteLoading(true);
    try {
      const data = await getRandomInspirationalAyah(language);
      setQuote(data);
    } catch (e) {
      console.error("Quote fetch failed:", e);
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    loadQuote();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Load progress stats
  useEffect(() => {
    async function loadStats() {
      try {
        const surahsData = await getSurahs();
        const { getTadarusStats, getDailyStreak } = await import("@/utils/progress");
        setStats(getTadarusStats(surahsData));
        setStreak(getDailyStreak());
      } catch (err) {
        console.error("Failed to load progress stats for landing page", err);
      }
    }
    loadStats();
    
    // Add custom event listener for updates
    window.addEventListener("quran-progress-updated", loadStats);
    return () => {
      window.removeEventListener("quran-progress-updated", loadStats);
    };
  }, []);

  // Hero entrance animations
  useEffect(() => {
    animate(".hero-anim", {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: (_el: Element, i: number) => i * 120,
      duration: 900,
      ease: "outQuint",
    });
    animate(".hero-deco", {
      opacity: [0, 0.6],
      scale: [0.8, 1],
      duration: 1200,
      ease: "outExpo",
    });
  }, []);

  // Feature cards stagger
  useEffect(() => {
    animate(".feature-card", {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(50),
      duration: 700,
      ease: "outQuad",
    });
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[92vh] text-center px-4 py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="hero-deco pointer-events-none absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl opacity-0" />
        <div className="hero-deco pointer-events-none absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-accent/8 blur-3xl opacity-0" />
        <div className="hero-deco pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full border border-primary/5 opacity-0" />
        <div className="hero-deco pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] rounded-full border border-primary/3 opacity-0" />

        {/* Floating Arabic letter decoration */}
        <div className="hero-deco pointer-events-none absolute top-16 right-[8%] font-arabic text-[120px] text-primary/4 select-none leading-none opacity-0 hidden lg:block">
          ﷲ
        </div>
        <div className="hero-deco pointer-events-none absolute bottom-24 left-[6%] font-arabic text-[80px] text-accent/5 select-none leading-none opacity-0 hidden lg:block">
          ﷽
        </div>

        {/* Badge */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="hero-anim opacity-0 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-glow/60 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <HiOutlineSparkles className="h-3.5 w-3.5" />
            {language === "id" ? "Gratis Selamanya · Tanpa Iklan" : "Free Forever · No Ads"}
          </div>
          {hijriTodayStr && (
            <div className="hero-anim opacity-0 inline-flex items-center gap-2 rounded-full border border-card-border bg-card-bg/40 px-4 py-1.5 text-xs font-bold text-foreground shadow-sm">
              <span>📅</span>
              <span>{hijriTodayStr}</span>
            </div>
          )}
        </div>


        {/* Main Heading */}
        <h1 className="hero-anim opacity-0 max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-tight mb-6">
          {language === "id" ? (
            <>
              Temukan Ketenangan<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-primary bg-size-200 animate-gradient">
                Dalam Al-Qur&apos;an
              </span>
            </>
          ) : (
            <>
              Find Peace &amp; Serenity<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-primary bg-size-200 animate-gradient">
                In The Quran
              </span>
            </>
          )}
        </h1>

        {/* Bismillah */}
        <p className="hero-anim opacity-0 font-arabic text-2xl sm:text-3xl text-primary/70 mb-4 leading-normal">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        {/* Subtitle */}
        <p className="hero-anim opacity-0 max-w-2xl text-base sm:text-lg text-muted leading-relaxed mb-8">
          {t("landingHeroSubtitle")}
        </p>

        {/* Mini Progress Widget */}
        {stats && stats.totalVersesRead > 0 && (
          <div className="hero-anim opacity-0 flex items-center justify-between gap-6 rounded-3xl border border-primary/20 bg-linear-to-r from-primary-glow/40 via-card-bg/60 to-transparent p-5 mb-8 max-w-md w-full shadow-sm text-left select-none">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <span>📊 {t("progressTracker")}</span>
                {streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent">
                    🔥 {streak} {language === "id" ? "Hari" : "Days"}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-xs font-extrabold text-foreground mt-1">
                <span>{stats.totalPercent}% {language === "id" ? "Selesai" : "Completed"}</span>
                <span className="text-muted">{stats.totalVersesRead} / 6236 {language === "id" ? "Ayat" : "Verses"}</span>
              </div>
              <div className="relative w-full h-1.5 bg-card-border rounded-full overflow-hidden mt-1">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalPercent}%` }}
                />
              </div>
            </div>
            <Link
              href="/progress"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card-bg border border-card-border text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xs"
              title={t("progressTracker")}
            >
              <FaArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="hero-anim opacity-0 flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/quran"
            className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary-glow hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <FaQuran className="h-4 w-4" />
            {t("landingHeroCta")}
            <FaArrowRight className="h-3.5 w-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <button
            onClick={scrollToFeatures}
            className="inline-flex items-center gap-2 rounded-2xl border border-card-border bg-card-bg/50 px-6 py-4 text-sm font-semibold text-muted hover:text-primary hover:border-primary/30 transition-all duration-300"
          >
            {t("landingHeroCtaSub")}
            <FaChevronDown className="h-3 w-3 animate-bounce" />
          </button>
        </div>

        {/* Stat Pills */}
        <div className="hero-anim opacity-0 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full">
          {[
            { value: "114", label: t("landingStatsSurah") },
            { value: "6,236", label: t("landingStatsAyat") },
            { value: "10", label: t("landingStatsLanguages") },
            { value: "6+", label: t("landingStatsReciters") },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-card-border bg-card-bg/60 backdrop-blur-sm p-4"
            >
              <StatCounter value={stat.value} label={stat.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK ACCESS PORTAL ──────────────────────────────────── */}
      <section className="relative py-16 px-4 bg-linear-to-b from-transparent to-card-bg/25 border-b border-card-border/60">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              {language === "id" ? "Portal Akses Cepat" : "Quick Access Portal"}
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
              {language === "id"
                ? "Pilih salah satu fitur utama di bawah untuk memulai secara instan."
                : "Choose one of the main features below to start instantly."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[
              {
                href: "/quran",
                icon: <FaQuran className="h-6 w-6 text-emerald-400" />,
                title_id: "Baca Al-Qur'an",
                title_en: "Read Al-Qur'an",
                desc_id: "114 Surah lengkap dengan audio murottal 6 Qori, terjemahan 10 bahasa, dan tajwid berwarna.",
                desc_en: "114 Surahs with 6 Qari audio, 10-language translations, and colored tajweed.",
                bgGradient: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/40"
              },
              {
                href: "/shalat",
                icon: <FaMoon className="h-5 w-5 text-amber-400" />,
                title_id: "Jadwal Shalat",
                title_en: "Prayer Times",
                desc_id: "Jadwal shalat dan imsakiyah se-Indonesia dengan deteksi GPS dan peta interaktif.",
                desc_en: "Accurate prayer + imsakiyah schedules with GPS detection and interactive map.",
                bgGradient: "from-amber-500/10 to-yellow-500/5 hover:border-amber-500/40"
              },
              {
                href: "/doa",
                icon: <span className="text-xl">🙏</span>,
                title_id: "Doa Harian",
                title_en: "Daily Du'a",
                desc_id: "Kumpulan doa harian shahih, transliterasi, terjemahan, serta referensi haditsnya.",
                desc_en: "Authentic daily prayers, Arabic text, transliteration, and hadith references.",
                bgGradient: "from-violet-500/10 to-purple-500/5 hover:border-violet-500/40"
              },
              {
                href: "/cari",
                icon: <FaSearch className="h-5 w-5 text-blue-400" />,
                title_id: "Pencarian Ayat",
                title_en: "Verse Search",
                desc_id: "Cari ayat Al-Qur'an di seluruh 114 surah berdasarkan kata kunci.",
                desc_en: "Search verses across all 114 surahs by keyword in Arabic or translation.",
                bgGradient: "from-blue-500/10 to-sky-500/5 hover:border-blue-500/40"
              },
              {
                href: "/hafalan",
                icon: <FaBrain className="h-5 w-5 text-indigo-400" />,
                title_id: "Asisten Hafalan",
                title_en: "Memorization",
                desc_id: "Flashcard, cloze test, dan mode sembunyi penuh untuk bantu hafalan Al-Qur'an.",
                desc_en: "Flashcards, cloze tests, and full-hide mode for self-paced Quran memorization.",
                bgGradient: "from-indigo-500/10 to-purple-500/5 hover:border-indigo-500/40"
              },
              {
                href: "/progress",
                icon: <span className="text-xl">📊</span>,
                title_id: "Progress Tadarus",
                title_en: "Tadarus Progress",
                desc_id: "Pantau persentase membaca Al-Qur'an, statistik surah, dan streak harian Anda.",
                desc_en: "Monitor your reading percentage, surah stats, and daily streak.",
                bgGradient: "from-rose-500/10 to-pink-500/5 hover:border-rose-500/40"
              },
              {
                href: "/downloads",
                icon: <FaDownload className="h-5 w-5 text-teal-400" />,
                title_id: "Audio Offline",
                title_en: "Offline Audio",
                desc_id: "Unduh murottal surah pilihan untuk didengarkan tanpa koneksi internet.",
                desc_en: "Download surah murottal for offline listening without an internet connection.",
                bgGradient: "from-teal-500/10 to-emerald-500/5 hover:border-teal-500/40"
              },
              {
                href: "/asmaul-husna",
                icon: <span className="text-xl">☪️</span>,
                title_id: "Asmaul Husna",
                title_en: "Asmaul Husna",
                desc_id: "99 nama-nama Allah dengan arti 4 bahasa, keutamaan, dan referensi Al-Qur'an.",
                desc_en: "99 names of Allah with meanings in 4 languages, virtues, and Quran references.",
                bgGradient: "from-amber-500/10 to-yellow-500/5 hover:border-amber-500/40"
              },
            ].map((portal, idx) => (
              <Link
                key={idx}
                href={portal.href}
                className={`group relative overflow-hidden rounded-3xl border border-card-border/75 bg-card-bg/40 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${portal.bgGradient}`}
              >
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card-bg border border-card-border shadow-xs group-hover:scale-110 transition-transform duration-300">
                    {portal.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors duration-200">
                      {language === "id" ? portal.title_id : portal.title_en}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      {language === "id" ? portal.desc_id : portal.desc_en}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-accent transition-colors duration-200">
                  <span>{language === "id" ? "Mulai" : "Open"}</span>
                  <FaArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4">
        {/* Divider gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-card-border to-transparent" />

        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-glow/40 px-4 py-1.5 text-xs font-semibold text-primary mb-8">
            <FaStar className="h-3 w-3" />
            {t("landingQuoteTitle")}
          </div>

          {quoteLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-card-border rounded-xl mx-auto w-3/4" />
              <div className="h-5 bg-card-border rounded-xl mx-auto w-1/2" />
              <div className="h-4 bg-card-border rounded-xl mx-auto w-2/3" />
            </div>
          ) : quote ? (
            <div className="relative rounded-3xl border border-card-border bg-linear-to-br from-card-bg via-card-bg/80 to-primary-glow/10 p-8 md:p-12 shadow-xl">
              {/* Decorative quote mark */}
              <span className="absolute top-4 left-6 font-arabic text-5xl text-primary/15 leading-none select-none">"</span>

              {/* Arabic */}
              <p className="font-arabic text-3xl sm:text-4xl md:text-5xl text-foreground leading-loose mb-6 tracking-wide" dir="rtl">
                {quote.arabic}
              </p>

              {/* Transliteration */}
              <p className="text-sm sm:text-base text-primary/80 italic font-light mb-4 leading-relaxed">
                {quote.transliteration}
              </p>

              {/* Translation */}
              <p className="text-base sm:text-lg text-muted leading-relaxed mb-6">
                &ldquo;{quote.translation}&rdquo;
              </p>

              {/* Reference */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/surah/${quote.surahNumber}#ayah-${quote.ayahNumber}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent tracking-wider uppercase transition-colors"
                >
                  <span>QS. {quote.surahEnglishName} : {quote.ayahNumber}</span>
                  <FaExternalLinkAlt className="h-2.5 w-2.5" />
                </Link>
                <button
                  onClick={loadQuote}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-3 py-1.5 text-xs text-muted hover:text-primary hover:border-primary/30 transition-all duration-300"
                >
                  <FaRedo className="h-2.5 w-2.5" />
                  {language === "id" ? "Ayat Lain" : "Next Verse"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-card-border to-transparent" />
      </section>

      {/* ── ACTIVE FEATURES ──────────────────────────────────────── */}
      <section ref={featuresRef} className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-4">
              <FaStar className="h-3 w-3" />
              {language === "id" ? "Tersedia Sekarang" : "Available Now"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
              {t("landingFeaturesTitle")}
            </h2>
            <p className="text-muted max-w-xl mx-auto text-sm sm:text-base">
              {t("landingFeaturesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ACTIVE_FEATURES.map((feature, i) => (
              <div
                key={i}
                className={`feature-card opacity-0 group relative overflow-hidden rounded-2xl border border-card-border bg-linear-to-br ${feature.gradient} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 cursor-default`}
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-card-bg border border-card-border text-primary text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                  {language === "id" ? feature.title_id : feature.title_en}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {language === "id" ? feature.desc_id : feature.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMING SOON ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-card-bg/20">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-card-border to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent mb-4">
              <FaRegClock className="h-3 w-3" />
              {t("landingComingSoonTitle")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
              {t("landingComingSoonTitle")}
            </h2>
            <p className="text-muted max-w-xl mx-auto text-sm sm:text-base">
              {t("landingComingSoonSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMING_SOON_FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-card-border/50 bg-card-bg/40 p-5 transition-all duration-300 cursor-not-allowed"
              >
                {/* Blur overlay */}
                <div className="absolute inset-0 backdrop-blur-[1px] bg-background/20 z-10 rounded-2xl" />

                {/* Coming Soon badge */}
                <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent/80">
                  <FaLock className="h-2 w-2" />
                  {t("landingComingSoonBadge")}
                </div>

                <div className="relative z-0">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-card-border text-muted text-xl opacity-60">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-sm text-muted mb-1">
                    {language === "id" ? feature.title_id : feature.title_en}
                  </h3>
                  <p className="text-xs text-muted/60 leading-relaxed">
                    {language === "id" ? feature.desc_id : feature.desc_en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-accent/8" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-primary/10" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full border border-primary/8" />

        <div className="relative mx-auto max-w-2xl text-center">
          {/* Decorative Arabic */}
          <p className="font-arabic text-4xl text-primary/30 mb-4 leading-normal">اقْرَأْ</p>

          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
            {t("landingCtaTitle")}
          </h2>
          <p className="text-muted text-base sm:text-lg mb-10 leading-relaxed">
            {t("landingCtaSubtitle")}
          </p>

          <Link
            href="/quran"
            className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-white shadow-xl shadow-primary-glow hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <FaQuran className="h-5 w-5" />
            {t("landingCtaButton")}
            <FaArrowRight className="h-4 w-4 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>

          <p className="mt-5 text-xs text-muted/60">
            {language === "id"
              ? "Gratis selamanya · Tanpa registrasi · Tanpa iklan"
              : "Free forever · No registration · No ads"}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
