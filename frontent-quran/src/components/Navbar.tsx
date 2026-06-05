"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaMoon, FaSun } from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("dark");
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("quran-theme") as "light" | "dark" | "sepia" || "dark";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  const toggleTheme = (newTheme: "light" | "dark" | "sepia") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("quran-theme", newTheme);
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-glow border border-primary/20 text-primary transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-md shrink-0">
            <FaBookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-wide text-foreground group-hover:text-primary transition-colors duration-300 truncate">
              {t("appName")}
            </span>
            <span className="hidden sm:block text-[10px] sm:text-xs text-muted truncate">{t("appSub")}</span>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3">
          <Link 
            href="/quran"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-primary hover:bg-primary-glow transition-all duration-300"
          >
            <HiOutlineBookOpen className="h-4 w-4" />
            {t("surahListNav")}
          </Link>

          {/* Open Quran CTA (mobile) */}
          <Link
            href="/quran"
            className="sm:hidden inline-flex items-center gap-1.5 rounded-xl bg-primary/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary transition-all duration-300 shadow-sm"
            aria-label="Open Quran"
          >
            <FaBookOpen className="h-3 w-3" />
            <span className="hidden xs:inline">{t("openQuran")}</span>
          </Link>

          {/* Language Selector Button */}
          <button
            onClick={cycleLanguage}
            className="flex h-9 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border px-3 text-xs font-bold text-foreground hover:bg-card-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm"
            title={language === "id" ? "Switch to English" : "Ubah ke Bahasa Indonesia"}
            aria-label="Toggle Language"
          >
            <span className="mr-1.5">{language === "id" ? "🇮🇩" : "🇬🇧"}</span>
            <span>{language === "id" ? "ID" : "EN"}</span>
          </button>

          {/* Theme Selector Panel */}
          {/* Desktop version */}
          <div className="hidden md:flex items-center gap-1 rounded-xl bg-card-bg/50 border border-card-border p-1">
            {/* Light Theme Button */}
            <button
              onClick={() => toggleTheme("light")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                theme === "light"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-border/50"
              }`}
              title={t("themeLight")}
              aria-label="Light Theme"
            >
              <FaSun className="h-4 w-4" />
            </button>

            {/* Sepia Theme Button */}
            <button
              onClick={() => toggleTheme("sepia")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-semibold text-xs transition-all duration-300 ${
                theme === "sepia"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-border/50"
              }`}
              title={t("themeSepia")}
              aria-label="Sepia Theme"
            >
              📖
            </button>

            {/* Dark Theme Button */}
            <button
              onClick={() => toggleTheme("dark")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                theme === "dark"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-border/50"
              }`}
              title={t("themeDark")}
              aria-label="Dark Theme"
            >
              <FaMoon className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Theme Cycle Button */}
          <button
            onClick={() => {
              if (theme === "light") toggleTheme("sepia");
              else if (theme === "sepia") toggleTheme("dark");
              else toggleTheme("light");
            }}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl bg-card-bg/50 border border-card-border text-muted hover:text-primary transition-all duration-300 shadow-xs"
            title={t("themeCycle")}
            aria-label="Cycle Theme"
          >
            {theme === "light" && <FaSun className="h-4 w-4 text-primary" />}
            {theme === "sepia" && <span className="text-sm">📖</span>}
            {theme === "dark" && <FaMoon className="h-4 w-4 text-primary" />}
          </button>
        </div>
      </div>
    </header>
  );
}
