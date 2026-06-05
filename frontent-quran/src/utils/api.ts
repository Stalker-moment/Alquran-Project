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

const BASE_URL = "https://api.alquran.cloud/v1";

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
  { identifier: "ru.kuliev", name: "Русский (Кулиев)" },
  { identifier: "zh.jian", name: "简体中文 (Ma Jian)" },
  { identifier: "ja.katsu", name: "日本語 (Ryoichi Mita)" },
];

/**
 * Fetch list of all 114 Surahs
 */
export async function getSurahs(): Promise<Surah[]> {
  const [cloudRes, equranRes] = await Promise.all([
    fetch(`${BASE_URL}/surah`).then(res => {
      if (!res.ok) throw new Error("Failed to fetch surah list");
      return res.json();
    }),
    fetch(`https://equran.id/api/v2/surat`).then(res => res.ok ? res.json() : null).catch(() => null)
  ]);
  
  const cloudSurahs = cloudRes.data;
  const equranSurahs = equranRes?.data || [];
  
  return cloudSurahs.map((surah: any, idx: number) => {
    const equranSurah = equranSurahs[idx];
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
  const isIndoEd = translationEdition === "id.indonesian";
  const editions = isIndoEd
    ? `${arabicEdition},${translationEdition},${audioEdition}`
    : `${arabicEdition},${translationEdition},${audioEdition},en.transliteration`;

  // Fetch both Cloud API and equran.id in parallel
  const [cloudRes, equranRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}/editions/${editions}`).then(res => {
      if (!res.ok) throw new Error("Cloud API error");
      return res.json();
    }),
    fetch(`https://equran.id/api/v2/surat/${surahNumber}`).then(res => {
      if (!res.ok) throw new Error("equran.id API error");
      return res.json();
    }).catch(err => {
      console.warn("equran.id failed, falling back to standard transliteration:", err);
      return null;
    })
  ]);

  const data = cloudRes.data;
  const arabicData = data[0];
  const translationData = data[1];
  const audioData = data[2];
  const transliterationData = isIndoEd ? null : data[3];
  const equranData = equranRes?.data;

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
      transliteration: transliterationData?.ayahs[index]?.text || "",
      teksLatin: equranData?.ayat[index]?.teksLatin || "",
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
    indonesianName: equranData?.namaLatin || undefined,
    indonesianNameTranslation: equranData?.arti || undefined,
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
  const response = await fetch(url);
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
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to search verses");
  }
  const result = await response.json();
  return result.data?.matches || [];
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

/** Famous, uplifting ayahs used as rotating quotes on the landing page */
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
    fetch(`${BASE_URL}/ayah/${refStr}/quran-uthmani`).then(r => r.json()),
    fetch(`${BASE_URL}/ayah/${refStr}/${translationEdition}`).then(r => r.json()),
    fetch(`${BASE_URL}/ayah/${refStr}/en.transliteration`).then(r => r.json()),
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
