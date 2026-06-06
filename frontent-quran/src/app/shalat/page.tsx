"use client";

import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import MapPicker from "@/components/MapPicker";
import {
  getShalatProvinsi,
  getShalatKabKota,
  getJadwalShalat,
  getImsakiyahProvinsi,
  getImsakiyahKabKota,
  getJadwalImsakiyah,
  JadwalShalatHari,
  getRandomInspirationalAyah,
} from "@/utils/api";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaMoon,
  FaSun,
  FaHeart,
  FaSearch,
  FaChevronDown,
  FaVolumeUp,
  FaVolumeMute,
  FaCrosshairs,
  FaMap,
} from "react-icons/fa";
import { MdOutlineTimer, MdOutlineAccessTime } from "react-icons/md";
import { animate, stagger } from "animejs";

export default function ShalatPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"shalat" | "imsakiyah">("shalat");
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Selection states
  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [kabkotaList, setKabkotaList] = useState<string[]>([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>("");
  const [selectedKabKota, setSelectedKabKota] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("last_mode") as "shalat" | "imsakiyah" | null;
    const savedProv = localStorage.getItem("last_provinsi");
    const savedKab = localStorage.getItem("last_kabkota");

    if (savedMode) setMode(savedMode);
    if (savedProv) setSelectedProvinsi(savedProv);
    if (savedKab) setSelectedKabKota(savedKab);
    
    setIsInitialized(true);
  }, []);

  // Search filter states
  const [provSearch, setProvSearch] = useState<string>("");
  const [kabSearch, setKabSearch] = useState<string>("");
  const [isProvOpen, setIsProvOpen] = useState<boolean>(false);
  const [isKabOpen, setIsKabOpen] = useState<boolean>(false);

  // Data states
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Time & Countdown states
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; date: Date } | null>(null);
  const [countdownStr, setCountdownStr] = useState<string>("");

  const getTimezoneAbbreviation = (): string => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Jakarta") || tz.includes("Pontianak")) return "WIB";
      if (tz.includes("Makassar") || tz.includes("Ujung_Pandang") || tz.includes("Singapore") || tz.includes("Bali")) return "WITA";
      if (tz.includes("Jayapura")) return "WIT";
      
      const offset = -new Date().getTimezoneOffset() / 60;
      if (offset === 7) return "WIB";
      if (offset === 8) return "WITA";
      if (offset === 9) return "WIT";
      
      const sign = offset >= 0 ? "+" : "-";
      const absOffset = Math.abs(offset);
      return `GMT${sign}${absOffset}`;
    } catch {
      return "";
    }
  };

  const getPrayerStatus = (pTime: string, isActive: boolean) => {
    if (!pTime) return "";
    try {
      const [h, m] = pTime.split(":").map(Number);
      const pDate = new Date();
      pDate.setHours(h, m, 0, 0);
      
      const nowTime = new Date();
      if (nowTime > pDate) {
        if (isActive) {
          const diffMins = (nowTime.getTime() - pDate.getTime()) / (1000 * 60);
          if (diffMins <= 60) {
            return language === "id" ? "(Aktif)" : "(Active)";
          }
        }
        return language === "id" ? "(Lewat)" : "(Passed)";
      } else {
        return language === "id" ? "(Akan Datang)" : "(Upcoming)";
      }
    } catch {
      return "";
    }
  };

  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [randomVerse, setRandomVerse] = useState<any>(null);

  // Load random inspirational verse when language changes
  useEffect(() => {
    async function loadRandomVerse() {
      try {
        const verse = await getRandomInspirationalAyah(language);
        setRandomVerse(verse);
      } catch (err) {
        console.error("Failed to load random verse:", err);
      }
    }
    loadRandomVerse();
  }, [language]);

  const matchProvince = (geoProv: string) => {
    if (!geoProv) return null;
    const gp = geoProv.toLowerCase();
    
    // 1. Direct or partial matching
    let match = provinsiList.find(p => p.toLowerCase().includes(gp) || gp.includes(p.toLowerCase()));
    if (match) return match;
    
    // 2. Custom aliases for standard mismatch cases
    if (gp.includes("jakarta")) return provinsiList.find(p => p.toLowerCase().includes("jakarta"));
    if (gp.includes("yogyakarta") || gp.includes("jogja")) return provinsiList.find(p => p.toLowerCase().includes("yogyakarta"));
    if (gp.includes("bangka") || gp.includes("belitung")) return provinsiList.find(p => p.toLowerCase().includes("bangka"));
    if (gp.includes("riau") && gp.includes("kepulauan")) return provinsiList.find(p => p.toLowerCase().includes("riau"));
    if (gp.includes("aceh")) return provinsiList.find(p => p.toLowerCase().includes("aceh"));
    
    return null;
  };

  const matchCity = (geoCity: string, cities: string[]) => {
    if (!geoCity || cities.length === 0) return cities[0] || "";
    const gc = geoCity.toLowerCase().replace("kota", "").replace("kabupaten", "").replace("kab.", "").trim();
    
    let match = cities.find(c => {
      const cleanC = c.toLowerCase().replace("kota", "").replace("kabupaten", "").replace("kab.", "").trim();
      return cleanC.includes(gc) || gc.includes(cleanC);
    });
    
    return match || cities[0];
  };

  const applyAddressToSelectors = async (address: any) => {
    const geoProv = address.state || address.province || address.region || "";
    const geoCity = address.city || address.city_district || address.county || address.municipality || address.town || address.suburb || address.village || "";
    
    if (!geoProv) throw new Error("Province not found in address");
    
    const matchedProv = matchProvince(geoProv);
    if (!matchedProv) throw new Error("No matching province found in Indonesia");
    
    setSelectedProvinsi(matchedProv);
    localStorage.setItem("last_provinsi", matchedProv);
    
    const cities = mode === "shalat" ? await getShalatKabKota(matchedProv) : await getImsakiyahKabKota(matchedProv);
    setKabkotaList(cities);
    
    const matchedCity = matchCity(geoCity, cities);
    setSelectedKabKota(matchedCity);
    localStorage.setItem("last_kabkota", matchedCity);
    
    return { prov: matchedProv, city: matchedCity };
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast(
        language === "id" ? "Browser Anda tidak mendukung Geolocation." : "Your browser does not support Geolocation.",
        "warning",
        language === "id" ? "Browser Tidak Didukung" : "Unsupported Browser"
      );
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`,
            { headers: { "User-Agent": "Alquran-Project-Client" } }
          );
          if (!res.ok) throw new Error("Reverse geocoding HTTP error " + res.status);
          const data = await res.json();
          const address = data.address || {};
          
          const { prov, city } = await applyAddressToSelectors(address);
          
          showToast(
            `${prov} – ${city}`,
            "success",
            language === "id" ? "Lokasi GPS Ditemukan ✓" : "GPS Location Found ✓"
          );
        } catch (err) {
          console.error("GPS location resolution failed:", err);
          showToast(
            language === "id"
              ? "Gagal mencocokkan lokasi GPS ke provinsi/kota. Coba pilih manual atau gunakan peta."
              : "Could not match GPS location to a province/city. Try manual selection or use the map.",
            "error",
            language === "id" ? "Lokasi Tidak Terdeteksi" : "Location Not Detected"
          );
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error code:", err.code, err.message);
        setGpsLoading(false);
        const msgs: Record<number, { id: string; en: string }> = {
          1: { id: "Izin GPS ditolak. Mohon aktifkan izin lokasi di pengaturan browser Anda.", en: "GPS permission denied. Please enable location access in your browser settings." },
          2: { id: "Sinyal GPS tidak tersedia. Pastikan GPS perangkat Anda aktif.", en: "GPS signal unavailable. Make sure your device GPS is enabled." },
          3: { id: "Permintaan GPS habis waktu (timeout). Coba lagi atau pilih lokasi manual.", en: "GPS request timed out. Please retry or pick location manually." },
        };
        const msg = msgs[err.code] || { id: "GPS error tidak diketahui.", en: "Unknown GPS error." };
        showToast(
          language === "id" ? msg.id : msg.en,
          "error",
          language === "id" ? "GPS Gagal" : "GPS Failed"
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const handleMapConfirm = async (lat: number, lng: number, address: any) => {
    setShowMapPicker(false);
    try {
      setGpsLoading(true);
      const { prov, city } = await applyAddressToSelectors(address);
      showToast(
        `${prov} – ${city}`,
        "success",
        language === "id" ? "Lokasi Peta Diterapkan ✓" : "Map Location Applied ✓"
      );
    } catch (err) {
      console.error("Map location apply failed:", err);
      showToast(
        language === "id" ? "Lokasi dari peta tidak dapat dicocokkan." : "Map location could not be matched to a city.",
        "error"
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const provDropdownRef = useRef<HTMLDivElement>(null);
  const kabDropdownRef = useRef<HTMLDivElement>(null);

  // Current Month / Year for Shalat
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  const getDayPhase = () => {
    const hours = currentTime.getHours();
    if (hours >= 4 && hours < 6) {
      return {
        phase: "dawn",
        label: language === "id" ? "Pagi / Fajar" : "Dawn / Morning",
        bgClass: "from-amber-600/35 via-rose-600/20 to-primary-glow/10 border-amber-500/40 shadow-amber-500/5",
        glowColor: "bg-amber-500/20",
        icon: <FaSun className="h-6 w-6 text-amber-400 animate-bounce-slow" />,
        themeColor: "text-amber-400",
        orbColor1: "bg-amber-500/20",
        orbColor2: "bg-rose-500/10",
        textColor: "from-amber-400 to-rose-400"
      };
    } else if (hours >= 6 && hours < 17) {
      return {
        phase: "day",
        label: language === "id" ? "Siang Hari" : "Daytime",
        bgClass: "from-sky-500/30 via-teal-500/10 to-primary-glow/10 border-sky-400/40 shadow-sky-500/5",
        glowColor: "bg-sky-500/20",
        icon: <FaSun className="h-6 w-6 text-yellow-400 animate-spin-slow" />,
        themeColor: "text-yellow-400",
        orbColor1: "bg-sky-500/20",
        orbColor2: "bg-teal-500/10",
        textColor: "from-teal-400 to-sky-400"
      };
    } else if (hours >= 17 && hours < 19) {
      return {
        phase: "dusk",
        label: language === "id" ? "Senja / Maghrib" : "Dusk / Twilight",
        bgClass: "from-orange-600/35 via-purple-600/20 to-primary-glow/10 border-orange-500/40 shadow-orange-500/5",
        glowColor: "bg-orange-500/20",
        icon: <FaSun className="h-6 w-6 text-orange-400 animate-bounce-slow" />,
        themeColor: "text-orange-400",
        orbColor1: "bg-orange-600/25",
        orbColor2: "bg-purple-600/15",
        textColor: "from-orange-400 to-purple-400"
      };
    } else {
      return {
        phase: "night",
        label: language === "id" ? "Malam Hari" : "Nighttime",
        bgClass: "from-indigo-950/50 via-purple-950/30 to-accent-glow/20 border-indigo-500/40 shadow-indigo-500/10",
        glowColor: "bg-indigo-500/20",
        icon: <FaMoon className="h-6 w-6 text-indigo-300 animate-pulse" />,
        themeColor: "text-indigo-300",
        orbColor1: "bg-indigo-500/20",
        orbColor2: "bg-purple-500/10",
        textColor: "from-indigo-300 to-purple-400"
      };
    }
  };

  const phaseInfo = getDayPhase();

  // Load Provinces on Mount & when mode/language/initialization changes
  useEffect(() => {
    if (!isInitialized) return;

    async function loadProvinces() {
      try {
        setLoading(true);
        const list = mode === "shalat" ? await getShalatProvinsi() : await getImsakiyahProvinsi();
        setProvinsiList(list);
        setError(null);

        // Respect existing selections (from localStorage or state)
        const currentProv = selectedProvinsi || localStorage.getItem("last_provinsi") || "";
        const provToSelect = list.includes(currentProv)
          ? currentProv
          : (list.find((p) => p.toLowerCase().includes("jakarta")) || list[0]);

        if (provToSelect) {
          setSelectedProvinsi(provToSelect);
          localStorage.setItem("last_provinsi", provToSelect);

          // Load cities
          const cities = mode === "shalat" ? await getShalatKabKota(provToSelect) : await getImsakiyahKabKota(provToSelect);
          setKabkotaList(cities);

          const currentKab = selectedKabKota || localStorage.getItem("last_kabkota") || "";
          const kabToSelect = cities.includes(currentKab)
            ? currentKab
            : (cities.find((c) => c.toLowerCase().includes("jakarta pusat")) || cities[0]);

          if (kabToSelect) {
            setSelectedKabKota(kabToSelect);
            localStorage.setItem("last_kabkota", kabToSelect);
          }
        }
      } catch (err) {
        console.error(err);
        setError(language === "id" ? "Gagal memuat daftar provinsi." : "Failed to load provinces.");
      } finally {
        setLoading(false);
      }
    }
    loadProvinces();
  }, [mode, language, isInitialized]);

  // Load Cities helper
  const loadCities = async (provName: string) => {
    try {
      setLoading(true);
      const list = mode === "shalat" ? await getShalatKabKota(provName) : await getImsakiyahKabKota(provName);
      setKabkotaList(list);
      
      const defaultCity = list.find((c) => c.toLowerCase().includes("jakarta pusat")) || list[0];
      if (defaultCity) {
        setSelectedKabKota(defaultCity);
        localStorage.setItem("last_kabkota", defaultCity);
      } else {
        setSelectedKabKota("");
      }
    } catch (err) {
      console.error(err);
      setSelectedKabKota("");
    } finally {
      setLoading(false);
    }
  };

  // Handle Province Select
  const handleProvSelect = async (provName: string) => {
    setSelectedProvinsi(provName);
    localStorage.setItem("last_provinsi", provName);
    setIsProvOpen(false);
    setProvSearch("");
    await loadCities(provName);
  };

  // Handle KabKota Select
  const handleKabSelect = (cityName: string) => {
    setSelectedKabKota(cityName);
    localStorage.setItem("last_kabkota", cityName);
    setIsKabOpen(false);
    setKabSearch("");
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (provDropdownRef.current && !provDropdownRef.current.contains(event.target as Node)) {
        setIsProvOpen(false);
      }
      if (kabDropdownRef.current && !kabDropdownRef.current.contains(event.target as Node)) {
        setIsKabOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Schedule Data when selection changes
  useEffect(() => {
    async function fetchSchedule() {
      if (!selectedProvinsi || !selectedKabKota) return;
      try {
        setLoading(true);
        setError(null);
        if (mode === "shalat") {
          const data = await getJadwalShalat(selectedProvinsi, selectedKabKota, currentMonth, currentYear);
          setJadwal(data);
        } else {
          const data = await getJadwalImsakiyah(selectedProvinsi, selectedKabKota);
          setJadwal(data);
        }
      } catch (err) {
        console.error(err);
        setError(language === "id" ? "Gagal memuat jadwal." : "Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [selectedProvinsi, selectedKabKota, mode, language]);

  // Page Entry Stagger Animation
  useEffect(() => {
    if (!loading && jadwal.length > 0) {
      animate(".anim-fade", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(40),
        duration: 700,
        ease: "outQuint",
      });
    }
  }, [loading, jadwal.length]);

  // Live Clock Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to parse today's schedule row
  const getTodaySchedule = (): any => {
    if (!jadwal || jadwal.length === 0) return null;
    const todayDate = now.getDate();
    const todayRow = jadwal.find((row) => Number(row.tanggal) === todayDate);
    return todayRow || jadwal[0];
  };

  const todaySchedule = getTodaySchedule();

  // Calculate Countdown to Next Prayer
  useEffect(() => {
    if (!todaySchedule) {
      setNextPrayer(null);
      setCountdownStr("");
      return;
    }

    const findNext = () => {
      const prayers = [
        { name: t("imsak"), time: todaySchedule.imsak },
        { name: t("subuh"), time: todaySchedule.subuh },
        { name: t("terbit"), time: todaySchedule.terbit },
        { name: t("dhuha"), time: todaySchedule.dhuha },
        { name: t("dzuhur"), time: todaySchedule.dzuhur },
        { name: t("ashar"), time: todaySchedule.ashar },
        { name: t("maghrib"), time: todaySchedule.maghrib },
        { name: t("isya"), time: todaySchedule.isya },
      ];

      const checkTime = new Date();
      for (const p of prayers) {
        if (!p.time) continue;
        const [h, m] = p.time.split(":").map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0, 0);
        if (pDate > checkTime) {
          return { name: p.name, time: p.time, date: pDate };
        }
      }

      // If all passed, next is tomorrow's Imsak
      const tomorrowImsak = new Date();
      tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);
      const [h, m] = todaySchedule.imsak.split(":").map(Number);
      tomorrowImsak.setHours(h, m, 0, 0);
      return {
        name: `${t("imsak")} (${language === "id" ? "Besok" : "Tomorrow"})`,
        time: todaySchedule.imsak,
        date: tomorrowImsak,
      };
    };

    const next = findNext();
    setNextPrayer(next);

    if (next) {
      const updateCountdown = () => {
        const diff = next.date.getTime() - new Date().getTime();
        if (diff <= 0) {
          // Trigger reload
          setNextPrayer(findNext());
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdownStr(
          t("prayerCountdown", {
            hours: hours.toString().padStart(2, "0"),
            minutes: minutes.toString().padStart(2, "0"),
            seconds: seconds.toString().padStart(2, "0"),
          })
        );
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [todaySchedule, t, language]);

  // Check if a prayer time is active (current time falls between it and next)
  const isCurrentPrayer = (pName: string, pTime: string): boolean => {
    if (!todaySchedule || !pTime) return false;
    const [h, m] = pTime.split(":").map(Number);
    const pDate = new Date();
    pDate.setHours(h, m, 0, 0);

    const nowTime = new Date();
    if (nowTime < pDate) return false;

    // Find what is the next prayer's date
    const prayers = [
      { name: "Imsak", time: todaySchedule.imsak },
      { name: "Subuh", time: todaySchedule.subuh },
      { name: "Terbit", time: todaySchedule.terbit },
      { name: "Dhuha", time: todaySchedule.dhuha },
      { name: "Dzuhur", time: todaySchedule.dzuhur },
      { name: "Ashar", time: todaySchedule.ashar },
      { name: "Maghrib", time: todaySchedule.maghrib },
      { name: "Isya", time: todaySchedule.isya },
    ];
    const currentIndex = prayers.findIndex((p) => p.name === pName || (pName.includes("Subuh") && p.name === "Subuh"));
    if (currentIndex === -1) return false;

    const nextIndex = (currentIndex + 1) % prayers.length;
    const nextPrayerObj = prayers[nextIndex];
    const [nh, nm] = nextPrayerObj.time.split(":").map(Number);
    const nextDate = new Date();
    nextDate.setHours(nh, nm, 0, 0);
    if (nextIndex === 0) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return nowTime >= pDate && nowTime < nextDate;
  };

  const filteredProv = provinsiList.filter((p) =>
    p.toLowerCase().includes(provSearch.toLowerCase())
  );

  const filteredKab = kabkotaList.filter((k) =>
    k.toLowerCase().includes(kabSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="anim-fade relative overflow-hidden rounded-3xl border border-card-border bg-linear-to-br from-primary-glow/40 via-card-bg/50 to-transparent p-8 md:p-12 mb-10 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-glow/85 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              <FaClock className="h-3 w-3" />
              {t("shalatTab")} Indonesia
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {language === "id" ? "Waktu Shalat &" : "Prayer Times &"}<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                {language === "id" ? "Imsakiyah Bulanan" : "Monthly Imsakiyah"}
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted max-w-lg">
              {language === "id"
                ? "Dapatkan jadwal shalat 5 waktu dan jadwal imsakiyah akurat berdasarkan provinsi dan kabupaten/kota di seluruh Indonesia."
                : "Get accurate monthly prayer schedules and imsakiyah times for provinces and regencies/cities across Indonesia."}
            </p>
          </div>
          <div className="hidden md:flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-primary/20 to-accent/20 border border-primary/20 text-primary">
            <MdOutlineTimer className="h-24 w-24 opacity-85" />
          </div>
        </div>

        {/* Mode Selector & Filter Selectors */}
        <div className="anim-fade grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-30">
          
          {/* Mode Tabs */}
          <div className="flex rounded-2xl border border-card-border bg-card-bg/40 p-1 shadow-xs h-[54px] items-center">
            <button
              onClick={() => {
                setMode("shalat");
                localStorage.setItem("last_mode", "shalat");
              }}
              className={`flex-1 h-full text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                mode === "shalat"
                  ? "bg-primary text-white shadow-md shadow-primary-glow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t("shalatBulanIni").split(" ")[2] || t("shalatTab")}
            </button>
            <button
              onClick={() => {
                setMode("imsakiyah");
                localStorage.setItem("last_mode", "imsakiyah");
              }}
              className={`flex-1 h-full text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                mode === "imsakiyah"
                  ? "bg-primary text-white shadow-md shadow-primary-glow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t("imsakiyahTab")} (Ramadhan)
            </button>
          </div>

          {/* Searchable Province Dropdown */}
          <div ref={provDropdownRef} className="relative z-30">
            <button
              onClick={() => {
                setIsProvOpen(!isProvOpen);
                setIsKabOpen(false);
                setProvSearch("");
              }}
              className="w-full h-[54px] flex items-center justify-between rounded-2xl border border-card-border bg-card-bg/60 px-4.5 text-sm font-semibold text-foreground hover:border-primary/45 transition-all duration-200 shadow-xs cursor-pointer text-left select-none"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FaMapMarkerAlt className="text-primary shrink-0" />
                <span className="truncate">{selectedProvinsi || t("pilihProvinsi")}</span>
              </div>
              <FaChevronDown className={`h-3 w-3 text-muted transition-transform duration-300 ${isProvOpen ? "rotate-180" : ""}`} />
            </button>

            {isProvOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-card-border bg-card-bg p-2 shadow-2xl animate-fade-in max-h-72 overflow-y-auto flex flex-col gap-2">
                <div className="relative sticky top-0 bg-card-bg z-10">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder={language === "id" ? "Cari Provinsi..." : "Search Province..."}
                    value={provSearch}
                    onChange={(e) => setProvSearch(e.target.value)}
                    className="w-full rounded-xl border border-card-border bg-background py-2 pl-9.5 pr-4 text-xs text-foreground focus:border-primary/80 focus:outline-hidden"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex flex-col gap-0.5">
                  {filteredProv.length > 0 ? (
                    filteredProv.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleProvSelect(p)}
                        className={`w-full text-left rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                          selectedProvinsi === p
                            ? "bg-primary text-white font-bold"
                            : "text-foreground hover:bg-primary-glow hover:text-primary"
                        }`}
                      >
                        {p}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-muted">
                      {language === "id" ? "Provinsi tidak ditemukan." : "Province not found."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Searchable City/KabKota Dropdown */}
          <div ref={kabDropdownRef} className="relative z-20">
            <button
              onClick={() => {
                setIsKabOpen(!isKabOpen);
                setIsProvOpen(false);
                setKabSearch("");
              }}
              disabled={!selectedProvinsi}
              className="w-full h-[54px] flex items-center justify-between rounded-2xl border border-card-border bg-card-bg/60 px-4.5 text-sm font-semibold text-foreground hover:border-primary/45 transition-all duration-200 shadow-xs cursor-pointer text-left select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FaMapMarkerAlt className="text-accent shrink-0" />
                <span className="truncate">{selectedKabKota || t("pilihKabKota")}</span>
              </div>
              <FaChevronDown className={`h-3 w-3 text-muted transition-transform duration-300 ${isKabOpen ? "rotate-180" : ""}`} />
            </button>

            {isKabOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-card-border bg-card-bg p-2 shadow-2xl animate-fade-in max-h-72 overflow-y-auto flex flex-col gap-2">
                <div className="relative sticky top-0 bg-card-bg z-10">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder={language === "id" ? "Cari Kabupaten/Kota..." : "Search City/Regency..."}
                    value={kabSearch}
                    onChange={(e) => setKabSearch(e.target.value)}
                    className="w-full rounded-xl border border-card-border bg-background py-2 pl-9.5 pr-4 text-xs text-foreground focus:border-primary/80 focus:outline-hidden"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex flex-col gap-0.5">
                  {filteredKab.length > 0 ? (
                    filteredKab.map((k) => (
                      <button
                        key={k}
                        onClick={() => handleKabSelect(k)}
                        className={`w-full text-left rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                          selectedKabKota === k
                            ? "bg-primary text-white font-bold"
                            : "text-foreground hover:bg-primary-glow hover:text-primary"
                        }`}
                      >
                        {k}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-muted">
                      {language === "id" ? "Kab/Kota tidak ditemukan." : "Regency/City not found."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* GPS + Map Buttons */}
          <div className="flex gap-2">
            <button
              onClick={detectLocation}
              disabled={gpsLoading || provinsiList.length === 0}
              className="flex-1 h-[54px] flex items-center justify-center gap-2 rounded-2xl border border-card-border bg-card-bg/60 px-4 text-sm font-bold text-foreground hover:border-primary/45 hover:text-primary transition-all duration-200 shadow-xs cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gpsLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-card-border border-t-primary" />
              ) : (
                <FaCrosshairs className="text-primary" />
              )}
              <span className="truncate">
                {gpsLoading
                  ? (language === "id" ? "Mendeteksi..." : "Detecting...")
                  : (language === "id" ? "GPS Otomatis" : "Auto GPS")}
              </span>
            </button>
            <button
              onClick={() => setShowMapPicker(true)}
              disabled={provinsiList.length === 0}
              title={language === "id" ? "Pilih lokasi di peta" : "Pick location on map"}
              className="h-[54px] w-[54px] flex items-center justify-center rounded-2xl border border-card-border bg-card-bg/60 text-muted hover:border-primary/45 hover:text-primary transition-all duration-200 shadow-xs cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <FaMap className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Map Picker Modal */}
        {showMapPicker && (
          <MapPicker
            initialLat={-6.2}
            initialLng={106.816666}
            language={language}
            onConfirm={handleMapConfirm}
            onClose={() => setShowMapPicker(false)}
          />
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-card-border border-t-primary" />
          </div>
        )}

        {/* Content View: Countdown & Schedules */}
        {!loading && jadwal.length > 0 && (
          <div className="space-y-8">
            
            {/* Top Cards: Live Widget + Current Day Times */}
            <div className="anim-fade grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Countdown Card (Glow Widget) */}
              <div className={`lg:col-span-5 rounded-3xl border p-6 md:p-8 flex flex-col justify-between items-center shadow-lg relative overflow-hidden text-center min-h-[320px] transition-all duration-500 backdrop-blur-md bg-card-bg/60 ${phaseInfo.bgClass}`}>
                {/* Dynamic Glowing ambient blobs */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl -z-10 transition-colors duration-1000 ${phaseInfo.orbColor1}`} />
                <div className={`absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-3xl -z-10 transition-colors duration-1000 ${phaseInfo.orbColor2}`} />
                
                {/* Location Display */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-1 select-none">
                    <FaMapMarkerAlt className="animate-bounce" /> {selectedKabKota}
                  </p>
                  <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                    {selectedProvinsi}
                  </p>
                </div>

                {/* Day Phase Indicator */}
                <div className="mt-4 flex items-center gap-2 rounded-full bg-card-border/40 border border-card-border/60 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-xs select-none">
                  {phaseInfo.icon}
                  <span className="font-bold tracking-wide">{phaseInfo.label}</span>
                </div>

                {/* Countdown Time */}
                <div className="my-6">
                  {nextPrayer ? (
                    <div className="space-y-2">
                      <p className={`text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r ${phaseInfo.textColor} font-mono tracking-tight leading-none`}>
                        {countdownStr}
                      </p>
                      <p className="text-xs text-muted font-medium">
                        {t("nextPrayerIn", { name: nextPrayer.name, time: nextPrayer.time })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Calculating next prayer...</p>
                  )}
                </div>

                {/* Live Date-Clock */}
                <div className="w-full border-t border-card-border/40 pt-4 flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FaCalendarAlt />
                    {currentTime.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-foreground bg-card-border/40 border border-card-border/60 px-2.5 py-1 rounded-lg">
                    <MdOutlineAccessTime className="text-primary text-sm" />
                    {currentTime.toLocaleTimeString(language === "id" ? "id-ID" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                    <span className="text-[10px] text-primary font-bold ml-1.5 uppercase select-none">{getTimezoneAbbreviation()}</span>
                  </span>
                </div>
              </div>

              {/* Today's Times Quick View Card */}
              <div className="lg:col-span-7 rounded-3xl border border-card-border bg-card-bg/60 p-6 md:p-8 flex flex-col justify-between shadow-xs backdrop-blur-md">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1.5 flex items-center gap-2 select-none">
                    <FaSun className="text-primary animate-pulse" />
                    {t("shalatHariIni")}
                  </h2>
                  <p className="text-xs text-muted mb-6">
                    {language === "id"
                      ? "Detail waktu ibadah dan pembagian waktu shalat hari ini."
                      : "Detailed prayer times for today."}
                  </p>
                </div>

                {todaySchedule ? (
                  <div className="flex-1 flex flex-col justify-between">
                    
                    {/* Inspirational Verse in the middle to fill the empty space */}
                    {randomVerse ? (
                      <div className="my-5 p-4 rounded-2xl bg-background/30 border border-card-border/40 text-center space-y-2.5 relative overflow-hidden backdrop-blur-xs select-none">
                        <p className="font-arabic text-lg sm:text-xl text-primary font-bold leading-relaxed">
                          {randomVerse.arabic}
                        </p>
                        <p className="text-[11px] text-muted italic max-w-lg mx-auto leading-normal">
                          "{randomVerse.translation}"
                        </p>
                        <p className="text-[9px] text-primary/80 font-bold uppercase tracking-wider">
                          QS. {randomVerse.surahEnglishName} [{randomVerse.surahNumber}:{randomVerse.ayahNumber}]
                        </p>
                      </div>
                    ) : (
                      <div className="my-6 flex justify-center items-center">
                        <div className="h-6 w-6 animate-pulse rounded-full bg-primary-glow" />
                      </div>
                    )}

                    {/* Today's prayer time boxes grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3">
                      {[
                        { name: t("imsak"), time: todaySchedule.imsak, id: "Imsak" },
                        { name: t("subuh"), time: todaySchedule.subuh, id: "Subuh" },
                        { name: t("terbit"), time: todaySchedule.terbit, id: "Terbit" },
                        { name: t("dhuha"), time: todaySchedule.dhuha, id: "Dhuha" },
                        { name: t("dzuhur"), time: todaySchedule.dzuhur, id: "Dzuhur" },
                        { name: t("ashar"), time: todaySchedule.ashar, id: "Ashar" },
                        { name: t("maghrib"), time: todaySchedule.maghrib, id: "Maghrib" },
                        { name: t("isya"), time: todaySchedule.isya, id: "Isya" },
                      ].map((p) => {
                        const isActive = isCurrentPrayer(p.id, p.time);
                        return (
                          <div
                            key={p.name}
                            className={`relative rounded-xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                              isActive
                                ? "border-primary bg-primary-glow/30 text-primary shadow-md shadow-primary-glow/10 scale-105"
                                : "border-card-border bg-background/30 hover:bg-background/80 hover:border-card-border/80"
                            }`}
                          >
                            {isActive && (
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </span>
                            )}
                            <span className={`text-[10px] sm:text-xs font-bold truncate tracking-wide ${isActive ? "text-primary" : "text-muted"}`}>
                              {p.name}
                            </span>
                            <span className={`text-xs sm:text-sm md:text-base font-black font-mono leading-none ${isActive ? "text-primary" : "text-foreground"}`}>
                              {p.time || "—"}
                            </span>
                            {p.time && (
                              <span className={`text-[8px] sm:text-[9px] font-bold tracking-wide transition-all ${isActive ? "text-primary/90" : "text-muted/65"}`}>
                                {getPrayerStatus(p.time, isActive)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted text-xs">Loading today times...</div>
                )}
              </div>
            </div>

            {/* Monthly Schedule Table */}
            <div className="anim-fade rounded-3xl border border-card-border bg-card-bg/40 overflow-hidden shadow-xs">
              <div className="p-6 md:p-8 border-b border-card-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-foreground mb-1.5 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    {mode === "shalat" ? t("shalatBulanIni") : t("imsakiyahBulanIni")}
                  </h3>
                  <p className="text-xs text-muted">
                    {mode === "shalat"
                      ? `${language === "id" ? "Jadwal lengkap bulan" : "Complete schedule for"} ${now.toLocaleString(language === "id" ? "id-ID" : "en-US", { month: "long" })} ${currentYear}`
                      : `${language === "id" ? "Jadwal Imsakiyah Ramadhan tahun" : "Ramadhan Imsakiyah schedule for"} ${currentYear}`}
                  </p>
                </div>
              </div>

              {/* Scrollable table container */}
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-card-bg sticky top-0 z-10 border-b border-card-border text-muted font-bold tracking-wider uppercase select-none">
                    <tr>
                      <th className="py-4.5 px-6 font-semibold">{language === "id" ? "Tanggal" : "Date"}</th>
                      <th className="py-4.5 px-3 font-semibold text-center">{t("imsak")}</th>
                      <th className="py-4.5 px-3 font-semibold text-center">{t("subuh")}</th>
                      <th className="py-4.5 px-3 font-semibold text-center">{t("terbit")}</th>
                      <th className="py-4.5 px-3 font-semibold text-center">{t("dhuha")}</th>
                      <th className="py-4.5 px-3 font-semibold text-center">{t("dzuhur")}</th>
                      <th className="py-4.5 px-3 font-semibold text-center">{t("ashar")}</th>
                      <th className="py-4.5 px-3 font-semibold text-center">{t("maghrib")}</th>
                      <th className="py-4.5 px-4 font-semibold text-center">{t("isya")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60">
                    {jadwal.map((row) => {
                      const isToday = Number(row.tanggal) === now.getDate();

                      const formattedDate = () => {
                        if (mode === "imsakiyah") {
                          return `${language === "id" ? "Ramadhan" : "Ramadan"} ${row.tanggal}`;
                        }
                        if (row.tanggal_lengkap) {
                          try {
                            const [y, m, d] = row.tanggal_lengkap.split("-").map(Number);
                            const dateObj = new Date(y, m - 1, d);
                            return dateObj.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                              weekday: "long",
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            });
                          } catch {
                            return `${row.hari || ""}, ${row.tanggal_lengkap}`;
                          }
                        }
                        return row.tanggal;
                      };

                      return (
                        <tr
                          key={row.tanggal}
                          className={`transition-colors duration-200 border-l-4 ${
                            isToday
                              ? "bg-primary-glow/15 font-bold text-primary hover:bg-primary-glow/20 border-l-primary"
                              : "hover:bg-card-bg/25 border-l-transparent"
                          }`}
                        >
                          <td className="py-3 px-6 whitespace-nowrap">
                            {isToday ? (
                              <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">
                                {language === "id" ? "Hari Ini" : "Today"}
                              </span>
                            ) : null}
                            <span className={isToday ? "text-primary font-bold" : "text-foreground"}>
                              {formattedDate()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-medium">{row.imsak || "—"}</td>
                          <td className="py-3 px-3 text-center font-mono font-medium">{row.subuh || "—"}</td>
                          <td className="py-3 px-3 text-center font-mono font-medium">{row.terbit || "—"}</td>
                          <td className="py-3 px-3 text-center font-mono font-medium">{row.dhuha || "—"}</td>
                          <td className="py-3 px-3 text-center font-mono font-medium">{row.dzuhur || "—"}</td>
                          <td className="py-3 px-3 text-center font-mono font-medium">{row.ashar || "—"}</td>
                          <td className="py-3 px-3 text-center font-mono font-medium">{row.maghrib || "—"}</td>
                          <td className="py-3 px-4 text-center font-mono font-medium">{row.isya || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border py-8 mt-16 bg-card-bg/10 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
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
            <span className="hidden sm:block text-card-border">·</span>
            <div className="flex items-center gap-4">
              <a
                href="https://equran.id"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
              >
                {t("sumberApi")} (equran.id)
              </a>
              <span>•</span>
              <span className="text-primary font-medium">{t("readListenTadabbur")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
