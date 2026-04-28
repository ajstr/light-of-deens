import { fetchTanzilSurahAyahs } from "@/lib/tanzil-uthmani";
import { normalizeDisplayedArabicText } from "@/lib/arabic-text";
import DOMPurify from "dompurify";

// Quran metadata + English translation sourced from quran-json on jsDelivr
// Arabic verse text for the main reader sourced from Quran.com Imlaei text,
// normalized for a simpler display, with Tanzil Uthmani as fallback.

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  translation: string;
  numberInSurah: number;
}

export interface WordByWord {
  arabic: string;
  translation: string;
  transliteration: string;
  position: number;
}

export interface AyahWords {
  verseNumber: number;
  words: WordByWord[];
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
}

interface QuranJsonVerse {
  id: number;
  text: string;
  translation: string;
}

interface QuranJsonSurah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  verses: QuranJsonVerse[];
}

const DATA_URL = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json";

// Available English translations (Quran.com API resource IDs)
export interface TranslationOption {
  id: number; // 0 = bundled Sahih International
  name: string;
  author: string;
  isTafsir?: boolean; // true = use tafsir endpoint instead of translations
}

export const TRANSLATIONS: TranslationOption[] = [
  { id: 0, name: "Sahih International", author: "Sahih International" },
  { id: 131, name: "Sahih International (API)", author: "Sahih International" },
  { id: 20, name: "Saheeh International", author: "Saheeh International" },
  { id: 203, name: "The Clear Quran", author: "Dr. Mustafa Khattab" },
  { id: 85, name: "Yusuf Ali", author: "Abdullah Yusuf Ali" },
  { id: 84, name: "Maududi", author: "Abul Ala Maududi" },
  { id: 95, name: "Muhammad Pickthall", author: "Muhammad Marmaduke Pickthall" },
  { id: 22, name: "Muhsin Khan", author: "Muhammad Muhsin Khan" },
  { id: 46, name: "Somali — Mahmud Muhammad Abduh", author: "Mahmud Muhammad Abduh" },
  { id: 169, name: "Ibn Kathir (Abridged)", author: "Ibn Kathir", isTafsir: true },
];

let cachedData: QuranJsonSurah[] | null = null;
const arabicDisplayCache = new Map<number, string[]>(); // v2 - cleared dots

async function loadData(): Promise<QuranJsonSurah[]> {
  if (cachedData) return cachedData;
  const res = await fetch(DATA_URL);
  cachedData = await res.json();
  return cachedData!;
}

async function fetchDisplayArabicAyahs(surahNumber: number): Promise<string[]> {
  if (arabicDisplayCache.has(surahNumber)) {
    return arabicDisplayCache.get(surahNumber)!;
  }

  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?fields=text_uthmani&per_page=300`
  );

  if (!res.ok) {
    throw new Error("Failed to load Uthmani Arabic verses");
  }

  const json = await res.json();
  const verses = (json.verses || []).map((verse: any) =>
    (verse.text_uthmani || "")
      // Strip end-of-ayah markers (۝), rub/hizb (۞), circles, and superscript alef/extras —
      // BUT preserve waqf (pause) signs U+06D6–U+06DC so tajweed pause rulings render in the reader.
      .replace(/[\u06DD\u06DE\u06DF-\u06ED\u0670\u08F0-\u08FF۝●⬤۞]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim()
  );

  arabicDisplayCache.set(surahNumber, verses);
  return verses;
}

export async function fetchSurahs(): Promise<Surah[]> {
  const data = await loadData();
  return data.map((s) => ({
    number: s.id,
    name: s.name,
    englishName: s.transliteration,
    englishNameTranslation: s.translation,
    numberOfAyahs: s.total_verses,
    revelationType: s.type.charAt(0).toUpperCase() + s.type.slice(1),
  }));
}

// Reciter types and API
export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: { name: string; language_name: string };
}

let cachedReciters: Reciter[] | null = null;

export async function fetchReciters(): Promise<Reciter[]> {
  if (cachedReciters) return cachedReciters;
  const res = await fetch("https://api.quran.com/api/v4/resources/recitations?language=en");
  const json = await res.json();
  cachedReciters = json.recitations;
  return cachedReciters!;
}

const audioCache = new Map<string, string[]>();

export async function fetchAudioUrls(
  surahNumber: number,
  reciterId: number
): Promise<string[]> {
  const key = `${reciterId}-${surahNumber}`;
  if (audioCache.has(key)) return audioCache.get(key)!;

  const allFiles: any[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNumber}?per_page=50&page=${page}`
    );
    const json = await res.json();
    allFiles.push(...json.audio_files);
    totalPages = json.pagination.total_pages;
    page++;
  }

  const urls: string[] = allFiles.map((f: any) => {
    const url: string = f.url;
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("http")) return url;
    return `https://verses.quran.com/${url}`;
  });
  audioCache.set(key, urls);
  return urls;
}

// Word-by-word translation via Quran.com API v4
const WBW_API = "https://api.quran.com/api/v4/verses/by_chapter";
const wbwCache = new Map<number, AyahWords[]>();

export async function fetchWordByWord(surahNumber: number): Promise<AyahWords[]> {
  if (wbwCache.has(surahNumber)) return wbwCache.get(surahNumber)!;

  const res = await fetch(
    `${WBW_API}/${surahNumber}?language=en&words=true&word_fields=text_uthmani,translation&per_page=300`
  );
  const json = await res.json();

  const result: AyahWords[] = json.verses.map((v: any) => ({
    verseNumber: v.verse_number,
    words: v.words
      .filter((w: any) => w.char_type_name === "word")
      .map((w: any) => ({
        arabic: w.text_uthmani,
        translation: w.translation?.text || "",
        transliteration: w.transliteration?.text || "",
        position: w.position,
      })),
  }));

  wbwCache.set(surahNumber, result);
  return result;
}

// Tajweed color-coded text via Quran.com API v4
const tajweedCache = new Map<number, string[]>();

export async function fetchTajweedText(surahNumber: number): Promise<string[]> {
  if (tajweedCache.has(surahNumber)) return tajweedCache.get(surahNumber)!;

  const allVerses: string[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?fields=text_uthmani_tajweed&per_page=50&page=${page}`
    );
    const json = await res.json();
    json.verses.forEach((v: any) => {
      // Convert <tajweed class="X"> to <span class="tajweed-X"> for proper browser rendering
      const html = (v.text_uthmani_tajweed || "")
        .replace(/<tajweed\s+class=([^>]+)>/g, (_: string, cls: string) => `<span class="tj-${cls}">`)
        .replace(/<\/tajweed>/g, "</span>");
      allVerses.push(html);
    });
    totalPages = json.pagination.total_pages;
    page++;
  }

  const sanitized = allVerses.map((html) =>
    DOMPurify.sanitize(html, { ALLOWED_TAGS: ["span"], ALLOWED_ATTR: ["class"] })
  );

  tajweedCache.set(surahNumber, sanitized);
  return sanitized;
}

const surahCache = new Map<string, SurahDetail>();
const translationCache = new Map<string, string[]>();

// Fetch translation text from Quran.com API
async function fetchApiTranslation(surahNumber: number, translationId: number): Promise<string[]> {
  const key = `${translationId}-${surahNumber}`;
  if (translationCache.has(key)) return translationCache.get(key)!;

  const option = TRANSLATIONS.find((t) => t.id === translationId);

  if (option?.isTafsir) {
    return fetchTafsirTranslation(surahNumber, translationId, key);
  }

  const allTranslations: string[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?translations=${translationId}&per_page=50&page=${page}`
    );
    const json = await res.json();
    json.verses.forEach((v: any) => {
      const t = v.translations?.[0]?.text || "";
      allTranslations.push(t.replace(/<[^>]*>/g, "").replace(/<sup[^>]*>.*?<\/sup>/g, ""));
    });
    totalPages = json.pagination.total_pages;
    page++;
  }

  translationCache.set(key, allTranslations);
  return allTranslations;
}

// Fetch tafsir text from Quran.com tafsir endpoint
async function fetchTafsirTranslation(surahNumber: number, tafsirId: number, cacheKey: string): Promise<string[]> {
  const allTexts: string[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${surahNumber}?per_page=50&page=${page}`
    );
    const json = await res.json();
    (json.tafsirs || []).forEach((t: any) => {
      const text = (t.text || "").replace(/<[^>]*>/g, "").replace(/\s{2,}/g, " ").trim();
      allTexts.push(text);
    });
    totalPages = json.pagination?.total_pages || 1;
    page++;
  }

  translationCache.set(cacheKey, allTexts);
  return allTexts;
}

// Available tafsir sources for per-verse lookup
export const TAFSIR_SOURCES = [
  { id: 169, name: "Ibn Kathir (Abridged)", author: "Ibn Kathir" },
  { id: 74, name: "Tafsir al-Jalalayn", author: "Jalal ad-Din al-Mahalli & as-Suyuti" },
  { id: 168, name: "Al-Tabari", author: "Ibn Jarir al-Tabari" },
  { id: 816, name: "Tafsir al-Wasit", author: "Muhammad Sayyid Tantawi" },
];

const verseTafsirCache = new Map<string, string>();

export async function fetchVerseTafsir(surahNumber: number, ayahNumber: number, tafsirId: number): Promise<string> {
  const key = `${tafsirId}-${surahNumber}:${ayahNumber}`;
  if (verseTafsirCache.has(key)) return verseTafsirCache.get(key)!;

  const verseKey = `${surahNumber}:${ayahNumber}`;
  const res = await fetch(
    `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`
  );
  if (!res.ok) throw new Error("Failed to fetch tafsir");
  const json = await res.json();
  const raw = json.tafsir?.text || "";
  const text = raw.replace(/<[^>]*>/g, "").replace(/\s{2,}/g, " ").trim();
  verseTafsirCache.set(key, text);
  return text;
}

export async function fetchSurah(number: number, translationId: number = 0): Promise<SurahDetail> {
  const cacheKey = `${number}-${translationId}`;
  if (surahCache.has(cacheKey)) return surahCache.get(cacheKey)!;

  const data = await loadData();
  const s = data[number - 1];
  const arabicAyahs = await fetchDisplayArabicAyahs(number).catch(() =>
    fetchTanzilSurahAyahs(number)
  );

  // Get translations - use bundled for id=0, otherwise fetch from API
  let translations: string[] | null = null;
  if (translationId > 0) {
    try {
      translations = await fetchApiTranslation(number, translationId);
    } catch {
      // Fall back to bundled
    }
  }

  const result: SurahDetail = {
    number: s.id,
    name: s.name,
    englishName: s.transliteration,
    englishNameTranslation: s.translation,
    revelationType: s.type.charAt(0).toUpperCase() + s.type.slice(1),
    ayahs: s.verses.map((v, index) => ({
      number: index + 1,
      // Preserve waqf signs (U+06D6–U+06DC); strip only ayah-end/ornament markers
      text: (arabicAyahs[index] ?? v.text).replace(/[\u06DD\u06DE\u06DF-\u06ED\u0670\u08F0-\u08FF۝●⬤۞]/g, "").replace(/\s{2,}/g, " ").trim(),
      translation: translations?.[index] ?? v.translation.replace(/<[^>]*>/g, ""),
      numberInSurah: index + 1,
    })),
  };

  surahCache.set(cacheKey, result);
  return result;
}
