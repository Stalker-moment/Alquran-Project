"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import {
  ASMAUL_HUSNA,
  AsmaulHusnaName,
  ASMAUL_HUSNA_CATEGORIES,
  NAME_CATEGORIES,
} from "@/data/asmaulHusna";
import { FaSearch, FaCopy, FaCheck, FaTimes, FaHeart, FaChevronDown, FaLanguage } from "react-icons/fa";
import { animate, stagger } from "animejs";

type NameLanguage = "id" | "en" | "tr" | "ur";

const LANGUAGE_LABELS: Record<NameLanguage, string> = {
  id: "Indonesia",
  en: "English",
  tr: "Türkçe",
  ur: "اردو",
};

// Golden gradient colors for each card by number group
const CARD_GRADIENTS = [
  "from-amber-500/10 to-yellow-600/5",
  "from-emerald-500/10 to-teal-600/5",
  "from-blue-500/10 to-indigo-600/5",
  "from-purple-500/10 to-violet-600/5",
  "from-rose-500/10 to-pink-600/5",
  "from-cyan-500/10 to-sky-600/5",
  "from-orange-500/10 to-amber-600/5",
  "from-lime-500/10 to-green-600/5",
  "from-fuchsia-500/10 to-purple-600/5",
  "from-red-500/10 to-rose-600/5",
];

export default function AsmaulHusnaPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedName, setSelectedName] = useState<AsmaulHusnaName | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [nameLanguage, setNameLanguage] = useState<NameLanguage>("id");
  const [isLangDropOpen, setIsLangDropOpen] = useState(false);
  const [isCatDropOpen, setIsCatDropOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) {
        setIsLangDropOpen(false);
        setIsCatDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Stagger animation for cards
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        animate(".ah-card", {
          opacity: [0, 1],
          translateY: [24, 0],
          scale: [0.96, 1],
          delay: stagger(18),
          duration: 500,
          ease: "outQuint",
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mounted, selectedCategory, searchQuery]);

  const filteredNames = useMemo(() => {
    return ASMAUL_HUSNA.filter((name) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        name.transliteration.toLowerCase().includes(query) ||
        name.arabic.includes(query) ||
        name.meanings.id.toLowerCase().includes(query) ||
        name.meanings.en.toLowerCase().includes(query) ||
        String(name.number).includes(query);

      const matchesCategory =
        selectedCategory === "all" ||
        NAME_CATEGORIES[name.number] === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = useCallback(
    async (name: AsmaulHusnaName) => {
      const text = [
        `${name.number}. ${name.transliteration}`,
        `${name.arabic}`,
        ``,
        `Bahasa Indonesia: ${name.meanings.id}`,
        `English: ${name.meanings.en}`,
        `Türkçe: ${name.meanings.tr}`,
        `اردو: ${name.meanings.ur}`,
        ``,
        `Keutamaan: ${name.benefits.id}`,
        name.quranRef ? `Referensi: ${name.quranRef}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(name.number);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    },
    []
  );

  const categoryOptions = Object.entries(ASMAUL_HUSNA_CATEGORIES).map(
    ([key, val]) => ({ value: key, label: language === "id" ? val.id : val.en })
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-card-border bg-gradient-to-br from-amber-500/10 via-card-bg/60 to-primary-glow/20 p-8 md:p-12 mb-10 shadow-sm">
          {/* Decorative background pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a017' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/25 px-4 py-1.5 text-xs font-bold text-amber-500">
                ✨ {language === "id" ? "99 Nama Allah Yang Maha Indah" : "The 99 Beautiful Names of Allah"}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                {language === "id" ? "Asmaul Husna" : "Asmaul Husna"}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
                  {language === "id" ? "99 Nama Allah SWT" : "99 Names of Allah"}
                </span>
              </h1>
              <p className="text-sm md:text-base text-muted max-w-xl leading-relaxed">
                {language === "id"
                  ? "Pelajari dan renungkan 99 nama indah Allah beserta artinya dalam berbagai bahasa. Setiap nama mengungkap keagungan, keindahan, dan kesempurnaan Allah SWT."
                  : "Learn and contemplate the 99 beautiful names of Allah with their meanings in multiple languages. Each name reveals the majesty, beauty, and perfection of Allah SWT."}
              </p>
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                {[
                  { value: "99", label: language === "id" ? "Nama Mulia" : "Holy Names" },
                  { value: "4", label: language === "id" ? "Bahasa" : "Languages" },
                  { value: "∞", label: language === "id" ? "Keutamaan" : "Virtues" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-black text-amber-500">{stat.value}</div>
                    <div className="text-xs text-muted font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Arabic calligraphy-style element */}
            <div className="hidden md:flex h-44 w-44 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-primary/10 border-2 border-amber-500/25 shadow-inner relative">
              <div className="absolute inset-2 rounded-full border border-amber-500/15" />
              <div className="text-center select-none pointer-events-none">
                <p className="font-arabic text-3xl text-amber-500 font-bold leading-none mb-1">اللَّه</p>
                <p className="text-[10px] text-amber-500/70 font-semibold tracking-widest uppercase">Allah</p>
              </div>
            </div>
          </div>

          {/* Quran reference bottom banner */}
          <div className="relative mt-8 pt-6 border-t border-card-border/40 text-center">
            <p className="font-arabic text-xl text-amber-500/80 leading-loose mb-1">
              وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
            </p>
            <p className="text-xs text-muted italic">
              {language === "id"
                ? "\"Hanya milik Allah Asmaul Husna, maka bermohonlah kepada-Nya dengan menyebut nama-nama-Nya\" (Al-A'raf: 180)"
                : "\"And to Allah belong the Beautiful Names, so invoke Him by them\" (Al-A'raf: 180)"}
            </p>
          </div>
        </div>

        {/* Search, Filter, and Language Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
            <input
              type="text"
              placeholder={
                language === "id"
                  ? "Cari nama, arti, atau nomor..."
                  : "Search name, meaning, or number..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[52px] rounded-2xl border border-card-border bg-card-bg/40 pl-11 pr-4 text-sm text-foreground placeholder-muted/70 focus:border-amber-500/60 focus:bg-card-bg/70 focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 rounded-full transition-colors"
              >
                <FaTimes className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter — Custom Dropdown */}
          <div className="relative min-w-[200px]" data-dropdown>
            <button
              onClick={() => { setIsCatDropOpen((p) => !p); setIsLangDropOpen(false); }}
              className={`h-[52px] w-full flex items-center gap-2 rounded-2xl border bg-card-bg/40 px-4 text-sm text-foreground transition-all duration-200 cursor-pointer ${
                isCatDropOpen ? "border-amber-500/60 bg-card-bg/70" : "border-card-border hover:border-amber-500/60"
              }`}
            >
              <span className="flex-1 text-left">
                {categoryOptions.find((o) => o.value === selectedCategory)?.label}
              </span>
              <FaChevronDown
                className={`h-3 w-3 text-muted shrink-0 transition-transform duration-200 ${
                  isCatDropOpen ? "rotate-180 text-amber-500" : ""
                }`}
              />
            </button>
            {isCatDropOpen && (
              <div className="absolute top-full mt-1.5 left-0 right-0 z-30 rounded-xl border border-card-border bg-card-bg shadow-2xl overflow-hidden animate-fade-in">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedCategory(opt.value);
                      setIsCatDropOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer hover:bg-primary-glow hover:text-primary ${
                      selectedCategory === opt.value
                        ? "bg-amber-500/10 text-amber-500 font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name Language Selector */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setIsLangDropOpen((p) => !p); setIsCatDropOpen(false); }}
              className={`h-[52px] min-w-[140px] flex items-center gap-2 rounded-2xl border bg-card-bg/40 px-4 text-sm text-foreground transition-all duration-200 cursor-pointer ${
                isLangDropOpen ? "border-amber-500/60 bg-card-bg/70" : "border-card-border hover:border-amber-500/60"
              }`}
            >
              <FaLanguage className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="flex-1 text-left">{LANGUAGE_LABELS[nameLanguage]}</span>
              <FaChevronDown className={`h-3 w-3 text-muted transition-transform duration-200 ${isLangDropOpen ? "rotate-180" : ""}`} />
            </button>
            {isLangDropOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 z-20 rounded-xl border border-card-border bg-card-bg shadow-xl overflow-hidden">
                {(Object.keys(LANGUAGE_LABELS) as NameLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setNameLanguage(lang);
                      setIsLangDropOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer hover:bg-primary-glow hover:text-primary ${
                      nameLanguage === lang
                        ? "bg-amber-500/10 text-amber-500 font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-muted font-medium">
            {language === "id"
              ? `Menampilkan ${filteredNames.length} nama`
              : `Showing ${filteredNames.length} names`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-amber-500 hover:text-amber-400 font-semibold transition-colors"
            >
              {language === "id" ? "Hapus pencarian" : "Clear search"}
            </button>
          )}
        </div>

        {/* Names Grid */}
        {filteredNames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredNames.map((name) => {
              const gradientClass = CARD_GRADIENTS[(name.number - 1) % CARD_GRADIENTS.length];
              return (
                <div
                  key={name.number}
                  onClick={() => setSelectedName(name)}
                  className={`ah-card group relative overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br ${gradientClass} bg-card-bg/40 hover:bg-card-bg/70 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 p-5 transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col`}
                  style={{ opacity: 0 }}
                >
                  {/* Number badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/25 text-xs font-black text-amber-500">
                      {name.number}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(name);
                      }}
                      className="text-muted/60 hover:text-amber-500 transition-colors p-1 rounded-lg hover:bg-amber-500/10"
                      title={language === "id" ? "Salin" : "Copy"}
                    >
                      {copiedId === name.number ? (
                        <FaCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <FaCopy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Arabic name - Large and centered */}
                  <div className="text-center py-3 mb-3">
                    <p className="font-arabic text-3xl text-amber-500 font-bold leading-loose group-hover:scale-105 transition-transform duration-300 inline-block">
                      {name.arabic}
                    </p>
                  </div>

                  {/* Transliteration */}
                  <p className="text-center text-sm font-bold text-foreground mb-1 tracking-wide">
                    {name.transliteration}
                  </p>

                  {/* Meaning in selected language */}
                  <p className="text-center text-xs text-muted leading-relaxed line-clamp-2 flex-1">
                    {name.meanings[nameLanguage]}
                  </p>

                  {/* Quran reference badge */}
                  {name.quranRef && (
                    <div className="mt-3 pt-3 border-t border-card-border/30 text-center">
                      <span className="text-[10px] text-amber-500/70 font-semibold">
                        📖 {name.quranRef}
                      </span>
                    </div>
                  )}

                  {/* Hover shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/3 group-hover:via-amber-500/2 group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-2xl" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="font-bold text-foreground text-lg mb-2">
              {language === "id" ? "Nama tidak ditemukan" : "Name not found"}
            </h3>
            <p className="text-sm text-muted">
              {language === "id"
                ? "Coba cari dengan kata kunci lain atau ubah filter kategori."
                : "Try searching with other keywords or change the category filter."}
            </p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={() => setSelectedName(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-card-border bg-card-bg shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            {/* Modal top gradient strip */}
            <div className="h-1.5 w-full rounded-t-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600" />

            <div className="p-6 md:p-8 space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedName(null)}
                className="absolute top-5 right-5 text-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-card-border/40"
              >
                <FaTimes className="h-4 w-4" />
              </button>

              {/* Number & Header */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25 text-xl font-black text-amber-500">
                  {selectedName.number}
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">
                    {selectedName.transliteration}
                  </h2>
                  {selectedName.quranRef && (
                    <p className="text-xs text-amber-500/80 font-semibold mt-0.5">
                      📖 {selectedName.quranRef}
                    </p>
                  )}
                </div>
              </div>

              {/* Arabic Text Block */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-card-bg/50 to-yellow-500/5 border border-amber-500/20 p-8 text-center">
                <p className="font-arabic text-5xl text-amber-500 font-bold leading-loose mb-2">
                  {selectedName.arabic}
                </p>
                <p className="text-base font-semibold text-foreground/80 tracking-wider">
                  {selectedName.transliteration}
                </p>
              </div>

              {/* Meanings in All Languages */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                  {language === "id" ? "Arti dalam Berbagai Bahasa" : "Meanings in Multiple Languages"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(LANGUAGE_LABELS) as NameLanguage[]).map((lang) => (
                    <div
                      key={lang}
                      className="rounded-xl border border-card-border/60 bg-background/30 p-4 space-y-1"
                    >
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        {LANGUAGE_LABELS[lang]}
                      </p>
                      <p
                        className={`text-sm font-medium text-foreground leading-relaxed ${
                          lang === "ur" ? "font-arabic text-right text-base" : ""
                        }`}
                      >
                        {selectedName.meanings[lang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits / Virtues */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2">
                <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  ✨ {language === "id" ? "Keutamaan & Faedah" : "Benefits & Virtues"}
                </h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {language === "id" ? selectedName.benefits.id : selectedName.benefits.en}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t border-card-border/40">
                <button
                  onClick={() => handleCopy(selectedName)}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-white transition-all duration-200 cursor-pointer shadow-sm"
                >
                  {copiedId === selectedName.number ? (
                    <>
                      <FaCheck className="h-3.5 w-3.5" />
                      <span>{language === "id" ? "Tersalin!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <FaCopy className="h-3.5 w-3.5" />
                      <span>{language === "id" ? "Salin Nama" : "Copy Name"}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedName(null)}
                  className="rounded-xl border border-card-border bg-card-bg/40 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-card-border/50 transition-all duration-200 cursor-pointer"
                >
                  {language === "id" ? "Tutup" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-card-border py-8 mt-16 bg-card-bg/10 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()}{" "}
            {language === "id" ? "Al-Qur'an Al-Kareem" : "Quran Kareem"}. 
            {language === "id" ? " Data Asmaul Husna." : " Asmaul Husna Data."}
          </p>
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
        </div>
      </footer>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
