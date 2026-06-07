// Quran reading goals + daily progress + streak tracking.
// Supports three goal modes (any combination): daily ayahs, daily pages, khatm-by-date.

import { TOTAL_QURAN_AYAHS } from "./storage";

const SETTINGS_KEY = "lod_quran_goals";
const LOG_KEY = "lod_quran_goals_log";

export interface QuranGoalSettings {
  ayahsEnabled: boolean;
  dailyAyahs: number;       // target ayahs/day
  pagesEnabled: boolean;
  dailyPages: number;       // target pages/day
  khatmEnabled: boolean;
  khatmDate: string;        // YYYY-MM-DD target completion
}

const defaults: QuranGoalSettings = {
  ayahsEnabled: true,
  dailyAyahs: 10,
  pagesEnabled: false,
  dailyPages: 1,
  khatmEnabled: false,
  khatmDate: "",
};

export function getGoalSettings(): QuranGoalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch { return defaults; }
}

export function saveGoalSettings(s: QuranGoalSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  emitGoalChange();
}

// Daily log: { "YYYY-MM-DD": { ayahs: number } }
export interface DailyLog { [date: string]: { ayahs: number } }

export function getLog(): DailyLog {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function incrementToday(by: number = 1): void {
  const log = getLog();
  const k = todayKey();
  log[k] = { ayahs: (log[k]?.ayahs ?? 0) + by };
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    emitGoalChange();
  } catch {/* quota */}
}

export function getTodayAyahs(): number {
  return getLog()[todayKey()]?.ayahs ?? 0;
}

const AVG_AYAHS_PER_PAGE = TOTAL_QURAN_AYAHS / 604; // ~10.3

export function ayahsForPagesGoal(pages: number): number {
  return Math.round(pages * AVG_AYAHS_PER_PAGE);
}

/** Compute daily ayahs required to finish Quran by khatmDate from current totalRead. */
export function ayahsForKhatm(khatmDate: string, totalReadAllTime: number): number {
  if (!khatmDate) return 0;
  const target = new Date(khatmDate);
  target.setHours(23, 59, 59, 999);
  const remainingAyahs = Math.max(0, TOTAL_QURAN_AYAHS - totalReadAllTime);
  const daysLeft = Math.max(1, Math.ceil((target.getTime() - Date.now()) / 86400000));
  return Math.ceil(remainingAyahs / daysLeft);
}

/** Total daily target combining enabled modes (max of enabled goals). */
export function effectiveDailyTarget(s: QuranGoalSettings, totalReadAllTime: number): number {
  const targets: number[] = [];
  if (s.ayahsEnabled) targets.push(s.dailyAyahs);
  if (s.pagesEnabled) targets.push(ayahsForPagesGoal(s.dailyPages));
  if (s.khatmEnabled && s.khatmDate) targets.push(ayahsForKhatm(s.khatmDate, totalReadAllTime));
  return targets.length ? Math.max(...targets) : 0;
}

/** Current streak: consecutive days (including today if met, or up to yesterday) goal was hit. */
export function getStreak(targetPerDay: number): number {
  if (targetPerDay <= 0) return 0;
  const log = getLog();
  let streak = 0;
  const d = new Date();
  // If today's met, count it; otherwise start from yesterday.
  if ((log[todayKey(d)]?.ayahs ?? 0) < targetPerDay) {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const k = todayKey(d);
    if ((log[k]?.ayahs ?? 0) >= targetPerDay) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

const EVT = "lod-goal-change";
function emitGoalChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT));
}
export function subscribeGoalChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener(EVT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(EVT, h);
    window.removeEventListener("storage", h);
  };
}
