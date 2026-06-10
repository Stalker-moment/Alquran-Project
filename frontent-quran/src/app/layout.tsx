import type { Metadata } from "next";
import { Amiri, Outfit, Noto_Naskh_Arabic, Scheherazade_New, Lateef } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "@/components/Toast";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-naskh",
  display: "swap",
});

const scheherazade = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-hafs",
  display: "swap",
});

const lateef = Lateef({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-indopak",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

import PWARegister from "./PWARegister";

export const metadata: Metadata = {
  title: "Al-Qur'an Al-Kareem | Modern Quran Viewer",
  description: "Read, search, and listen to the Holy Quran with audio recitation (murottal), multi-language translations, auto-scroll, and modern reading themes.",
  keywords: ["Quran", "Al-Quran", "Quran Online", "Murottal", "Auto Scroll Quran", "Quran Translation"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Al-Qur'an Al-Kareem",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${amiri.variable} ${notoNaskh.variable} ${scheherazade.variable} ${lateef.variable} h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0b0f19" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <PWARegister />
        <LanguageProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

