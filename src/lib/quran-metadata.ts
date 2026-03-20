// Juz (Para) data: each juz starts at a specific surah and ayah
export interface JuzInfo {
  juz: number;
  startSurah: number;
  startAyah: number;
}

export const JUZ_DATA: JuzInfo[] = [
  { juz: 1, startSurah: 1, startAyah: 1 },
  { juz: 2, startSurah: 2, startAyah: 142 },
  { juz: 3, startSurah: 2, startAyah: 253 },
  { juz: 4, startSurah: 3, startAyah: 93 },
  { juz: 5, startSurah: 4, startAyah: 24 },
  { juz: 6, startSurah: 4, startAyah: 148 },
  { juz: 7, startSurah: 5, startAyah: 82 },
  { juz: 8, startSurah: 6, startAyah: 111 },
  { juz: 9, startSurah: 7, startAyah: 88 },
  { juz: 10, startSurah: 8, startAyah: 41 },
  { juz: 11, startSurah: 9, startAyah: 93 },
  { juz: 12, startSurah: 11, startAyah: 6 },
  { juz: 13, startSurah: 12, startAyah: 53 },
  { juz: 14, startSurah: 15, startAyah: 1 },
  { juz: 15, startSurah: 17, startAyah: 1 },
  { juz: 16, startSurah: 18, startAyah: 75 },
  { juz: 17, startSurah: 21, startAyah: 1 },
  { juz: 18, startSurah: 23, startAyah: 1 },
  { juz: 19, startSurah: 25, startAyah: 21 },
  { juz: 20, startSurah: 27, startAyah: 56 },
  { juz: 21, startSurah: 29, startAyah: 46 },
  { juz: 22, startSurah: 33, startAyah: 31 },
  { juz: 23, startSurah: 36, startAyah: 28 },
  { juz: 24, startSurah: 39, startAyah: 32 },
  { juz: 25, startSurah: 41, startAyah: 47 },
  { juz: 26, startSurah: 46, startAyah: 1 },
  { juz: 27, startSurah: 51, startAyah: 31 },
  { juz: 28, startSurah: 58, startAyah: 1 },
  { juz: 29, startSurah: 67, startAyah: 1 },
  { juz: 30, startSurah: 78, startAyah: 1 },
];

// Hizb data: 60 hizbs, each starts at a specific surah and ayah
export interface HizbInfo {
  hizb: number;
  startSurah: number;
  startAyah: number;
}

export const HIZB_DATA: HizbInfo[] = [
  { hizb: 1, startSurah: 1, startAyah: 1 },
  { hizb: 2, startSurah: 2, startAyah: 26 },
  { hizb: 3, startSurah: 2, startAyah: 44 },
  { hizb: 4, startSurah: 2, startAyah: 75 },
  { hizb: 5, startSurah: 2, startAyah: 106 },
  { hizb: 6, startSurah: 2, startAyah: 142 },
  { hizb: 7, startSurah: 2, startAyah: 177 },
  { hizb: 8, startSurah: 2, startAyah: 203 },
  { hizb: 9, startSurah: 2, startAyah: 233 },
  { hizb: 10, startSurah: 2, startAyah: 253 },
  { hizb: 11, startSurah: 3, startAyah: 15 },
  { hizb: 12, startSurah: 3, startAyah: 51 },
  { hizb: 13, startSurah: 3, startAyah: 92 },
  { hizb: 14, startSurah: 3, startAyah: 133 },
  { hizb: 15, startSurah: 3, startAyah: 171 },
  { hizb: 16, startSurah: 4, startAyah: 12 },
  { hizb: 17, startSurah: 4, startAyah: 36 },
  { hizb: 18, startSurah: 4, startAyah: 60 },
  { hizb: 19, startSurah: 4, startAyah: 88 },
  { hizb: 20, startSurah: 4, startAyah: 114 },
  { hizb: 21, startSurah: 4, startAyah: 148 },
  { hizb: 22, startSurah: 5, startAyah: 12 },
  { hizb: 23, startSurah: 5, startAyah: 36 },
  { hizb: 24, startSurah: 5, startAyah: 58 },
  { hizb: 25, startSurah: 5, startAyah: 82 },
  { hizb: 26, startSurah: 5, startAyah: 105 },
  { hizb: 27, startSurah: 6, startAyah: 36 },
  { hizb: 28, startSurah: 6, startAyah: 74 },
  { hizb: 29, startSurah: 6, startAyah: 111 },
  { hizb: 30, startSurah: 6, startAyah: 141 },
  { hizb: 31, startSurah: 7, startAyah: 31 },
  { hizb: 32, startSurah: 7, startAyah: 58 },
  { hizb: 33, startSurah: 7, startAyah: 88 },
  { hizb: 34, startSurah: 7, startAyah: 142 },
  { hizb: 35, startSurah: 7, startAyah: 171 },
  { hizb: 36, startSurah: 8, startAyah: 22 },
  { hizb: 37, startSurah: 8, startAyah: 41 },
  { hizb: 38, startSurah: 8, startAyah: 61 },
  { hizb: 39, startSurah: 9, startAyah: 34 },
  { hizb: 40, startSurah: 9, startAyah: 59 },
  { hizb: 41, startSurah: 9, startAyah: 93 },
  { hizb: 42, startSurah: 9, startAyah: 122 },
  { hizb: 43, startSurah: 10, startAyah: 26 },
  { hizb: 44, startSurah: 10, startAyah: 71 },
  { hizb: 45, startSurah: 11, startAyah: 6 },
  { hizb: 46, startSurah: 11, startAyah: 61 },
  { hizb: 47, startSurah: 12, startAyah: 7 },
  { hizb: 48, startSurah: 12, startAyah: 53 },
  { hizb: 49, startSurah: 13, startAyah: 5 },
  { hizb: 50, startSurah: 13, startAyah: 35 },
  { hizb: 51, startSurah: 15, startAyah: 1 },
  { hizb: 52, startSurah: 16, startAyah: 1 },
  { hizb: 53, startSurah: 17, startAyah: 1 },
  { hizb: 54, startSurah: 17, startAyah: 50 },
  { hizb: 55, startSurah: 18, startAyah: 17 },
  { hizb: 56, startSurah: 18, startAyah: 75 },
  { hizb: 57, startSurah: 19, startAyah: 22 },
  { hizb: 58, startSurah: 20, startAyah: 1 },
  { hizb: 59, startSurah: 21, startAyah: 1 },
  { hizb: 60, startSurah: 22, startAyah: 1 },
];

/** Given a juz number, return the surah and ayah it starts at */
export function getJuzStart(juz: number): { surah: number; ayah: number } | null {
  const j = JUZ_DATA.find((d) => d.juz === juz);
  return j ? { surah: j.startSurah, ayah: j.startAyah } : null;
}

/** Given a hizb number, return the surah and ayah it starts at */
export function getHizbStart(hizb: number): { surah: number; ayah: number } | null {
  const h = HIZB_DATA.find((d) => d.hizb === hizb);
  return h ? { surah: h.startSurah, ayah: h.startAyah } : null;
}

/** Get all hizbs that fall within a given surah */
export function getHizbsInSurah(surahNumber: number, totalAyahs: number): HizbInfo[] {
  return HIZB_DATA.filter((h) => h.startSurah === surahNumber && h.startAyah <= totalAyahs);
}

/** Get all juz boundaries that fall within a given surah */
export function getJuzInSurah(surahNumber: number, totalAyahs: number): JuzInfo[] {
  return JUZ_DATA.filter((j) => j.startSurah === surahNumber && j.startAyah <= totalAyahs);
}

/** Find which juz a specific surah/ayah belongs to */
export function findJuzForAyah(surahNumber: number, ayahNumber: number): number {
  for (let i = JUZ_DATA.length - 1; i >= 0; i--) {
    const j = JUZ_DATA[i];
    if (surahNumber > j.startSurah || (surahNumber === j.startSurah && ayahNumber >= j.startAyah)) {
      return j.juz;
    }
  }
  return 1;
}

/** Find which hizb a specific surah/ayah belongs to */
export function findHizbForAyah(surahNumber: number, ayahNumber: number): number {
  for (let i = HIZB_DATA.length - 1; i >= 0; i--) {
    const h = HIZB_DATA[i];
    if (surahNumber > h.startSurah || (surahNumber === h.startSurah && ayahNumber >= h.startAyah)) {
      return h.hizb;
    }
  }
  return 1;
}
