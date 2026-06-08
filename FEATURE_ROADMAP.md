# 🕌 Al-Qur'an Al-Kareem — Feature Roadmap v2.0

> Roadmap baru untuk eksekusi setelah semua 12 fitur v1.0 selesai.
> Dibuat: 2026-06-08 | Status saat ini: Semua fitur v1.0 ✅ SELESAI

---

## ✅ SELESAI (v1.0 — Semua Done)

- [x] Baca Al-Qur'an 114 surah (Uthmani, tajwid, transliterasi, terjemahan 10 bahasa)
- [x] Audio murottal 6+ Qori + auto-scroll + speed + repeat mode
- [x] Navigasi Juz 1–30
- [x] Highlight Tajwid (10 aturan, per kata)
- [x] Word-by-Word Highlight (sinkron audio)
- [x] Mode Mushaf Full Screen (imersif)
- [x] Pilihan Font Arabic (Uthmani, Hafs, Naskh, IndoPak)
- [x] Tafsir 3 sumber (Kemenag RI, Jalalain, Ibn Kathir)
- [x] Kartu Ayat Share (gradien kustom, download PNG)
- [x] Kamus Kata Arab (WordPopup dari Quran.com API)
- [x] Duo Reciter Mode (2 Qori bergantian per ayat)
- [x] Asisten Hafalan (Flashcard, Cloze Test, Full-Hide)
- [x] Download Audio Offline (Cache API + IndexedDB)
- [x] Media Download Manager (halaman `/downloads`)
- [x] Jadwal Shalat + Imsakiyah (GPS, peta interaktif)
- [x] Kumpulan Doa Harian
- [x] Progress Tadarus (streak, completion, statistik)
- [x] Asmaul Husna (99 nama, 4 bahasa)
- [x] Pencarian Ayat Global
- [x] Bookmark Ayat
- [x] Navbar Premium (glassmorphism, portal dropdown)
- [x] Footer Premium (4 kolom, API reference, legal)
- [x] Halaman Terms, Privacy, Cookies

---

## 🚀 ROADMAP v2.0 — Fitur yang Akan Dikerjakan

---

### 📂 PRIORITAS 1 — PWA & Infrastruktur

---

#### 1. 📱 PWA (Progressive Web App) — Installable

**Deskripsi:** Ubah aplikasi menjadi PWA agar bisa diinstall langsung ke home screen HP/desktop tanpa app store.

**Detail implementasi:**
- Tambahkan `manifest.json` dengan icon, theme-color, display: `standalone`
- Implementasi Service Worker dengan `next-pwa` atau custom SW
- Strategi cache: Cache-first untuk aset statis, network-first untuk API
- Tambah `offline.html` fallback jika tidak ada koneksi
- Daftarkan SW di `layout.tsx`
- Test instalasi di Chrome (desktop & Android) dan Safari (iOS)

**File yang perlu dibuat/diubah:**
- `public/manifest.json` ← baru
- `public/sw.js` ← service worker custom (atau generate via next-pwa)
- `public/icons/` ← icon 192x192 dan 512x512
- `src/app/layout.tsx` ← tambah `<link rel="manifest">`
- `next.config.ts` ← tambah PWA plugin config

---

#### 2. 🔔 Push Notification Waktu Shalat

**Deskripsi:** Notifikasi push otomatis di browser saat waktu shalat tiba (5 menit sebelumnya).

**Detail implementasi:**
- Minta permission `Notification` di halaman shalat
- Gunakan `setInterval` atau `setTimeout` untuk trigger notifikasi
- Hitung waktu shalat berikutnya dari data yang sudah ada
- Notifikasi berisi: nama shalat, waktu, dan countdown
- Simpan preferensi notifikasi di localStorage
- Toggle on/off di halaman shalat dan SettingsPanel

**File yang perlu dibuat/diubah:**
- `src/utils/notification.ts` ← baru, helper push notification
- `src/app/shalat/page.tsx` ← tambah permission request & toggle
- `src/components/SettingsPanel.tsx` ← tambah toggle notifikasi

---

### 📂 PRIORITAS 2 — Analytics & Statistik

---

#### 3. 📊 Statistik Tadarus Lanjutan (Heatmap + Grafik)

**Deskripsi:** Visualisasi data bacaan yang lebih kaya — heatmap aktivitas, tren mingguan, dan laporan bacaan.

**Detail implementasi:**
- **Heatmap GitHub-style:** Grid 52×7 menampilkan aktivitas tadarus per hari dalam setahun
- **Bar chart mingguan:** Berapa ayat dibaca per hari dalam 7 hari terakhir
- **Pie chart surah:** Distribusi surah yang sering dibaca
- **Rata-rata durasi baca** berdasarkan timestamp localStorage
- Gunakan library SVG murni (tidak perlu chart library besar) atau `recharts` (lightweight)
- Tambah tab baru di halaman `/progress`

**File yang perlu dibuat/diubah:**
- `src/app/progress/page.tsx` ← tambah section statistik lanjutan
- `src/utils/progress.ts` ← tambah fungsi `getDailyActivity()`, `getWeeklyStats()`
- `src/components/HeatmapChart.tsx` ← baru, komponen SVG heatmap

---

#### 4. 🏆 Sistem Gamifikasi (Badges & Achievements)

**Deskripsi:** Berikan badge/pencapaian kepada user untuk memotivasi konsistensi membaca.

**Badge yang direncanakan:**
| Badge | Kondisi |
|-------|---------|
| 🌱 Pemula | Membaca pertama kali |
| 📖 Rajin | 7 hari streak berturut-turut |
| 🔥 Konsisten | 30 hari streak |
| ⭐ Al-Fatihah | Surah Al-Fatihah selesai |
| 🏅 Juz Pertama | Juz 1 selesai |
| 🎯 Hafidz Pemula | 10 ayat ditandai hafal |
| 💎 Khatam | 114 surah selesai |

**Detail implementasi:**
- Simpan badge yang sudah diperoleh di localStorage
- Cek kondisi badge setiap kali user membaca/hafal
- Tampilkan notifikasi animasi saat badge baru diperoleh
- Tampilkan galeri badge di halaman `/progress`
- Badge yang belum diperoleh tampil grayscale/terkunci

**File yang perlu dibuat/diubah:**
- `src/utils/achievements.ts` ← baru, logic badge
- `src/app/progress/page.tsx` ← tambah section badge gallery
- `src/components/AchievementToast.tsx` ← baru, animasi badge unlock

---

### 📂 PRIORITAS 3 — Fitur Sosial & Komunitas

---

#### 5. 👥 Halaqah Digital (Grup Tadarus)

**Deskripsi:** Fitur berbagi progress tadarus dalam kelompok kecil (tanpa backend — menggunakan URL sharing).

**Pendekatan tanpa backend:**
- Generate URL unik yang mengandung encode data progress user (base64 atau JSON di URL hash)
- Teman bisa buka URL tersebut untuk melihat progress
- Buat halaman `/halaqah` sebagai dashboard grup (data dari URL params)
- Fitur "Kirim Progress" → salin URL ke clipboard
- Tampilkan comparative progress antar anggota (dari URL data)

**File yang perlu dibuat/diubah:**
- `src/app/halaqah/page.tsx` ← baru
- `src/utils/shareProgress.ts` ← baru, encode/decode progress URL
- `src/components/Navbar.tsx` ← tambah link halaqah di MORE_NAV

---

#### 6. 🗺️ Qibla Finder

**Deskripsi:** Kompas digital untuk menentukan arah kiblat berdasarkan lokasi GPS user.

**Detail implementasi:**
- Gunakan `DeviceOrientationEvent` untuk kompas digital
- Hitung sudut kiblat (Makkah) dari koordinat GPS user menggunakan formula Haversine
- Tampilkan kompas SVG animasi yang berputar real-time
- Fallback: tampilkan koordinat dan sudut jika kompas tidak tersedia
- Terintegrasi ke halaman `/shalat` sebagai tab baru

**File yang perlu dibuat/diubah:**
- `src/utils/qibla.ts` ← baru, kalkulasi arah kiblat
- `src/app/shalat/page.tsx` ← tambah tab "Arah Kiblat"
- `src/components/QiblaCompass.tsx` ← baru, komponen kompas SVG

---

### 📂 PRIORITAS 4 — Konten Islami Tambahan

---

#### 7. 📅 Kalender Hijriah

**Deskripsi:** Kalender Hijriah interaktif dengan konversi tanggal dan hari penting Islam.

**Detail implementasi:**
- Tampilkan tanggal Hijriah hari ini di widget kecil
- Konverter tanggal Masehi ↔ Hijriah
- Tandai hari-hari penting: Ramadhan, Idul Fitri, Idul Adha, Maulid Nabi, dll.
- Mini widget di landing page / halaman shalat
- API: `https://api.aladhan.com/v1/gToH` untuk konversi

**File yang perlu dibuat/diubah:**
- `src/utils/hijri.ts` ← baru, kalkulasi & fetch kalender Hijriah
- `src/components/HijriWidget.tsx` ← baru, widget tanggal Hijriah
- `src/app/shalat/page.tsx` ← embed HijriWidget
- `src/app/page.tsx` ← embed mini widget di hero section

---

#### 8. 📿 Dzikir Counter (Tasbih Digital)

**Deskripsi:** Tasbih digital untuk menghitung dzikir harian dengan target dan statistik.

**Detail implementasi:**
- Tampilan tasbih bulat besar dengan animasi klik
- Pilihan dzikir: Subhanallah, Alhamdulillah, Allahuakbar, Istighfar, Sholawat, custom
- Target per sesi (misal: 33x, 100x)
- Simpan statistik harian di localStorage
- Vibrate API untuk feedback haptik di mobile
- Halaman `/dzikir`

**File yang perlu dibuat/diubah:**
- `src/app/dzikir/page.tsx` ← baru, halaman tasbih digital
- `src/components/Navbar.tsx` ← tambah link dzikir di MORE_NAV
- `src/context/LanguageContext.tsx` ← tambah label dzikir

---

#### 9. 🎙️ Murotal Radio (Streaming)

**Deskripsi:** Streaming radio murottal online dari berbagai stasiun radio Qur'an internasional.

**Detail implementasi:**
- Daftar stasiun radio murottal (Quran.fm, Albayan Radio, dll)
- Player sederhana dengan play/pause dan pilihan stasiun
- Tidak butuh API khusus — cukup streaming dari URL publik
- Terintegrasi ke halaman baru `/radio`

**Stream URL yang tersedia:**
```
Quran.fm (Alafasy)  : http://stream.quran.fm/quran/alafasy
Saudi Radio Quran   : http://mn1.makkah-live.com:8002/
Albayan Radio       : http://albayan-radio.com:8000/
```

**File yang perlu dibuat/diubah:**
- `src/app/radio/page.tsx` ← baru
- `src/components/Navbar.tsx` ← tambah link radio di MORE_NAV

---

### 📂 PRIORITAS 5 — UX & Aksesibilitas

---

#### 10. ♿ Mode Aksesibilitas

**Deskripsi:** Peningkatan aksesibilitas untuk pengguna dengan kebutuhan khusus.

**Detail implementasi:**
- **Ukuran teks super besar** (mode lansia) — ukuran font Arab 64px+
- **High contrast mode** — warna kontras tinggi untuk low-vision
- **Screen reader support** — ARIA labels lengkap di semua komponen interaktif
- **Keyboard navigation** — semua fitur bisa diakses tanpa mouse
- Tambah toggle di SettingsPanel

**File yang perlu dibuat/diubah:**
- `src/app/globals.css` ← tambah `[data-theme="high-contrast"]` variables
- `src/components/SettingsPanel.tsx` ← tambah toggle accessibility mode
- `src/components/Navbar.tsx` ← perbaiki ARIA labels

---

#### 11. 🌐 Multi-Bahasa UI Diperluas

**Deskripsi:** Perluas UI language support ke bahasa Arab dan Melayu.

**Detail implementasi:**
- Tambah `ar` (Arabic) ke `UI_TRANSLATIONS` dengan RTL support
- Tambah `ms` (Malay/Bahasa Malaysia)
- Saat bahasa Arab aktif: layout seluruh app jadi RTL
- Navbar, footer, semua label ikut berubah
- Perbaiki alignment semua komponen untuk RTL

**File yang perlu dibuat/diubah:**
- `src/context/LanguageContext.tsx` ← tambah `ar` dan `ms` translations
- `src/app/globals.css` ← tambah RTL utilities
- `src/app/layout.tsx` ← `dir="rtl"` saat bahasa Arab

---

#### 12. 🔍 Pencarian Lanjutan (Filter & Semantik)

**Deskripsi:** Tingkatkan halaman pencarian dengan filter tema dan pencarian semantik sederhana.

**Detail implementasi:**
- Filter berdasarkan **tema/topik** (Tauhid, Shalat, Sabar, Rezeki, dll)
- Filter berdasarkan **Juz** dan **Surah**
- Tampilkan **preview ayat sebelum dan sesudah** hasil pencarian (konteks)
- **Riwayat pencarian** tersimpan di localStorage
- Highlight kata kunci di hasil pencarian

**File yang perlu dibuat/diubah:**
- `src/app/cari/page.tsx` ← tambah filter UI dan logika
- `src/utils/api.ts` ← tambah helper pencarian dengan filter
- `src/context/LanguageContext.tsx` ← tambah label filter baru

---

## 📅 Urutan Eksekusi yang Disarankan

```
Sesi 1 (besok):
  [1] PWA Installable           ← Impact tinggi, user experience langsung terasa
  [2] Push Notification Shalat  ← Sangat berguna, lengkap dengan PWA

Sesi 2:
  [6] Qibla Finder              ← Fitur shalat yang melengkapi
  [7] Kalender Hijriah          ← Widget informasi bermanfaat
  [8] Dzikir Counter            ← Fitur harian, simpel tapi powerful

Sesi 3:
  [3] Statistik Lanjutan        ← Heatmap & grafik yang visual
  [4] Gamifikasi / Badge        ← Motivasi konsistensi user

Sesi 4:
  [9] Murotal Radio             ← Fitur streaming ringan
  [12] Pencarian Lanjutan       ← UX improvement pencarian

Sesi 5:
  [5] Halaqah Digital           ← Fitur sosial tanpa backend
  [10] Mode Aksesibilitas       ← Inklusivitas
  [11] Multi-Bahasa UI          ← RTL Arabic support
```

---

## 📝 Catatan Teknis

- **PWA:** Gunakan `next-pwa` (simpel) atau custom SW dengan Workbox
- **Notifikasi:** `Notification API` bawaan browser, tidak perlu Firebase
- **Heatmap:** Implementasi SVG murni tanpa chart library eksternal
- **Qibla:** Formula Haversine + `DeviceOrientationEvent` (perlu HTTPS)
- **Kalender Hijriah:** API `api.aladhan.com` (gratis, tanpa key)
- **Dzikir:** Pure React state + Vibrate API (mobile only)
- **Radio:** Cukup `<audio>` HTML biasa dengan stream URL
- **State:** Tetap pakai `localStorage` + React Context, tidak perlu Redux/Zustand
- **Styling:** TailwindCSS v4 + CSS Variables yang sudah ada

---

## 🛠️ API Tambahan yang Akan Digunakan

| API | URL | Kegunaan |
|-----|-----|----------|
| **aladhan.com** | `https://api.aladhan.com/v1` | Konversi kalender Hijriah |
| **Quran.fm** | `http://stream.quran.fm/quran/` | Streaming radio murottal |
| **Browser Notification API** | Built-in | Push notification shalat |
| **Device Orientation API** | Built-in | Kompas Qibla |
| **Vibration API** | Built-in | Feedback haptik Dzikir |

---

*Last updated: 2026-06-08 | by Antigravity AI*
*v1.0 — 12 fitur selesai ✅ | v2.0 — 12 fitur baru direncanakan 🚀*
