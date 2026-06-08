<div align="center">

# 🕌 Al-Qur'an Al-Kareem

### Modern Quran Viewer · Murottal Player · Islamic Toolkit

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Anime.js](https://img.shields.io/badge/Anime.js-4.4-FF6B6B?style=for-the-badge)](https://animejs.com)

**Platform Al-Qur'an digital modern — baca, dengar, tadabbur, dan hafal.**

[🌐 Live Demo](http://localhost:3000) · [📋 Roadmap Fitur](./FEATURE_ROADMAP.md) · [🐛 Laporkan Bug](#)

</div>

---

## ✨ Fitur Unggulan (16+ Fitur)

| Fitur | Deskripsi |
|-------|-----------|
| 📖 **Baca Al-Qur'an** | Semua 114 surah dengan teks Arab Uthmani berkualitas tinggi |
| 🎵 **Murottal Player** | Audio murottal 6+ Qori pilihan, auto-scroll, speed control, repeat mode |
| 🔤 **Transliterasi Latin** | Ejaan latin gaya NU Indonesia (`quran.nu.or.id`) |
| 🌍 **Multibahasa** | Terjemahan dalam 10 bahasa (ID, EN, FR, TR, DE, ES, RU, ZH, JA, dll.) |
| 🎨 **Highlight Tajwid** | 10 aturan tajwid berwarna per kata dengan tooltip keterangan |
| 🔖 **Bookmark Ayat** | Simpan ayat favorit, tersimpan otomatis di browser localStorage |
| 📍 **Last Read** | Tracker posisi baca terakhir secara otomatis |
| 🔁 **Mode Repeat** | Ulangi ayat, surah, atau rentang ayat (Tahfidz mode) |
| 🤟 **Quran Isyarat** | Tampilan teks dengan font bahasa isyarat Arab |
| 🌙 **Multi Tema** | Dark, Light, dan Sepia — dengan auto dark mode berdasarkan jam |
| 🗂️ **Navigasi Juz** | Navigasi berdasarkan Juz 1–30 dengan custom dropdown & prev/next |
| ✨ **Word Highlight** | Sorotan kata demi kata real-time sinkron dengan audio murottal |
| 🖥️ **Mode Mushaf** | Mode baca full screen imersif tanpa distraksi UI |
| 🔤 **Pilihan Font Arab** | Uthmani, Hafs (Scheherazade), Naskh, IndoPak |
| 📖 **Tafsir 3 Sumber** | Kemenag RI, Tafsir Jalalain, dan Ibn Kathir — on-demand per ayat |
| 🖼️ **Kartu Ayat Share** | Generate kartu ayat indah untuk dibagikan ke media sosial |
| 📚 **Kamus Kata Arab** | Klik kata Arab → popup arti, transliterasi, dan info gramatikal |
| 🔀 **Duo Reciter** | Dengarkan 2 Qori bergantian per ayat untuk belajar makhraj |
| 🧠 **Asisten Hafalan** | Flashcard, cloze test, mode sembunyi penuh — hafalan mandiri |
| 📥 **Audio Offline** | Download murottal surah untuk diputar tanpa koneksi internet |
| 🕌 **Jadwal Shalat** | Jadwal shalat + imsakiyah se-Indonesia, GPS, peta interaktif |
| 🙏 **Doa Harian** | Kumpulan doa shahih lengkap dengan referensi hadits |
| ☪️ **Asmaul Husna** | 99 nama Allah dengan arti 4 bahasa, keutamaan, referensi Qur'an |
| 📊 **Progress Tadarus** | Statistik bacaan, streak harian, completion 114 surah |
| 🔍 **Pencarian Global** | Cari ayat berdasarkan kata kunci di seluruh Al-Qur'an |
| ⚖️ **Legal Pages** | Terms of Service, Privacy Policy, Cookie Policy |

---

## 🖼️ Tampilan

> Aplikasi menggunakan desain modern dengan glassmorphism, gradien, dan animasi halus.

- **Halaman Utama** — Hero landing + Quick Access Portal + Feature Showcase + Ayat Pilihan
- **Halaman Baca Surah** — Layout fokus dengan teks Arab besar, tajwid berwarna, transliterasi, terjemahan
- **Halaman Baca Juz** — Navigasi per Juz 1–30 dengan layout pembacaan yang sama
- **Halaman Shalat** — Jadwal shalat harian + bulanan + imsakiyah + peta GPS
- **Halaman Doa** — Kategorisasi doa, animasi flip card
- **Halaman Hafalan** — Flashcard interaktif + cloze test + statistik
- **Halaman Progress** — Heatmap surah, streak harian, statistik lengkap
- **Halaman Downloads** — Pengelola audio offline dengan progress bar
- **Halaman Asmaul Husna** — Grid 99 nama dengan detail popup
- **Audio Player** — Player sticky di bagian bawah dengan progress bar dan kontrol lengkap
- **Settings Panel** — Slide-out panel untuk semua preferensi membaca
- **Navbar** — Modern glassmorphism nav dengan dropdown "Lainnya" via React portal
- **Footer** — Premium 4-kolom dengan API reference, legal links, stats, GitHub

---

## 🛠️ Tech Stack

```
Frontend Framework : Next.js 16.2.7 (Turbopack)
UI Library         : React 19
Language           : TypeScript 5
Styling            : TailwindCSS v4
Animasi            : Anime.js v4
Icons              : React Icons v5
State              : React Context API + localStorage + Cache API (IndexedDB)
API                : alquran.cloud + equran.id + quran.com + myquran.com
```

---

## 📁 Struktur Project

```
Alquran-Project/
├── FEATURE_ROADMAP.md          # Rencana fitur ke depan
├── README.md                   # Dokumen ini
│
└── frontent-quran/             # Aplikasi Next.js
    ├── public/
    │   └── fonts/              # Font Arabic (Uthmani, Isyarat)
    │
    └── src/
        ├── app/
        │   ├── page.tsx                # Landing page utama
        │   ├── layout.tsx              # Root layout & provider
        │   ├── globals.css             # Design system & Tajwid colors
        │   ├── surah/[number]/         # Halaman baca per surah
        │   ├── juz/[number]/           # Halaman baca per juz
        │   ├── shalat/                 # Jadwal shalat & imsakiyah
        │   ├── doa/                    # Kumpulan doa harian
        │   ├── hafalan/                # Mode hafalan mandiri
        │   ├── progress/               # Progress tadarus tracker
        │   ├── downloads/              # Audio offline manager
        │   ├── asmaul-husna/           # 99 nama Allah
        │   ├── bookmark/               # Bookmark ayat
        │   ├── cari/                   # Pencarian global
        │   ├── terms/                  # Terms of Service
        │   ├── privacy/                # Privacy Policy
        │   └── cookies/                # Cookie Policy
        │
        ├── components/
        │   ├── AudioPlayer.tsx         # Murottal player (sticky bottom)
        │   ├── CustomSelect.tsx        # Portal-based select dropdown
        │   ├── FlashCard.tsx           # Hafalan flashcard
        │   ├── Footer.tsx              # Premium footer component
        │   ├── MapPicker.tsx           # GPS prayer time map
        │   ├── Navbar.tsx              # Modern glassmorphism navbar
        │   ├── SettingsPanel.tsx       # Slide-out settings panel
        │   ├── ShareModal.tsx          # Verse share card generator
        │   ├── SurahCard.tsx           # Surah list card
        │   ├── Toast.tsx               # Toast notification system
        │   └── WordPopup.tsx           # Arabic word lookup popup
        │
        ├── context/
        │   ├── LanguageContext.tsx     # Multi-language i18n state
        │   └── ToastContext.tsx        # Global toast notifications
        │
        └── utils/
            ├── api.ts                  # API functions & TypeScript interfaces
            ├── offline.ts              # Offline audio download & cache
            └── progress.ts             # Reading progress & streak logic
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** v18 atau lebih baru
- **npm** / **yarn** / **pnpm**

### Instalasi

```bash
# 1. Clone repository
git clone <repo-url>
cd Alquran-Project/frontent-quran

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build Production

```bash
# Build
npm run build

# Jalankan production server
npm start
```

---

## 🌐 Sumber API Open Source

Aplikasi menggunakan API publik dan gratis — **tidak perlu API key**:

| API | URL | Kegunaan |
|-----|-----|----------|
| **alquran.cloud** | `https://api.alquran.cloud/v1` | Teks Arab Uthmani, terjemahan 40+ bahasa, tajwid, audio |
| **equran.id** | `https://equran.id/api/v2` | Nama surah Indonesia, transliterasi NU-style, tafsir Kemenag |
| **quran.com (v4)** | `https://api.quran.com/api/v4` | Word-by-word, timing audio, segmen kata |
| **Islamic Network CDN** | `https://cdn.islamic.network` | CDN audio murottal berkualitas tinggi |

### Endpoint Utama yang Digunakan

```
GET /surah                                      → Daftar 114 surah
GET /surah/{number}/editions/{editions}         → Detail surah + terjemahan + audio
GET /search/{keyword}/all/{edition}             → Pencarian ayat global
GET /ayah/{ref}/editions/{editions}             → Tafsir per ayat
GET /api/v4/verses/by_key/{key}?words=true      → Word-by-word data
```

---

## 🎵 Pilihan Qori (Reciter)

| Nama | Identifier API |
|------|---------------|
| Mishary Rashid Alafasy | `ar.alafasy` |
| Abdurrahmaan As-Sudais | `ar.sudais` |
| Abdul Basit Abdul Samad | `ar.abdulsamad` |
| Maher Al Muaiqly | `ar.mahermuaiqly` |
| Saad Al-Ghamdi | `ar.ghamadi` |
| Hani Ar-Rifai | `ar.hanafi` |

---

## 🌍 Bahasa yang Didukung

| Bahasa | Kode Terjemahan |
|--------|----------------|
| 🇮🇩 Bahasa Indonesia | `id.indonesian` |
| 🇬🇧 English (Sahih International) | `en.sahih` |
| 🇬🇧 English (Pickthall) | `en.pickthall` |
| 🇫🇷 Français | `fr.hamidullah` |
| 🇹🇷 Türkçe | `tr.ates` |
| 🇩🇪 Deutsch | `de.aburida` |
| 🇪🇸 Español | `es.cortes` |
| 🇷🇺 Русский | `ru.kuliev` |
| 🇨🇳 简体中文 | `zh.jian` |
| 🇯🇵 日本語 | `ja.katsu` |

---

## ⚙️ Fitur Settings

Semua pengaturan tersimpan otomatis di `localStorage` browser:

| Setting | Opsi |
|---------|------|
| **Tema** | Dark / Light / Sepia / Auto (berdasarkan waktu) |
| **Bahasa UI** | Indonesia / English |
| **Terjemahan** | 10 bahasa tersedia |
| **Qori Utama** | 6 reciter tersedia |
| **Qori Kedua (Duo)** | 6 reciter tersedia |
| **Font Arab** | Uthmani / Hafs / Naskh / IndoPak |
| **Ukuran Font Arab** | Slider 24px – 56px |
| **Ukuran Font Terjemahan** | Slider 12px – 24px |
| **Tampilkan Latin** | On / Off |
| **Highlight Tajwid** | On / Off |
| **Tampilkan Isyarat** | On / Off |
| **Auto-Scroll Murottal** | On / Off |
| **Word-by-Word Highlight** | On / Off |
| **Mode Mushaf** | On / Off |
| **Duo Reciter** | On / Off |
| **Loop Range Ayat** | Ayat mulai → Ayat selesai |

---

## 🔁 Mode Repeat Murottal

Klik tombol 🔁 di player untuk berpindah mode:

| Mode | Ikon | Perilaku |
|------|------|----------|
| **None** | — | Putar berurutan, berhenti di akhir surah |
| **Ayah** | `1` | Ulangi satu ayat yang sedang diputar |
| **Surah** | `∞` | Ulangi seluruh surah dari awal |
| **Range** | `↔` | Ulangi rentang ayat tertentu (Tahfidz mode) |

---

## 📋 Rencana Fitur Selanjutnya

Lihat file **[FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md)** untuk detail lengkap roadmap baru.

---

## 🤝 Kontribusi

Pull request sangat disambut! Untuk perubahan besar, buka issue terlebih dahulu.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/NamaFitur`)
3. Commit perubahan (`git commit -m 'Add: NamaFitur'`)
4. Push ke branch (`git push origin feature/NamaFitur`)
5. Buka Pull Request

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan dakwah dan edukasi. Bebas digunakan dengan menyertakan atribusi.

---

<div align="center">

**بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**

*Dibuat dengan ❤️ untuk kemudahan umat dalam membaca Al-Qur'an*

🌐 **Live:** [quran.tierkun.com](https://quran.tierkun.com)

API by [alquran.cloud](https://alquran.cloud) · [equran.id](https://equran.id) · [quran.com](https://quran.com) · [islamic.network](https://islamic.network)

*Last updated: June 2026*

</div>
