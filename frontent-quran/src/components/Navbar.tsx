"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaMoon, FaSun, FaBars, FaTimes, FaGlobe, FaBookmark } from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("dark");
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isAutoTheme = localStorage.getItem("quran-auto-theme") === "true";
    let storedTheme: "light" | "dark" | "sepia" = "dark";
    if (isAutoTheme) {
      const hour = new Date().getHours();
      storedTheme = (hour >= 18 || hour < 6) ? "dark" : "light";
      localStorage.setItem("quran-theme", storedTheme);
    } else {
      storedTheme = localStorage.getItem("quran-theme") as "light" | "dark" | "sepia" || "dark";
    }
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  const toggleTheme = (newTheme: "light" | "dark" | "sepia") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("quran-theme", newTheme);
    localStorage.setItem("quran-auto-theme", "false");
  };

  const cycleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <FaBookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-wider">Al-Qur'an</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-glow border border-primary/20 text-primary transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-md shrink-0">
            <FaBookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="hidden sm:block text-sm sm:text-base md:text-lg font-extrabold tracking-wide text-foreground group-hover:text-primary transition-colors duration-300 truncate">
              {t("appName")}
            </span>
            <span className="block sm:hidden text-sm font-extrabold tracking-wide text-foreground group-hover:text-primary transition-colors duration-300 truncate">
              Al-Qur&apos;an
            </span>
            <span className="hidden xl:block text-[10px] sm:text-xs text-muted truncate">{t("appSub")}</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5">
          <Link 
            href="/quran"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-primary hover:bg-primary-glow transition-all duration-300 animate-fade-in"
          >
            <HiOutlineBookOpen className="h-4 w-4" />
            <span>{t("navSurah")}</span>
          </Link>

          <Link 
            href="/shalat"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-primary hover:bg-primary-glow transition-all duration-300 animate-fade-in"
          >
            <FaMoon className="h-3.5 w-3.5" />
            <span>{t("navShalat")}</span>
          </Link>

          <Link 
            href="/doa"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-primary hover:bg-primary-glow transition-all duration-300 animate-fade-in"
          >
            <span>🙏</span>
            <span>{t("navDoa")}</span>
          </Link>

          <Link 
            href="/cari"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-primary hover:bg-primary-glow transition-all duration-300 animate-fade-in"
          >
            <span>🔍</span>
            <span>{t("navCari")}</span>
          </Link>

          <Link 
            href="/progress"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-primary hover:bg-primary-glow transition-all duration-300 animate-fade-in"
          >
            <span>📊</span>
            <span>{t("navProgress")}</span>
          </Link>

          <Link 
            href="/bookmark"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-primary hover:bg-primary-glow transition-all duration-300 animate-fade-in"
          >
            <FaBookmark className="h-3 w-3" />
            <span>{t("navBookmark")}</span>
          </Link>
        </div>

        {/* Global Controls & Hamburger Toggle */}
        <div className="flex items-center gap-2">
          {/* Language Selector Button */}
          <button
            onClick={cycleLanguage}
            className="flex h-9 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border px-2.5 text-xs font-bold text-foreground hover:bg-card-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm cursor-pointer select-none"
            title={language === "id" ? "Switch to English" : "Ubah ke Bahasa Indonesia"}
            aria-label="Toggle Language"
          >
            <FaGlobe className="mr-1.5 h-3.5 w-3.5 text-primary" />
            <span>{language === "id" ? "ID" : "EN"}</span>
          </button>

          {/* Desktop/Tablet Theme Selector Panel */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-card-bg/50 border border-card-border p-1">
            <button
              onClick={() => toggleTheme("light")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 cursor-pointer ${
                theme === "light"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-border/50"
              }`}
              title={t("themeLight")}
              aria-label="Light Theme"
            >
              <FaSun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toggleTheme("sepia")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-semibold text-xs transition-all duration-300 cursor-pointer ${
                theme === "sepia"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-border/50"
              }`}
              title={t("themeSepia")}
              aria-label="Sepia Theme"
            >
              📖
            </button>
            <button
              onClick={() => toggleTheme("dark")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 cursor-pointer ${
                theme === "dark"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-border/50"
              }`}
              title={t("themeDark")}
              aria-label="Dark Theme"
            >
              <FaMoon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Theme Cycle Button */}
          <button
            onClick={() => {
              if (theme === "light") toggleTheme("sepia");
              else if (theme === "sepia") toggleTheme("dark");
              else toggleTheme("light");
            }}
            className="flex sm:hidden h-9 w-9 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary transition-all duration-300 shadow-xs cursor-pointer"
            title={t("themeCycle")}
            aria-label="Cycle Theme"
          >
            {theme === "light" && <FaSun className="h-3.5 w-3.5 text-primary" />}
            {theme === "sepia" && <span className="text-sm">📖</span>}
            {theme === "dark" && <FaMoon className="h-3.5 w-3.5 text-primary" />}
          </button>

          {/* Mobile Hamburger menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary transition-all duration-300 shadow-xs cursor-pointer"
            title="Menu"
            aria-label="Toggle Mobile Menu"
          >
            {isMenuOpen ? <FaTimes className="h-4 w-4 text-primary" /> : <FaBars className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown overlay */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-card-border bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out absolute top-16 left-0 right-0 z-40 p-4 shadow-xl flex flex-col gap-2">
          <Link
            href="/quran"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3.5 rounded-xl px-4.5 py-3.5 text-sm font-bold text-foreground hover:bg-primary-glow hover:text-primary transition-all duration-200"
          >
            <HiOutlineBookOpen className="h-5 w-5 text-primary" />
            <span>{t("navSurah")}</span>
          </Link>
          <Link
            href="/shalat"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3.5 rounded-xl px-4.5 py-3.5 text-sm font-bold text-foreground hover:bg-primary-glow hover:text-primary transition-all duration-200"
          >
            <FaMoon className="h-4 w-4 text-primary" />
            <span>{t("navShalat")}</span>
          </Link>
          <Link
            href="/doa"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3.5 rounded-xl px-4.5 py-3.5 text-sm font-bold text-foreground hover:bg-primary-glow hover:text-primary transition-all duration-200"
          >
            <span className="text-base">🙏</span>
            <span>{t("navDoa")}</span>
          </Link>
          <Link
            href="/cari"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3.5 rounded-xl px-4.5 py-3.5 text-sm font-bold text-foreground hover:bg-primary-glow hover:text-primary transition-all duration-200"
          >
            <span className="text-base">🔍</span>
            <span>{t("navCari")}</span>
          </Link>
          <Link
            href="/progress"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3.5 rounded-xl px-4.5 py-3.5 text-sm font-bold text-foreground hover:bg-primary-glow hover:text-primary transition-all duration-200"
          >
            <span className="text-base">📊</span>
            <span>{t("navProgress")}</span>
          </Link>
          <Link
            href="/bookmark"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3.5 rounded-xl px-4.5 py-3.5 text-sm font-bold text-foreground hover:bg-primary-glow hover:text-primary transition-all duration-200"
          >
            <FaBookmark className="h-4 w-4 text-primary" />
            <span>{t("navBookmark")}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
