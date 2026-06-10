"use client";

import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaExchangeAlt, FaHistory, FaStarAndCrescent } from "react-icons/fa";
import { getHijriDate, calculateLocalHijri, getIslamicHolidays, HijriDateInfo } from "@/utils/hijri";
import { useLanguage } from "@/context/LanguageContext";

export default function HijriWidget() {
  const { t, language } = useLanguage();
  const [todayHijri, setTodayHijri] = useState<HijriDateInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Converter States
  const [convTab, setConvTab] = useState<"g2h" | "h2g">("g2h");
  
  // G2H State
  const [gregDate, setGregDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [convertedHijri, setConvertedHijri] = useState<HijriDateInfo | null>(null);

  // H2G State
  const [hDay, setHDay] = useState<number>(1);
  const [hMonth, setHMonth] = useState<number>(1);
  const [hYear, setHYear] = useState<number>(1447);
  const [convertedGreg, setConvertedGreg] = useState<Date | null>(null);

  useEffect(() => {
    async function loadToday() {
      const info = await getHijriDate(new Date());
      setTodayHijri(info);
      setConvertedHijri(info);
      setLoading(false);
    }
    loadToday();
  }, []);

  // Live convert Gregorian to Hijri
  useEffect(() => {
    if (!gregDate) return;
    const parts = gregDate.split("-").map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const res = calculateLocalHijri(d);
      setConvertedHijri(res);
    }
  }, [gregDate]);

  // Tabular Hijri to Julian Day to Gregorian Date
  useEffect(() => {
    // Tabular Islamic Calendar conversion
    const epoch = 1948439.5;
    const cycle = Math.floor((hYear - 1) / 30);
    const yearCycle = (hYear - 1) % 30;
    
    let jd = epoch + cycle * 10631 + yearCycle * 354 + Math.floor((11 * yearCycle + 3) / 30);
    
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    
    // Check if leap year in cycle
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    if (leapYears.includes(hYear % 30)) {
      monthLengths[11] = 30;
    }

    // Limit day input depending on selected month length
    const maxDay = monthLengths[hMonth - 1] || 30;
    const activeDay = Math.min(hDay, maxDay);

    for (let i = 0; i < hMonth - 1; i++) {
      jd += monthLengths[i];
    }
    jd += activeDay - 1;
    
    // Constant adjustment offset (adjusting for moon sighting visibility)
    jd -= 1.5; 

    // Convert Julian Day back to Gregorian Date
    const z = Math.floor(jd + 0.5);
    const f = (jd + 0.5) - z;
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    const a = z + 1 + alpha - Math.floor(alpha / 4);
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    setConvertedGreg(new Date(year, month - 1, Math.round(day)));
  }, [hDay, hMonth, hYear]);

  // Convert custom Hijri date back to Gregorian helper for lists
  const getGregorianForHoliday = (dayStr: string, hijriYear: number): Date => {
    const [dVal, mVal] = dayStr.split("-").map(Number);
    const epoch = 1948439.5;
    const cycle = Math.floor((hijriYear - 1) / 30);
    const yearCycle = (hijriYear - 1) % 30;
    
    let jd = epoch + cycle * 10631 + yearCycle * 354 + Math.floor((11 * yearCycle + 3) / 30);
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    
    for (let i = 0; i < mVal - 1; i++) {
      jd += monthLengths[i];
    }
    jd += dVal - 1;
    jd -= 1.5; // adjustment offset
    
    const z = Math.floor(jd + 0.5);
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    const a = z + 1 + alpha - Math.floor(alpha / 4);
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    return new Date(year, month - 1, Math.round(day));
  };

  const holidays = todayHijri ? getIslamicHolidays(todayHijri.year) : [];
  const HIJRI_MONTHS_LIST = language === "id" ? [
    "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
    "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
  ] : [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none">
      
      {/* 1. Today Hijri Date Card */}
      <div className="lg:col-span-4 rounded-3xl border border-card-border bg-card-bg/60 p-6 flex flex-col justify-between items-center text-center shadow-xs backdrop-blur-md min-h-[280px]">
        <div className="space-y-1">
          <span className="text-[10px] text-primary font-black uppercase tracking-widest block">
            {language === "id" ? "KALENDER HIJRIAH" : "HIJRI CALENDAR"}
          </span>
          <p className="text-xs text-muted">
            {language === "id" ? "Hari ini dalam kalender Hijriah" : "Today in the Islamic Calendar"}
          </p>
        </div>

        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-card-border border-t-primary" />
        ) : todayHijri ? (
          <div className="space-y-3">
            <h4 className="font-arabic text-3xl text-primary font-bold tracking-wide leading-normal">
              {todayHijri.day} {todayHijri.monthNameAr} {todayHijri.year}
            </h4>
            <p className="text-base font-extrabold text-foreground tracking-tight leading-none">
              {todayHijri.day} {todayHijri.monthNameId} {todayHijri.year} H
            </p>
            <p className="text-xs text-muted font-medium flex items-center justify-center gap-1.5 pt-1">
              <FaCalendarAlt />
              {new Date().toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ) : null}

        <div className="w-full border-t border-card-border/40 pt-4 text-[10px] text-muted flex items-center justify-center gap-1.5 font-medium">
          <FaStarAndCrescent className="text-primary animate-pulse" />
          <span>Calculated offline (tabular fallback active)</span>
        </div>
      </div>

      {/* 2. Interactive Bidirectional Converter */}
      <div className="lg:col-span-4 rounded-3xl border border-card-border bg-card-bg/60 p-6 flex flex-col justify-between shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between border-b border-card-border/40 pb-2 mb-4">
            <h4 className="font-black text-sm text-foreground flex items-center gap-2">
              <FaExchangeAlt className="text-primary" />
              {language === "id" ? "Konverter Tanggal" : "Date Converter"}
            </h4>
            <div className="flex gap-1 bg-background/50 border border-card-border p-0.5 rounded-lg text-[9px] font-bold">
              <button
                onClick={() => setConvTab("g2h")}
                className={`px-2 py-1 rounded-md transition-all ${
                  convTab === "g2h" ? "bg-primary text-white" : "text-muted hover:text-foreground"
                }`}
              >
                M ➔ H
              </button>
              <button
                onClick={() => setConvTab("h2g")}
                className={`px-2 py-1 rounded-md transition-all ${
                  convTab === "h2g" ? "bg-primary text-white" : "text-muted hover:text-foreground"
                }`}
              >
                H ➔ M
              </button>
            </div>
          </div>

          {/* TAB 1: Gregorian to Hijri */}
          {convTab === "g2h" ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">
                  {language === "id" ? "Tanggal Masehi" : "Gregorian Date"}
                </label>
                <input
                  type="date"
                  value={gregDate}
                  onChange={(e) => setGregDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-card-border bg-background px-3 text-xs text-foreground focus:border-primary/80 focus:outline-hidden"
                />
              </div>

              {convertedHijri && (
                <div className="p-3.5 rounded-xl bg-primary-glow/25 border border-primary/20 text-center space-y-1 mt-2">
                  <span className="text-[9px] text-primary font-bold uppercase tracking-widest block">Hasil Konversi</span>
                  <span className="font-arabic text-xl text-primary font-bold block">{convertedHijri.day} {convertedHijri.monthNameAr} {convertedHijri.year}</span>
                  <span className="text-xs font-black text-foreground">{convertedHijri.day} {convertedHijri.monthNameId} {convertedHijri.year} H</span>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: Hijri to Gregorian */
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted uppercase block">Hari</label>
                  <select
                    value={hDay}
                    onChange={(e) => setHDay(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-card-border bg-background px-2 text-xs text-foreground focus:outline-hidden focus:border-primary"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted uppercase block">Bulan</label>
                  <select
                    value={hMonth}
                    onChange={(e) => setHMonth(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-card-border bg-background px-2 text-xs text-foreground focus:outline-hidden focus:border-primary"
                  >
                    {HIJRI_MONTHS_LIST.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted uppercase block">Tahun</label>
                  <input
                    type="number"
                    value={hYear}
                    min={1}
                    max={3000}
                    onChange={(e) => setHYear(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-card-border bg-background px-2 text-xs text-foreground focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {convertedGreg && (
                <div className="p-3.5 rounded-xl bg-primary-glow/25 border border-primary/20 text-center space-y-1 mt-2">
                  <span className="text-[9px] text-primary font-bold uppercase tracking-widest block">Hasil Konversi</span>
                  <span className="text-xs font-black text-foreground block pt-1">
                    {convertedGreg.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                  <span className="text-[10px] text-muted font-medium">Masehi / Gregorian</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Important Islamic Holidays List */}
      <div className="lg:col-span-4 rounded-3xl border border-card-border bg-card-bg/60 p-6 flex flex-col shadow-xs backdrop-blur-md justify-between min-h-[280px]">
        <h4 className="font-black text-sm text-foreground flex items-center gap-2 border-b border-card-border/40 pb-2 mb-3">
          <FaHistory className="text-primary animate-pulse" />
          {language === "id" ? "Hari Besar Keagamaan" : "Islamic Holidays"}
        </h4>

        <div className="flex-1 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin space-y-2.5">
          {holidays.map((holiday, idx) => {
            const hYearActive = todayHijri?.year || 1447;
            const gregDateHoliday = getGregorianForHoliday(holiday.hijriDate, hYearActive);
            
            return (
              <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-background/25 border border-card-border/40 hover:bg-background/40 transition-colors">
                <div className="space-y-0.5 leading-tight">
                  <span className="font-black text-foreground text-[11px] block">{language === "id" ? holiday.nameId : holiday.nameEn}</span>
                  <span className="text-[9px] text-muted font-medium">
                    {gregDateHoliday.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-primary bg-primary-glow px-2 py-0.5 rounded-lg border border-primary/20 whitespace-nowrap shrink-0">
                  {holiday.hijriDate.replace("-", "/")} H
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
