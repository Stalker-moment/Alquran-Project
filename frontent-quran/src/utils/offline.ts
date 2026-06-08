// Utility for caching and managing offline murottal audio using browser Cache Storage API

const CACHE_NAME = "quran-audio-offline";

// Memory cache to store and reuse generated Blob Object URLs to prevent leaks and repeat requests
const objectUrlCache: Record<string, string> = {};

function getLocalStorageKey(surahNumber: number, reciter: string): string {
  return `quran-offline-surah-${surahNumber}-${reciter}`;
}

export interface OfflineSurahMetadata {
  downloaded: boolean;
  surahNumber: number;
  surahName: string;
  reciter: string;
  ayahCount: number;
  urls: string[];
  timestamp: number;
}

/**
 * Download murottal audio for all ayahs in a Surah and store them in Cache Storage.
 */
export async function downloadSurahAudio(
  surahNumber: number,
  ayahs: { audioUrl?: string }[],
  reciter: string,
  surahName: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal
): Promise<void> {
  if (typeof window === "undefined") return;

  const cache = await caches.open(CACHE_NAME);
  const validAyahs = ayahs.filter(a => a.audioUrl);
  const total = validAyahs.length;
  
  if (total === 0) {
    onProgress(100);
    const metadata: OfflineSurahMetadata = {
      downloaded: true,
      surahNumber,
      surahName,
      reciter,
      ayahCount: 0,
      urls: [],
      timestamp: Date.now()
    };
    localStorage.setItem(getLocalStorageKey(surahNumber, reciter), JSON.stringify(metadata));
    return;
  }

  let downloadedCount = 0;
  const urls: string[] = [];

  for (const ayah of validAyahs) {
    if (signal?.aborted) {
      throw new DOMException("Download canceled", "AbortError");
    }

    if (!ayah.audioUrl) continue;
    urls.push(ayah.audioUrl);

    // Check if already in cache
    const matched = await cache.match(ayah.audioUrl);
    if (matched) {
      downloadedCount++;
      onProgress(Math.round((downloadedCount / total) * 100));
      continue;
    }

    try {
      const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(ayah.audioUrl)}`;
      const res = await fetch(proxyUrl, { signal });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      
      // Store in Cache API under the original URL
      await cache.put(ayah.audioUrl, res);
      downloadedCount++;
      onProgress(Math.round((downloadedCount / total) * 100));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      console.warn(`Failed to download audio for URL: ${ayah.audioUrl}`, err);
      // Increment count anyway so the progress bar moves and finishes
      downloadedCount++;
      onProgress(Math.round((downloadedCount / total) * 100));
    }
  }

  const metadata: OfflineSurahMetadata = {
    downloaded: true,
    surahNumber,
    surahName,
    reciter,
    ayahCount: total,
    urls,
    timestamp: Date.now()
  };
  localStorage.setItem(getLocalStorageKey(surahNumber, reciter), JSON.stringify(metadata));
}

/**
 * Delete cached murottal audio files for a Surah and clean up local memory cache.
 */
export async function deleteSurahAudio(
  surahNumber: number,
  ayahs: { audioUrl?: string }[] | undefined,
  reciter: string
): Promise<void> {
  if (typeof window === "undefined") return;

  const cache = await caches.open(CACHE_NAME);
  let urlsToDelete: string[] = [];

  // Try to use provided ayahs
  if (ayahs && ayahs.length > 0) {
    urlsToDelete = ayahs.filter(a => a.audioUrl).map(a => a.audioUrl) as string[];
  } else {
    // Read from localStorage metadata
    const metaStr = localStorage.getItem(getLocalStorageKey(surahNumber, reciter));
    if (metaStr && metaStr !== "true") {
      try {
        const meta = JSON.parse(metaStr);
        if (meta && meta.urls) {
          urlsToDelete = meta.urls;
        }
      } catch (e) {
        console.warn("Failed to parse metadata for deletion:", e);
      }
    }
  }

  // Deletion logic
  for (const url of urlsToDelete) {
    try {
      await cache.delete(url);
      if (objectUrlCache[url]) {
        URL.revokeObjectURL(objectUrlCache[url]);
        delete objectUrlCache[url];
      }
    } catch (e) {
      console.warn(`Failed to delete cache for URL: ${url}`, e);
    }
  }

  localStorage.removeItem(getLocalStorageKey(surahNumber, reciter));
}

/**
 * Check if the Surah has been marked as fully downloaded in localStorage.
 */
export function isSurahDownloaded(surahNumber: number, reciter: string): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(getLocalStorageKey(surahNumber, reciter));
  if (!val) return false;
  if (val === "true") return true;
  try {
    const parsed = JSON.parse(val);
    return !!(parsed && parsed.downloaded);
  } catch {
    return false;
  }
}

/**
 * Retrieve a local Object URL for cached audios, or null if not cached.
 */
export async function getCachedAudioUrl(audioUrl?: string): Promise<string | null> {
  if (typeof window === "undefined" || !audioUrl) return null;

  // Check memory cache first
  if (objectUrlCache[audioUrl]) {
    return objectUrlCache[audioUrl];
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const matched = await cache.match(audioUrl);
    if (!matched) return null;

    const blob = await matched.blob();
    const objectUrl = URL.createObjectURL(blob);
    objectUrlCache[audioUrl] = objectUrl; // Cache in memory
    return objectUrl;
  } catch (err) {
    console.warn("Failed to check cache for audio URL:", audioUrl, err);
    return null;
  }
}

/**
 * Retrieve list of all downloaded surahs from localStorage metadata
 */
export function getDownloadedSurahs(): OfflineSurahMetadata[] {
  if (typeof window === "undefined") return [];
  const downloads: OfflineSurahMetadata[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("quran-offline-surah-")) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          if (value === "true") {
            const parts = key.split("-");
            const surahNum = parseInt(parts[3]);
            const reciterIdentifier = parts.slice(4).join("-");
            downloads.push({
              downloaded: true,
              surahNumber: surahNum,
              surahName: `Surah ${surahNum}`,
              reciter: reciterIdentifier,
              ayahCount: 0,
              urls: [],
              timestamp: Date.now()
            });
          } else {
            const parsed = JSON.parse(value);
            if (parsed && parsed.downloaded) {
              downloads.push(parsed);
            }
          }
        } catch (e) {
          console.warn("Failed to parse metadata key:", key, e);
        }
      }
    }
  }
  return downloads.sort((a, b) => a.surahNumber - b.surahNumber);
}

/**
 * Get offline cache statistics (total size in MB, file count)
 */
export async function getOfflineCacheSize(): Promise<{ sizeMb: number; fileCount: number }> {
  if (typeof window === "undefined") return { sizeMb: 0, fileCount: 0 };
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    let totalSize = 0;
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
          totalSize += parseInt(contentLength, 10);
        } else {
          try {
            const blob = await response.clone().blob();
            totalSize += blob.size;
          } catch {
            // Ignore blob errors
          }
        }
      }
    }
    const sizeMb = parseFloat((totalSize / (1024 * 1024)).toFixed(2));
    return { sizeMb, fileCount: keys.length };
  } catch (err) {
    console.error("Failed to calculate cache size:", err);
    return { sizeMb: 0, fileCount: 0 };
  }
}

/**
 * Wipe all downloaded audio files from Cache Storage and localStorage
 */
export async function clearAllOfflineAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  
  await caches.delete(CACHE_NAME);
  
  for (const url in objectUrlCache) {
    try {
      URL.revokeObjectURL(objectUrlCache[url]);
    } catch {}
    delete objectUrlCache[url];
  }
  
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("quran-offline-surah-")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
