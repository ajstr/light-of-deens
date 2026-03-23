const DISPLAY_ARABIC_WORD_BOUNDARY = /(^|\s)([\u0621-\u064A])ّ/gu;
const DISPLAY_MIN_PATTERN = /(^|\s)مِن(?=$|[\sۚۖۗۛۜۙۘ،؛,.!?؟])/gu;

export function normalizeDisplayedArabicText(text: string): string {
  return text
    .replace(DISPLAY_ARABIC_WORD_BOUNDARY, "$1$2")
    .replace(DISPLAY_MIN_PATTERN, "$1مِنْ");
}