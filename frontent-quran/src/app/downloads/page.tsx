"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { animate, stagger, utils } from "animejs";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { getDownloadedSurahs, getOfflineCacheSize, deleteSurahAudio, clearAllOfflineAudio, OfflineSurahMetadata } from "@/utils/offline";
import { POPULAR_RECITERS } from "@/utils/api";
import { FaTrash, FaPlay, FaChevronRight, FaFolderOpen, FaExclamationTriangle, FaTimes, FaCheckCircle } from "react-icons/fa";

// ── Types ─────────────────────────────────────────────────────────────────────
type ConfirmModal = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: "danger" | "warning";
  onConfirm: () => void;
};

type Toast = {
  visible: boolean;
  message: string;
  type: "success" | "error";
};

// ── Confirmation Modal Component ──────────────────────────────────────────────
function ConfirmationModal({ modal, onClose, language }: { modal: ConfirmModal; onClose: () => void; language: string }) {
  useEffect(() => {
    if (modal.open) {
      animate(".confirm-modal-card", {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 280,
        ease: "outBack(1.4)",
      });
    }
  }, [modal.open]);

  if (!modal.open) return null;

  const isRed = modal.variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="confirm-modal-card relative w-full max-w-sm rounded-3xl border border-card-border bg-card-bg shadow-2xl p-6 sm:p-8 flex flex-col gap-5 opacity-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-card-border/50 transition-all duration-200 cursor-pointer"
          aria-label="Close"
        >
          <FaTimes className="h-3.5 w-3.5" />
        </button>

        {/* Icon */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isRed
              ? "bg-red-500/10 border-red-500/25 text-red-500"
              : "bg-amber-500/10 border-amber-500/25 text-amber-500"
          }`}
        >
          <FaExclamationTriangle className="h-6 w-6" />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-foreground mb-1.5 pr-6">{modal.title}</h3>
          <p className="text-sm text-muted leading-relaxed">{modal.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-card-border bg-card-bg/50 px-4 py-2.5 text-sm font-bold text-muted hover:text-foreground hover:bg-card-border/30 transition-all duration-200 cursor-pointer"
          >
            {language === "id" ? "Batal" : "Cancel"}
          </button>
          <button
            onClick={() => { modal.onConfirm(); onClose(); }}
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isRed
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/25"
                : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
            }`}
          >
            {modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast Notification Component ──────────────────────────────────────────────
function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.visible) {
      animate(".toast-notif", {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 350,
        ease: "outQuad",
      });
      const timer = setTimeout(onDismiss, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, onDismiss]);

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[9998] -translate-x-1/2 px-4 w-full max-w-sm pointer-events-none">
      <div
        className={`toast-notif opacity-0 flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-xl text-sm font-bold pointer-events-auto ${
          toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
            : "bg-red-500/10 border-red-500/30 text-red-500"
        }`}
      >
        <FaCheckCircle className={`h-4 w-4 shrink-0 ${toast.type === "error" ? "hidden" : ""}`} />
        <FaExclamationTriangle className={`h-4 w-4 shrink-0 ${toast.type === "success" ? "hidden" : ""}`} />
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DownloadsPage() {
  const { language, t } = useLanguage();
  const [downloadedList, setDownloadedList] = useState<OfflineSurahMetadata[]>([]);
  const [cacheSize, setCacheSize] = useState<{ sizeMb: number; fileCount: number }>({ sizeMb: 0, fileCount: 0 });
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<ConfirmModal>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    variant: "danger",
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<Toast>({ visible: false, message: "", type: "success" });

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, open: false }));
  }, []);

  // Fetch offline stats and downloaded list
  const loadOfflineData = async () => {
    try {
      const list = getDownloadedSurahs();
      const stats = await getOfflineCacheSize();
      setDownloadedList(list);
      setCacheSize(stats);
    } catch (err) {
      console.error("Failed to load offline storage details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfflineData();
  }, []);

  // Trigger Anime.js entrance animations for the rows
  useEffect(() => {
    if (!loading && downloadedList.length > 0) {
      utils.remove(".download-row-anim");
      animate(".download-row-anim", {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(40),
        duration: 500,
        ease: "outQuad"
      });
    }
  }, [loading, downloadedList.length]);

  const handleDeleteSurah = (surahNumber: number, reciter: string, surahName: string) => {
    setModal({
      open: true,
      title: language === "id" ? `Hapus Audio ${surahName}?` : `Delete ${surahName} Audio?`,
      description: language === "id"
        ? `File audio offline untuk Surah ${surahName} akan dihapus permanen dari perangkat Anda.`
        : `The offline audio file for Surah ${surahName} will be permanently removed from your device.`,
      confirmLabel: language === "id" ? "Ya, Hapus" : "Yes, Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteSurahAudio(surahNumber, undefined, reciter);
          await loadOfflineData();
          showToast(t("deleteOfflineSuccess"), "success");
        } catch (err) {
          console.error(`Failed to delete cache for Surah ${surahNumber}:`, err);
          showToast(language === "id" ? "Gagal menghapus file audio." : "Failed to delete audio files.", "error");
        }
      },
    });
  };

  const handleClearAll = () => {
    setModal({
      open: true,
      title: language === "id" ? "Hapus Semua Audio Offline?" : "Clear All Offline Audio?",
      description: language === "id"
        ? "Seluruh file audio yang telah diunduh akan dihapus permanen. Anda perlu mengunduh ulang untuk akses offline."
        : "All downloaded audio files will be permanently removed. You will need to re-download them for offline access.",
      confirmLabel: language === "id" ? "Hapus Semua" : "Clear All",
      variant: "danger",
      onConfirm: async () => {
        try {
          await clearAllOfflineAudio();
          await loadOfflineData();
          showToast(t("downloadsClearAllSuccess"), "success");
        } catch (err) {
          console.error("Failed to clear all cache:", err);
          showToast(language === "id" ? "Gagal mengosongkan penyimpanan." : "Failed to clear storage.", "error");
        }
      },
    });
  };

  const getReciterName = (identifier: string) => {
    const found = POPULAR_RECITERS.find(r => r.identifier === identifier);
    if (found) return found.name;
    return identifier.split(".").pop() || identifier;
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Navbar />

      <ConfirmationModal modal={modal} onClose={closeModal} language={language} />
      <ToastNotification toast={toast} onDismiss={dismissToast} />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Header Title */}
        <div className="mb-8 select-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <span>📥</span> {t("downloadsTitle")}
          </h1>
          <p className="text-sm text-muted max-w-2xl leading-relaxed">
            {t("downloadsSubtitle")}
          </p>
        </div>

        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-6">
            <div className="animate-pulse h-32 rounded-3xl border border-card-border bg-card-bg/20" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse h-20 rounded-2xl border border-card-border/50 bg-card-bg/10" />
              ))}
            </div>
          </div>
        ) : downloadedList.length === 0 ? (
          /* Empty State Dashboard */
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg/20 p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs select-none">
            <div className="h-16 w-16 rounded-2xl bg-primary-glow border border-primary/20 flex items-center justify-center text-primary mb-6">
              <FaFolderOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {language === "id" ? "Penyimpanan Bersih & Kosong" : "Offline Storage Clear"}
            </h3>
            <p className="text-sm text-muted mb-8 max-w-sm leading-relaxed">
              {t("downloadsEmpty")}
            </p>
            <Link
              href="/quran"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-glow hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {t("downloadExploreSurah")} <FaChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          /* Active Manager Dashboard */
          <div className="space-y-6">
            {/* Storage Statistics Summary Card */}
            <div className="rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/10 via-card-bg/40 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs select-none">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  {t("downloadsStorage")}
                </span>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-foreground">{cacheSize.sizeMb}</span>
                  <span className="text-sm font-bold text-muted">MB</span>
                </div>
                <p className="text-xs text-muted">
                  {language === "id" 
                    ? `Terdiri dari ${cacheSize.fileCount} file murottal ayat yang diunduh.` 
                    : `Consisting of ${cacheSize.fileCount} downloaded murottal verse files.`
                  }
                </p>
              </div>

              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-500/25 active:scale-95 transition-all duration-300 cursor-pointer shrink-0"
              >
                <FaExclamationTriangle className="h-3.5 w-3.5" />
                <span>{t("downloadsClearAll")}</span>
              </button>
            </div>

            {/* Downloaded Surahs Rows Container */}
            <div className="space-y-3">
              {downloadedList.map((item) => (
                <div
                  key={`${item.surahNumber}-${item.reciter}`}
                  className="download-row-anim opacity-0 rounded-2xl border border-card-border bg-card-bg/40 hover:bg-card-bg p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Index Circle */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card-border text-xs sm:text-sm font-extrabold text-foreground select-none">
                      {item.surahNumber}
                    </div>

                    {/* Surah Name & Reciter details */}
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base text-foreground truncate">
                        {item.surahName}
                      </h4>
                      <p className="text-xs text-muted truncate flex items-center gap-1.5 mt-0.5 select-none">
                        <span>🎙️ {getReciterName(item.reciter)}</span>
                        {item.ayahCount > 0 && (
                          <>
                            <span className="text-card-border">•</span>
                            <span>{item.ayahCount} {t("ayat")}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/surah/${item.surahNumber}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-glow border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer shadow-xs"
                      title={t("playSurah")}
                    >
                      <FaPlay className="h-3 w-3 translate-x-px" />
                    </Link>
                    <button
                      onClick={() => handleDeleteSurah(item.surahNumber, item.reciter, item.surahName)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer shadow-xs"
                      title={language === "id" ? "Hapus Audio" : "Delete Audio"}
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
