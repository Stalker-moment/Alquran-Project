import type { Metadata } from "next";
import { Amiri, Outfit } from "next/font/google";
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

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Al-Qur'an Al-Kareem | Modern Quran Viewer",
  description: "Read, search, and listen to the Holy Quran with audio recitation (murottal), multi-language translations, auto-scroll, and modern reading themes.",
  keywords: ["Quran", "Al-Quran", "Quran Online", "Murottal", "Auto Scroll Quran", "Quran Translation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${amiri.variable} h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
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
