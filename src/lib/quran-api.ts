// Quran data sourced from Tanzil.net (https://tanzil.net)
// Arabic text (Uthmani) + English translation (Saheeh International)
// via quran-json npm package on jsdelivr CDN

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

let cachedData: QuranJsonSurah[] | null = null;

async function loadData(): Promise<QuranJsonSurah[]> {
  if (cachedData) return cachedData;
  const res = await fetch(DATA_URL);
  cachedData = await res.json();
  return cachedData!;
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

export async function fetchSurah(number: number): Promise<SurahDetail> {
  const data = await loadData();
  const s = data[number - 1];

  return {
    number: s.id,
    name: s.name,
    englishName: s.transliteration,
    englishNameTranslation: s.translation,
    revelationType: s.type.charAt(0).toUpperCase() + s.type.slice(1),
    ayahs: s.verses.map((v, i) => ({
      number: i + 1,
      text: v.text,
      translation: v.translation,
      numberInSurah: v.id,
    })),
  };
}
