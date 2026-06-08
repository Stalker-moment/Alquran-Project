// Utility helpers for Quran Memorization Assistant (Hafalan progress)

export type MemorizedProgress = Record<number, number[]>;

const LOCAL_STORAGE_KEY = "quran-memorized-verses";

/**
 * Get the object of memorized verses mapping surahNumber to arrays of ayahNumbers
 */
export function getMemorizedVerses(): MemorizedProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Error parsing memorized progress:", err);
    return {};
  }
}

/**
 * Check if a specific verse is marked as memorized
 */
export function isVerseMemorized(surahNumber: number, ayahNumber: number): boolean {
  const progress = getMemorizedVerses();
  return progress[surahNumber]?.includes(ayahNumber) || false;
}

/**
 * Toggle memorized state for a specific verse
 */
export function toggleVerseMemorized(surahNumber: number, ayahNumber: number): boolean {
  if (typeof window === "undefined") return false;
  
  const progress = getMemorizedVerses();
  if (!progress[surahNumber]) {
    progress[surahNumber] = [];
  }
  
  const index = progress[surahNumber].indexOf(ayahNumber);
  let isNowMemorized = false;
  
  if (index > -1) {
    // Remove from array
    progress[surahNumber].splice(index, 1);
    isNowMemorized = false;
  } else {
    // Add to array
    progress[surahNumber].push(ayahNumber);
    // Sort array
    progress[surahNumber].sort((a, b) => a - b);
    isNowMemorized = true;
  }
  
  // Clean up empty surah arrays
  if (progress[surahNumber].length === 0) {
    delete progress[surahNumber];
  }
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Error saving memorized progress:", err);
  }
  
  return isNowMemorized;
}

/**
 * Get stats of memorized verses in a specific surah
 */
export function getSurahMemorizedStats(surahNumber: number, totalAyahs: number) {
  const progress = getMemorizedVerses();
  const count = progress[surahNumber]?.length || 0;
  const percent = totalAyahs > 0 ? Math.round((count / totalAyahs) * 100) : 0;
  return { count, percent };
}

/**
 * Get total count of memorized verses across all surahs
 */
export function getTotalMemorizedCount(): number {
  const progress = getMemorizedVerses();
  return Object.values(progress).reduce((acc, curr) => acc + (curr?.length || 0), 0);
}
