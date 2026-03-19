const TANZIL_UTHMANI_URL = "https://cdn.jsdelivr.net/gh/acfatah/tanzil@main/data/quran-uthmani.txt";
const BISMILLAH_PREFIX = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

let cachedSurahs: Map<number, string[]> | null = null;

function normalizeAyahText(
  surahNumber: number,
  ayahNumber: number,
  text: string
): string {
  const normalizedText = text.trim();

  if (
    ayahNumber === 1 &&
    surahNumber !== 1 &&
    surahNumber !== 9 &&
    normalizedText.startsWith(BISMILLAH_PREFIX)
  ) {
    return normalizedText.slice(BISMILLAH_PREFIX.length).trimStart();
  }

  return normalizedText;
}

async function loadTanzilSurahs(): Promise<Map<number, string[]>> {
  if (cachedSurahs) return cachedSurahs;

  const res = await fetch(TANZIL_UTHMANI_URL);
  if (!res.ok) {
    throw new Error("Failed to load Tanzil Uthmani text");
  }

  const rawText = await res.text();
  const surahs = new Map<number, string[]>();

  for (const line of rawText.split(/\r?\n/)) {
    if (!line.trim()) continue;

    const [surahPart, ayahPart, ...textParts] = line.split("|");
    const surahNumber = Number(surahPart);
    const ayahNumber = Number(ayahPart);
    const ayahText = normalizeAyahText(
      surahNumber,
      ayahNumber,
      textParts.join("|")
    );

    if (!Number.isFinite(surahNumber) || !Number.isFinite(ayahNumber)) {
      continue;
    }

    const ayahs = surahs.get(surahNumber) ?? [];
    ayahs[ayahNumber - 1] = ayahText;
    surahs.set(surahNumber, ayahs);
  }

  cachedSurahs = surahs;
  return surahs;
}

export async function fetchTanzilSurahAyahs(
  surahNumber: number
): Promise<string[]> {
  const surahs = await loadTanzilSurahs();
  return surahs.get(surahNumber) ?? [];
}
