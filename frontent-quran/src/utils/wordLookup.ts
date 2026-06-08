export interface QuranWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  text_uthmani: string;
  location: string;
  translationId: string;
  translationEn: string;
  transliteration: string;
}

export interface MorphologyTag {
  code: string;
  category: string;
  meaning: string;
  user_meaning?: string;
}

export interface WordMorphology {
  location: string;
  text: string;
  root: string | null;
  pos: string | null; // Isim, Fi'il, Harf
  posDetails: string | null;
  allTags: MorphologyTag[];
}

const verseWordsCache: Record<string, QuranWord[]> = {};
const morphologyCache: Record<string, WordMorphology | null> = {};

/**
 * Fetch and combine Indonesian and English word details for a given verse key (surah:ayah)
 */
export async function getVerseWords(surah: number, ayah: number): Promise<QuranWord[]> {
  const verseKey = `${surah}:${ayah}`;
  if (verseWordsCache[verseKey]) {
    return verseWordsCache[verseKey];
  }

  try {
    const [resId, resEn] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&language=id&word_fields=text_uthmani,location`),
      fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&language=en&word_fields=text_uthmani,location`)
    ]);

    if (!resId.ok || !resEn.ok) {
      throw new Error(`Failed to fetch words for ${verseKey} (ID: ${resId.status}, EN: ${resEn.status})`);
    }

    const dataId = await resId.json();
    const dataEn = await resEn.json();

    const wordsId = dataId.verse?.words || [];
    const wordsEn = dataEn.verse?.words || [];

    const combinedWords: QuranWord[] = wordsId.map((wId: any, idx: number) => {
      const wEn = wordsEn[idx];
      return {
        id: wId.id,
        position: wId.position,
        audio_url: wId.audio_url,
        char_type_name: wId.char_type_name,
        text_uthmani: wId.text_uthmani || wId.text,
        location: wId.location,
        translationId: wId.translation?.text || "",
        translationEn: wEn?.translation?.text || "",
        transliteration: wId.transliteration?.text || ""
      };
    });

    verseWordsCache[verseKey] = combinedWords;
    return combinedWords;
  } catch (error) {
    console.error("Error in getVerseWords:", error);
    throw error;
  }
}

/**
 * Fetch morphological data from Quranhub API for a specific word location (surah:ayah:word)
 */
export async function getWordMorphology(location: string): Promise<WordMorphology | null> {
  if (morphologyCache[location] !== undefined) {
    return morphologyCache[location];
  }

  try {
    const res = await fetch(`https://api.quranhub.com/v1/morphology/word/${location}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch morphology for location ${location}: ${res.status}`);
    }

    const json = await res.json();
    if (json.code !== 200 || !json.data) {
      morphologyCache[location] = null;
      return null;
    }

    const data = json.data;
    const tagsByCategory = data.morphology?.tags_by_category || {};
    const allTags = data.morphology?.all_tags || [];

    // Extract Root letters (e.g. from Root category)
    let root: string | null = null;
    if (tagsByCategory.Root && tagsByCategory.Root.length > 0) {
      root = tagsByCategory.Root[0].code;
    }

    // Determine POS (Isim, Fi'il, Harf)
    let pos: string | null = null;
    let posDetails: string | null = null;

    if (tagsByCategory.Asma && tagsByCategory.Asma.length > 0) {
      pos = "Isim";
      posDetails = tagsByCategory.Asma.map((t: any) => t.user_meaning || t.meaning).join(", ");
    } else if (tagsByCategory.Afal && tagsByCategory.Afal.length > 0) {
      pos = "Fi'il";
      posDetails = tagsByCategory.Afal.map((t: any) => t.user_meaning || t.meaning).join(", ");
    } else if (tagsByCategory.Horof && tagsByCategory.Horof.length > 0) {
      pos = "Harf";
      posDetails = tagsByCategory.Horof.map((t: any) => t.user_meaning || t.meaning).join(", ");
    }

    const result: WordMorphology = {
      location,
      text: data.word?.text || "",
      root,
      pos,
      posDetails,
      allTags
    };

    morphologyCache[location] = result;
    return result;
  } catch (error) {
    console.error(`Error in getWordMorphology for ${location}:`, error);
    morphologyCache[location] = null;
    return null;
  }
}
