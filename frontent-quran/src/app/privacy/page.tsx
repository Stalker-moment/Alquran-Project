"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { FaChevronLeft, FaShieldAlt } from "react-icons/fa";

export default function PrivacyPage() {
  const { language } = useLanguage();
  const isId = language === "id";

  const sections = isId ? [
    {
      title: "1. Informasi yang Kami Kumpulkan",
      body: "Al-Qur'an Al-Kareem tidak mengumpulkan informasi pribadi apapun dari pengguna. Semua data disimpan secara lokal di perangkat Anda menggunakan browser localStorage dan Cache API. Kami tidak memiliki server database yang menyimpan informasi pengguna."
    },
    {
      title: "2. Data yang Disimpan Secara Lokal",
      body: "Aplikasi ini menyimpan data berikut di perangkat Anda:\n• Bookmark ayat Al-Qur'an\n• Progress membaca dan streak harian\n• Pengaturan tampilan (tema, ukuran font)\n• Preferensi bahasa\n• Audio murottal yang diunduh offline\n• Riwayat hafalan\n\nData ini sepenuhnya berada di bawah kendali Anda dan dapat dihapus kapan saja melalui pengaturan browser."
    },
    {
      title: "3. API Pihak Ketiga",
      body: "Aplikasi ini menggunakan API publik pihak ketiga untuk mengambil data Al-Qur'an, audio murottal, dan jadwal shalat. API yang digunakan meliputi Al-Quran Cloud, Quran.com, Equran.id, dan MyQuran.com. Permintaan ke API ini bersifat anonim dan tidak menyertakan informasi pribadi Anda."
    },
    {
      title: "4. Tidak Ada Pelacakan",
      body: "Kami tidak menggunakan cookie analitik, pixel tracking, atau alat pelacak pihak ketiga lainnya. Kami tidak mengirimkan data penggunaan Anda ke server manapun. Privasi Anda adalah prioritas utama kami."
    },
    {
      title: "5. Keamanan",
      body: "Meskipun kami tidak menyimpan data pengguna di server, kami tetap berkomitmen untuk menjaga keamanan aplikasi. Kami menggunakan HTTPS untuk semua komunikasi dengan API pihak ketiga."
    },
    {
      title: "6. Perubahan Kebijakan Privasi",
      body: "Kebijakan privasi ini dapat diubah sewaktu-waktu. Setiap perubahan akan dipublikasikan di halaman ini dengan tanggal pembaruan yang diperbarui. Kami menyarankan Anda untuk meninjau halaman ini secara berkala."
    },
    {
      title: "7. Kontak",
      body: "Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui halaman GitHub repositori proyek ini."
    },
  ] : [
    {
      title: "1. Information We Collect",
      body: "Al-Qur'an Al-Kareem does not collect any personal information from users. All data is stored locally on your device using browser localStorage and Cache API. We do not have a database server storing user information."
    },
    {
      title: "2. Locally Stored Data",
      body: "This application stores the following data on your device:\n• Quran verse bookmarks\n• Reading progress and daily streaks\n• Display settings (theme, font size)\n• Language preferences\n• Downloaded offline murottal audio\n• Memorization history\n\nThis data is entirely under your control and can be deleted at any time through your browser settings."
    },
    {
      title: "3. Third-Party APIs",
      body: "This application uses public third-party APIs to fetch Quran data, murottal audio, and prayer schedules. APIs used include Al-Quran Cloud, Quran.com, Equran.id, and MyQuran.com. Requests to these APIs are anonymous and do not include your personal information."
    },
    {
      title: "4. No Tracking",
      body: "We do not use analytical cookies, tracking pixels, or any other third-party tracking tools. We do not send your usage data to any server. Your privacy is our top priority."
    },
    {
      title: "5. Security",
      body: "Although we do not store user data on servers, we remain committed to maintaining application security. We use HTTPS for all communications with third-party APIs."
    },
    {
      title: "6. Changes to Privacy Policy",
      body: "This privacy policy may be changed at any time. Any changes will be published on this page with an updated date. We recommend you review this page periodically."
    },
    {
      title: "7. Contact",
      body: "If you have any questions about this privacy policy, please reach out through the GitHub repository page of this project."
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
            <FaShieldAlt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              {isId ? "Kebijakan Privasi" : "Privacy Policy"}
            </h1>
            <p className="text-sm text-muted">
              {isId ? "Terakhir diperbarui: Juni 2026" : "Last updated: June 2026"}
            </p>
          </div>
        </div>

        {/* Privacy-first badge */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-sm text-muted leading-relaxed">
            {isId
              ? "Privasi Anda dilindungi. Aplikasi ini berjalan sepenuhnya di perangkat Anda — tidak ada data pengguna yang dikirim ke server kami."
              : "Your privacy is protected. This application runs entirely on your device — no user data is sent to our servers."
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
