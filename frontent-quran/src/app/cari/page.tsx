"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { searchVector, VectorSearchResult } from "@/utils/api";
import CustomSelect from "@/components/CustomSelect";
import { FaSearch, FaCopy, FaCheck, FaHeart, FaArrowRight, FaBrain, FaExternalLinkAlt, FaBookOpen } from "react-icons/fa";
import { animate, stagger } from "animejs";

const SUGGESTIONS = [
  "cara bersabar menghadapi ujian hidup",
  "kewajiban berbakti kepada orang tua",
  "doa ketenangan hati dan pikiran",
  "hukum riba dalam islam",
  "kisah nabi musa dan firaun",
  "keutamaan berinfak dan sedekah",
];

export default function SearchPage() {
  const { language } = useLanguage();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<VectorSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [limit, setLimit] = useState<number>(5);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0.3);

  // Trigger search function
  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setError(null);
      
      const payloadTypes = selectedTypes.length > 0 ? selectedTypes : undefined;
      const data = await searchVector(searchQuery, limit, payloadTypes, minScore);
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(language === "id" ? "Gagal melakukan pencarian semantik." : "Failed to execute semantic search.");
    } finally {
      setLoading(false);
    }
  };

  // Search trigger on enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Suggestions selector
  const handleSuggestionClick = (sug: string) => {
    setQuery(sug);
    handleSearch(sug);
  };

  // Stagger entry animation
  useEffect(() => {
    if (!loading && results && results.hasil.length > 0) {
      animate(".anim-fade-results", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(40),
        duration: 650,
        ease: "outQuint",
      });
    }
  }, [loading, results]);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 0.7) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (score >= 0.5) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  };

  const toggleTypeFilter = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
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
              <FaBrain className="h-3.5 w-3.5 text-primary animate-pulse" />
              {language === "id" ? "Pencarian Semantik AI" : "Semantic AI Vector Search"}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {language === "id" ? "Cari Makna & Konteks" : "Search by Meaning"}<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                {language === "id" ? "Dengan Pencarian Vektor" : "With AI Vector Search"}
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted max-w-lg">
              {language === "id"
                ? "Tanyakan apa saja menggunakan bahasa santai atau natural (misal: 'bagaimana bersabar saat dihina', 'doa sebelum bepergian'). AI kami akan menemukan ayat, tafsir, surah, atau doa yang paling relevan berdasarkan kecocokan maknawi."
                : "Ask anything in natural conversational language (e.g. 'how to stay patient in trials', 'prayers for traveling'). Our AI parses meaning embeddings to fetch matching verses, tafsir, surahs, or daily prayers."}
            </p>
          </div>
          <div className="hidden md:flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-primary/20 to-accent/20 border border-primary/20 text-primary">
            <FaBrain className="h-24 w-24 opacity-85" />
          </div>
        </div>

        {/* Search Input and Settings Column */}
        <div className="anim-fade space-y-6 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
              <input
                type="text"
                placeholder={language === "id" ? "Ketik apa yang ingin Anda cari (misal: hikmah musibah, salat malam)..." : "Type your query (e.g. wisdom behind trials, night prayers)..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-[58px] rounded-2xl border border-card-border bg-card-bg/40 pl-11.5 pr-4 text-sm sm:text-base text-foreground placeholder-muted/70 focus:border-primary/80 focus:bg-card-bg/60 focus:outline-hidden transition-all duration-200"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="h-[58px] px-6 sm:px-8 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-primary-glow/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <FaSearch />
                  <span className="hidden sm:inline">{language === "id" ? "Cari" : "Search"}</span>
                </>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="p-5 rounded-2xl border border-card-border bg-card-bg/10 flex flex-col md:flex-row md:items-center justify-between gap-5 select-none">
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block">
                {language === "id" ? "Filter Jenis Data" : "Data Types Filter"}
              </span>
              <div className="flex flex-wrap gap-2">
                {["surat", "ayat", "tafsir", "doa"].map((t) => {
                  const isActive = selectedTypes.includes(t) || selectedTypes.length === 0;
                  const activeColor = 
                    t === "surat" ? "bg-blue-600 text-white border-blue-500" :
                    t === "ayat" ? "bg-emerald-600 text-white border-emerald-500" :
                    t === "tafsir" ? "bg-orange-600 text-white border-orange-500" :
                    "bg-purple-600 text-white border-purple-500";

                  return (
                    <button
                      key={t}
                      onClick={() => toggleTypeFilter(t)}
                      className={`text-xs font-bold rounded-xl px-3 py-1.5 border transition-all duration-200 cursor-pointer ${
                        selectedTypes.includes(t)
                          ? activeColor
                          : "border-card-border bg-card-bg/30 text-muted hover:text-foreground"
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Score & Limit Selectors */}
            <div className="flex flex-wrap items-center gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">
                  {language === "id" ? "Skor Minimal" : "Min Score"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={minScore}
                    onChange={(e) => setMinScore(parseFloat(e.target.value))}
                    className="w-24 accent-primary"
                  />
                  <span className="text-xs font-mono font-bold text-foreground">{(minScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">
                  {language === "id" ? "Batas Hasil" : "Results Limit"}
                </label>
                <CustomSelect
                  options={[3, 5, 10].map((num) => ({
                    value: String(num),
                    label: `${num} ${language === "id" ? "Hasil" : "Results"}`,
                  }))}
                  value={String(limit)}
                  onChange={(v) => setLimit(Number(v))}
                  className="w-[140px]"
                />
              </div>
            </div>
          </div>

          {/* Search Suggestions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest block">
              💡 {language === "id" ? "Coba Cari Dengan Contoh" : "Try Searching With Suggestions"}
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSuggestionClick(sug)}
                  className="text-xs rounded-xl border border-card-border/70 hover:border-primary/45 bg-card-bg/15 hover:bg-primary-glow px-3.5 py-2 text-muted hover:text-primary transition-all duration-200 cursor-pointer shadow-2xs select-none"
                >
                  {sug}
                </button>
              ))}
            </div>
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

        {/* Search Results list */}
        {!loading && results && results.hasil.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-card-border/60 pb-3 select-none">
              <h3 className="font-black text-lg text-foreground">
                {language === "id"
                  ? `Hasil Pencarian (${results.hasil.length})`
                  : `Search Results (${results.hasil.length})`}
              </h3>
              <span className="text-xs text-muted">
                {language === "id" ? "Ditemukan oleh AI semantic model" : "Found by AI semantic model"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {results.hasil.map((item, idx) => {
                const itemKey = `${item.tipe}-${idx}`;
                const matchPercentage = (item.skor * 100).toFixed(1);

                return (
                  <div
                    key={itemKey}
                    className="anim-fade-results rounded-3xl border border-card-border bg-card-bg/40 p-6 md:p-8 transition-all duration-300 hover:border-card-border/80 flex flex-col justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Header: Score badge and Type tag */}
                    <div className="flex items-center justify-between gap-3 select-none">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider text-white ${
                          item.tipe === "surat" ? "bg-blue-600" :
                          item.tipe === "ayat" ? "bg-emerald-600" :
                          item.tipe === "tafsir" ? "bg-orange-600" :
                          "bg-purple-600"
                        }`}>
                          {item.tipe}
                        </span>
                        <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full tracking-wide ${getScoreBadgeClass(item.skor)}`}>
                          {matchPercentage}% {language === "id" ? "cocok" : "match"} ({item.relevansi})
                        </span>
                      </div>

                      {/* Top Action Copy / Go to Surah */}
                      <div className="flex items-center gap-1.5">
                        {item.tipe === "surat" && (
                          <Link
                            href={`/surah/${item.data.id_surat || item.data.nomor}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-card-border bg-card-bg px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-glow transition-all duration-200"
                          >
                            <FaBookOpen className="h-3 w-3" />
                            <span>{language === "id" ? "Buka Surah" : "Read Surah"}</span>
                          </Link>
                        )}

                        {item.tipe === "ayat" && (
                          <>
                            <button
                              onClick={() => handleCopyText(
                                itemKey,
                                `${item.data.nama_surat} [${item.data.nomor_ayat}]\n\n${item.data.teks_arab}\n\n${item.data.teks_latin}\n\nArtinya: "${item.data.terjemahan_id}"`
                              )}
                              className="text-muted hover:text-primary transition-colors p-2 hover:bg-card-border/40 rounded-full"
                              title="Salin Ayat"
                            >
                              {copiedId === itemKey ? <FaCheck className="text-green-500 h-3.5 w-3.5" /> : <FaCopy className="h-3.5 w-3.5" />}
                            </button>
                            <Link
                              href={`/surah/${item.data.id_surat}`}
                              className="text-muted hover:text-primary transition-colors p-2 hover:bg-card-border/40 rounded-full"
                              title="Buka Ayat di Surah"
                            >
                              <FaExternalLinkAlt className="h-3 w-3" />
                            </Link>
                          </>
                        )}

                        {item.tipe === "tafsir" && (
                          <>
                            <button
                              onClick={() => handleCopyText(
                                itemKey,
                                `Tafsir ${item.data.nama_surat} [Ayat ${item.data.nomor_ayat}]\n\n${item.data.isi}`
                              )}
                              className="text-muted hover:text-primary transition-colors p-2 hover:bg-card-border/40 rounded-full"
                              title="Salin Tafsir"
                            >
                              {copiedId === itemKey ? <FaCheck className="text-green-500 h-3.5 w-3.5" /> : <FaCopy className="h-3.5 w-3.5" />}
                            </button>
                            <Link
                              href={`/surah/${item.data.id_surat}`}
                              className="text-muted hover:text-primary transition-colors p-2 hover:bg-card-border/40 rounded-full"
                              title="Buka Ayat di Surah"
                            >
                              <FaExternalLinkAlt className="h-3 w-3" />
                            </Link>
                          </>
                        )}

                        {item.tipe === "doa" && (
                          <button
                            onClick={() => handleCopyText(
                              itemKey,
                              `${item.data.judul}\n\n${item.data.teks_arab}\n\n${item.data.teks_latin}\n\nArtinya: "${item.data.terjemahan}"\n\nSumber: ${item.data.sumber || "Hisnul Muslim"}`
                            )}
                            className="text-muted hover:text-primary transition-colors p-2 hover:bg-card-border/40 rounded-full"
                            title="Salin Doa"
                          >
                            {copiedId === itemKey ? <FaCheck className="text-green-500 h-3.5 w-3.5" /> : <FaCopy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rendering results based on type */}
                    <div className="space-y-4">
                      {/* TYPE: SURAT */}
                      {item.tipe === "surat" && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <h4 className="font-extrabold text-foreground text-lg sm:text-xl">
                              Surat {item.data.nama || item.data.nama_latin}
                            </h4>
                            <span className="font-arabic text-lg text-primary font-bold">
                              {item.data.nama_arab}
                            </span>
                          </div>
                          <p className="text-xs text-primary font-bold">
                            {language === "id" ? "Arti" : "Meaning"}: {item.data.arti} • {item.data.jumlah_ayat} {language === "id" ? "Ayat" : "Verses"} • {item.data.tempat_turun}
                          </p>
                          <p className="text-xs leading-relaxed text-muted whitespace-pre-line bg-background/25 p-3 rounded-xl border border-card-border/40">
                            {item.data.deskripsi}
                          </p>
                        </div>
                      )}

                      {/* TYPE: AYAT */}
                      {item.tipe === "ayat" && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-muted uppercase tracking-wider select-none">
                            QS. {item.data.nama_surat} [{item.data.nomor_ayat}]
                          </h4>
                          <div className="p-4.5 rounded-2xl bg-background/30 border border-card-border/50 text-right">
                            <p className="font-arabic text-2xl md:text-3xl text-primary font-bold leading-loose tracking-wide">
                              {item.data.teks_arab}
                            </p>
                          </div>
                          <div className="space-y-2 text-xs leading-relaxed">
                            <p className="text-foreground italic font-medium font-serif leading-relaxed">
                              {item.data.teks_latin}
                            </p>
                            <p className="text-foreground font-medium border-t border-card-border/40 pt-2 leading-relaxed">
                              "{item.data.terjemahan_id}"
                            </p>
                            {item.data.terjemahan_en && (
                              <p className="text-muted leading-relaxed font-serif">
                                "{item.data.terjemahan_en}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TYPE: TAFSIR */}
                      {item.tipe === "tafsir" && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-muted uppercase tracking-wider select-none">
                            Tafsir QS. {item.data.nama_surat} [{item.data.nomor_ayat}]
                          </h4>
                          <div className="text-xs leading-relaxed text-muted whitespace-pre-line bg-background/25 p-4.5 rounded-2xl border border-card-border/40 max-h-[250px] overflow-y-auto">
                            {item.data.isi}
                          </div>
                        </div>
                      )}

                      {/* TYPE: DOA */}
                      {item.tipe === "doa" && (
                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-bold text-primary bg-primary-glow px-2 py-0.5 rounded-full select-none">
                              {item.data.grup || "Doa Harian"}
                            </span>
                            <h4 className="font-extrabold text-foreground text-base mt-1.5">
                              {item.data.judul}
                            </h4>
                          </div>

                          <div className="p-4.5 rounded-2xl bg-background/30 border border-card-border/50 text-right">
                            <p className="font-arabic text-xl md:text-2xl text-primary font-bold leading-loose tracking-wide">
                              {item.data.teks_arab}
                            </p>
                          </div>

                          <div className="space-y-2 text-xs leading-relaxed">
                            <p className="text-foreground italic font-medium font-serif leading-relaxed">
                              {item.data.teks_latin}
                            </p>
                            <p className="text-foreground font-medium border-t border-card-border/40 pt-2 leading-relaxed">
                              "{item.data.terjemahan}"
                            </p>
                            {(item.data.sumber || item.data.catatan) && (
                              <p className="text-[10px] text-muted border-l-2 border-primary/40 pl-2 leading-normal italic whitespace-pre-line mt-3 font-mono">
                                {item.data.sumber || item.data.catatan}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && results && results.hasil.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto anim-fade-results">
            <span className="text-5xl block mb-4">🔮</span>
            <h3 className="font-bold text-foreground text-lg mb-1">
              {language === "id" ? "Hasil tidak ditemukan" : "No results found"}
            </h3>
            <p className="text-xs text-muted leading-normal">
              {language === "id"
                ? "Cobalah mengetik pertanyaan lain dengan bahasa natural atau naikkan batas toleransi skor kecocokan semantik."
                : "Try searching with different natural language query or lower the min matching score settings."}
            </p>
          </div>
        )}
      </main>

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
