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
  numberInSurah: number;
  juz: number;
  page: number;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
}

const BASE_URL = "https://api.alquran.cloud/v1";

export async function fetchSurahs(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/surah`);
  const data = await res.json();
  return data.data;
}

export async function fetchSurah(number: number): Promise<SurahDetail> {
  const res = await fetch(`${BASE_URL}/surah/${number}`);
  const data = await res.json();
  return data.data;
}
