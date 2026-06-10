"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { animate } from "animejs";
import { 
  FaVolumeUp, 
  FaVolumeMute, 
  FaUndo, 
  FaSave, 
  FaTrash, 
  FaPlus, 
  FaCheck, 
  FaKeyboard, 
  FaInfoCircle,
  FaTimes,
  FaExclamationTriangle
} from "react-icons/fa";

interface DhikrPhrase {
  id: string;
  ar: string;
  tr: string;
  translationId: string;
  translationEn: string;
}

interface SavedSession {
  id: string;
  phrase: string;
  arabic?: string;
  count: number;
  timestamp: string;
}

const DHIKR_PHRASES: DhikrPhrase[] = [
  {
    id: "subhanallah",
    ar: "سُبْحَانَ ٱللَّهِ",
    tr: "Subḥānallāh",
    translationId: "Maha Suci Allah",
    translationEn: "Glory be to Allah",
  },
  {
    id: "alhamdulillah",
    ar: "ٱلْحَمْدُ لِلَّهِ",
    tr: "Alḥamdulillāh",
    translationId: "Segala puji bagi Allah",
    translationEn: "Praise be to Allah",
  },
  {
    id: "allahuakbar",
    ar: "ٱللَّهُ أَكْبَرُ",
    tr: "Allāhu Akbar",
    translationId: "Allah Maha Besar",
    translationEn: "Allah is the Greatest",
  },
  {
    id: "lailahaillallah",
    ar: "لَا إِلَٰهَ إِلَّا ٱللَّهُ",
    tr: "Lā ilāha illallāh",
    translationId: "Tiada Tuhan selain Allah",
    translationEn: "There is no god but Allah",
  },
  {
    id: "astaghfirullah",
    ar: "أَسْتَغْفِرُ ٱللَّهَ",
    tr: "Astaghfirullāh",
    translationId: "Aku memohon ampun kepada Allah",
    translationEn: "I seek forgiveness from Allah",
  },
  {
    id: "sholawat",
    ar: "ٱللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    tr: "Allāhumma ṣalli ‘alā Muḥammad",
    translationId: "Ya Allah, limpahkanlah rahmat kepada Nabi Muhammad",
    translationEn: "O Allah, send blessings upon Prophet Muhammad",
  }
];

export default function DzikirPage() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Counter states
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33); // default 33
  const [customTargetVal, setCustomTargetVal] = useState<string>("100");
  const [isCustomTarget, setIsCustomTarget] = useState<boolean>(false);

  // Confirmation Modal State
  interface ConfirmModalState {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "warning";
    onConfirm: () => void;
  }

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    variant: "danger",
    onConfirm: () => {},
  });

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
  };

  // Selection states
  const [selectedPhraseId, setSelectedPhraseId] = useState<string>("subhanallah");
  const [customPhraseAr, setCustomPhraseAr] = useState<string>("");
  const [customPhraseTr, setCustomPhraseTr] = useState<string>("");

  // Options toggles
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Statistics & History
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [todayTotal, setTodayTotal] = useState<number>(0);

  // Button active state for animation
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Audio helper context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    // Preferences
    const savedVib = localStorage.getItem("dzikir-vibration");
    if (savedVib !== null) setVibrationEnabled(savedVib === "true");

    const savedSnd = localStorage.getItem("dzikir-sound");
    if (savedSnd !== null) setSoundEnabled(savedSnd === "true");

    const savedTarget = localStorage.getItem("dzikir-target");
    if (savedTarget !== null) {
      const parsedVal = Number(savedTarget);
      setTarget(parsedVal);
      if (parsedVal !== 33 && parsedVal !== 100 && parsedVal !== 0) {
        setIsCustomTarget(true);
      }
    }

    const savedCustomTargetVal = localStorage.getItem("dzikir-custom-target-val");
    if (savedCustomTargetVal !== null) {
      setCustomTargetVal(savedCustomTargetVal);
    }

    const savedPhrase = localStorage.getItem("dzikir-selected-phrase");
    if (savedPhrase !== null) {
      setSelectedPhraseId(savedPhrase);
    }

    const savedCustomAr = localStorage.getItem("dzikir-custom-ar");
    if (savedCustomAr !== null) {
      setCustomPhraseAr(savedCustomAr);
    }

    const savedCustomTr = localStorage.getItem("dzikir-custom-tr");
    if (savedCustomTr !== null) {
      setCustomPhraseTr(savedCustomTr);
    }

    // Stats
    const savedTodayTotal = localStorage.getItem("dzikir-today-total");
    if (savedTodayTotal !== null) setTodayTotal(Number(savedTodayTotal));

    const savedHistory = localStorage.getItem("dzikir-history");
    if (savedHistory !== null) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Sync settings/history to local storage
  const savePreference = (key: string, val: string | boolean | number) => {
    localStorage.setItem(key, String(val));
  };

  // Keyboard spacebar listener
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is writing custom phrase input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        incrementCount();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, count, target, selectedPhraseId, customPhraseAr, customPhraseTr, vibrationEnabled, soundEnabled]);

  // programmatically synthesize click sound (triangle wave decay)
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (err) {
      console.warn("Web Audio API not supported/activated", err);
    }
  };

  // trigger haptic feedback vibration
  const triggerVibration = (type: "click" | "complete") => {
    if (!vibrationEnabled || typeof navigator === "undefined" || !navigator.vibrate) return;
    if (type === "complete") {
      navigator.vibrate([100, 50, 100]);
    } else {
      navigator.vibrate(15);
    }
  };

  // get current phrase details
  const getCurrentPhrase = () => {
    if (selectedPhraseId === "custom") {
      return {
        ar: customPhraseAr || "سُبْحَانَ ٱللَّهِ",
        tr: customPhraseTr || "Custom Phrase",
        display: customPhraseTr || (language === "id" ? "Kalimat Kustom" : "Custom Phrase")
      };
    }
    const found = DHIKR_PHRASES.find(p => p.id === selectedPhraseId);
    if (!found) return { ar: "", tr: "", display: "" };
    return {
      ar: found.ar,
      tr: found.tr,
      display: language === "id" ? found.translationId : found.translationEn
    };
  };

  // Increment Counter
  const incrementCount = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 80);

    const nextCount = count + 1;
    setCount(nextCount);
    
    // update statistics today
    const nextTodayTotal = todayTotal + 1;
    setTodayTotal(nextTodayTotal);
    savePreference("dzikir-today-total", nextTodayTotal);

    // Audio & Haptic feedback
    playClickSound();

    if (target > 0 && nextCount === target) {
      triggerVibration("complete");
    } else {
      triggerVibration("click");
    }
  };

  // Reset session count
  const handleReset = () => {
    if (count === 0) return;
    setConfirmModal({
      open: true,
      title: language === "id" ? "Reset Hitungan?" : "Reset Count?",
      description: t("dzikirResetConfirm"),
      confirmLabel: language === "id" ? "Ya, Reset" : "Yes, Reset",
      variant: "warning",
      onConfirm: () => {
        setCount(0);
      }
    });
  };

  // Save current count session to history
  const handleSave = () => {
    if (count === 0) return;
    const currentInfo = getCurrentPhrase();
    const newSession: SavedSession = {
      id: String(Date.now()),
      phrase: selectedPhraseId === "custom" ? currentInfo.tr : selectedPhraseId,
      arabic: currentInfo.ar,
      count: count,
      timestamp: new Date().toISOString()
    };

    const nextHistory = [newSession, ...history];
    setHistory(nextHistory);
    localStorage.setItem("dzikir-history", JSON.stringify(nextHistory));
    
    // reset main count
    setCount(0);
  };

  // Delete a history item
  const handleDeleteHistoryItem = (id: string) => {
    const nextHistory = history.filter(item => item.id !== id);
    setHistory(nextHistory);
    localStorage.setItem("dzikir-history", JSON.stringify(nextHistory));
  };

  // Clear all history logs
  const handleClearAllHistory = () => {
    setConfirmModal({
      open: true,
      title: language === "id" ? "Hapus Semua Riwayat?" : "Clear All History?",
      description: language === "id" 
        ? "Apakah Anda yakin ingin menghapus semua riwayat sesi dzikir dan statistik hari ini?" 
        : "Are you sure you want to clear all dhikr session history and statistics for today?",
      confirmLabel: language === "id" ? "Hapus Semua" : "Clear All",
      variant: "danger",
      onConfirm: () => {
        setHistory([]);
        localStorage.removeItem("dzikir-history");
        setTodayTotal(0);
        localStorage.removeItem("dzikir-today-total");
      }
    });
  };

  // Format timestamp to local hour
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  // Resolve localized labels for history rows
  const getHistoryLabel = (key: string) => {
    const found = DHIKR_PHRASES.find(p => p.id === key);
    if (!found) return key;
    return language === "id" ? found.translationId : found.translationEn;
  };

  const currentPhrase = getCurrentPhrase();

  // Progress circle configuration
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = target > 0 ? Math.min(count / target, 1) : 0;
  const strokeDashoffset = target > 0 ? circumference - progressPercent * circumference : 0;

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-card-border border-t-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <ConfirmationModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={closeConfirmModal}
        language={language}
      />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/40 via-card-bg/50 to-transparent p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-glow/85 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              📿 {t("dzikirTitle")}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
              {t("dzikirTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-lg">
              {t("dzikirSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card-bg/55 border border-card-border px-5 py-3.5 rounded-2xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                {t("dzikirTodayTotal")}
              </span>
              <span className="text-2xl font-black text-primary font-mono">{todayTotal}</span>
            </div>
            {todayTotal > 0 && (
              <button 
                onClick={handleClearAllHistory}
                className="text-muted hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-500/10 cursor-pointer"
                title={language === "id" ? "Reset Statistik" : "Reset Stats"}
              >
                <FaTrash className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Config, Preferences & Settings */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Phrase Selection Panel */}
            <div className="rounded-2xl border border-card-border bg-card-bg/30 p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>📋</span> {t("dzikirSelectPhrase")}
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {DHIKR_PHRASES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPhraseId(p.id);
                      savePreference("dzikir-selected-phrase", p.id);
                      setCount(0);
                    }}
                    className={`text-left rounded-xl p-3 border transition-all duration-150 cursor-pointer text-xs flex flex-col justify-between gap-1.5 ${
                      selectedPhraseId === p.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card-bg/30 border-card-border text-foreground hover:bg-card-bg/70"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold">{language === "id" ? p.translationId : p.translationEn}</span>
                      <span className="font-arabic font-bold text-base leading-none">{p.ar}</span>
                    </div>
                    <span className="text-[10px] text-muted italic">{p.tr}</span>
                  </button>
                ))}

                {/* Custom Phrase Selection Option */}
                <button
                  onClick={() => {
                    setSelectedPhraseId("custom");
                    savePreference("dzikir-selected-phrase", "custom");
                    setCount(0);
                  }}
                  className={`text-left rounded-xl p-3 border transition-all duration-150 cursor-pointer text-xs flex items-center justify-between ${
                    selectedPhraseId === "custom"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card-bg/30 border-card-border text-foreground hover:bg-card-bg/70"
                  }`}
                >
                  <span className="font-bold">✨ {t("dzikirCustom")}</span>
                  <span className="text-[10px] opacity-80">🖊️</span>
                </button>
              </div>

              {/* Custom input fields */}
              {selectedPhraseId === "custom" && (
                <div className="space-y-3 p-3 rounded-xl bg-background/50 border border-card-border animate-dropdown-in">
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Teks Arab
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="سُبْحَانَ ٱللَّهِ"
                      value={customPhraseAr}
                      onChange={(e) => {
                        setCustomPhraseAr(e.target.value);
                        savePreference("dzikir-custom-ar", e.target.value);
                      }}
                      className="w-full h-10 rounded-lg border border-card-border bg-card-bg/40 px-3 text-sm text-foreground text-right placeholder-muted/50 focus:border-primary focus:outline-hidden transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Transliterasi / Nama
                    </label>
                    <input
                      type="text"
                      placeholder={t("dzikirCustomPlaceholder")}
                      value={customPhraseTr}
                      onChange={(e) => {
                        setCustomPhraseTr(e.target.value);
                        savePreference("dzikir-custom-tr", e.target.value);
                      }}
                      className="w-full h-10 rounded-lg border border-card-border bg-card-bg/40 px-3 text-xs text-foreground placeholder-muted/50 focus:border-primary focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Target Settings */}
            <div className="rounded-2xl border border-card-border bg-card-bg/30 p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>🎯</span> {t("dzikirTarget")}
              </h2>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[33, 100, 0].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setTarget(val);
                      savePreference("dzikir-target", val);
                      setIsCustomTarget(false);
                      setCount(0);
                    }}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer border ${
                      !isCustomTarget && target === val
                        ? "bg-primary text-white border-primary"
                        : "bg-card-bg/30 border-card-border text-foreground hover:bg-card-bg/70"
                    }`}
                  >
                    {val === 0 ? t("dzikirTargetNone") : `${val}x`}
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    setIsCustomTarget(true);
                    const parsedVal = Number(customTargetVal) || 33;
                    setTarget(parsedVal);
                    savePreference("dzikir-target", parsedVal);
                    setCount(0);
                  }}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer border ${
                    isCustomTarget
                      ? "bg-primary text-white border-primary"
                      : "bg-card-bg/30 border-card-border text-foreground hover:bg-card-bg/70"
                  }`}
                >
                  {language === "id" ? "Kustom" : "Custom"}
                </button>
              </div>

              {/* Custom Target Input */}
              {isCustomTarget && (
                <div className="flex gap-2 items-center p-2 rounded-xl bg-background/50 border border-card-border animate-dropdown-in">
                  <input
                    type="number"
                    min="1"
                    value={customTargetVal}
                    onChange={(e) => {
                      setCustomTargetVal(e.target.value);
                      savePreference("dzikir-custom-target-val", e.target.value);
                      const parsed = Number(e.target.value);
                      if (parsed > 0) {
                        setTarget(parsed);
                        savePreference("dzikir-target", parsed);
                      }
                    }}
                    className="flex-1 h-9 rounded-lg border border-card-border bg-card-bg/40 px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
                    placeholder="Masukkan target..."
                  />
                  <span className="text-[10px] text-muted pr-2">kali</span>
                </div>
              )}
            </div>

            {/* Audio / Haptic Options */}
            <div className="rounded-2xl border border-card-border bg-card-bg/30 p-5 space-y-3.5 shadow-xs">
              <h2 className="text-sm font-bold text-foreground">⚙️ Preferences</h2>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    const nextVal = !soundEnabled;
                    setSoundEnabled(nextVal);
                    savePreference("dzikir-sound", nextVal);
                  }}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border text-xs cursor-pointer transition-all ${
                    soundEnabled ? "border-primary/30 bg-primary-glow/20 text-primary" : "border-card-border bg-card-bg/20 text-muted"
                  }`}
                >
                  <span className="font-semibold">{t("dzikirSound")}</span>
                  {soundEnabled ? <FaVolumeUp className="h-3.5 w-3.5" /> : <FaVolumeMute className="h-3.5 w-3.5" />}
                </button>

                <button
                  onClick={() => {
                    const nextVal = !vibrationEnabled;
                    setVibrationEnabled(nextVal);
                    savePreference("dzikir-vibration", nextVal);
                  }}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border text-xs cursor-pointer transition-all ${
                    vibrationEnabled ? "border-primary/30 bg-primary-glow/20 text-primary" : "border-card-border bg-card-bg/20 text-muted"
                  }`}
                >
                  <span className="font-semibold">{t("dzikirVibration")}</span>
                  <span className="text-xs">📳</span>
                </button>
              </div>
            </div>

          </div>

          {/* Center panel: Large Interactive Counter circle */}
          <div className="lg:col-span-2 space-y-8 flex flex-col justify-between">
            
            {/* Interactive Bead area */}
            <div className="rounded-3xl border border-card-border bg-linear-to-b from-card-bg/40 to-card-bg/10 p-8 flex flex-col items-center justify-center space-y-8 shadow-xs relative min-h-[440px]">
              
              {/* Keyboard Tip info banner */}
              <div className="absolute top-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-card-border bg-background/50 text-[10px] text-muted tracking-wide">
                <FaKeyboard className="text-primary" />
                <span>Tekan <strong>Space</strong> / <strong>Enter</strong> untuk menghitung</span>
              </div>

              {/* Central Phrase Banner display */}
              <div className="text-center space-y-2 mt-4">
                <p className="font-arabic text-3xl sm:text-4xl font-bold text-primary animate-pulse tracking-wide select-none leading-relaxed">
                  {currentPhrase.ar}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {currentPhrase.tr}
                </p>
                <p className="text-[11px] text-muted">
                  {currentPhrase.display}
                </p>
              </div>

              {/* Clickable Circle Bead SVG Counter */}
              <div className="relative flex items-center justify-center select-none">
                
                {/* SVG Progress Ring */}
                <svg className="w-56 h-56 transform -rotate-90 select-none">
                  <circle
                    cx="112"
                    cy="112"
                    r={radius}
                    className="stroke-card-border fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r={radius}
                    className="stroke-primary fill-none transition-all duration-150"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Tap Bead Trigger */}
                <button
                  onClick={incrementCount}
                  className={`absolute w-44 h-44 rounded-full flex flex-col items-center justify-center cursor-pointer border shadow-2xl transition-all select-none ${
                    isPressing 
                      ? "scale-92 bg-primary/20 border-primary shadow-primary/20" 
                      : "scale-100 bg-background/60 hover:bg-background/90 hover:scale-[1.02] hover:shadow-primary/10 border-card-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted mt-2">
                    {target > 0 ? `${t("dzikirTarget")}: ${target}x` : t("dzikirTargetNone")}
                  </span>
                  <span className="text-5xl font-black font-mono text-foreground tracking-tight select-none my-1">
                    {count}
                  </span>
                  <span className="text-[9px] font-bold text-primary tracking-widest uppercase animate-pulse select-none">
                    TAP
                  </span>
                </button>
              </div>

              {/* Target Complete alert */}
              {target > 0 && count >= target && (
                <div className="animate-dropdown-in px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold flex items-center gap-1.5">
                  <FaCheck className="animate-bounce" />
                  <span>{t("dzikirCompleted")}</span>
                </div>
              )}

              {/* Bottom Operations Row */}
              <div className="flex gap-4 w-full max-w-xs justify-center pt-2">
                <button
                  disabled={count === 0}
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold bg-card-bg/30 border border-card-border text-foreground hover:bg-card-bg/60 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <FaUndo className="h-3 w-3" />
                  <span>{t("dzikirReset")}</span>
                </button>

                <button
                  disabled={count === 0}
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold bg-primary text-white hover:bg-primary-glow hover:text-primary border border-transparent disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-primary/10"
                >
                  <FaSave className="h-3 w-3" />
                  <span>{t("dzikirSave")}</span>
                </button>
              </div>

            </div>

            {/* History Row list */}
            <div className="rounded-3xl border border-card-border bg-card-bg/30 p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-card-border/60">
                <h3 className="font-black text-sm text-foreground">
                  📿 {t("dzikirHistoryTitle")}
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FaTrash className="h-2.5 w-2.5" />
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-muted text-xs flex flex-col items-center gap-1.5">
                  <FaInfoCircle className="h-4 w-4 opacity-50" />
                  <p>{t("dzikirHistoryEmpty")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-card-border bg-background/35 group relative hover:border-primary/25 transition-all"
                    >
                      <div className="flex items-center gap-2 max-w-full min-w-0 pr-6">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-primary font-mono">{item.count}x</span>
                            <span className="text-xs font-bold text-foreground">
                              {getHistoryLabel(item.phrase)}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted block">
                            🕒 {formatTime(item.timestamp)}
                          </span>
                        </div>
                      </div>

                      {item.arabic && (
                        <span className="font-arabic font-bold text-base text-muted/80 select-none mr-8 block max-w-[40%] truncate leading-none">
                          {item.arabic}
                        </span>
                      )}
                      
                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="text-muted hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100"
                        title="Hapus baris ini"
                      >
                        <FaTrash className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

// ── Confirmation Modal Component ──────────────────────────────────────────────
function ConfirmationModal({ 
  open, 
  title, 
  description, 
  confirmLabel, 
  variant, 
  onConfirm, 
  onClose, 
  language 
}: { 
  open: boolean; 
  title: string; 
  description: string; 
  confirmLabel: string; 
  variant: "danger" | "warning"; 
  onConfirm: () => void; 
  onClose: () => void; 
  language: string; 
}) {
  useEffect(() => {
    if (open) {
      animate(".dzikir-confirm-modal-card", {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 280,
        ease: "outBack(1.4)",
      });
    }
  }, [open]);

  if (!open) return null;

  const isRed = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="dzikir-confirm-modal-card relative w-full max-w-sm rounded-3xl border border-card-border bg-card-bg shadow-2xl p-6 sm:p-8 flex flex-col gap-5 opacity-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-card-border/50 transition-all duration-200 cursor-pointer"
          aria-label="Close"
        >
          <FaTimes className="h-3.5 w-3.5" />
        </button>

        {/* Icon */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isRed
              ? "bg-red-500/10 border-red-500/25 text-red-500"
              : "bg-amber-500/10 border-amber-500/25 text-amber-500"
          }`}
        >
          <FaExclamationTriangle className="h-6 w-6" />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-foreground mb-1.5 pr-6">{title}</h3>
          <p className="text-sm text-muted leading-relaxed">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-card-border bg-card-bg/50 px-4 py-2.5 text-sm font-bold text-muted hover:text-foreground hover:bg-card-border/30 transition-all duration-200 cursor-pointer"
          >
            {language === "id" ? "Batal" : "Cancel"}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isRed
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/25"
                : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
