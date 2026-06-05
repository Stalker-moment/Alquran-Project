# 🕌 Al-Qur'an Al-Kareem — Feature Roadmap

> Dokumen ini berisi semua ide fitur yang akan diimplementasikan ke depannya.
> Dibuat: 2026-06-05

---

## ✅ Fitur yang Sudah Ada (Done)

- [x] Baca Al-Qur'an semua 114 surah
- [x] Terjemahan multibahasa (Indonesia, Inggris, Prancis, Turki, Jerman, Spanyol, Rusia, China, Jepang)
- [x] Audio murottal dengan auto-scroll
- [x] Pilihan Qori/Reciter
- [x] Latin/transliterasi (gaya NU untuk Indonesia)
- [x] Highlight Tajwid dengan tooltip keterangan
- [x] Bookmark ayat (localStorage)
- [x] Last-read tracker
- [x] Fitur Isyarat (Arabic Sign Language font)
- [x] Mode repeat: Ayat, Surah, Range (Tahfidz)
- [x] Pencarian ayat global
- [x] Multi-theme: Dark, Light, Sepia
- [x] Navigasi Surah & Ayah custom dropdown
- [x] Responsive mobile + desktop
- [x] Nama & terjemahan surah dalam Bahasa Indonesia

---

## 🚀 Fitur yang Akan Dibuat

---

### 📂 PRIORITAS 1 — High Impact

---

#### 1. 🗂️ Halaman Navigasi Juz
**Deskripsi:** Navigasi berdasarkan Juz 1–30, tidak hanya per surah.

**Detail implementasi:**
- Tambah halaman `/juz/[number]` (1–30)
- Fetch API: `https://api.alquran.cloud/v1/juz/{juzNumber}/quran-uthmani`
- Tampilkan daftar Juz di halaman utama (tab/toggle: "Surah" | "Juz")
- Setiap Juz menampilkan nama surah yang tercakup + range ayat
- Navigasi prev/next Juz di halaman baca

**File yang perlu dibuat/diubah:**
- `src/app/juz/[number]/page.tsx` ← baru
- `src/utils/api.ts` ← tambah `getJuzDetails()`
- `src/app/page.tsx` ← tambah tab "Juz" di samping list surah
- `src/context/LanguageContext.tsx` ← tambah label `juz`, `juzOf`, dll.

---

#### 2. 📊 Progress Tadarus Tracker
**Deskripsi:** Visualisasi berapa persen Al-Qur'an sudah dibaca oleh user.

**Detail implementasi:**
- Simpan progress per surah di `localStorage` (ayah terakhir dibaca)
- Halaman `/progress` atau section di homepage
- Tampilkan:
  - Overall progress bar (% dari total 6236 ayat)
  - Grid 114 surah dengan status: belum/sedang/selesai (warna berbeda)
  - Streak harian (berapa hari berturut-turut membaca)
  - Total ayat & surah yang sudah dibaca
- Reset progress option

**File yang perlu dibuat/diubah:**
- `src/app/progress/page.tsx` ← baru
- `src/utils/progress.ts` ← helper untuk hitung & simpan progress
- `src/app/page.tsx` ← tambah widget "Progress Saya" di hero section
- `src/components/Navbar.tsx` ← tambah link ke halaman progress

---

#### 3. ✨ Word-by-Word Highlight (Sinkron Audio)
**Deskripsi:** Setiap kata Arab di-highlight secara real-time mengikuti audio yang sedang diputar.

**Detail implementasi:**
- Gunakan API timing word-by-word dari `https://api.alqurancloud.com` atau data timing offline
- Alternatif: gunakan `everyayah.com` yang punya data timing per kata
- Saat audio play, `currentTime` audio dibandingkan dengan timestamp tiap kata
- Kata aktif diberi highlight dengan animasi fade/glow
- Toggle on/off di Settings

**File yang perlu dibuat/diubah:**
- `src/components/AudioPlayer.tsx` ← expose `currentTime` ke parent
- `src/app/surah/[number]/page.tsx` ← render kata per kata (split text)
- `src/utils/api.ts` ← tambah `getWordTimings(surahNum, ayahNum)`
- `src/app/globals.css` ← style highlight kata aktif

---

### 📂 PRIORITAS 2 — UX Enhancement

---

#### 4. 🖥️ Mode Mushaf Full Screen (Immersive Reading)
**Deskripsi:** Mode baca layar penuh tanpa elemen UI yang mengganggu (tanpa navbar, settings, dll).

**Detail implementasi:**
- Tombol "Mode Mushaf" di sticky header
- Saat aktif: sembunyikan navbar, settings panel, footer
- Tampilkan hanya teks Arab (besar) + nomor ayat + bismillah
- Tombol kecil untuk keluar dari mode mushaf
- Keyboard shortcut: `F` untuk toggle fullscreen mode
- Animasi transisi masuk/keluar dengan Anime.js

**File yang perlu dibuat/diubah:**
- `src/app/surah/[number]/page.tsx` ← state `isMushafMode`
- `src/app/globals.css` ← class `.mushaf-mode` hide elemen UI

---

#### 5. 🔤 Pilihan Font Arabic
**Deskripsi:** User dapat memilih font Arab sesuai preferensi.

**Font yang tersedia:**
| Font | Identifier | Karakter |
|------|-----------|----------|
| Uthmani (Default) | `quran-uthmani` | Standar mushaf Indonesia |
| Hafs | `hafs` | Gaya Timur Tengah |
| Naskh | `naskh` | Klasik, mudah dibaca |
| Indopak | `indopak` | Populer di Asia Selatan |

**Detail implementasi:**
- Tambah dropdown font di SettingsPanel
- Simpan pilihan ke `localStorage`
- Load Google Fonts / local font sesuai pilihan
- Ubah class `font-arabic` secara dinamis

**File yang perlu dibuat/diubah:**
- `src/components/SettingsPanel.tsx` ← tambah selector font
- `src/app/globals.css` ← tambah font face definitions
- `src/context/LanguageContext.tsx` ← tambah label

---

#### 6. 🌙 Auto Dark Mode Berdasarkan Waktu
**Deskripsi:** Tema otomatis berganti berdasarkan jam (siang = light, malam = dark).

**Detail implementasi:**
- Deteksi jam saat app load
- Jam 06:00–17:59 → Light/Sepia
- Jam 18:00–05:59 → Dark
- Bisa di-override manual di Settings
- Toggle "Auto Theme" on/off

**File yang perlu dibuat/diubah:**
- `src/components/SettingsPanel.tsx` ← tambah toggle auto theme
- `src/app/layout.tsx` ← inject auto theme logic

---

### 📂 PRIORITAS 3 — Audio Lanjutan

---

#### 7. 🔀 Perbandingan 2 Qori
**Deskripsi:** Dengarkan 2 reciter secara bergantian per ayat untuk belajar makhraj.

**Detail implementasi:**
- Di AudioPlayer, tambah mode "Duo Reciter"
- Pilih Reciter A dan Reciter B
- Tiap ayat: putar Reciter A → selesai → putar Reciter B → lanjut ayat berikutnya
- UI: dua avatar reciter, yang sedang aktif di-highlight

**File yang perlu dibuat/diubah:**
- `src/components/AudioPlayer.tsx` ← tambah `reciterB` dan logika duo play
- `src/components/SettingsPanel.tsx` ← tambah selector reciter kedua

---

#### 8. 📥 Download Audio Offline
**Deskripsi:** Simpan file MP3 murottal per surah untuk diputar tanpa internet.

**Detail implementasi:**
- Tombol download di header surah
- Fetch semua URL audio ayat, zip menggunakan `jszip`
- Progress bar saat download
- Simpan ke IndexedDB / Service Worker cache
- Indikator "Tersimpan Offline" di surah card

**File yang perlu dibuat/diubah:**
- `src/utils/offline.ts` ← helper download & cache audio
- `src/app/surah/[number]/page.tsx` ← tombol download
- `next.config.ts` ← tambah PWA config (next-pwa)

---

### 📂 PRIORITAS 4 — Konten & Edukasi

---

#### 9. 📖 Tafsir Singkat per Ayat
**Deskripsi:** Tampilkan tafsir ringkas di bawah terjemahan.

**Sumber API:**
- `https://api.alquran.cloud/v1/ayah/{ref}/editions/id.muntakhab` (Tafsir Muntakhab)
- Atau fetch dari quran.kemenag.go.id

**Detail implementasi:**
- Toggle "Tampilkan Tafsir" di Settings
- Fetch on-demand (lazy load saat user klik "Baca Tafsir")
- Tampil sebagai expandable section di bawah terjemahan
- Pilihan tafsir: Kemenag, Jalalain, Ibnu Katsir (ringkasan)

**File yang perlu dibuat/diubah:**
- `src/utils/api.ts` ← tambah `getTafsir(surahNum, ayahNum, edition)`
- `src/app/surah/[number]/page.tsx` ← tambah tafsir section per ayat
- `src/components/SettingsPanel.tsx` ← toggle show tafsir

---

#### 10. 📚 Kamus Kata Arab (Word Lookup)
**Deskripsi:** Klik kata Arab → popup arti kata + info gramatikal.

**Sumber data:**
- API Quranic Arabic Corpus: `http://api.quran.com/api/v4/words`
- atau `https://api.qurancdn.com`

**Detail implementasi:**
- Split teks Arab per kata (berdasarkan spasi)
- Setiap kata dibungkus `<span>` yang bisa diklik
- Klik kata → popup/modal muncul berisi:
  - Transliterasi kata
  - Arti kata (Indonesia/Inggris)
  - Bentuk gramatikal (isim/fi'il/harf)
  - Jumlah kemunculan di Al-Qur'an
- Kompatibel dengan mode Tajwid

**File yang perlu dibuat/diubah:**
- `src/utils/wordLookup.ts` ← fetch data kata
- `src/components/WordPopup.tsx` ← baru, komponen popup
- `src/app/surah/[number]/page.tsx` ← render kata per kata dengan klik handler

---

#### 11. 🖼️ Kartu Ayat untuk Dibagikan (Quote Share)
**Deskripsi:** Generate gambar kartu ayat yang indah untuk dibagikan ke media sosial.

**Detail implementasi:**
- Tombol "Bagikan" di setiap ayat
- Gunakan `html2canvas` atau `@vercel/og` untuk render kartu
- Template kartu: teks Arab besar + terjemahan + nama surah + nomor ayat
- Pilihan warna/tema kartu (dark, light, hijau, ungu)
- Download sebagai PNG atau langsung share via Web Share API

**File yang perlu dibuat/diubah:**
- `src/components/ShareCard.tsx` ← baru, komponen kartu
- `src/app/api/og/route.tsx` ← Next.js OG image generation
- `src/app/surah/[number]/page.tsx` ← tombol share per ayat

---

#### 12. 🧠 Mode Hafalan (Flashcard / Cloze Test)
**Deskripsi:** Sembunyikan sebagian kata ayat, user mengisi kelanjutannya.

**Detail implementasi:**
- Toggle "Mode Hafalan" di Settings
- Pilih surah yang ingin dihafal
- Mode tampilan:
  - **Cloze**: beberapa kata disembunyikan (misal setiap kata ke-3)
  - **Full Hide**: seluruh ayat disembunyikan, klik untuk reveal
  - **Flashcard**: tampil satu ayat, klik untuk flip ke terjemahan
- Skor hafalan tersimpan di localStorage
- Statistik: berapa ayat berhasil dihafal

**File yang perlu dibuat/diubah:**
- `src/app/hafalan/page.tsx` ← baru, halaman mode hafalan
- `src/components/FlashCard.tsx` ← baru, komponen flashcard
- `src/utils/hafalan.ts` ← logic cloze & scoring

---

## 📅 Urutan Eksekusi yang Disarankan

```
Minggu 1:  [1] Juz Navigation + [6] Auto Dark Mode
Minggu 2:  [2] Progress Tadarus Tracker
Minggu 3:  [3] Word-by-Word Highlight (Audio Sync)
Minggu 4:  [4] Mode Mushaf Full Screen + [5] Font Picker
Minggu 5:  [9] Tafsir Singkat + [11] Kartu Share
Minggu 6:  [12] Mode Hafalan (Flashcard)
Minggu 7:  [10] Kamus Kata Arab
Minggu 8:  [7] Duo Reciter + [8] Download Offline
```

---

## 📝 Catatan Teknis

- **API Utama:** `https://api.alquran.cloud/v1` (gratis, tanpa auth)
- **API Indonesia:** `https://equran.id/api/v2` (nama surah, latin NU-style)
- **Audio CDN:** `https://cdn.islamic.network/quran/audio/`
- **State Management:** Semua pakai React `useState` + `localStorage` (tanpa Redux)
- **Animasi:** Anime.js (sudah terpasang)
- **Styling:** TailwindCSS v4 (sudah terpasang)
- **Framework:** Next.js 16 (Turbopack)

---

*Last updated: 2026-06-05 | by Antigravity AI*
