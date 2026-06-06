"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSurahs, Surah } from "@/utils/api";
import { useLanguage } from "@/context/LanguageContext";
import { getDailyStreak, getTadarusStats, getSurahProgress, resetAllProgress, TadarusStats } from "@/utils/progress";
import {
  FaChevronLeft,
  FaFire,
  FaQuran,
  FaBookOpen,
  FaCheckCircle,
  FaTrashAlt,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { animate, stagger } from "animejs";

type StatusFilter = "all" | "unread" | "in_progress" | "completed";

export default function ProgressPage() {
  const { language, t } = useLanguage();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stats & Streak
  const [stats, setStats] = useState<TadarusStats>({
    totalVersesRead: 0,
    totalPercent: 0,
    completedSurahs: 0,
    inProgressSurahs: 0,
  });
  const [streak, setStreak] = useState<number>(0);
  const [surahReadCounts, setSurahReadCounts] = useState<Record<number, number>>({});

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Custom Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Load surah list & calculate progress stats
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSurahs();
      setSurahs(data);

      // Extract read progress counts
      const counts: Record<number, number> = {};
      data.forEach((s) => {
        counts[s.number] = getSurahProgress(s.number);
      });
      setSurahReadCounts(counts);

      // Compute stats
      setStats(getTadarusStats(data));
      setStreak(getDailyStreak());
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        language === "id"
          ? "Gagal memuat data progress. Silakan periksa koneksi internet Anda."
          : "Failed to load progress data. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animations on mount & when filter updates
  useEffect(() => {
    if (!loading && surahs.length > 0) {
      animate(".stats-card-anim", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(100),
        duration: 800,
        ease: "outExpo",
      });

      animate(".surah-row-anim", {
        opacity: [0, 1],
        translateY: [15, 0],
        delay: stagger(20),
        duration: 500,
        ease: "outQuad",
      });
    }
  }, [loading, statusFilter, searchTerm, surahs.length]);

  const handleResetProgress = () => {
    resetAllProgress();
    setIsResetModalOpen(false);
    loadData();
  };

  // Determine surah reading status
  const getSurahStatus = (surah: Surah): "unread" | "in_progress" | "completed" => {
    const read = surahReadCounts[surah.number] || 0;
    if (read === 0) return "unread";
    if (read >= surah.numberOfAyahs) return "completed";
    return "in_progress";
  };

  // Filter & Search Logic
  const filteredSurahs = surahs.filter((surah) => {
    const status = getSurahStatus(surah);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && status === "unread") ||
      (statusFilter === "in_progress" && status === "in_progress") ||
      (statusFilter === "completed" && status === "completed");

    const matchSearch =
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (surah.indonesianName &&
        surah.indonesianName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(surah.number) === searchTerm;

    return matchesStatus && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 select-none">
        
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/quran"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-xs"
            title={t("backToSurahs")}
          >
            <FaChevronLeft className="h-4 w-4" />
          </Link>
          <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <span>{t("appName")}</span>
            <span>/</span>
            <span className="text-primary">{t("progressTracker")}</span>
          </div>
        </div>

        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground flex items-center gap-2.5">
              <span>📊</span> {t("progressTitle")}
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              {language === "id"
                ? "Pantau pencapaian tadarus harian Anda, kelengkapan surah, dan pertahankan streak membaca Anda."
                : "Monitor your daily tadarus achievements, surah completions, and keep up your reading streak."}
            </p>
          </div>

          {/* Reset Button */}
          {stats.totalVersesRead > 0 && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs"
            >
              <FaTrashAlt className="h-3.5 w-3.5" />
              <span>{t("resetProgress")}</span>
            </button>
          )}
        </div>

        {error ? (
          <div className="max-w-md mx-auto border border-card-border bg-card-bg/60 p-8 rounded-3xl text-center my-12">
            <h2 className="text-xl font-bold text-red-500 mb-2">{t("errorTitle")}</h2>
            <p className="text-muted mb-6">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/95 transition-all cursor-pointer"
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted font-medium animate-pulse">
              {language === "id" ? "Menghitung statistik membaca..." : "Calculating reading stats..."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* ── STATS DASHBOARD GRID ──────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Streak */}
              <div className="stats-card-anim opacity-0 rounded-2xl border border-card-border bg-linear-to-br from-orange-500/10 via-card-bg/60 to-transparent p-5 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">{t("streakTitle")}</span>
                  <h3 className="text-3xl font-black text-foreground flex items-center gap-1.5">
                    {streak > 0 ? (
                      <>
                        <span className="text-orange-500">🔥</span>
                        <span>{t("streakCount", { streak })}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted/40">🔥</span>
                        <span>0 {language === "id" ? "Hari" : "Days"}</span>
                      </>
                    )}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center text-xl">
                  <FaFire />
                </div>
              </div>

              {/* Card 2: Percent Done */}
              <div className="stats-card-anim opacity-0 rounded-2xl border border-card-border bg-linear-to-br from-emerald-500/10 via-card-bg/60 to-transparent p-5 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">
                    {language === "id" ? "Total Penyelesaian" : "Overall Completion"}
                  </span>
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-500">
                    {stats.totalPercent}%
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl">
                  <FaCheckCircle />
                </div>
              </div>

              {/* Card 3: Total Verses Read */}
              <div className="stats-card-anim opacity-0 rounded-2xl border border-card-border bg-linear-to-br from-primary-glow/40 via-card-bg/60 to-transparent p-5 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">{t("totalVersesRead")}</span>
                  <h3 className="text-3xl font-black text-foreground">
                    {stats.totalVersesRead} <span className="text-xs text-muted font-medium">/ 6236</span>
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl">
                  <FaQuran />
                </div>
              </div>

              {/* Card 4: Surah Completed / In Progress */}
              <div className="stats-card-anim opacity-0 rounded-2xl border border-card-border bg-linear-to-br from-violet-500/10 via-card-bg/60 to-transparent p-5 flex items-center justify-between shadow-xs">
                <div className="space-y-1 flex-1">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">
                    {language === "id" ? "Status Surah" : "Surah Status"}
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <div>
                      <span className="text-2xl font-black text-foreground">{stats.completedSurahs}</span>
                      <span className="text-[10px] font-semibold text-emerald-500 block uppercase tracking-wider">
                        {t("statusCompleted")}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-card-border" />
                    <div>
                      <span className="text-2xl font-black text-foreground">{stats.inProgressSurahs}</span>
                      <span className="text-[10px] font-semibold text-blue-500 block uppercase tracking-wider">
                        {language === "id" ? "Sedang" : "Reading"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500 flex items-center justify-center text-xl">
                  <FaBookOpen />
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="stats-card-anim opacity-0 rounded-2xl border border-card-border bg-card-bg/40 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2 text-sm font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <HiOutlineSparkles className="text-primary h-4 w-4" />
                  {language === "id" ? "Progress Khatam Al-Qur'an" : "Quran Completion Progress"}
                </span>
                <span className="text-primary">{stats.totalPercent}%</span>
              </div>
              <div className="relative w-full h-3 bg-card-border rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-primary via-accent to-primary rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted mt-2 select-none">
                <span>0 {language === "id" ? "ayat" : "verses"}</span>
                <span>{language === "id" ? `${6236 - stats.totalVersesRead} ayat lagi menuju Khatam` : `${6236 - stats.totalVersesRead} verses remaining`}</span>
                <span>6,236 {language === "id" ? "ayat" : "verses"}</span>
              </div>
            </div>

            {/* ── FILTER & SEARCH CONTROLS ──────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border/60 pb-5">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
                <input
                  type="text"
                  placeholder={language === "id" ? "Cari surah di progress..." : "Search surahs in progress..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-card-border bg-card-bg/50 py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary/50 focus:bg-card-bg focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto self-start md:self-auto select-none no-scrollbar">
                {[
                  { value: "all", label: language === "id" ? "Semua" : "All" },
                  { value: "unread", label: t("statusUnread"), color: "hover:text-muted" },
                  { value: "in_progress", label: t("statusInProgress"), color: "hover:text-blue-500" },
                  { value: "completed", label: t("statusCompleted"), color: "hover:text-emerald-500" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value as StatusFilter)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all duration-300 cursor-pointer ${
                      statusFilter === tab.value
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-card-bg/50 border-card-border text-muted hover:border-primary/30"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SURAH PROGRESS GRID ───────────────────────────────── */}
            {filteredSurahs.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-card-border rounded-3xl bg-card-bg/10 select-none">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-muted text-sm font-semibold">{t("noResults")}</p>
                <p className="text-xs text-muted/65 mt-1">
                  {language === "id"
                    ? "Coba sesuaikan kata kunci pencarian atau filter status Anda."
                    : "Try adjusting your search query or status filters."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredSurahs.map((surah) => {
                  const read = surahReadCounts[surah.number] || 0;
                  const total = surah.numberOfAyahs;
                  const percent = Math.min(100, parseFloat(((read / total) * 100).toFixed(1)));
                  const status = getSurahStatus(surah);

                  // Set card styles dynamically
                  let statusLabel = t("statusUnread");
                  let statusColorClass = "text-muted bg-card-border";
                  let borderClass = "border-card-border bg-card-bg/40 hover:border-card-border/80";
                  let progressColor = "bg-muted";

                  if (status === "completed") {
                    statusLabel = t("statusCompleted");
                    statusColorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                    borderClass = "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/50 hover:shadow-emerald-500/5 shadow-md";
                    progressColor = "bg-emerald-500";
                  } else if (status === "in_progress") {
                    statusLabel = t("statusInProgress");
                    statusColorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20";
                    borderClass = "border-blue-500/25 bg-blue-500/5 hover:border-blue-500/50 hover:shadow-blue-500/5 shadow-md";
                    progressColor = "bg-blue-500";
                  }

                  return (
                    <Link
                      href={`/surah/${surah.number}`}
                      key={surah.number}
                      className={`surah-row-anim opacity-0 group relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${borderClass}`}
                    >
                      <div className="space-y-4">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Surah Number Icon */}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card-bg border border-card-border text-xs font-bold text-muted group-hover:text-primary group-hover:border-primary/30 transition-all duration-300 shadow-xs">
                              {surah.number}
                            </div>
                            <div className="min-w-0 leading-tight">
                              <h3 className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                {language === "id" ? surah.indonesianName || surah.englishName : surah.englishName}
                              </h3>
                              <p className="text-[10px] text-muted truncate mt-0.5">
                                {surah.englishNameTranslation}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[9px] font-bold ${statusColorClass}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Progress Bar & Details */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-foreground">
                            <span>{read} / {total} {t("ayat")}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="relative w-full h-1.5 bg-card-border rounded-full overflow-hidden">
                            <div
                              className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 ${progressColor}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] font-bold text-primary group-hover:text-accent transition-colors select-none">
                        <span>{language === "id" ? "Buka Surah" : "Open Surah"}</span>
                        <FaArrowRight className="h-2.5 w-2.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── CUSTOM CONFIRMATION MODAL ─────────────────────────────────────── */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
          <div 
            className="w-full max-w-md rounded-3xl border border-card-border bg-card-bg p-6 shadow-2xl animate-scale-in text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xl mb-4">
              <FaTrashAlt />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {language === "id" ? "Reset Progress Membaca?" : "Reset Reading Progress?"}
            </h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              {t("resetConfirm")}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="rounded-xl border border-card-border bg-card-bg/50 px-4 py-2.5 text-xs font-bold text-muted hover:text-foreground hover:bg-card-border/50 transition-all duration-300 cursor-pointer"
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={handleResetProgress}
                className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 cursor-pointer"
              >
                {language === "id" ? "Ya, Reset" : "Yes, Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
