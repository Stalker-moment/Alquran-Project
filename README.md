<div align="center">

# 🕌 Al-Qur'an Al-Kareem

### Modern Quran Viewer & Murottal Player

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Anime.js](https://img.shields.io/badge/Anime.js-4.4-FF6B6B?style=for-the-badge)](https://animejs.com)

**Aplikasi Al-Qur'an modern dengan tampilan premium — baca, dengar, dan tadabbur**

[🌐 Live Demo](http://localhost:3000) · [📋 Roadmap Fitur](./FEATURE_ROADMAP.md) · [🐛 Laporkan Bug](#)

</div>

---

## ✨ Fitur Unggulan

| Fitur | Deskripsi |
|-------|-----------|
| 📖 **Baca Al-Qur'an** | Semua 114 surah dengan teks Arab Uthmani |
| 🎵 **Murottal Player** | Audio murottal dengan 5 qori pilihan, auto-scroll, dan kontrol lengkap |
| 🔤 **Transliterasi Latin** | Ejaan latin gaya NU Indonesia (`quran.nu.or.id`) |
| 🌍 **Multibahasa** | Terjemahan dalam 10 bahasa (ID, EN, FR, TR, DE, ES, RU, ZH, JA, dll.) |
| 🎨 **Highlight Tajwid** | Warna-warni tajwid dengan tooltip keterangan hukum bacaan |
| 🔖 **Bookmark Ayat** | Simpan ayat favorit, tersimpan otomatis di browser |
| 📍 **Last Read** | Tracker posisi baca terakhir secara otomatis |
| 🔁 **Mode Repeat** | Ulangi ayat, surah, atau rentang ayat (Tahfidz mode) |
| 🤟 **Quran Isyarat** | Tampilan teks dengan font isyarat bahasa Arab |
| 🌙 **Multi Tema** | Dark, Light, dan Sepia mode |
| 🗂️ **Navigasi Juz** | Navigasi berdasarkan Juz 1–30 dengan daftar Juz kustom di homepage |
| 🌙 **Auto Dark Mode** | Ganti tema otomatis berdasarkan jam (18:00 - 06:00 tema gelap) |
| ✨ **Word Highlight** | Sorotan kata demi kata secara real-time sinkron dengan audio murottal |
| ☪️ **Asmaul Husna** | 99 nama Allah lengkap dengan arti 4 bahasa (ID, EN, TR, Urdu), keutamaan, dan referensi Qur'an |
| 📱 **Responsive** | Optimal di mobile, tablet, dan desktop |
| ⚡ **Pencarian Global** | Cari ayat berdasarkan kata kunci di seluruh Al-Qur'an |

---

## 🖼️ Tampilan

> Aplikasi menggunakan desain modern dengan glassmorphism, gradien, dan animasi halus.

- **Halaman Utama** — Grid surah dengan search bar dan hero banner
- **Halaman Baca** — Layout fokus dengan teks Arab besar, transliterasi, dan terjemahan
- **Audio Player** — Player sticky di bagian bawah dengan progress bar dan kontrol lengkap
- **Settings Panel** — Slide-out panel untuk semua preferensi membaca

---

## 🛠️ Tech Stack

```
Frontend Framework : Next.js 16.2.7 (Turbopack)
UI Library         : React 19
Language           : TypeScript 5
Styling            : TailwindCSS v4
Animasi            : Anime.js v4
Icons              : React Icons v5
State              : React Context API + localStorage
API                : alquran.cloud + equran.id
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
        │   ├── page.tsx            # Halaman utama (daftar surah)
        │   ├── layout.tsx          # Root layout & provider
        │   ├── globals.css         # Design system & Tajwid colors
        │   └── surah/
        │       └── [number]/
        │           └── page.tsx    # Halaman baca per surah
        │
        ├── components/
        │   ├── AudioPlayer.tsx     # Murottal player (sticky bottom)
        │   ├── Navbar.tsx          # Navigation bar
        │   ├── SettingsPanel.tsx   # Slide-out settings
        │   └── SurahCard.tsx       # Kartu surah di homepage
        │
        ├── context/
        │   └── LanguageContext.tsx # Multi-language state & translations
        │
        └── utils/
            └── api.ts              # API functions & TypeScript interfaces
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

## 🌐 Sumber API

Aplikasi menggunakan API publik dan gratis — **tidak perlu API key**:

| API | URL | Kegunaan |
|-----|-----|----------|
| **alquran.cloud** | `https://api.alquran.cloud/v1` | Teks Arab, terjemahan, audio murottal, tajwid |
| **equran.id** | `https://equran.id/api/v2` | Nama surah bahasa Indonesia, transliterasi latin NU-style |

### Endpoint Utama yang Digunakan

```
GET /surah                                        → Daftar 114 surah
GET /surah/{number}/editions/{editions}           → Detail surah + terjemahan + audio
GET /search/{keyword}/all/{edition}               → Pencarian ayat global
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
| **Tema** | Dark / Light / Sepia |
| **Bahasa UI** | Indonesia / English |
| **Terjemahan** | 10 bahasa tersedia |
| **Qori** | 5 reciter tersedia |
| **Ukuran Font Arab** | Slider 24px – 56px |
| **Ukuran Font Terjemahan** | Slider 12px – 24px |
| **Tampilkan Latin** | On / Off |
| **Highlight Tajwid** | On / Off |
| **Tampilkan Isyarat** | On / Off |
| **Auto-Scroll Murottal** | On / Off |

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

Lihat file **[FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md)** untuk detail lengkap 12 fitur yang direncanakan, termasuk:

- [x] 🗂️ Navigasi Juz 1–30
- [x] 🌙 Auto Dark Mode Berdasarkan Waktu
- [x] 📊 Progress Tadarus Tracker
- [x] ✨ Word-by-Word Audio Highlight
- 🖥️ Mode Mushaf Full Screen
- 📖 Tafsir Singkat per Ayat
- 🧠 Mode Hafalan (Flashcard)
- 🖼️ Kartu Ayat untuk Share
- dan banyak lagi...

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

*Dibuat dengan ❤️ oleh **[sinyo @ tierkun](https://tierkun.com)** untuk kemudahan umat dalam membaca Al-Qur'an*

🌐 **Live:** [quran.tierkun.com](https://quran.tierkun.com)

API by [alquran.cloud](https://alquran.cloud) · [equran.id](https://equran.id)

</div>
