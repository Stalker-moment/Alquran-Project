"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaDownload, FaCopy, FaShareAlt, FaTimes, FaCheck, FaFont, FaImage, FaLink } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import html2canvas from "html2canvas";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  transliteration?: string;
  translation: string;
  arabicFont?: string;
}

const THEMES = [
  { 
    id: "teal", 
    name: "Teal Breeze", 
    class: "bg-gradient-to-br from-teal-850 to-emerald-950 text-emerald-50 border border-emerald-500/20", 
    style: {
      background: "linear-gradient(to bottom right, #0b3d39, #022c22)",
      color: "#ecfdf5",
      borderColor: "rgba(16, 185, 129, 0.2)"
    },
    dark: true 
  },
  { 
    id: "emerald", 
    name: "Emerald Gold", 
    class: "bg-gradient-to-br from-emerald-900 via-teal-950 to-amber-950/80 text-amber-50 border border-amber-500/10", 
    style: {
      background: "linear-gradient(to bottom right, #064e3b, #042f2e, rgba(69, 26, 3, 0.8))",
      color: "#fffbeb",
      borderColor: "rgba(245, 158, 11, 0.1)"
    },
    dark: true 
  },
  { 
    id: "midnight", 
    name: "Midnight Gold", 
    class: "bg-gradient-to-br from-zinc-950 via-slate-900 to-amber-950/60 text-zinc-100 border border-amber-900/20", 
    style: {
      background: "linear-gradient(to bottom right, #09090b, #0f172a, rgba(69, 26, 3, 0.6))",
      color: "#f4f4f5",
      borderColor: "rgba(120, 53, 4, 0.2)"
    },
    dark: true 
  },
  { 
    id: "purple", 
    name: "Deep Purple", 
    class: "bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950/60 text-purple-100 border border-purple-500/20", 
    style: {
      background: "linear-gradient(to bottom right, #1e1b4b, #3b0764, rgba(74, 4, 78, 0.6))",
      color: "#f3e8ff",
      borderColor: "rgba(168, 85, 247, 0.2)"
    },
    dark: true 
  },
  { 
    id: "sunset", 
    name: "Amber Sunset", 
    class: "bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950/80 text-orange-50 border border-orange-500/15", 
    style: {
      background: "linear-gradient(to bottom right, #451a03, #431407, rgba(76, 5, 25, 0.8))",
      color: "#fff7ed",
      borderColor: "rgba(249, 115, 22, 0.15)"
    },
    dark: true 
  },
  { 
    id: "sepia", 
    name: "Sepia Scroll", 
    class: "bg-[#f5ebd0] text-[#422e17] border border-[#d6c39a]", 
    style: {
      backgroundColor: "#f5ebd0",
      color: "#422e17",
      borderColor: "#d6c39a"
    },
    dark: false 
  },
  { 
    id: "dark", 
    name: "Matte Black", 
    class: "bg-zinc-900 text-zinc-100 border border-zinc-850", 
    style: {
      backgroundColor: "#18181b",
      color: "#f4f4f5",
      borderColor: "#27272a"
    },
    dark: true 
  },
  { 
    id: "light", 
    name: "Classic White", 
    class: "bg-white text-zinc-900 border border-zinc-200 shadow-md", 
    style: {
      backgroundColor: "#ffffff",
      color: "#18181b",
      borderColor: "#e4e4e7"
    },
    dark: false 
  }
];

export default function ShareModal({
  isOpen,
  onClose,
  surahName,
  surahNumber,
  ayahNumber,
  arabicText,
  transliteration,
  translation,
  arabicFont = "quran-uthmani"
}: ShareModalProps) {
  const { language, t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [showArabic, setShowArabic] = useState(true);
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  
  const [isCopiedText, setIsCopiedText] = useState(false);
  const [isCopiedImage, setIsCopiedImage] = useState(false);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [resolvedFonts, setResolvedFonts] = useState({
    arabic: "serif",
    sans: "sans-serif",
  });

  // Resolve Next.js CSS variables at runtime for canvas font support
  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      const rootStyle = getComputedStyle(document.documentElement);
      
      let arabicVar = "--font-amiri";
      if (arabicFont === "hafs") arabicVar = "--font-hafs";
      else if (arabicFont === "naskh") arabicVar = "--font-naskh";
      else if (arabicFont === "indopak") arabicVar = "--font-indopak";

      const resolvedArabic = rootStyle.getPropertyValue(arabicVar) || "serif";
      const resolvedSans = rootStyle.getPropertyValue("--font-outfit") || "sans-serif";
      
      setResolvedFonts({
        arabic: resolvedArabic,
        sans: resolvedSans,
      });
    }
  }, [isOpen, arabicFont]);

  if (!isOpen) return null;

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/surah/${surahNumber}?ayah=${ayahNumber}`;
  };

  const handleCopyText = async () => {
    try {
      const shareUrl = getShareUrl();
      const textToCopy = `QS. ${surahName} : ${ayahNumber}\n\n${
        showArabic ? arabicText.replace(/\[[a-z](:\d+)?\[/g, "").replace(/\]/g, "") + "\n\n" : ""
      }${showLatin && transliteration ? transliteration + "\n\n" : ""}${
        showTranslation ? `"${translation}"` : ""
      }\n\nLink: ${shareUrl}\n\nShared via Al-Qur'an Al-Kareem Modern Viewer`;

      await navigator.clipboard.writeText(textToCopy);
      setIsCopiedText(true);
      setTimeout(() => setIsCopiedText(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      const shareUrl = getShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setIsCopiedUrl(true);
      setTimeout(() => setIsCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Helper to convert any CSS color string to rgba format using canvas context
  const convertColorToRgba = (colorStr: string): string => {
    if (typeof window === "undefined") return colorStr;
    
    // Simple cache to avoid re-drawing the same color multiple times
    if ((convertColorToRgba as any).cache === undefined) {
      (convertColorToRgba as any).cache = {};
    }
    const cache = (convertColorToRgba as any).cache;
    if (cache[colorStr]) return cache[colorStr];

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return colorStr;
    
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const result = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    cache[colorStr] = result;
    return result;
  };

  const sanitizeColorString = (val: string): string => {
    if (typeof val !== "string") return val;
    if (!val.includes("oklch") && !val.includes("oklab")) return val;
    
    return val.replace(/(oklch|oklab)\([^)]+\)/gi, (match) => {
      return convertColorToRgba(match);
    });
  };

  const sanitizeStyles = () => {
    let cssText = "";
    const originalSheetsState: { sheet: CSSStyleSheet; disabled: boolean }[] = [];
    
    // Collect all cssRules and disable original sheets
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          for (let j = 0; j < rules.length; j++) {
            cssText += rules[j].cssText + "\n";
          }
          originalSheetsState.push({ sheet, disabled: sheet.disabled });
          sheet.disabled = true;
        }
      } catch (e) {
        // Cross-origin stylesheet security block, ignore
      }
    }
    
    // Replace oklab and oklch functions with rgb/rgba equivalent so html2canvas doesn't crash.
    const cleanedCss = sanitizeColorString(cssText);
      
    // Inject the temporary cleaned stylesheet
    const tempStyle = document.createElement("style");
    tempStyle.id = "html2canvas-temp-style";
    tempStyle.textContent = cleanedCss;
    document.head.appendChild(tempStyle);
    
    return () => {
      // Cleanup: remove temporary style and re-enable original stylesheets
      if (tempStyle.parentNode) {
        tempStyle.parentNode.removeChild(tempStyle);
      }
      for (const state of originalSheetsState) {
        state.sheet.disabled = state.disabled;
      }
    };
  };

  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    
    // Create a clone to render off-screen, avoiding modal transforms/overflow/max-width limits
    const clone = cardRef.current.cloneNode(true) as HTMLDivElement;
    
    // Set explicit styles on the clone
    clone.style.position = "absolute";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = "600px";
    clone.style.maxWidth = "none";
    clone.style.height = "auto";
    clone.style.transform = "none";
    clone.style.transition = "none";
    clone.style.animation = "none";
    
    document.body.appendChild(clone);
    
    let cleanupStyles: (() => void) | null = null;
    const originalGetComputedStyle = window.getComputedStyle;
    
    try {
      // Monkey-patch getComputedStyle to resolve oklab/oklch to rgba on the fly
      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === "getPropertyValue") {
              return function (propertyName: string) {
                const res = target.getPropertyValue(propertyName);
                if (typeof res === "string" && (res.includes("oklch") || res.includes("oklab"))) {
                  return sanitizeColorString(res);
                }
                return res;
              };
            }
            const value = target[prop as any] as any;
            if (typeof value === "string" && (value.includes("oklch") || value.includes("oklab"))) {
              return sanitizeColorString(value);
            }
            if (typeof value === "function") {
              return value.bind(target);
            }
            return value;
          }
        });
      };

      // Sanitize document stylesheets to remove oklab/oklch parser-breaking rules
      cleanupStyles = sanitizeStyles();
      
      // Wait a bit for font rendering
      await new Promise((resolve) => setTimeout(resolve, 80));
      
      const canvas = await html2canvas(clone, {
        scale: 2, // Retinal display resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      
      return canvas;
    } catch (err) {
      console.error("html2canvas generation failed:", err);
      return null;
    } finally {
      // Restore window.getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;
      
      // Clean up the cloned element
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      // Restore original stylesheets
      if (cleanupStyles) {
        cleanupStyles();
      }
    }
  };

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Could not generate canvas");
      
      const link = document.createElement("a");
      link.download = `Ayat_${surahName.replace(/\s+/g, "_")}_${ayahNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Could not generate canvas");
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          setIsCopiedImage(true);
          setTimeout(() => setIsCopiedImage(false), 2000);
        } catch (err) {
          console.error("ClipboardItem write failed:", err);
          // Fallback to text copy
          handleCopyText();
        }
      }, "image/png");
    } catch (err) {
      console.error("Copy image failed:", err);
    }
  };

  const handleShare = async () => {
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `Ayat_${surahName}_${ayahNumber}.png`, { type: "image/png" });
        const shareUrl = getShareUrl();
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `QS. ${surahName} : ${ayahNumber}`,
            text: `QS. ${surahName} : ${ayahNumber} - Al-Qur'an Al-Kareem\n${shareUrl}`
          });
        } else {
          // Fallback share text
          await navigator.share({
            title: `QS. ${surahName} : ${ayahNumber}`,
            text: `QS. ${surahName} : ${ayahNumber}\n\n"${translation}"\n\nLink: ${shareUrl}`
          });
        }
      }, "image/png");
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  };

  // Helper font size classes for preview
  const arabicSizeClass = fontSize === "sm" ? "text-xl" : fontSize === "md" ? "text-2xl" : "text-3xl";
  const translationSizeClass = fontSize === "sm" ? "text-xs" : fontSize === "md" ? "text-sm" : "text-base";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative z-10 flex h-full max-h-[90vh] w-[90vw] max-w-4xl flex-col rounded-3xl border border-card-border bg-card-bg/95 p-6 shadow-2xl backdrop-blur-md overflow-hidden animate-zoom-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border/60 pb-4 mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FaImage className="text-primary h-4 w-4" />
            {t("shareCardTitle")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-card-border hover:text-foreground transition-all duration-200"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
          
          {/* Left Panel: Preview Container */}
          <div className="flex-1 flex flex-col items-center justify-center bg-background/40 border border-card-border/50 rounded-2xl p-6 overflow-y-auto select-none min-h-0">
            
            {/* The Actual Renderable Card */}
            <div
              ref={cardRef}
              className={`w-full max-w-[440px] rounded-3xl p-8 shadow-lg text-center flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${selectedTheme.class}`}
              style={selectedTheme.style}
            >
              {/* Card Design Decorative Elements */}
              {selectedTheme.id !== "light" && selectedTheme.id !== "sepia" && (
                <>
                  <div 
                    className="absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl pointer-events-none"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  />
                  <div 
                    className="absolute bottom-0 left-0 h-32 w-32 rounded-full blur-3xl pointer-events-none"
                    style={{ backgroundColor: "rgba(45, 212, 191, 0.05)" }}
                  />
                </>
              )}

              {/* Card Header: Surah Name */}
              <div 
                className="flex flex-col items-center border-b border-current/10 pb-4 mb-6"
                style={{ borderBottomColor: selectedTheme.dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
              >
                <span className="text-xs uppercase tracking-widest font-extrabold opacity-75">
                  QS. {surahName}
                </span>
                <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider mt-1">
                  {language === "id" ? `Ayat ${ayahNumber}` : `Verse ${ayahNumber}`}
                </span>
              </div>

              {/* Card Content */}
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {/* Arabic text */}
                {showArabic && (
                  <p 
                    className={`font-arabic leading-loose tracking-wide dir-rtl text-right select-all ${arabicSizeClass}`}
                    style={{
                      fontFamily: resolvedFonts.arabic,
                      color: selectedTheme.dark ? "#ffffff" : "#18181b",
                      fontSize: fontSize === "sm" ? "20px" : fontSize === "md" ? "28px" : "36px",
                      lineHeight: "2.2"
                    }}
                    dir="rtl"
                  >
                    {arabicText.replace(/\[[a-z](:\d+)?\[/g, "").replace(/\]/g, "")}
                  </p>
                )}

                {/* Latin Transliteration */}
                {showLatin && transliteration && (
                  <p 
                    className={`font-serif italic opacity-85 select-all leading-relaxed ${translationSizeClass}`}
                    style={{
                      color: selectedTheme.dark ? "rgba(255, 255, 255, 0.85)" : "rgba(24, 24, 27, 0.85)",
                      fontSize: fontSize === "sm" ? "12px" : fontSize === "md" ? "14px" : "16px"
                    }}
                  >
                    {transliteration}
                  </p>
                )}

                {/* Translation */}
                {showTranslation && (
                  <p 
                    className={`font-sans font-light leading-relaxed select-all ${translationSizeClass}`}
                    style={{
                      fontFamily: resolvedFonts.sans,
                      color: selectedTheme.dark ? "rgba(255, 255, 255, 0.9)" : "rgba(24, 24, 27, 0.9)",
                      fontSize: fontSize === "sm" ? "12px" : fontSize === "md" ? "14px" : "16px"
                    }}
                  >
                    &ldquo;{translation}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Footer: App Watermark */}
              <div 
                className="mt-8 pt-4 border-t border-current/10 flex items-center justify-between text-[8px] uppercase tracking-widest font-bold opacity-50"
                style={{ borderTopColor: selectedTheme.dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
              >
                <span>Al-Qur&apos;an Al-Kareem</span>
                <span>Modern Quran Viewer</span>
              </div>
            </div>

          </div>

          {/* Right Panel: Controls */}
          <div className="w-full md:w-80 flex flex-col justify-between gap-6 overflow-y-auto pr-1 shrink-0">
            
            {/* Customization Options */}
            <div className="space-y-5">
              
              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                  {t("selectTheme")}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map((theme) => {
                    const isActive = selectedTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        className={`group relative h-10 w-full rounded-xl transition-all duration-300 border-2 cursor-pointer ${
                          isActive 
                            ? "border-primary scale-105 shadow-md shadow-primary-glow" 
                            : "border-card-border hover:border-card-border/80"
                        } overflow-hidden`}
                        title={theme.name}
                      >
                        <div className={`absolute inset-0 ${theme.class.split(" ")[0]}`} />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white rounded-lg">
                            <FaCheck className="h-3 w-3 shadow-xs" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography / Font Size Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                  {t("fontSize")}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-background/50 border border-card-border p-1 rounded-xl">
                  {(["sm", "md", "lg"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                        fontSize === sz
                          ? "bg-primary text-white"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted block">
                  Tampilan Elemen
                </span>

                {/* Show Arabic */}
                <button
                  onClick={() => setShowArabic(!showArabic)}
                  className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    showArabic
                      ? "border-primary bg-primary-glow text-primary"
                      : "border-card-border bg-background/50 text-muted hover:text-foreground"
                  }`}
                >
                  <span>{t("showArabic")}</span>
                  <input
                    type="checkbox"
                    checked={showArabic}
                    readOnly
                    className="h-3.5 w-3.5 accent-primary pointer-events-none"
                  />
                </button>

                {/* Show Latin */}
                {transliteration && (
                  <button
                    onClick={() => setShowLatin(!showLatin)}
                    className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                      showLatin
                        ? "border-primary bg-primary-glow text-primary"
                        : "border-card-border bg-background/50 text-muted hover:text-foreground"
                    }`}
                  >
                    <span>{t("showLatinLabel")}</span>
                    <input
                      type="checkbox"
                      checked={showLatin}
                      readOnly
                      className="h-3.5 w-3.5 accent-primary pointer-events-none"
                    />
                  </button>
                )}

                {/* Show Translation */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    showTranslation
                      ? "border-primary bg-primary-glow text-primary"
                      : "border-card-border bg-background/50 text-muted hover:text-foreground"
                  }`}
                >
                  <span>{t("showTranslation")}</span>
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    readOnly
                    className="h-3.5 w-3.5 accent-primary pointer-events-none"
                  />
                </button>
              </div>

            </div>

            {/* Actions Buttons */}
            <div className="space-y-2 border-t border-card-border/60 pt-4">
              
              {/* Copy Link Button */}
              <button
                onClick={handleCopyUrl}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-card-border bg-background hover:bg-card-bg/60 py-2.5 text-xs font-bold text-foreground transition-all duration-200 cursor-pointer shadow-xs"
              >
                {isCopiedUrl ? (
                  <>
                    <FaCheck className="h-3.5 w-3.5 text-green-500" />
                    <span>Link Disalin!</span>
                  </>
                ) : (
                  <>
                    <FaLink className="h-3.5 w-3.5 text-muted" />
                    <span>Salin Link Ayat</span>
                  </>
                )}
              </button>

              {/* Copy Image Button */}
              <button
                onClick={handleCopyImage}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-card-border bg-background hover:bg-card-bg/60 py-2.5 text-xs font-bold text-foreground transition-all duration-200 cursor-pointer shadow-xs"
              >
                {isCopiedImage ? (
                  <>
                    <FaCheck className="h-3.5 w-3.5 text-green-500" />
                    <span>Gambar Disalin!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="h-3.5 w-3.5 text-muted" />
                    <span>{t("copyImage")}</span>
                  </>
                )}
              </button>

              {/* Copy Text Button */}
              <button
                onClick={handleCopyText}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-card-border bg-background hover:bg-card-bg/60 py-2.5 text-xs font-bold text-foreground transition-all duration-200 cursor-pointer shadow-xs"
              >
                {isCopiedText ? (
                  <>
                    <FaCheck className="h-3.5 w-3.5 text-green-500" />
                    <span>Teks Disalin!</span>
                  </>
                ) : (
                  <>
                    <FaFont className="h-3.5 w-3.5 text-muted" />
                    <span>{t("salinTeks")}</span>
                  </>
                )}
              </button>

              {/* Web Share Button */}
              {typeof navigator !== "undefined" && !!navigator.share && (
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-card-border bg-background hover:bg-card-bg/60 py-2.5 text-xs font-bold text-foreground transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <FaShareAlt className="h-3.5 w-3.5 text-muted" />
                  <span>{t("bagikanAyat")}</span>
                </button>
              )}

              {/* Download PNG Button */}
              <button
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary hover:bg-primary-hover py-3 text-xs font-bold text-white shadow-md shadow-primary-glow hover:scale-101 transition-all duration-200 cursor-pointer"
              >
                <FaDownload className={`h-3.5 w-3.5 ${isDownloading ? "animate-bounce" : ""}`} />
                <span>{isDownloading ? "Mengekspor..." : t("downloadImage")}</span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
