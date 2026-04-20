// Local storage helpers for bookmarks, last-read position, and settings

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  timestamp: number;
}

export interface LastRead {
  surahNumber: number;
  ayahIndex: number;
}

export interface AppSettings {
  fontSize: number; // 1=small, 2=medium, 3=large, 4=xlarge
  theme: "light" | "dark";
  defaultReciterId: number;
  arabicFont: string;
  showTranslation: boolean;
  translationId: number; // Quran.com translation resource ID
}

const BOOKMARKS_KEY = "quran-bookmarks";
const LAST_READ_KEY = "quran-last-read";
const SETTINGS_KEY = "quran-settings";
const READING_PROGRESS_KEY = "quran-reading-progress";
const LAST_SESSION_KEY = "quran-last-session";

// Last full session — for "Continue where you left off" (reading + audio state)
export type RepeatMode = "none" | "surah" | "ayah";
export interface LastSession {
  surahNumber: number;
  surahName?: string;
  ayahIndex: number;
  reciterId: number;
  wasPlaying: boolean;
  currentTime: number;       // seconds within current ayah audio
  repeatMode: RepeatMode;
  repeatCount: number;       // 0 = infinite, otherwise total target loops
  // Range repeat (optional). When rangeStart and rangeEnd are set (>= 0), playback loops
  // ayahs [rangeStart..rangeEnd] (0-based inclusive). rangeCount === 0 means infinite.
  rangeStart?: number;
  rangeEnd?: number;
  rangeCount?: number;
  updatedAt: number;
}

export function getLastSession(): LastSession | null {
  try {
    const raw = localStorage.getItem(LAST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastSession(session: Partial<LastSession>): void {
  const prev = getLastSession();
  const merged: LastSession = {
    surahNumber: 1,
    ayahIndex: 0,
    reciterId: getSettings().defaultReciterId,
    wasPlaying: false,
    currentTime: 0,
    repeatMode: "none",
    repeatCount: 0,
    ...prev,
    ...session,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(merged));
  } catch {
    /* quota — ignore */
  }
}

export function clearLastSession(): void {
  localStorage.removeItem(LAST_SESSION_KEY);
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  const exists = bookmarks.some(
    (b) => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
  );
  if (!exists) {
    bookmarks.unshift(bookmark);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }
}

export function removeBookmark(surahNumber: number, ayahNumber: number): void {
  const bookmarks = getBookmarks().filter(
    (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
  );
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(surahNumber: number, ayahNumber: number): boolean {
  return getBookmarks().some(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );
}

// Last Read
export function getLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastRead(surahNumber: number, ayahIndex: number): void {
  localStorage.setItem(LAST_READ_KEY, JSON.stringify({ surahNumber, ayahIndex }));
}

// Settings
const defaultSettings: AppSettings = {
  fontSize: 2,
  theme: "light",
  defaultReciterId: 7,
  arabicFont: "kfgqpc",
  showTranslation: true,
  translationId: 0, // 0 = bundled Sahih International
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Reading Progress — tracks which ayahs have been read per surah
// Stored as { [surahNumber]: number[] } where array contains read ayah numbers (1-based)
export interface ReadingProgress {
  [surahNumber: number]: number[];
}

export function getReadingProgress(): ReadingProgress {
  try {
    const raw = localStorage.getItem(READING_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markAyahRead(surahNumber: number, ayahNumber: number): void {
  const progress = getReadingProgress();
  if (!progress[surahNumber]) progress[surahNumber] = [];
  if (!progress[surahNumber].includes(ayahNumber)) {
    progress[surahNumber].push(ayahNumber);
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
  }
}

export function getSurahReadCount(surahNumber: number): number {
  const progress = getReadingProgress();
  return progress[surahNumber]?.length ?? 0;
}

export function getTotalAyahsRead(): number {
  const progress = getReadingProgress();
  return Object.values(progress).reduce((sum, arr) => sum + arr.length, 0);
}

export const TOTAL_QURAN_AYAHS = 6236;
