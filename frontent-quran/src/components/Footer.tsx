"use client";

import React from "react";
import Link from "next/link";
import { FaBookOpen, FaGithub, FaHeart, FaExternalLinkAlt } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

// ── Data ─────────────────────────────────────────────────────────────────────
const FEATURE_LINKS = [
  { href: "/quran",       labelId: "Baca Al-Qur'an",   labelEn: "Read Al-Qur'an"    },
  { href: "/shalat",      labelId: "Jadwal Shalat",     labelEn: "Prayer Schedule"   },
  { href: "/doa",         labelId: "Kumpulan Doa",      labelEn: "Daily Prayers"     },
  { href: "/hafalan",     labelId: "Asisten Hafalan",   labelEn: "Memorization Tool" },
  { href: "/cari",        labelId: "Pencarian Ayat",    labelEn: "Verse Search"      },
  { href: "/asmaul-husna",labelId: "Asmaul Husna",      labelEn: "Asmaul Husna"      },
  { href: "/progress",    labelId: "Progress Tadarus",  labelEn: "Reading Progress"  },
  { href: "/downloads",   labelId: "Audio Offline",     labelEn: "Offline Audio"     },
];

const LEGAL_LINKS = [
  { href: "/terms",   labelId: "Syarat Penggunaan",   labelEn: "Terms of Service" },
  { href: "/privacy", labelId: "Kebijakan Privasi",   labelEn: "Privacy Policy"   },
  { href: "/cookies", labelId: "Kebijakan Cookie",    labelEn: "Cookie Policy"    },
];

const API_SOURCES = [
  {
    name: "Al-Quran Cloud",
    url: "https://alquran.cloud",
    desc: "Open source Quran API — text, audio, and translations",
    badge: "REST API",
  },
  {
    name: "Islamic Network (CDN)",
    url: "https://cdn.islamic.network",
    desc: "High-quality Quran audio CDN by islamic.network",
    badge: "Audio CDN",
  },
  {
    name: "Quran.com API (v4)",
    url: "https://api.quran.com",
    desc: "Ayah segments, word-by-word, and recitation data",
    badge: "REST API",
  },
  {
    name: "Equran.id API",
    url: "https://equran.id",
    desc: "Indonesian translation and tafsir (Kemenag RI)",
    badge: "REST API",
  },
];

const STATS = [
  { value: "114",   labelId: "Surah",      labelEn: "Surahs"    },
  { value: "6.236", labelId: "Ayat",       labelEn: "Verses"    },
  { value: "30",    labelId: "Juz",        labelEn: "Juz"       },
  { value: "6+",    labelId: "Qori",       labelEn: "Reciters"  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Footer() {
  const { language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-card-border/50 bg-background overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -top-16 right-1/4 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── TOP SECTION ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:py-16 lg:grid-cols-[2fr_1fr_1fr_1.5fr]">

          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-all duration-300 group-hover:border-primary group-hover:shadow-md group-hover:shadow-primary/20">
                <FaBookOpen className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-extrabold tracking-wide text-foreground group-hover:text-primary transition-colors duration-300">
                  Al-Qur&apos;an Al-Kareem
                </span>
                <span className="text-[10px] font-medium text-muted mt-0.5">
                  {language === "id" ? "Quran Viewer & Murottal" : "Quran Viewer & Murottal"}
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted leading-relaxed max-w-xs">
              {language === "id"
                ? "Platform Al-Qur'an digital open source — baca, dengar murottal dari qori terbaik, tadabbur ayat, dan hafalan interaktif."
                : "An open source digital Quran platform — read, listen to top reciters, reflect on verses, and practice memorization."
              }
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 flex-wrap">
              {STATS.map(s => (
                <div key={s.value} className="flex flex-col">
                  <span className="text-lg font-extrabold text-primary leading-none">{s.value}</span>
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-0.5">
                    {language === "id" ? s.labelId : s.labelEn}
                  </span>
                </div>
              ))}
            </div>

            {/* GitHub link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors duration-200 w-fit"
            >
              <FaGithub className="h-4 w-4" />
              <span>{language === "id" ? "Lihat Source Code" : "View Source Code"}</span>
              <FaExternalLinkAlt className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Features Column */}
          <div>
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-primary">
              {language === "id" ? "Fitur Utama" : "Features"}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {FEATURE_LINKS.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-3 bg-card-border group-hover:w-4 group-hover:bg-primary transition-all duration-200" />
                    {language === "id" ? item.labelId : item.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-primary">
              Legal
            </h3>
            <ul className="flex flex-col gap-2.5">
              {LEGAL_LINKS.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-3 bg-card-border group-hover:w-4 group-hover:bg-primary transition-all duration-200" />
                    {language === "id" ? item.labelId : item.labelEn}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 mb-4 text-[11px] font-bold uppercase tracking-widest text-primary">
              {language === "id" ? "Sumber Data" : "Data Sources"}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {API_SOURCES.map(src => (
                <li key={src.url}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-3 bg-card-border group-hover:w-4 group-hover:bg-primary transition-all duration-200" />
                    {src.name}
                    <FaExternalLinkAlt className="h-2 w-2 opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* API Reference Column */}
          <div>
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-primary">
              {language === "id" ? "Referensi API Open Source" : "Open Source APIs"}
            </h3>
            <div className="flex flex-col gap-3">
              {API_SOURCES.map(src => (
                <a
                  key={src.url}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 rounded-xl border border-card-border/50 bg-card-bg/20 px-3.5 py-3 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                      {src.name}
                    </span>
                    <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                      {src.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">{src.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-card-border/40 py-5 text-xs text-muted">
          <span>
            © {year}{" "}
            <span className="font-semibold text-foreground">Al-Qur&apos;an Al-Kareem</span>.{" "}
            {language === "id" ? "Hak Cipta Dilindungi." : "All rights reserved."}
          </span>
          <span className="flex items-center gap-1.5">
            {language === "id" ? "Dibuat dengan" : "Made with"}
            <FaHeart className="h-3 w-3 text-red-500 animate-pulse" />
            {language === "id" ? "untuk umat Islam di seluruh dunia" : "for Muslims around the world"}
          </span>
        </div>
      </div>
    </footer>
  );
}
