export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  indonesianName?: string;
  indonesianNameTranslation?: string;
}

export interface Ayah {
  number: number;
  text: string; // Arabic text
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  translation: string; // Combined translation
  audioUrl?: string; // Combined audio URL
  transliteration: string; // Latin transliteration
  teksLatin?: string; // Indonesian transliteration from equran.id
  surah?: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    indonesianName?: string;
  };
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: "text" | "audio";
  type: string;
}

import equran from "./equranClient";

const BASE_URL = "https://api.alquran.cloud/v1";
const EQURAN_BASE_URL = "https://equran.id/api/v2";

/**
 * Fetch helper with retries and exponential backoff
 */
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      console.warn(`Fetch failed with status ${response.status} for ${url}. Retrying (${i + 1}/${retries})...`);
    } catch (err) {
      console.warn(`Fetch error for ${url}:`, err, `. Retrying (${i + 1}/${retries})...`);
    }
    if (i < retries - 1) {
      await new Promise(res => setTimeout(res, delay * (i + 1)));
    }
  }
  return fetch(url, options);
}

export interface Provinsi {
  id: string;
  nama: string;
}

export interface KabKota {
  id: string;
  nama: string;
}

export interface JadwalShalatHari {
  tanggal: number | string;
  tanggal_lengkap?: string;
  hari?: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface JadwalImsakiyahHari {
  tanggal: number | string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface TafsirAyat {
  ayat: number;
  teks: string;
}

export interface TafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirAyat[];
}

// Popular reciters list
export const POPULAR_RECITERS = [
  { identifier: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  { identifier: "ar.sudais", name: "Abdurrahmaan As-Sudais" },
  { identifier: "ar.abdulsamad", name: "Abdul Basit Abdul Samad" },
  { identifier: "ar.mahermuaiqly", name: "Maher Al Muaiqly" },
  { identifier: "ar.ghamadi", name: "Saad Al-Ghamdi" },
];

// Popular translations list
export const POPULAR_TRANSLATIONS = [
  { identifier: "id.indonesian", name: "Bahasa Indonesia (Kemenag)" },
  { identifier: "en.sahih", name: "English (Sahih International)" },
  { identifier: "en.pickthall", name: "English (Pickthall)" },
  { identifier: "fr.hamidullah", name: "Français (Hamidullah)" },
  { identifier: "tr.ates", name: "Türkçe (Süleyman Ateş)" },
  { identifier: "de.aburida", name: "Deutsch (Abu Rida)" },
  { identifier: "es.cortes", name: "Español (Cortés)" },
  { identifier: "ru.kuliev", name: "Русский (Кулиiev)" },
  { identifier: "zh.jian", name: "简体中文 (Ma Jian)" },
  { identifier: "ja.katsu", name: "日本語 (Ryoichi Mita)" },
];

/**
 * Fetch list of all 114 Surahs
 */
export async function getSurahs(): Promise<Surah[]> {
  const [cloudRes, equranSurahs] = await Promise.all([
    fetchWithRetry(`${BASE_URL}/surah`).then(res => {
      if (!res.ok) throw new Error("Failed to fetch surah list");
      return res.json();
    }),
    fetchWithRetry(`${EQURAN_BASE_URL}/surat`).then(res => res.json()).then(json => json.data || []).catch(() => [])
  ]);
  
  const cloudSurahs = cloudRes.data;
  
  return cloudSurahs.map((surah: any) => {
    const equranSurah = equranSurahs.find((s: any) => s.nomor === surah.number);
    return {
      ...surah,
      indonesianName: equranSurah?.namaLatin || surah.englishName,
      indonesianNameTranslation: equranSurah?.arti || surah.englishNameTranslation
    };
  });
}

/**
 * Fetch a specific Surah with combined Arabic text, translation, and audio.
 * Merges the multiple editions response from api.alquran.cloud.
 */
export async function getSurahDetails(
  surahNumber: number,
  translationEdition: string = "id.indonesian",
  audioEdition: string = "ar.alafasy",
  useTajweed: boolean = false
): Promise<SurahDetail> {
  const arabicEdition = useTajweed ? "quran-tajweed" : "quran-uthmani";

  // Always fetch en.transliteration as 4th edition regardless of translation
  const editions = `${arabicEdition},${translationEdition},${audioEdition},en.transliteration`;

  // Fetch both Cloud API and equran SDK client in parallel
  const [cloudRes, equranSurah] = await Promise.all([
    fetchWithRetry(`${BASE_URL}/surah/${surahNumber}/editions/${editions}`).then(res => {
      if (!res.ok) throw new Error("Cloud API error");
      return res.json();
    }),
    fetchWithRetry(`${EQURAN_BASE_URL}/surat/${surahNumber}`).then(res => res.json()).then(json => json.data).catch(err => {
      console.warn("Direct equran fetch failed, falling back to standard transliteration:", err);
      return null;
    })
  ]);

  const data = cloudRes.data;
  const arabicData = data[0];
  const translationData = data[1];
  const audioData = data[2];
  const transliterationData = data[3]; // always index 3 — en.transliteration (academic style)

  const combinedAyahs: Ayah[] = arabicData.ayahs.map((ayah: any, index: number) => {
    return {
      number: ayah.number,
      text: ayah.text,
      numberInSurah: ayah.numberInSurah,
      juz: ayah.juz,
      manzil: ayah.manzil,
      page: ayah.page,
      ruku: ayah.ruku,
      hizbQuarter: ayah.hizbQuarter,
      sajda: ayah.sajda,
      translation: translationData?.ayahs[index]?.text || "",
      audioUrl: audioData?.ayahs[index]?.audio || undefined,
      // Academic transliteration — shown for English UI (e.g. "Al-ḥamdu lillāhi rabbi l-ʿālamīn")
      transliteration: transliterationData?.ayahs[index]?.text || "",
      // NU-style Indonesian transliteration — shown for Indonesian UI (e.g. "Alhamdulillahi rabbil 'aalamin")
      teksLatin: equranSurah?.ayat[index]?.teksLatin || "",
    };
  });

  return {
    number: arabicData.number,
    name: arabicData.name,
    englishName: arabicData.englishName,
    englishNameTranslation: arabicData.englishNameTranslation,
    numberOfAyahs: arabicData.numberOfAyahs,
    revelationType: arabicData.revelationType,
    ayahs: combinedAyahs,
    indonesianName: equranSurah?.namaLatin || undefined,
    indonesianNameTranslation: equranSurah?.arti || undefined,
  };
}

/**
 * Fetch available editions (translations or audio)
 */
export async function getEditions(format: "text" | "audio", type?: string): Promise<Edition[]> {
  let url = `${BASE_URL}/edition?format=${format}`;
  if (type) {
    url += `&type=${type}`;
  }
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch editions for format ${format}`);
  }
  const result = await response.json();
  return result.data;
}

export interface SearchResult {
  number: number;
  text: string;
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
  numberInSurah: number;
}

/**
 * Search the Quran for a keyword in a specific language edition
 */
export async function searchAyahs(keyword: string, language: string): Promise<SearchResult[]> {
  const edition = language === "id" ? "id.indonesian" : "en.sahih";
  const url = `${BASE_URL}/search/${encodeURIComponent(keyword)}/all/${edition}`;
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error("Failed to search verses");
  }
  const result = await response.json();
  return result.data?.matches || [];
}

// ─── Tafsir API Wrapper ─────────────────────────────────────────────────────────

/**
 * Fetch Tafsir of a specific Surah
 */
export async function getSurahTafsir(surahNumber: number): Promise<TafsirDetail> {
  const response = await fetchWithRetry(`${EQURAN_BASE_URL}/tafsir/${surahNumber}`);
  if (!response.ok) throw new Error("Failed to fetch tafsir");
  const json = await response.json();
  return json.data;
}

// ─── Shalat & Imsakiyah API ────────────────────────────────────────────────────

/**
 * Fetch list of all provinces in Indonesia
 */
export async function getShalatProvinsi(): Promise<string[]> {
  const response = await fetchWithRetry(`${EQURAN_BASE_URL}/shalat/provinsi`);
  if (!response.ok) throw new Error("Failed to fetch provinces");
  const json = await response.json();
  return json.data || [];
}

/**
 * Fetch list of all kabkota in a province
 */
export async function getShalatKabKota(provinsiName: string): Promise<string[]> {
  const response = await fetchWithRetry(`${EQURAN_BASE_URL}/shalat/kabkota`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provinsi: provinsiName }),
  });
  if (!response.ok) throw new Error("Failed to fetch kabkota list");
  const json = await response.json();
  return json.data || [];
}

/**
 * Fetch monthly prayer times for a city/regency
 */
export async function getJadwalShalat(
  provinsi: string,
  kabkota: string,
  bulan: number,
  tahun: number
): Promise<JadwalShalatHari[]> {
  const response = await fetchWithRetry(`${EQURAN_BASE_URL}/shalat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provinsi, kabkota, bulan, tahun }),
  });
  if (!response.ok) throw new Error("Failed to fetch prayer schedule");
  const json = await response.json();
  return json.data?.jadwal || [];
}

/**
 * Fetch list of imsakiyah provinces
 */
export async function getImsakiyahProvinsi(): Promise<string[]> {
  const response = await fetchWithRetry(`${EQURAN_BASE_URL}/imsakiyah/provinsi`);
  if (!response.ok) throw new Error("Failed to fetch imsakiyah provinces");
  const json = await response.json();
  return json.data || [];
}

/**
 * Fetch list of imsakiyah kabkota
 */
export async function getImsakiyahKabKota(provinsiName: string): Promise<string[]> {
  const response = await fetchWithRetry(`${EQURAN_BASE_URL}/imsakiyah/kabkota`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provinsi: provinsiName }),
  });
  if (!response.ok) throw new Error("Failed to fetch imsakiyah kabkota list");
  const json = await response.json();
  return json.data || [];
}

/**
 * Fetch imsakiyah Ramadhan schedule
 */
export async function getJadwalImsakiyah(provinsi: string, kabkota: string): Promise<JadwalImsakiyahHari[]> {
  const response = await fetchWithRetry(`${EQURAN_BASE_URL}/imsakiyah`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provinsi, kabkota }),
  });
  if (!response.ok) throw new Error("Failed to fetch imsakiyah schedule");
  const json = await response.json();
  return json.data?.imsakiyah || [];
}

// ─── Inspirational Quote ──────────────────────────────────────────────────────

export interface QuoteAyah {
  arabic: string;
  transliteration: string;
  translation: string;
  surahEnglishName: string;
  surahNumber: number;
  ayahNumber: number;
}

const INSPIRATIONAL_AYAH_REFS = [
  { surah: 94, ayah: 5 },   // Fa inna ma'al 'usri yusra
  { surah: 2, ayah: 286 },  // La yukallifullahu nafsan
  { surah: 13, ayah: 28 },  // Ala bidhikrillahi tatmainnul qulub
  { surah: 14, ayah: 7 },   // La'in shakartum la'azidannakum
  { surah: 3, ayah: 173 },  // Hasbunallah wa ni'mal wakeel
  { surah: 65, ayah: 3 },   // Wa man yatawakkal 'alallah
  { surah: 39, ayah: 53 },  // La taqnatu min rahmatillah
  { surah: 2, ayah: 152 },  // Fadhkuruni adhkurkum
  { surah: 3, ayah: 160 },  // In yansurkumullahu fa la ghaliba lakum
  { surah: 2, ayah: 45 },   // Was ta'inu bis sabri was salah
  { surah: 94, ayah: 6 },   // Inna ma'al 'usri yusra
  { surah: 55, ayah: 13 },  // Fa biayyi alai rabbikuma tukadhdhiban
];

export async function getRandomInspirationalAyah(language: string): Promise<QuoteAyah> {
  const ref = INSPIRATIONAL_AYAH_REFS[Math.floor(Math.random() * INSPIRATIONAL_AYAH_REFS.length)];
  const translationEdition = language === "id" ? "id.indonesian" : "en.sahih";
  const refStr = `${ref.surah}:${ref.ayah}`;

  const [arabicRes, translationRes, translitRes] = await Promise.all([
    fetchWithRetry(`${BASE_URL}/ayah/${refStr}/quran-uthmani`).then(r => r.json()),
    fetchWithRetry(`${BASE_URL}/ayah/${refStr}/${translationEdition}`).then(r => r.json()),
    fetchWithRetry(`${BASE_URL}/ayah/${refStr}/en.transliteration`).then(r => r.json()),
  ]);

  return {
    arabic: arabicRes.data.text,
    transliteration: translitRes.data.text,
    translation: translationRes.data.text,
    surahEnglishName: arabicRes.data.surah.englishName,
    surahNumber: ref.surah,
    ayahNumber: ref.ayah,
  };
}

// ─── Doa & Dzikir API ──────────────────────────────────────────────────────────

export interface DoaItem {
  id: number;
  grup: string;
  nama: string;
  ar: string;
  tr: string;
  idn: string;
  tentang: string;
  tag: string[];
}

export async function getDoaList(): Promise<DoaItem[]> {
  const response = await fetchWithRetry(`https://equran.id/api/doa`);
  if (!response.ok) throw new Error("Failed to fetch doa list");
  const json = await response.json();
  return json.data || [];
}

export async function getDoaDetail(id: number): Promise<DoaItem> {
  const response = await fetchWithRetry(`https://equran.id/api/doa/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch doa detail for id ${id}`);
  const json = await response.json();
  return json.data;
}

// ─── Vector Semantic Search API ────────────────────────────────────────────────

export interface VectorSearchResult {
  status: string;
  cari: string;
  jumlah: number;
  hasil: Array<{
    tipe: "surat" | "ayat" | "tafsir" | "doa";
    skor: number;
    relevansi: string;
    data: any;
  }>;
}

export async function searchVector(
  cari: string,
  batas: number = 5,
  tipe?: string[],
  skorMin?: number
): Promise<VectorSearchResult> {
  const body: any = { cari, batas };
  if (tipe) body.tipe = tipe;
  if (skorMin !== undefined) body.skorMin = skorMin;

  const response = await fetchWithRetry(`https://equran.id/api/vector`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to search vector");
  return response.json();
}

// ─── Juz API Helpers & Mappings ──────────────────────────────────────────────────

export interface JuzMapping {
  juzNumber: number;
  startSurah: string;
  startAyah: number;
  endSurah: string;
  endAyah: number;
  descriptionId: string;
  descriptionEn: string;
}

export const JUZ_MAPPINGS: JuzMapping[] = [
  { juzNumber: 1, startSurah: "Al-Fatihah", startAyah: 1, endSurah: "Al-Baqarah", endAyah: 141, descriptionId: "Al-Fatihah 1 - Al-Baqarah 141", descriptionEn: "Al-Fatihah 1 - Al-Baqarah 141" },
  { juzNumber: 2, startSurah: "Al-Baqarah", startAyah: 142, endSurah: "Al-Baqarah", endAyah: 252, descriptionId: "Al-Baqarah 142 - Al-Baqarah 252", descriptionEn: "Al-Baqarah 142 - Al-Baqarah 252" },
  { juzNumber: 3, startSurah: "Al-Baqarah", startAyah: 253, endSurah: "Ali 'Imran", endAyah: 92, descriptionId: "Al-Baqarah 253 - Ali 'Imran 92", descriptionEn: "Al-Baqarah 253 - Ali 'Imran 92" },
  { juzNumber: 4, startSurah: "Ali 'Imran", startAyah: 93, endSurah: "An-Nisa'", endAyah: 23, descriptionId: "Ali 'Imran 93 - An-Nisa' 23", descriptionEn: "Ali 'Imran 93 - An-Nisa' 23" },
  { juzNumber: 5, startSurah: "An-Nisa'", startAyah: 24, endSurah: "An-Nisa'", endAyah: 147, descriptionId: "An-Nisa' 24 - An-Nisa' 147", descriptionEn: "An-Nisa' 24 - An-Nisa' 147" },
  { juzNumber: 6, startSurah: "An-Nisa'", startAyah: 148, endSurah: "Al-Ma'idah", endAyah: 81, descriptionId: "An-Nisa' 148 - Al-Ma'idah 81", descriptionEn: "An-Nisa' 148 - Al-Ma'idah 81" },
  { juzNumber: 7, startSurah: "Al-Ma'idah", startAyah: 82, endSurah: "Al-An'am", endAyah: 110, descriptionId: "Al-Ma'idah 82 - Al-An'am 110", descriptionEn: "Al-Ma'idah 82 - Al-An'am 110" },
  { juzNumber: 8, startSurah: "Al-An'am", startAyah: 111, endSurah: "Al-A'raf", endAyah: 87, descriptionId: "Al-An'am 111 - Al-A'raf 87", descriptionEn: "Al-An'am 111 - Al-A'raf 87" },
  { juzNumber: 9, startSurah: "Al-A'raf", startAyah: 88, endSurah: "Al-Anfal", endAyah: 40, descriptionId: "Al-A'raf 88 - Al-Anfal 40", descriptionEn: "Al-A'raf 88 - Al-Anfal 40" },
  { juzNumber: 10, startSurah: "Al-Anfal", startAyah: 41, endSurah: "At-Tawbah", endAyah: 92, descriptionId: "Al-Anfal 41 - At-Tawbah 92", descriptionEn: "Al-Anfal 41 - At-Tawbah 92" },
  { juzNumber: 11, startSurah: "At-Tawbah", startAyah: 93, endSurah: "Hud", endAyah: 5, descriptionId: "At-Tawbah 93 - Hud 5", descriptionEn: "At-Tawbah 93 - Hud 5" },
  { juzNumber: 12, startSurah: "Hud", startAyah: 6, endSurah: "Yusuf", endAyah: 52, descriptionId: "Hud 6 - Yusuf 52", descriptionEn: "Hud 6 - Yusuf 52" },
  { juzNumber: 13, startSurah: "Yusuf", startAyah: 53, endSurah: "Ibrahim", endAyah: 52, descriptionId: "Yusuf 53 - Ibrahim 52", descriptionEn: "Yusuf 53 - Ibrahim 52" },
  { juzNumber: 14, startSurah: "Al-Hijr", startAyah: 1, endSurah: "An-Nahl", endAyah: 128, descriptionId: "Al-Hijr 1 - An-Nahl 128", descriptionEn: "Al-Hijr 1 - An-Nahl 128" },
  { juzNumber: 15, startSurah: "Al-Isra'", startAyah: 1, endSurah: "Al-Kahf", endAyah: 74, descriptionId: "Al-Isra' 1 - Al-Kahf 74", descriptionEn: "Al-Isra' 1 - Al-Kahf 74" },
  { juzNumber: 16, startSurah: "Al-Kahf", startAyah: 75, endSurah: "Ta-Ha", endAyah: 135, descriptionId: "Al-Kahf 75 - Ta-Ha 135", descriptionEn: "Al-Kahf 75 - Ta-Ha 135" },
  { juzNumber: 17, startSurah: "Al-Anbiya'", startAyah: 1, endSurah: "Al-Hajj", endAyah: 78, descriptionId: "Al-Anbiya' 1 - Al-Hajj 78", descriptionEn: "Al-Anbiya' 1 - Al-Hajj 78" },
  { juzNumber: 18, startSurah: "Al-Mu'minun", startAyah: 1, endSurah: "Al-Furqan", endAyah: 20, descriptionId: "Al-Mu'minun 1 - Al-Furqan 20", descriptionEn: "Al-Mu'minun 1 - Al-Furqan 20" },
  { juzNumber: 19, startSurah: "Al-Furqan", startAyah: 21, endSurah: "An-Naml", endAyah: 55, descriptionId: "Al-Furqan 21 - An-Naml 55", descriptionEn: "Al-Furqan 21 - An-Naml 55" },
  { juzNumber: 20, startSurah: "An-Naml", startAyah: 56, endSurah: "Al-'Ankabut", endAyah: 45, descriptionId: "An-Naml 56 - Al-'Ankabut 45", descriptionEn: "An-Naml 56 - Al-'Ankabut 45" },
  { juzNumber: 21, startSurah: "Al-'Ankabut", startAyah: 46, endSurah: "Al-Ahzab", endAyah: 30, descriptionId: "Al-'Ankabut 46 - Al-Ahzab 30", descriptionEn: "Al-'Ankabut 46 - Al-Ahzab 30" },
  { juzNumber: 22, startSurah: "Al-Ahzab", startAyah: 31, endSurah: "Ya-Sin", endAyah: 27, descriptionId: "Al-Ahzab 31 - Ya-Sin 27", descriptionEn: "Al-Ahzab 31 - Ya-Sin 27" },
  { juzNumber: 23, startSurah: "Ya-Sin", startAyah: 28, endSurah: "Az-Zumar", endAyah: 31, descriptionId: "Ya-Sin 28 - Az-Zumar 31", descriptionEn: "Ya-Sin 28 - Az-Zumar 31" },
  { juzNumber: 24, startSurah: "Az-Zumar", startAyah: 32, endSurah: "Fussilat", endAyah: 46, descriptionId: "Az-Zumar 32 - Fussilat 46", descriptionEn: "Az-Zumar 32 - Fussilat 46" },
  { juzNumber: 25, startSurah: "Fussilat", startAyah: 47, endSurah: "Al-Jathiyah", endAyah: 37, descriptionId: "Fussilat 47 - Al-Jathiyah 37", descriptionEn: "Fussilat 47 - Al-Jathiyah 37" },
  { juzNumber: 26, startSurah: "Al-Ahqaf", startAyah: 1, endSurah: "Adh-Dhariyat", endAyah: 30, descriptionId: "Al-Ahqaf 1 - Adh-Dhariyat 30", descriptionEn: "Al-Ahqaf 1 - Adh-Dhariyat 30" },
  { juzNumber: 27, startSurah: "Adh-Dhariyat", startAyah: 31, endSurah: "Al-Hadid", endAyah: 29, descriptionId: "Adh-Dhariyat 31 - Al-Hadid 29", descriptionEn: "Adh-Dhariyat 31 - Al-Hadid 29" },
  { juzNumber: 28, startSurah: "Al-Mujadilah", startAyah: 1, endSurah: "At-Tahrim", endAyah: 12, descriptionId: "Al-Mujadilah 1 - At-Tahrim 12", descriptionEn: "Al-Mujadilah 1 - At-Tahrim 12" },
  { juzNumber: 29, startSurah: "Al-Mulk", startAyah: 1, endSurah: "Al-Mursalat", endAyah: 50, descriptionId: "Al-Mulk 1 - Al-Mursalat 50", descriptionEn: "Al-Mulk 1 - Al-Mursalat 50" },
  { juzNumber: 30, startSurah: "An-Naba'", startAyah: 1, endSurah: "An-Nas", endAyah: 6, descriptionId: "An-Naba' 1 - An-Nas 6", descriptionEn: "An-Naba' 1 - An-Nas 6" },
];

export interface JuzDetail {
  juzNumber: number;
  ayahs: Ayah[];
}

export async function getJuzDetails(
  juzNumber: number,
  translationEdition: string = "id.indonesian",
  audioEdition: string = "ar.alafasy",
  useTajweed: boolean = false
): Promise<JuzDetail> {
  const arabicEdition = useTajweed ? "quran-tajweed" : "quran-uthmani";

  const [arabicRes, translationRes, audioRes, translitRes] = await Promise.all([
    fetchWithRetry(`${BASE_URL}/juz/${juzNumber}/${arabicEdition}`).then(r => {
      if (!r.ok) throw new Error("Failed to fetch Arabic Juz");
      return r.json();
    }),
    fetchWithRetry(`${BASE_URL}/juz/${juzNumber}/${translationEdition}`).then(r => {
      if (!r.ok) throw new Error("Failed to fetch translation Juz");
      return r.json();
    }),
    fetchWithRetry(`${BASE_URL}/juz/${juzNumber}/${audioEdition}`).then(r => {
      if (!r.ok) throw new Error("Failed to fetch audio Juz");
      return r.json();
    }),
    fetchWithRetry(`${BASE_URL}/juz/${juzNumber}/en.transliteration`).then(r => {
      if (!r.ok) throw new Error("Failed to fetch transliteration Juz");
      return r.json();
    }),
  ]);

  const arabicAyahs = arabicRes.data.ayahs;
  const translationAyahs = translationRes.data.ayahs;
  const audioAyahs = audioRes.data.ayahs;
  const translitAyahs = translitRes.data.ayahs;

  const combinedAyahs: Ayah[] = arabicAyahs.map((ayah: any, index: number) => {
    return {
      number: ayah.number,
      text: ayah.text,
      numberInSurah: ayah.numberInSurah,
      juz: ayah.juz,
      manzil: ayah.manzil,
      page: ayah.page,
      ruku: ayah.ruku,
      hizbQuarter: ayah.hizbQuarter,
      sajda: ayah.sajda,
      translation: translationAyahs[index]?.text || "",
      audioUrl: audioAyahs[index]?.audio || undefined,
      transliteration: translitAyahs[index]?.text || "",
      surah: ayah.surah,
    };
  });

  return {
    juzNumber,
    ayahs: combinedAyahs,
  };
}
