import { Surah } from "./api";

export interface TadarusStats {
  totalVersesRead: number;
  totalPercent: number;
  completedSurahs: number;
  inProgressSurahs: number;
}

/**
 * Safely formatting local date to YYYY-MM-DD
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Update the read progress for a specific surah
 */
export function updateSurahProgress(surahNumber: number, ayahNumber: number): void {
  if (typeof window === "undefined" || !surahNumber || !ayahNumber) return;

  try {
    // 1. Update progress
    const progressKey = "quran-progress";
    const currentProgress: Record<number, number> = JSON.parse(localStorage.getItem(progressKey) || "{}");
    const existing = currentProgress[surahNumber] || 0;

    let hasChanged = false;
    if (ayahNumber > existing) {
      currentProgress[surahNumber] = ayahNumber;
      localStorage.setItem(progressKey, JSON.stringify(currentProgress));
      hasChanged = true;
    }

    // 2. Add today's date to reading history for streak calculations
    const historyKey = "quran-reading-history";
    const history: string[] = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const todayStr = getLocalDateString();

    if (!history.includes(todayStr)) {
      history.push(todayStr);
      localStorage.setItem(historyKey, JSON.stringify(history));
      hasChanged = true;
    }

    // 3. Dispatch global custom event if any updates occurred
    if (hasChanged) {
      window.dispatchEvent(new CustomEvent("quran-progress-updated"));
    }
  } catch (e) {
    console.error("Failed to update surah progress", e);
  }
}

/**
 * Get read progress for a single surah
 */
export function getSurahProgress(surahNumber: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const progress: Record<number, number> = JSON.parse(localStorage.getItem("quran-progress") || "{}");
    return progress[surahNumber] || 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Calculate the user's daily consecutive reading streak
 */
export function getDailyStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const history: string[] = JSON.parse(localStorage.getItem("quran-reading-history") || "[]");
    if (!history || history.length === 0) return 0;

    // Remove duplicates and sort in descending order (newest first)
    const sortedDates = Array.from(new Set(history)).sort((a, b) => b.localeCompare(a));
    
    const todayStr = getLocalDateString();
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const lastReadDate = sortedDates[0];
    // If the latest read is neither today nor yesterday, the streak is broken
    if (lastReadDate !== todayStr && lastReadDate !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    const currentDateToCheck = new Date(lastReadDate);

    // Keep checking consecutive days going backward
    while (true) {
      const expectedStr = getLocalDateString(currentDateToCheck);
      if (sortedDates.includes(expectedStr)) {
        streak++;
        // Decrement by 1 day
        currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (e) {
    console.error("Failed to calculate streak", e);
    return 0;
  }
}

/**
 * Retrieve overall tadarus statistics across all surahs
 */
export function getTadarusStats(surahs: Surah[]): TadarusStats {
  if (typeof window === "undefined" || !surahs || surahs.length === 0) {
    return { totalVersesRead: 0, totalPercent: 0, completedSurahs: 0, inProgressSurahs: 0 };
  }

  try {
    const progress: Record<number, number> = JSON.parse(localStorage.getItem("quran-progress") || "{}");
    let totalVersesRead = 0;
    let completedSurahs = 0;
    let inProgressSurahs = 0;

    surahs.forEach((surah) => {
      const readCount = progress[surah.number] || 0;
      if (readCount > 0) {
        const cappedRead = Math.min(readCount, surah.numberOfAyahs);
        totalVersesRead += cappedRead;
        if (cappedRead === surah.numberOfAyahs) {
          completedSurahs++;
        } else {
          inProgressSurahs++;
        }
      }
    });

    const totalPercent = Math.min(100, parseFloat(((totalVersesRead / 6236) * 100).toFixed(2)));

    return {
      totalVersesRead,
      totalPercent,
      completedSurahs,
      inProgressSurahs,
    };
  } catch (e) {
    console.error("Failed to compile progress stats", e);
    return { totalVersesRead: 0, totalPercent: 0, completedSurahs: 0, inProgressSurahs: 0 };
  }
}

/**
 * Reset all progress and streak records
 */
export function resetAllProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("quran-progress");
    localStorage.removeItem("quran-reading-history");
    window.dispatchEvent(new CustomEvent("quran-progress-updated"));
  } catch (e) {
    console.error("Failed to reset progress storage", e);
  }
}
