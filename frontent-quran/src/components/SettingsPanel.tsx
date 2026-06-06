"use client";

import React, { useEffect, useState } from "react";
import { FaFont, FaLanguage, FaUser, FaTimes, FaGlobe, FaSun, FaMoon } from "react-icons/fa";
import { POPULAR_RECITERS, POPULAR_TRANSLATIONS } from "@/utils/api";
import { useLanguage } from "@/context/LanguageContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  arabicSize: number;
  setArabicSize: (size: number) => void;
  translationSize: number;
  setTranslationSize: (size: number) => void;
  selectedTranslation: string;
  setSelectedTranslation: (edition: string) => void;
  selectedReciter: string;
  setSelectedReciter: (reciter: string) => void;
  autoScroll: boolean;
  setAutoScroll: (scroll: boolean) => void;
  showLatin: boolean;
  setShowLatin: (show: boolean) => void;
  useTajweed: boolean;
  setUseTajweed: (tajweed: boolean) => void;
  showIsyarat: boolean;
  setShowIsyarat: (isyarat: boolean) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  arabicSize,
  setArabicSize,
  translationSize,
  setTranslationSize,
  selectedTranslation,
  setSelectedTranslation,
  selectedReciter,
  setSelectedReciter,
  autoScroll,
  setAutoScroll,
  showLatin,
  setShowLatin,
  useTajweed,
  setUseTajweed,
  showIsyarat,
  setShowIsyarat,
}: SettingsPanelProps) {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("dark");
  const [autoTheme, setAutoTheme] = useState<boolean>(false);
  const [isTranslationOpen, setIsTranslationOpen] = useState(false);
  const [isReciterOpen, setIsReciterOpen] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("quran-theme") as "light" | "dark" | "sepia" || "dark";
      setTheme(storedTheme);
      const storedAutoTheme = localStorage.getItem("quran-auto-theme") === "true";
      setAutoTheme(storedAutoTheme);
    }
    setIsTranslationOpen(false);
    setIsReciterOpen(false);
  }, [isOpen]);

  const handleThemeChange = (newTheme: "light" | "dark" | "sepia") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("quran-theme", newTheme);
    setAutoTheme(false);
    localStorage.setItem("quran-auto-theme", "false");
  };

  const handleAutoThemeToggle = (val: boolean) => {
    setAutoTheme(val);
    localStorage.setItem("quran-auto-theme", String(val));
    if (val) {
      const hour = new Date().getHours();
      const targetTheme = (hour >= 18 || hour < 6) ? "dark" : "light";
      setTheme(targetTheme);
      document.documentElement.setAttribute("data-theme", targetTheme);
      localStorage.setItem("quran-theme", targetTheme);
    }
  };

  // Prevent scroll behind the drawer when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300" 
      />

      {/* Side Drawer Panel */}
      <div className="relative z-10 flex h-full w-80 max-w-full flex-col border-l border-card-border bg-card-bg p-6 shadow-2xl transition-all duration-300 overflow-y-auto animate-slide-in">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-card-border/60 pb-4 mb-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            {t("settingsTitle")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-card-border hover:text-foreground transition-all duration-200"
            title={t("settingsClose")}
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Content Form */}
        <div className="flex flex-col gap-6">
          
          {/* 1. Global App Language */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <FaGlobe className="text-primary h-3.5 w-3.5" />
              {t("language")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage("id")}
                className={`py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
                  language === "id"
                    ? "bg-primary border-primary text-white"
                    : "border-card-border bg-background/50 text-muted hover:text-foreground"
                }`}
              >
                🇮🇩 Indonesia
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
                  language === "en"
                    ? "bg-primary border-primary text-white"
                    : "border-card-border bg-background/50 text-muted hover:text-foreground"
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* 1.5. Reading Theme */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <FaSun className="text-primary h-3.5 w-3.5" />
              {t("theme")}
            </label>
            
            {/* Auto Theme Toggle */}
            <button
              onClick={() => handleAutoThemeToggle(!autoTheme)}
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300 cursor-pointer ${
                autoTheme
                  ? "border-primary bg-primary-glow text-primary"
                  : "border-card-border bg-background/50 text-muted hover:text-foreground hover:bg-card-bg/60"
              }`}
            >
              <div className="text-left">
                <span className="block font-bold">{t("autoTheme")}</span>
                <span className="block text-[10px] text-muted leading-tight mt-0.5 max-w-[180px]">{t("autoThemeDesc")}</span>
              </div>
              <div
                className={`relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 p-0.5 ${
                  autoTheme ? "bg-primary" : "bg-card-border"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    autoTheme ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                onClick={() => handleThemeChange("light")}
                className={`py-2 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                  theme === "light"
                    ? "bg-primary border-primary text-white"
                    : "border-card-border bg-background/50 text-muted hover:text-foreground hover:border-primary/20"
                }`}
              >
                <FaSun className="h-3 w-3" />
                {t("themeLight").split(" ")[0]}
              </button>
              <button
                onClick={() => handleThemeChange("sepia")}
                className={`py-2 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                  theme === "sepia"
                    ? "bg-primary border-primary text-white"
                    : "border-card-border bg-background/50 text-muted hover:text-foreground hover:border-primary/20"
                }`}
              >
                📖
                {t("themeSepia").split(" ")[0]}
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={`py-2 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                  theme === "dark"
                    ? "bg-primary border-primary text-white"
                    : "border-card-border bg-background/50 text-muted hover:text-foreground hover:border-primary/20"
                }`}
              >
                <FaMoon className="h-3 w-3" />
                {t("themeDark").split(" ")[0]}
              </button>
            </div>
          </div>

          {/* 2. Translation Selector (Custom Dropdown) */}
          <div className="flex flex-col gap-2 relative">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <FaLanguage className="text-primary h-3.5 w-3.5" />
              {t("translation")}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsTranslationOpen(!isTranslationOpen);
                  setIsReciterOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/45 transition-all duration-200 cursor-pointer shadow-xs text-left"
              >
                <span className="truncate">
                  {POPULAR_TRANSLATIONS.find(t => t.identifier === selectedTranslation)?.name || selectedTranslation}
                </span>
                <span className="text-muted text-[10px] ml-2 shrink-0">▼</span>
              </button>
              
              {isTranslationOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsTranslationOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-56 overflow-y-auto rounded-xl border border-card-border bg-card-bg p-1.5 shadow-xl select-none">
                    {POPULAR_TRANSLATIONS.map((trans) => (
                      <button
                        key={trans.identifier}
                        type="button"
                        onClick={() => {
                          setSelectedTranslation(trans.identifier);
                          setIsTranslationOpen(false);
                        }}
                        className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                          selectedTranslation === trans.identifier
                            ? "bg-primary text-white font-bold"
                            : "text-foreground hover:bg-primary-glow hover:text-primary"
                        }`}
                      >
                        {trans.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Reciter Selector (Custom Dropdown) */}
          <div className="flex flex-col gap-2 relative">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <FaUser className="text-primary h-3.5 w-3.5" />
              {t("reciter")}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsReciterOpen(!isReciterOpen);
                  setIsTranslationOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/45 transition-all duration-200 cursor-pointer shadow-xs text-left"
              >
                <span className="truncate">
                  {POPULAR_RECITERS.find(r => r.identifier === selectedReciter)?.name || selectedReciter}
                </span>
                <span className="text-muted text-[10px] ml-2 shrink-0">▼</span>
              </button>
              
              {isReciterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsReciterOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-56 overflow-y-auto rounded-xl border border-card-border bg-card-bg p-1.5 shadow-xl select-none">
                    {POPULAR_RECITERS.map((reciter) => (
                      <button
                        key={reciter.identifier}
                        type="button"
                        onClick={() => {
                          setSelectedReciter(reciter.identifier);
                          setIsReciterOpen(false);
                        }}
                        className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                          selectedReciter === reciter.identifier
                            ? "bg-primary text-white font-bold"
                            : "text-foreground hover:bg-primary-glow hover:text-primary"
                        }`}
                      >
                        {reciter.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4. Font Sizes */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <FaFont className="text-primary h-3.5 w-3.5" />
              {t("fontSize")}
            </label>
            
            {/* Arabic Font Slider */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-background/50 border border-card-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">{t("fontArabic")}</span>
                <span className="font-bold text-primary">{arabicSize}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={56}
                step={2}
                value={arabicSize}
                onChange={(e) => setArabicSize(parseInt(e.target.value))}
                className="w-full h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Translation Font Slider */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-background/50 border border-card-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">{t("fontTranslation")}</span>
                <span className="font-bold text-primary">{translationSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={28}
                step={1}
                value={translationSize}
                onChange={(e) => setTranslationSize(parseInt(e.target.value))}
                className="w-full h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* 5. Extra Features (Toggles) */}
          <div className="flex flex-col gap-3 pt-3 border-t border-card-border/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t("extras")}
            </span>
            
            {/* Auto Scroll Toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                autoScroll
                  ? "border-primary bg-primary-glow text-primary"
                  : "border-card-border bg-background/50 text-muted hover:text-foreground"
              }`}
            >
              <span>{t("autoScroll")}</span>
              <div
                className={`relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 p-0.5 ${
                  autoScroll ? "bg-primary" : "bg-card-border"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    autoScroll ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            {/* Show Latin Toggle */}
            <button
              onClick={() => setShowLatin(!showLatin)}
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                showLatin
                  ? "border-primary bg-primary-glow text-primary"
                  : "border-card-border bg-background/50 text-muted hover:text-foreground"
              }`}
            >
              <span>{t("showLatin")}</span>
              <div
                className={`relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 p-0.5 ${
                  showLatin ? "bg-primary" : "bg-card-border"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    showLatin ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            {/* Highlight Tajweed Toggle */}
            <button
              onClick={() => setUseTajweed(!useTajweed)}
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                useTajweed
                  ? "border-primary bg-primary-glow text-primary"
                  : "border-card-border bg-background/50 text-muted hover:text-foreground"
              }`}
            >
              <span>{t("highlightTajweed")}</span>
              <div
                className={`relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 p-0.5 ${
                  useTajweed ? "bg-primary" : "bg-card-border"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    useTajweed ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            {/* Show Isyarat Toggle */}
            <button
              onClick={() => setShowIsyarat(!showIsyarat)}
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                showIsyarat
                  ? "border-primary bg-primary-glow text-primary"
                  : "border-card-border bg-background/50 text-muted hover:text-foreground"
              }`}
            >
              <span>{t("showIsyarat")}</span>
              <div
                className={`relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 p-0.5 ${
                  showIsyarat ? "bg-primary" : "bg-card-border"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    showIsyarat ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
