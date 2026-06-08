"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBookOpen, FaMoon, FaSun, FaBars, FaTimes, FaGlobe, FaChevronDown } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

// ── Nav Config ─────────────────────────────────────────────────────────────
const PRIMARY_NAV = [
  { href: "/quran", labelKey: "navSurah",    icon: "📖" },
  { href: "/doa",   labelKey: "navDoa",      icon: "🙏" },
  { href: "/shalat",labelKey: "navShalat",   icon: "🕌" },
  { href: "/cari",  labelKey: "navCari",     icon: "🔍" },
];

const MORE_NAV = [
  { href: "/progress",    labelKey: "navProgress",    icon: "📊" },
  { href: "/hafalan",     labelKey: "navHafalan",     icon: "🧠" },
  { href: "/bookmark",    labelKey: "navBookmark",    icon: "🔖" },
  { href: "/downloads",   labelKey: "navDownloads",   icon: "📥" },
  { href: "/asmaul-husna",labelKey: "navAsmaulHusna", icon: "☪️" },
];

// ── Component ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("dark");
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const morePortalRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const [moreDropdownRect, setMoreDropdownRect] = useState<DOMRect | null>(null);

  // ── Init theme ────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const isAutoTheme = localStorage.getItem("quran-auto-theme") === "true";
    let stored: "light" | "dark" | "sepia" = "dark";
    if (isAutoTheme) {
      const h = new Date().getHours();
      stored = (h >= 18 || h < 6) ? "dark" : "light";
      localStorage.setItem("quran-theme", stored);
    } else {
      stored = (localStorage.getItem("quran-theme") as "light" | "dark" | "sepia") || "dark";
    }
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  // ── Scroll awareness ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close menus on route change ───────────────────────────────────────────
  useEffect(() => {
    setIsMobileOpen(false);
    setIsMoreOpen(false);
  }, [pathname]);

  // ── Close "more" dropdown on outside click ────────────────────────────────
  useEffect(() => {
    if (!isMoreOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Only close if the click is OUTSIDE both the trigger button AND the portal panel
      const inButton = moreButtonRef.current?.contains(target) ?? false;
      const inPanel  = morePortalRef.current?.contains(target) ?? false;
      if (!inButton && !inPanel) {
        setIsMoreOpen(false);
      }
    };
    // Delay so the opening click doesn't immediately re-close
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [isMoreOpen]);

  // ── Close "more" dropdown on scroll (portal won't follow on scroll) ────────
  useEffect(() => {
    if (!isMoreOpen) return;
    const onScroll = () => setIsMoreOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMoreOpen]);

  // ── Close mobile menu on outside click ───────────────────────────────────
  useEffect(() => {
    if (!isMobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobileOpen]);

  const toggleTheme = (t: "light" | "dark" | "sepia") => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("quran-theme", t);
    localStorage.setItem("quran-auto-theme", "false");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isMoreActive = MORE_NAV.some(item => isActive(item.href));

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <header className="sticky top-0 z-[60] w-full h-[60px] border-b border-white/5 bg-[#0b0f19]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/20">
              <FaBookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-extrabold tracking-wide text-white">Al-Qur&apos;an</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`navbar-root sticky top-0 z-[60] w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-card-border/60 shadow-lg shadow-black/20 bg-background/90 backdrop-blur-2xl"
          : "border-b border-transparent bg-background/60 backdrop-blur-xl"
      }`}
    >
      {/* ── Subtle top accent line ─────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />

      <div ref={mobileRef} className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* ── LOGO ──────────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary/20 group-hover:shadow-md group-hover:shadow-primary/20">
            <FaBookOpen className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-extrabold tracking-wide text-foreground group-hover:text-primary transition-colors duration-300">
              {t("appName")}
            </span>
            <span className="hidden xl:block text-[10px] font-medium text-muted mt-0.5">{t("appSub")}</span>
          </div>
        </Link>

        {/* ── DESKTOP NAV ───────────────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" aria-label="Primary navigation">
          {PRIMARY_NAV.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* "Lainnya" Dropdown */}
          <div ref={moreRef} className="relative">
            <button
              ref={moreButtonRef}
              onClick={() => {
                if (!isMoreOpen && moreButtonRef.current) {
                  setMoreDropdownRect(moreButtonRef.current.getBoundingClientRect());
                }
                setIsMoreOpen(!isMoreOpen);
              }}
              className={`nav-link flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                isMoreActive
                  ? "text-primary bg-primary/10"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
              aria-expanded={isMoreOpen}
            >
              <span>{language === "id" ? "Lainnya" : "More"}</span>
              <FaChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Panel — rendered via portal so it escapes backdrop-blur stacking context */}
            {isMoreOpen && moreDropdownRect && typeof document !== "undefined" && createPortal(
              <div
                ref={morePortalRef}
                style={{
                  position: "fixed",
                  top: moreDropdownRect.bottom + 6,
                  left: moreDropdownRect.left + moreDropdownRect.width / 2,
                  transform: "translateX(-50%)",
                  zIndex: 9999,
                }}
                className="w-48 rounded-2xl border border-card-border bg-background/98 backdrop-blur-xl shadow-2xl shadow-black/40 p-1.5 animate-dropdown-in"
              >
                {MORE_NAV.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                        active
                          ? "text-primary bg-primary/10"
                          : "text-muted hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span className="text-base w-5 text-center">{item.icon}</span>
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>,
              document.body
            )}
          </div>
        </nav>

        {/* ── RIGHT CONTROLS ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Theme Switcher — desktop */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-xl border border-card-border/60 bg-card-bg/30 p-1" role="group">
            <button
              onClick={() => toggleTheme("light")}
              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs transition-all duration-200 cursor-pointer ${theme === "light" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-white/5"}`}
              title={t("themeLight")} aria-pressed={theme === "light"}
            >
              <FaSun className="h-3 w-3" />
            </button>
            <button
              onClick={() => toggleTheme("sepia")}
              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs transition-all duration-200 cursor-pointer ${theme === "sepia" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-white/5"}`}
              title={t("themeSepia")} aria-pressed={theme === "sepia"}
            >
              <span className="text-[11px]">📖</span>
            </button>
            <button
              onClick={() => toggleTheme("dark")}
              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs transition-all duration-200 cursor-pointer ${theme === "dark" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-white/5"}`}
              title={t("themeDark")} aria-pressed={theme === "dark"}
            >
              <FaMoon className="h-3 w-3" />
            </button>
          </div>

          {/* Language pill */}
          <button
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-card-border/60 bg-card-bg/30 px-2.5 text-xs font-bold text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
            title={language === "id" ? "Switch to English" : "Ubah ke Indonesia"}
            aria-label="Toggle Language"
          >
            <FaGlobe className="h-3 w-3 text-primary" />
            <span>{language === "id" ? "ID" : "EN"}</span>
          </button>

          {/* Mobile theme cycle */}
          <button
            onClick={() => {
              if (theme === "light") toggleTheme("sepia");
              else if (theme === "sepia") toggleTheme("dark");
              else toggleTheme("light");
            }}
            className="sm:hidden h-8 w-8 flex items-center justify-center rounded-xl border border-card-border/60 bg-card-bg/30 text-muted hover:text-primary transition-all duration-200 cursor-pointer"
            aria-label="Cycle Theme"
          >
            {theme === "light" && <FaSun className="h-3.5 w-3.5 text-amber-400" />}
            {theme === "sepia" && <span className="text-sm">📖</span>}
            {theme === "dark" && <FaMoon className="h-3.5 w-3.5 text-primary" />}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`lg:hidden h-8 w-8 flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
              isMobileOpen
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-card-border/60 bg-card-bg/30 text-muted hover:text-primary"
            }`}
            aria-label="Toggle menu" aria-expanded={isMobileOpen}
          >
            <span className={`transition-transform duration-250 ${isMobileOpen ? "rotate-90" : ""}`}>
              {isMobileOpen ? <FaTimes className="h-3.5 w-3.5" /> : <FaBars className="h-3.5 w-3.5" />}
            </span>
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ─────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
          isMobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <div className="border-t border-card-border/50 bg-background/98 backdrop-blur-2xl px-4 py-4">
          {/* All links grid */}
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {[...PRIMARY_NAV, ...MORE_NAV].map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted hover:text-foreground hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="truncate">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider + appearance controls */}
          <div className="pt-3 border-t border-card-border/40 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted flex-1">
              {language === "id" ? "Tampilan" : "Appearance"}
            </span>
            <div className="flex items-center gap-0.5 rounded-xl border border-card-border/60 bg-card-bg/30 p-1">
              <button onClick={() => toggleTheme("light")} className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${theme === "light" ? "bg-primary text-white" : "text-muted hover:bg-white/5"}`}>
                <FaSun className="h-3 w-3" />
              </button>
              <button onClick={() => toggleTheme("sepia")} className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${theme === "sepia" ? "bg-primary text-white" : "text-muted hover:bg-white/5"}`}>
                <span className="text-[11px]">📖</span>
              </button>
              <button onClick={() => toggleTheme("dark")} className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${theme === "dark" ? "bg-primary text-white" : "text-muted hover:bg-white/5"}`}>
                <FaMoon className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={() => setLanguage(language === "id" ? "en" : "id")}
              className="flex h-8 items-center gap-1.5 rounded-xl border border-card-border/60 bg-card-bg/30 px-2.5 text-xs font-bold text-foreground hover:text-primary transition-all duration-200 cursor-pointer"
            >
              <FaGlobe className="h-3 w-3 text-primary" />
              <span>{language === "id" ? "ID" : "EN"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
