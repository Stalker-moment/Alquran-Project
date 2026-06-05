"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getRandomInspirationalAyah, QuoteAyah } from "@/utils/api";
import { useLanguage } from "@/context/LanguageContext";
import { animate, stagger } from "animejs";
import {
  FaQuran, FaBookmark, FaVolumeUp, FaGlobe, FaSearch,
  FaArrowRight, FaChevronDown, FaStar, FaRedo, FaHeart,
  FaRegClock, FaLock
} from "react-icons/fa";
import {
  MdOutlineTranslate, MdOutlineFormatSize, MdOutlineColorLens,
  MdOutlineBookmarks, MdOutlineHistory, MdOutlineLayers,
  MdOutlineShare, MdOutlineSchool, MdOutlineDownload,
  MdOutlineSpeed, MdOutlineFormatListBulleted, MdOutlineSpatialTracking
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
    title_id: "Baca Al-Qur'an",
    title_en: "Read Al-Qur'an",
    desc_id: "Semua 114 surah dengan teks Arab Uthmani berkualitas tinggi.",
    desc_en: "All 114 surahs with high-quality Uthmani Arabic text.",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: <FaVolumeUp />,
    title_id: "Murottal Audio",
    title_en: "Murottal Audio",
    desc_id: "5 pilihan Qori ternama dengan auto-scroll dan kontrol penuh.",
    desc_en: "5 renowned reciters with auto-scroll and full playback controls.",
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: <MdOutlineTranslate />,
    title_id: "Transliterasi Latin",
    title_en: "Latin Transliteration",
    desc_id: "Ejaan latin gaya NU Indonesia yang akurat dan mudah dibaca.",
    desc_en: "Accurate Latin transliteration following established standards.",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: <FaGlobe />,
    title_id: "10 Bahasa Terjemahan",
    title_en: "10 Language Translations",
    desc_id: "Indonesia, Inggris, Prancis, Turki, Jerman, Spanyol, Rusia & lebih.",
    desc_en: "Indonesian, English, French, Turkish, German, Spanish, Russian & more.",
    gradient: "from-cyan-500/20 to-sky-500/10",
  },
  {
    icon: <MdOutlineColorLens />,
    title_id: "Highlight Tajwid",
    title_en: "Tajweed Highlight",
    desc_id: "Warna-warni hukum tajwid dengan tooltip keterangan interaktif.",
    desc_en: "Color-coded tajweed rules with interactive tooltip explanations.",
    gradient: "from-orange-500/20 to-amber-500/10",
  },
  {
    icon: <FaBookmark />,
    title_id: "Bookmark Ayat",
    title_en: "Verse Bookmarks",
    desc_id: "Simpan ayat favorit, tersimpan otomatis di browser Anda.",
    desc_en: "Save favorite verses, automatically stored in your browser.",
    gradient: "from-rose-500/20 to-pink-500/10",
  },
  {
    icon: <MdOutlineHistory />,
    title_id: "Last Read Tracker",
    title_en: "Last Read Tracker",
    desc_id: "Posisi baca terakhir tersimpan otomatis untuk kelanjutan mudah.",
    desc_en: "Last reading position auto-saved for easy continuation.",
    gradient: "from-fuchsia-500/20 to-pink-500/10",
  },
  {
    icon: <FaRedo />,
    title_id: "Mode Repeat & Tahfidz",
    title_en: "Repeat & Tahfidz Mode",
    desc_id: "Ulangi ayat, surah, atau rentang ayat khusus untuk hafalan.",
    desc_en: "Repeat single verse, full surah, or a custom range for memorization.",
    gradient: "from-green-500/20 to-emerald-500/10",
  },
  {
    icon: <FaSearch />,
    title_id: "Pencarian Global",
    title_en: "Global Search",
    desc_id: "Cari ayat berdasarkan kata kunci di seluruh 6,236 ayat Al-Qur'an.",
    desc_en: "Search verses by keyword across all 6,236 Quran verses.",
    gradient: "from-yellow-500/20 to-amber-500/10",
  },
  {
    icon: <MdOutlineFormatSize />,
    title_id: "Ukuran Font Fleksibel",
    title_en: "Flexible Font Size",
    desc_id: "Atur ukuran teks Arab dan terjemahan sesuai kenyamanan Anda.",
    desc_en: "Adjust Arabic and translation font sizes to your comfort.",
    gradient: "from-teal-500/20 to-cyan-500/10",
  },
  {
    icon: <MdOutlineBookmarks />,
    title_id: "Multi Tema",
    title_en: "Multi Theme",
    desc_id: "Pilih tema Dark, Light, atau Sepia untuk kenyamanan mata.",
    desc_en: "Choose Dark, Light, or Sepia theme for eye comfort.",
    gradient: "from-indigo-500/20 to-blue-500/10",
  },
  {
    icon: <MdOutlineLayers />,
    title_id: "Quran Isyarat",
    title_en: "Sign Language (Isyarat)",
    desc_id: "Font isyarat bahasa Arab untuk kebutuhan pengguna tuli.",
    desc_en: "Arabic sign language font for deaf users' accessibility.",
    gradient: "from-purple-500/20 to-violet-500/10",
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
  { icon: <MdOutlineFormatListBulleted />, title_id: "Navigasi Juz 1–30", title_en: "Juz Navigation 1–30", desc_id: "Baca dan navigasi berdasarkan Juz.", desc_en: "Read and navigate by Juz." },
  { icon: <MdOutlineSpatialTracking />, title_id: "Progress Tadarus", title_en: "Tadarus Progress", desc_id: "Tracker berapa % Al-Qur'an telah dibaca.", desc_en: "Track how much of the Quran you've read." },
  { icon: <HiOutlineSparkles />, title_id: "Highlight Kata Audio", title_en: "Word Audio Highlight", desc_id: "Highlight kata per kata sinkron audio.", desc_en: "Word-by-word highlight synced to audio." },
  { icon: <FaHeart />, title_id: "Mode Hafalan", title_en: "Memorization Mode", desc_id: "Flashcard & cloze test untuk tahfidz.", desc_en: "Flashcard & cloze test for memorization." },
  { icon: <MdOutlineSchool />, title_id: "Tafsir Singkat", title_en: "Brief Tafsir", desc_id: "Tafsir ringkas per ayat on-demand.", desc_en: "Brief verse tafsir on demand." },
  { icon: <MdOutlineShare />, title_id: "Kartu Share Ayat", title_en: "Verse Share Card", desc_id: "Generate kartu ayat indah untuk sosmed.", desc_en: "Generate beautiful verse cards for social media." },
  { icon: <MdOutlineDownload />, title_id: "Download Offline", title_en: "Offline Download", desc_id: "Simpan audio murottal untuk offline.", desc_en: "Save murottal audio for offline use." },
  { icon: <MdOutlineSpeed />, title_id: "Kamus Kata Arab", title_en: "Arabic Word Dictionary", desc_id: "Klik kata Arab untuk lihat artinya.", desc_en: "Click Arabic words to see their meaning." },
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
        <div className="hero-anim opacity-0 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-glow/60 px-4 py-1.5 text-xs font-semibold text-primary mb-6 shadow-sm">
          <HiOutlineSparkles className="h-3.5 w-3.5" />
          {language === "id" ? "Gratis Selamanya · Tanpa Iklan" : "Free Forever · No Ads"}
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
        <p className="hero-anim opacity-0 max-w-2xl text-base sm:text-lg text-muted leading-relaxed mb-10">
          {t("landingHeroSubtitle")}
        </p>

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
            { value: "5", label: t("landingStatsReciters") },
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
                <span className="text-xs font-bold text-primary/70 tracking-wider uppercase">
                  QS. {quote.surahEnglishName} : {quote.ayahNumber}
                </span>
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

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-card-border py-8 bg-card-bg/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-3">
            <FaQuran className="h-4 w-4 text-primary" />
            <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          </div>
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
            <div className="flex items-center gap-3">
              <a href="https://alquran.cloud" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                alquran.cloud
              </a>
              <span className="text-card-border">·</span>
              <a href="https://equran.id" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                equran.id
              </a>
              <span className="text-card-border">·</span>
              <Link href="/quran" className="text-primary font-semibold hover:text-accent transition-colors">
                {t("surahListNav")} →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
