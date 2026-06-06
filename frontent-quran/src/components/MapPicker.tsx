"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes, FaMapMarkerAlt, FaCheck, FaSpinner } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";

// Dynamic import of Leaflet to avoid SSR issues
let L: typeof import("leaflet") | null = null;

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number, address: any) => void;
  onClose: () => void;
  language?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: any;
}

export default function MapPicker({
  initialLat = -6.2,
  initialLng = 106.816666,
  onConfirm,
  onClose,
  language = "id",
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [addressDisplay, setAddressDisplay] = useState<string>("");
  const [addressRaw, setAddressRaw] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const reverseGeocode = useCallback(
    async (newLat: number, newLng: number) => {
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json&accept-language=${language}`,
          { headers: { "User-Agent": "Alquran-Project-Client" } }
        );
        if (!res.ok) throw new Error("Reverse geocode failed");
        const data = await res.json();
        setAddressDisplay(data.display_name || "");
        setAddressRaw(data.address || {});
      } catch {
        setAddressDisplay(
          language === "id" ? "Lokasi tidak diketahui" : "Unknown location"
        );
      } finally {
        setGeocoding(false);
      }
    },
    [language]
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    async function initMap() {
      if (mapRef.current) return;

      L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Fix default icon path
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current!, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom pin icon using CSS
      const customIcon = L.divIcon({
        html: `<div style="
          width:28px;height:28px;
          background:#2dd4bf;
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 4px 14px rgba(0,0,0,0.45);
        "></div>`,
        className: "",
        iconAnchor: [14, 28],
        iconSize: [28, 28],
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        setLat(pos.lat);
        setLng(pos.lng);
        await reverseGeocode(pos.lat, pos.lng);
      });

      map.on("click", async (e: any) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
        setLat(newLat);
        setLng(newLng);
        await reverseGeocode(newLat, newLng);
      });

      mapRef.current = map;
      markerRef.current = marker;

      reverseGeocode(initialLat, initialLng);
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveToLocation = useCallback(
    (newLat: number, newLng: number) => {
      if (!mapRef.current || !markerRef.current) return;
      mapRef.current.setView([newLat, newLng], 14, { animate: true });
      markerRef.current.setLatLng([newLat, newLng]);
      setLat(newLat);
      setLng(newLng);
      reverseGeocode(newLat, newLng);
    },
    [reverseGeocode]
  );

  // My Location button
  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        moveToLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Nominatim search
  const doSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=7&countrycodes=id`,
        { headers: { "User-Agent": "Alquran-Project-Client" } }
      );
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSearchResults([]);
      setShowSuggestions(false);
    } finally {
      setSearching(false);
    }
  };

  // Debounced autocomplete on typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(false);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (val.trim().length >= 2) {
      searchDebounceRef.current = setTimeout(() => {
        doSearch(val);
      }, 400);
    } else {
      setSearchResults([]);
    }
  };

  // Manual search on Enter / button click
  const handleSearchBtn = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    doSearch(searchQuery);
  };

  const handleSearchSelect = (result: SearchResult) => {
    setShowSuggestions(false);
    setSearchResults([]);
    // Show only first part of address as query text
    const shortName =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.display_name.split(",")[0];
    setSearchQuery(shortName);
    moveToLocation(parseFloat(result.lat), parseFloat(result.lon));
  };

  // Close suggestions on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleConfirm = () => {
    onConfirm(lat, lng, addressRaw);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-3xl border border-card-border bg-card-bg shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-card-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary-glow border border-primary/20 flex items-center justify-center">
              <FaMapMarkerAlt className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-extrabold text-foreground text-base">
                {language === "id" ? "Pilih Lokasi di Peta" : "Pick Location on Map"}
              </h2>
              <p className="text-[11px] text-muted">
                {language === "id"
                  ? "Ketuk peta, seret pin, atau cari nama daerah"
                  : "Tap map, drag pin, or search an area"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-card-border bg-card-bg/60 flex items-center justify-center text-muted hover:text-foreground hover:bg-card-border/50 transition-all cursor-pointer"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Search Bar with Live Suggestions ── */}
        <div
          ref={searchBoxRef}
          className="px-4 py-3 border-b border-card-border/40 shrink-0 relative"
          style={{ zIndex: 999 }}
        >
          <div className="flex gap-2">
            {/* Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-3.5 w-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchBtn();
                  }
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSuggestions(true);
                }}
                placeholder={
                  language === "id"
                    ? "Cari kota, kecamatan, desa..."
                    : "Search city, district, village..."
                }
                className="w-full h-10 rounded-xl border border-card-border bg-card-bg/60 pl-9 pr-3 text-xs text-foreground placeholder-muted/60 focus:border-primary/70 focus:bg-card-bg/80 focus:outline-none transition-colors"
                autoComplete="off"
                spellCheck={false}
              />
              {/* Inline loading indicator */}
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-card-border border-t-primary" />
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearchBtn}
              disabled={searching || !searchQuery.trim()}
              className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <FaSearch className="h-3 w-3" />
              <span className="hidden sm:inline">
                {language === "id" ? "Cari" : "Search"}
              </span>
            </button>

            {/* My Location Button */}
            <button
              onClick={handleMyLocation}
              className="h-10 w-10 rounded-xl border border-card-border bg-card-bg/60 flex items-center justify-center text-primary hover:bg-primary-glow hover:border-primary/40 transition-all cursor-pointer shrink-0"
              title={language === "id" ? "Gunakan GPS Saya" : "Use My GPS"}
            >
              <MdMyLocation className="h-4 w-4" />
            </button>
          </div>

          {/* ── Live Suggestions Dropdown ── */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 rounded-2xl border border-card-border bg-background/98 backdrop-blur-lg shadow-2xl overflow-hidden"
              style={{ zIndex: 1000 }}
            >
              {/* Header row */}
              <div className="px-3 py-2 border-b border-card-border/40 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {language === "id" ? `${searchResults.length} Hasil Ditemukan` : `${searchResults.length} Results`}
                </span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <FaTimes className="h-2.5 w-2.5" />
                </button>
              </div>

              {/* Result list */}
              <div className="max-h-56 overflow-y-auto">
                {searchResults.map((r, i) => {
                  const city =
                    r.address?.city ||
                    r.address?.town ||
                    r.address?.village ||
                    "";
                  const province =
                    r.address?.state || r.address?.province || "";
                  const type = r.address?.suburb
                    ? "Kelurahan/Kecamatan"
                    : r.address?.village
                    ? "Desa"
                    : r.address?.town
                    ? "Kota/Kecamatan"
                    : r.address?.city
                    ? "Kota"
                    : "Lokasi";

                  return (
                    <button
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSearchSelect(r)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-primary-glow transition-colors group border-b border-card-border/20 last:border-0"
                    >
                      {/* Pin icon */}
                      <div className="mt-0.5 h-6 w-6 rounded-lg bg-primary-glow border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors">
                        <FaMapMarkerAlt className="h-2.5 w-2.5 text-primary group-hover:text-white transition-colors" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {city || r.display_name.split(",")[0]}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5 line-clamp-1">
                          {province
                            ? `${province} · ${type}`
                            : r.display_name}
                        </p>
                      </div>

                      {/* Km indicator placeholder */}
                      <span className="text-[9px] font-bold text-muted bg-card-border/40 px-1.5 py-0.5 rounded-md shrink-0 self-center">
                        {type.split("/")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results hint */}
          {!searching && showSuggestions && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
            <div className="absolute left-4 right-4 top-full mt-1 rounded-2xl border border-card-border bg-background/98 px-4 py-5 text-center shadow-xl"
              style={{ zIndex: 1000 }}
            >
              <p className="text-xs text-muted">
                {language === "id"
                  ? "Tidak ada hasil ditemukan. Coba kata kunci lain."
                  : "No results found. Try another keyword."}
              </p>
            </div>
          )}
        </div>

        {/* ── Map Area ── */}
        <div
          ref={mapContainerRef}
          className="flex-1"
          style={{ minHeight: "300px" }}
        />

        {/* ── Footer: address + confirm ── */}
        <div className="px-4 py-3.5 border-t border-card-border/60 bg-card-bg/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              {geocoding ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-card-border border-t-primary shrink-0" />
                  <span className="text-xs text-muted">
                    {language === "id" ? "Mencari alamat..." : "Finding address..."}
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-0.5">
                    {language === "id" ? "Lokasi Dipilih" : "Selected Location"}
                  </p>
                  <p className="text-xs text-foreground font-medium line-clamp-2 leading-snug">
                    {addressDisplay ||
                      (language === "id"
                        ? "Klik peta untuk memilih lokasi"
                        : "Click the map to select a location")}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={!addressRaw}
              className="shrink-0 flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary-glow/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheck className="h-3.5 w-3.5" />
              {language === "id" ? "Gunakan Lokasi" : "Use Location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
