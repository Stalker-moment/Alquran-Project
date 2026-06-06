"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { getDoaList, DoaItem } from "@/utils/api";
import CustomSelect from "@/components/CustomSelect";
import { FaSearch, FaCopy, FaCheck, FaTimes, FaHeart, FaChevronDown } from "react-icons/fa";
import { animate, stagger } from "animejs";

export default function DoaPage() {
  const { language } = useLanguage();
  const [doaList, setDoaList] = useState<DoaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("Semua");
  const [groups, setGroups] = useState<string[]>([]);

  // Selected Doa for Modal
  const [selectedDoa, setSelectedDoa] = useState<DoaItem | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    async function loadDoa() {
      try {
        setLoading(true);
        const data = await getDoaList();
        setDoaList(data);
        
        // Extract unique groups/categories
        const uniqueGroups = Array.from(new Set(data.map((item) => item.grup)));
        setGroups(["Semua", ...uniqueGroups]);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(language === "id" ? "Gagal memuat daftar doa." : "Failed to load prayers.");
      } finally {
        setLoading(false);
      }
    }
    loadDoa();
  }, [language]);

  // Page Entry Stagger Animation
  useEffect(() => {
    if (!loading && doaList.length > 0) {
      animate(".anim-fade", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(25),
        duration: 600,
        ease: "outQuint",
      });
    }
  }, [loading, doaList.length]);

  const filteredDoa = doaList.filter((doa) => {
    const matchesSearch =
      doa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doa.idn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doa.tag && doa.tag.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesGroup = selectedGroup === "Semua" || doa.grup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleCopy = async (doa: DoaItem) => {
    const textToCopy = `${doa.nama}\n\n${doa.ar}\n\n${doa.tr}\n\nArtinya: "${doa.idn}"\n\nSumber/Info: ${doa.tentang || "Hisnul Muslim"}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(doa.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="anim-fade relative overflow-hidden rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/40 via-card-bg/50 to-transparent p-8 md:p-12 mb-10 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-glow/85 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              🙏 {language === "id" ? "Doa & Dzikir Harian" : "Daily Du'a & Dhikr"}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {language === "id" ? "Kumpulan Doa" : "Daily Du'a"}<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                {language === "id" ? "Sesuai Sunnah & Hadits" : "From Qur'an & Sunnah"}
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted max-w-lg">
              {language === "id"
                ? "Temukan kumpulan doa harian, dzikir, serta doa-doa khusus lengkap dengan teks Arab, transliterasi Latin, terjemahan Indonesia, serta referensi sumber shahih."
                : "Discover a collection of daily prayers, dhikr, and special invocations complete with Arabic text, Latin transliteration, English/Indonesian translations, and authentic references."}
            </p>
          </div>
          <div className="hidden md:flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-primary/20 to-accent/20 border border-primary/20 text-primary">
            <span className="text-6xl animate-pulse">🤲</span>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <div className="anim-fade flex flex-col md:flex-row gap-4 mb-8">
          {/* Search bar */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
            <input
              type="text"
              placeholder={language === "id" ? "Cari nama doa, arti, atau kata kunci..." : "Search prayers, meanings, or tags..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[54px] rounded-2xl border border-card-border bg-card-bg/40 pl-11.5 pr-4 text-sm text-foreground placeholder-muted/70 focus:border-primary/80 focus:bg-card-bg/60 focus:outline-hidden transition-all duration-200"
            />
          </div>

          {/* Group Dropdown Selector - Custom */}
          <div className="min-w-[200px] md:w-[280px]">
            <CustomSelect
              options={groups.map((g) => ({
                value: g,
                label: g === "Semua" ? (language === "id" ? "Semua Kategori" : "All Categories") : g,
              }))}
              value={selectedGroup}
              onChange={(v) => setSelectedGroup(v)}
              searchable={groups.length > 8}
              searchPlaceholder={language === "id" ? "Cari kategori..." : "Search category..."}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="anim-fade rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-500 max-w-md mx-auto mb-8">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-card-border border-t-primary" />
          </div>
        )}

        {/* Doa Grid List */}
        {!loading && filteredDoa.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoa.map((doa) => (
              <div
                key={doa.id}
                onClick={() => setSelectedDoa(doa)}
                className="anim-fade group rounded-2xl border border-card-border bg-card-bg/30 hover:bg-card-bg/70 hover:border-primary/45 p-6 transition-all duration-300 shadow-xs flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.99]"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold text-primary uppercase bg-primary-glow px-2.5 py-0.5 rounded-full tracking-wider select-none">
                      {doa.grup}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(doa);
                      }}
                      className="text-muted hover:text-primary transition-colors p-1"
                      title="Salin Doa"
                    >
                      {copiedId === doa.id ? <FaCheck className="text-green-500 h-3.5 w-3.5" /> : <FaCopy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base line-clamp-2">
                      {doa.nama}
                    </h3>
                    <p className="font-arabic text-right text-lg text-primary/95 font-semibold line-clamp-1 py-1">
                      {doa.ar}
                    </p>
                    <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                      {doa.idn}
                    </p>
                  </div>
                </div>

                {/* Tags bottom bar */}
                {doa.tag && doa.tag.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-card-border/40">
                    {doa.tag.map((t) => (
                      <span key={t} className="text-[9px] font-medium text-muted bg-card-border/50 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && filteredDoa.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto anim-fade">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="font-bold text-foreground text-lg mb-1">
              {language === "id" ? "Doa tidak ditemukan" : "No prayers found"}
            </h3>
            <p className="text-xs text-muted leading-normal">
              {language === "id"
                ? "Coba cari dengan kata kunci lain atau pilih kategori yang berbeda."
                : "Try searching with other keywords or select a different category."}
            </p>
          </div>
        )}
      </main>

      {/* Doa Detail Modal Popup */}
      {selectedDoa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-card-border bg-card-bg p-6 md:p-8 shadow-2xl relative space-y-6 animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setSelectedDoa(null)}
              className="absolute top-4.5 right-4.5 text-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-card-border/40"
            >
              <FaTimes className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2.5">
              <span className="inline-block text-[10px] font-bold text-primary uppercase bg-primary-glow px-2.5 py-0.5 rounded-full tracking-wider">
                {selectedDoa.grup}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-foreground pr-8 leading-tight">
                {selectedDoa.nama}
              </h2>
            </div>

            {/* Prayer Arabic Box */}
            <div className="p-6 rounded-2xl bg-background/40 border border-card-border/60 text-center space-y-4">
              <p className="font-arabic text-2xl md:text-3xl text-primary font-bold leading-loose tracking-wide">
                {selectedDoa.ar}
              </p>
            </div>

            {/* Transliteration & Translation Box */}
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {language === "id" ? "Transliterasi Latin" : "Latin Transliteration"}
                </h4>
                <p className="text-foreground italic font-medium font-serif leading-relaxed">
                  {selectedDoa.tr}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">
                  {language === "id" ? "Artinya (Terjemahan)" : "Translation"}
                </h4>
                <p className="text-foreground font-medium leading-relaxed">
                  "{selectedDoa.idn}"
                </p>
              </div>

              {selectedDoa.tentang && (
                <div className="space-y-1 pt-3 border-t border-card-border/40 text-xs">
                  <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">
                    {language === "id" ? "Referensi & Keterangan Hadits" : "References & Hadith Notes"}
                  </h4>
                  <div className="text-muted leading-relaxed whitespace-pre-line font-mono bg-background/20 p-3 rounded-xl border border-card-border/40">
                    {selectedDoa.tentang}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-card-border/40">
              <button
                onClick={() => handleCopy(selectedDoa)}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-glow hover:text-primary transition-all duration-200 cursor-pointer shadow-xs"
              >
                {copiedId === selectedDoa.id ? (
                  <>
                    <FaCheck className="h-3.5 w-3.5" />
                    <span>{language === "id" ? "Tersalin!" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="h-3.5 w-3.5" />
                    <span>{language === "id" ? "Salin Doa" : "Copy Du'a"}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedDoa(null)}
                className="rounded-xl border border-card-border bg-card-bg/40 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-card-border/50 transition-all duration-200 cursor-pointer"
              >
                {language === "id" ? "Tutup" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-card-border py-8 mt-16 bg-card-bg/10 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {language === "id" ? "Al-Qur'an Al-Kareem" : "Quran Kareem"}. Powered by Next.js & equran.id.</p>
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
    </div>
  );
}
