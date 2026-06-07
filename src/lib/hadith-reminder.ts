// Daily hadith reminder — native local notification (Capacitor) when available.

import { getTodaysHadith } from "./daily-hadith";

const KEY = "lod_hadith_reminder";

export interface HadithReminderSettings {
  enabled: boolean;
  hour: number;   // 0-23
  minute: number; // 0-59
}

const defaults: HadithReminderSettings = { enabled: false, hour: 8, minute: 0 };

export function getHadithReminderSettings(): HadithReminderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch { return defaults; }
}

export function saveHadithReminderSettings(s: HadithReminderSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  void rescheduleHadithReminder();
}

export async function rescheduleHadithReminder() {
  const s = getHadithReminderSettings();
  // @ts-ignore
  const isNative = typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.();
  if (!isNative) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: 7001 }] }).catch(() => {});
    if (!s.enabled) return;
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;

    const next = new Date();
    next.setHours(s.hour, s.minute, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);

    const h = getTodaysHadith(next);
    await LocalNotifications.schedule({
      notifications: [{
        id: 7001,
        title: "Hadith of the Day",
        body: h.english.length > 140 ? h.english.slice(0, 137) + "…" : h.english,
        schedule: { at: next, repeats: true, every: "day" as any },
      }],
    });
  } catch {/* plugin unavailable */}
}
