"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { FaChevronLeft, FaFileContract } from "react-icons/fa";

export default function TermsPage() {
  const { language } = useLanguage();
  const isId = language === "id";

  const sections = isId ? [
    {
      title: "1. Penerimaan Syarat",
      body: "Dengan mengakses atau menggunakan aplikasi Al-Qur'an Al-Kareem, Anda menyetujui untuk terikat oleh syarat penggunaan ini. Jika Anda tidak menyetujui salah satu bagian dari syarat ini, Anda tidak berwenang mengakses layanan kami."
    },
    {
      title: "2. Tujuan Penggunaan",
      body: "Aplikasi ini disediakan semata-mata untuk keperluan pendidikan, keagamaan, dan tadabbur Al-Qur'an. Anda dilarang menggunakan aplikasi ini untuk tujuan yang melanggar hukum, menyebarkan konten yang menyinggung, atau merusak sistem kami."
    },
    {
      title: "3. Konten Al-Qur'an",
      body: "Teks Al-Qur'an, audio murottal, terjemahan, dan tafsir yang tersedia dalam aplikasi ini bersumber dari API publik open source (Al-Quran Cloud, Quran.com, Equran.id). Kami tidak mengklaim kepemilikan atas konten tersebut. Mohon gunakan konten Al-Qur'an dengan penuh hormat dan sesuai adab Islam."
    },
    {
      title: "4. Penyimpanan Lokal",
      body: "Aplikasi ini menyimpan data di perangkat Anda (browser localStorage dan Cache API) untuk keperluan pengalaman pengguna, seperti bookmark ayat, progress membaca, dan audio offline. Data ini tidak dikirim ke server kami."
    },
    {
      title: "5. Tidak Ada Garansi",
      body: "Aplikasi ini disediakan 'sebagaimana adanya' tanpa jaminan apapun. Kami tidak menjamin ketersediaan layanan pihak ketiga (API) yang kami gunakan, dan tidak bertanggung jawab atas gangguan layanan yang disebabkan oleh pihak ketiga tersebut."
    },
    {
      title: "6. Perubahan Syarat",
      body: "Kami berhak untuk mengubah syarat penggunaan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini. Penggunaan berkelanjutan atas layanan kami setelah perubahan berarti Anda menyetujui syarat yang baru."
    },
    {
      title: "7. Kontak",
      body: "Jika Anda memiliki pertanyaan tentang syarat penggunaan ini, silakan hubungi kami melalui halaman GitHub repositori proyek ini."
    },
  ] : [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing or using the Al-Qur'an Al-Kareem application, you agree to be bound by these terms of service. If you disagree with any part of these terms, you are not authorized to access our services."
    },
    {
      title: "2. Intended Use",
      body: "This application is provided solely for educational, religious, and Quranic reflection purposes. You may not use this application for unlawful purposes, to spread offensive content, or to damage our systems."
    },
    {
      title: "3. Quranic Content",
      body: "The Quranic text, murottal audio, translations, and tafsir available in this application are sourced from open source public APIs (Al-Quran Cloud, Quran.com, Equran.id). We make no ownership claims over this content. Please use Quranic content with full respect and in accordance with Islamic etiquette."
    },
    {
      title: "4. Local Storage",
      body: "This application stores data on your device (browser localStorage and Cache API) for user experience purposes, such as verse bookmarks, reading progress, and offline audio. This data is not sent to our servers."
    },
    {
      title: "5. No Warranty",
      body: "This application is provided 'as is' without any warranty. We do not guarantee the availability of the third-party services (APIs) we use, and we are not responsible for service disruptions caused by those third parties."
    },
    {
      title: "6. Changes to Terms",
      body: "We reserve the right to modify these terms of service at any time. Changes will take effect immediately upon publication on this page. Continued use of our services after changes constitutes your acceptance of the new terms."
    },
    {
      title: "7. Contact",
      body: "If you have any questions about these terms of service, please reach out through the GitHub repository page of this project."
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors duration-200 mb-8">
          <FaChevronLeft className="h-3 w-3" />
          {isId ? "Kembali ke Beranda" : "Back to Home"}
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <FaFileContract className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              {isId ? "Syarat Penggunaan" : "Terms of Service"}
            </h1>
            <p className="text-sm text-muted">
              {isId ? "Terakhir diperbarui: Juni 2026" : "Last updated: June 2026"}
            </p>
          </div>
        </div>

        {/* Intro banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 mb-8">
          <p className="text-sm text-muted leading-relaxed">
            {isId
              ? "Harap baca syarat penggunaan ini dengan seksama sebelum menggunakan aplikasi Al-Qur'an Al-Kareem. Dengan menggunakan layanan kami, Anda menyetujui syarat-syarat yang tercantum di bawah ini."
              : "Please read these terms of service carefully before using the Al-Qur'an Al-Kareem application. By using our service, you agree to the terms listed below."
            }
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {sections.map((sec, i) => (
            <section key={i} className="rounded-2xl border border-card-border bg-card-bg/30 px-5 py-5">
              <h2 className="text-base font-extrabold text-foreground mb-2">{sec.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{sec.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
