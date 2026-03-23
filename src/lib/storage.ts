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
}

const BOOKMARKS_KEY = "quran-bookmarks";
const LAST_READ_KEY = "quran-last-read";
const SETTINGS_KEY = "quran-settings";

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
