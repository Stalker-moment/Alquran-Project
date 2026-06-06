"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { animate, stagger, utils } from "animejs";
import { FaBookmark, FaTrash, FaChevronLeft, FaQuran, FaArrowRight, FaHeart, FaTimes } from "react-icons/fa";

interface Bookmark {
  surahNumber: number;
  surahName: string;
  indonesianName?: string;
  ayahNumber: number;
}

export default function BookmarksPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Load bookmarks on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedBookmarks = localStorage.getItem("quran-bookmarks");
      if (savedBookmarks) {
        try {
          setBookmarks(JSON.parse(savedBookmarks));
        } catch (e) {
          console.error("Failed to parse bookmarks", e);
        }
      }
    }
  }, []);

  // Stagger entry animation for bookmarks list using Anime.js
  useEffect(() => {
    if (mounted && bookmarks.length > 0) {
      utils.remove(".bookmark-card-anim");
      animate(".bookmark-card-anim", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(30, { start: 100 }),
        duration: 600,
        ease: "outQuint",
      });
    }
  }, [mounted, bookmarks.length]);

  const handleDeleteBookmark = (e: React.MouseEvent, target: Bookmark) => {
    e.preventDefault();
    e.stopPropagation();

    const updated = bookmarks.filter(
      (b) => !(b.surahNumber === target.surahNumber && b.ayahNumber === target.ayahNumber)
    );
    setBookmarks(updated);
    localStorage.setItem("quran-bookmarks", JSON.stringify(updated));
    showToast(
      language === "id"
        ? `Bookmark QS. ${target.surahName}: ${target.ayahNumber} berhasil dihapus`
        : `Bookmark QS. ${target.surahName}: ${target.ayahNumber} has been removed`,
      "info",
      t("bookmarkRemoved")
    );
  };

  const handleClearAllBookmarks = () => {
    setIsConfirmOpen(true);
  };

  const confirmClearAllBookmarks = () => {
    setBookmarks([]);
    localStorage.setItem("quran-bookmarks", JSON.stringify([]));
    showToast(
      language === "id" ? "Semua bookmark berhasil dihapus" : "All bookmarks have been removed",
      "info",
      t("bookmarkRemoved")
    );
    setIsConfirmOpen(false);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/40 via-card-bg/50 to-transparent p-8 md:p-12 mb-10 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-glow/85 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              <FaBookmark className="h-3 w-3" />
              {t("bookmarksTitle")}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {language === "id" ? "Simpanan Ayat" : "Saved Verses"} <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                {language === "id" ? "Pilihan Anda" : "Your Bookmarks"}
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted max-w-lg">
              {language === "id"
                ? "Daftar ayat-ayat suci Al-Qur'an yang Anda simpan untuk kemudahan membaca kembali kapan saja."
                : "A collection of sacred Quranic verses you have saved for easy reference and future reading."}
            </p>
          </div>

          <div className="relative hidden md:flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-primary/25 to-accent/25 border border-primary/20 text-primary">
            <FaBookmark className="h-20 w-20 opacity-80" />
            <div className="absolute inset-0 rounded-2xl border border-primary/10 scale-105" />
          </div>
        </div>

        {/* Clear All Option */}
        {bookmarks.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-semibold text-muted">
              {language === "id"
                ? `Total: ${bookmarks.length} Ayat`
                : `Total: ${bookmarks.length} Verses`}
            </span>
            <button
              id="clear-all-bookmarks"
              onClick={handleClearAllBookmarks}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer shadow-sm"
            >
              <FaTrash className="h-3 w-3" />
              {language === "id" ? "Hapus Semua" : "Clear All"}
            </button>
          </div>
        )}

        {/* Empty Bookmarks State */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-card-border rounded-3xl max-w-2xl mx-auto bg-card-bg/25">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-glow border border-primary/20 text-primary mb-6 animate-pulse">
              <FaBookmark className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {language === "id" ? "Belum Ada Bookmark" : "No Bookmarks Yet"}
            </h3>
            <p className="text-sm text-muted max-w-md mx-auto mb-8 px-4 leading-relaxed">
              {t("noBookmarks")} {language === "id"
                ? "Simpan ayat-ayat yang ingin Anda baca nanti dengan menekan tombol bookmark pada halaman surah."
                : "Save verses you want to read later by pressing the bookmark icon on the surah detail page."}
            </p>
            <Link
              href="/quran"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-glow hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <FaQuran className="h-4 w-4" />
              {t("openQuran")}
              <FaArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          /* Bookmarks Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((bookmark, idx) => {
              const displayName = language === "id" ? bookmark.indonesianName || bookmark.surahName : bookmark.surahName;
              return (
                <Link
                  key={`${bookmark.surahNumber}-${bookmark.ayahNumber}`}
                  href={`/surah/${bookmark.surahNumber}#ayah-${bookmark.ayahNumber}`}
                  className="bookmark-card-anim opacity-0 group relative overflow-hidden rounded-3xl border border-card-border bg-card-bg/40 p-5.5 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 hover:bg-card-bg/60 cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    {/* Icon index representation */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card-border text-primary group-hover:scale-110 group-hover:bg-primary-glow group-hover:text-primary transition-all duration-300">
                      <FaQuran className="h-5 w-5" />
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {displayName}
                      </h3>
                      <p className="text-xs text-muted font-medium mt-1">
                        {language === "id"
                          ? `QS. ${bookmark.surahName} · Ayat ${bookmark.ayahNumber}`
                          : `QS. ${bookmark.surahName} · Verse ${bookmark.ayahNumber}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center shrink-0">
                    <button
                      id={`delete-bookmark-${bookmark.surahNumber}-${bookmark.ayahNumber}`}
                      onClick={(e) => handleDeleteBookmark(e, bookmark)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer shadow-xs"
                      title={language === "id" ? "Hapus Bookmark" : "Remove Bookmark"}
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Left accent hover line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                </Link>
              );
            })}
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

      {/* Custom Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-card-border bg-card-bg p-6 md:p-8 shadow-2xl relative space-y-6 animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="absolute top-4.5 right-4.5 text-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-card-border/40"
              aria-label="Close"
            >
              <FaTimes className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2.5">
              <h2 className="text-xl md:text-2xl font-black text-foreground leading-tight">
                {language === "id" ? "Hapus Semua Bookmark?" : "Clear All Bookmarks?"}
              </h2>
            </div>

            {/* Modal Body */}
            <p className="text-sm text-muted leading-relaxed">
              {language === "id"
                ? "Apakah Anda yakin ingin menghapus semua bookmark yang disimpan? Tindakan ini tidak dapat dibatalkan."
                : "Are you sure you want to clear all your saved bookmarks? This action cannot be undone."}
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-card-border/40">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-xl border border-card-border bg-card-bg/40 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-card-border/50 transition-all duration-200 cursor-pointer"
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                id="confirm-clear-all"
                onClick={confirmClearAllBookmarks}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <FaTrash className="h-3.5 w-3.5" />
                <span>{language === "id" ? "Ya, Hapus Semua" : "Yes, Clear All"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
