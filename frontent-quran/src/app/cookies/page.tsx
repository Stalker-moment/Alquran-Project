"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { FaChevronLeft, FaCookieBite } from "react-icons/fa";

export default function CookiesPage() {
  const { language } = useLanguage();
  const isId = language === "id";

  const sections = isId ? [
    {
      title: "Apa Itu Cookie?",
      body: "Cookie adalah file teks kecil yang disimpan di perangkat Anda oleh browser web. Cookie umumnya digunakan untuk menyimpan preferensi pengguna, sesi login, dan data analitik."
    },
    {
      title: "Apakah Kami Menggunakan Cookie?",
      body: "Tidak. Al-Qur'an Al-Kareem tidak menggunakan cookie tradisional (HTTP cookies). Kami tidak menetapkan cookie pelacak, cookie analitik, maupun cookie iklan di perangkat Anda."
    },
    {
      title: "Apa yang Kami Gunakan Sebagai Gantinya?",
      body: "Sebagai pengganti cookie, kami menggunakan teknologi penyimpanan browser yang lebih modern dan transparan:\n\n• localStorage — untuk menyimpan preferensi tema, ukuran font, bahasa, dan data progress membaca.\n• Cache API (Service Worker) — untuk menyimpan file audio murottal yang Anda unduh untuk akses offline.\n\nSemua data ini hanya berada di perangkat Anda dan tidak pernah dikirim ke server manapun."
    },
    {
      title: "Cookie dari API Pihak Ketiga",
      body: "Ketika aplikasi mengambil data dari API pihak ketiga (Al-Quran Cloud, Quran.com, dll.), server API tersebut mungkin secara teknis menetapkan cookie browser. Namun, kami tidak menggunakan atau membaca cookie tersebut untuk tujuan pelacakan. API ini diakses secara anonim."
    },
    {
      title: "Cara Mengelola Penyimpanan Lokal",
      body: "Anda dapat menghapus semua data yang disimpan aplikasi ini kapan saja melalui:\n• Pengaturan browser Anda → Privasi → Hapus Data Situs\n• Fitur hapus data di halaman Unduhan aplikasi (untuk audio offline)\n\nMenghapus data lokal akan mereset semua preferensi dan progress Anda."
    },
    {
      title: "Perubahan Kebijakan Ini",
      body: "Kebijakan cookie ini dapat diperbarui sewaktu-waktu. Perubahan akan dipublikasikan di halaman ini."
    },
  ] : [
    {
      title: "What Are Cookies?",
      body: "Cookies are small text files stored on your device by your web browser. They are commonly used to store user preferences, login sessions, and analytical data."
    },
    {
      title: "Do We Use Cookies?",
      body: "No. Al-Qur'an Al-Kareem does not use traditional HTTP cookies. We do not set tracking, analytical, or advertising cookies on your device."
    },
    {
      title: "What Do We Use Instead?",
      body: "Instead of cookies, we use more modern and transparent browser storage technologies:\n\n• localStorage — to store theme preferences, font sizes, language settings, and reading progress data.\n• Cache API (Service Worker) — to store murottal audio files you download for offline access.\n\nAll this data only resides on your device and is never sent to any server."
    },
    {
      title: "Cookies from Third-Party APIs",
      body: "When the application fetches data from third-party APIs (Al-Quran Cloud, Quran.com, etc.), those API servers may technically set browser cookies. However, we do not use or read those cookies for tracking purposes. These APIs are accessed anonymously."
    },
    {
      title: "How to Manage Local Storage",
      body: "You can delete all data stored by this application at any time through:\n• Your browser settings → Privacy → Clear Site Data\n• The delete feature on the Downloads page (for offline audio)\n\nDeleting local data will reset all your preferences and reading progress."
    },
    {
      title: "Changes to This Policy",
      body: "This cookie policy may be updated at any time. Changes will be published on this page."
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">

        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors duration-200 mb-8">
          <FaChevronLeft className="h-3 w-3" />
          {isId ? "Kembali ke Beranda" : "Back to Home"}
        </Link>

        <div className="flex items-start gap-4 mb-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <FaCookieBite className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              {isId ? "Kebijakan Cookie" : "Cookie Policy"}
            </h1>
            <p className="text-sm text-muted">
              {isId ? "Terakhir diperbarui: Juni 2026" : "Last updated: June 2026"}
            </p>
          </div>
        </div>

        {/* No cookie badge */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">🍪</span>
          <p className="text-sm text-muted leading-relaxed">
            {isId
              ? "Kami tidak menggunakan cookie pelacak. Data disimpan hanya di perangkat Anda menggunakan localStorage dan Cache API, bukan cookie HTTP."
              : "We don't use tracking cookies. Data is stored only on your device using localStorage and Cache API, not HTTP cookies."
            }
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {sections.map((sec, i) => (
            <section key={i} className="rounded-2xl border border-card-border bg-card-bg/30 px-5 py-5">
              <h2 className="text-base font-extrabold text-foreground mb-2">{sec.title}</h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{sec.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
