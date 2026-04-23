// Schedules in-app Athan playback + native local notifications.

import { computeTimes, getPrayerSettings, getPrayerLocation, prayerLabel, PrayerName, DailyTimes } from "./prayer-times";

let audioEl: HTMLAudioElement | null = null;
let timers: number[] = [];

const PRAYERS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

export function playAthanNow(): Promise<void> {
  const s = getPrayerSettings();
  if (!s.athan.enabled || s.athan.sound === "silent") return Promise.resolve();
  const a = getAudio();
  a.src = `/audio/athan-${s.athan.sound}.mp3`;
  a.volume = s.athan.volume;
  return a.play().catch(() => { /* autoplay blocked */ });
}

export function stopAthan() {
  if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
}

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
}

export function rescheduleAthan() {
  clearTimers();
  const loc = getPrayerLocation();
  if (!loc) return;
  const settings = getPrayerSettings();
  if (!settings.athan.enabled) return;

  const times = computeTimes(loc, new Date(), settings);
  const now = Date.now();

  PRAYERS.forEach((p) => {
    const at = (times as any)[p].getTime();
    const delay = at - now;
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const id = window.setTimeout(() => {
        playAthanNow();
        // Re-schedule next day after Isha fires
        if (p === "isha") setTimeout(() => rescheduleAthan(), 60_000);
      }, delay);
      timers.push(id);
    }
  });

  // Also schedule native notifications when running on Capacitor
  scheduleNativeNotifications(times).catch(() => { /* ignore */ });
}

async function scheduleNativeNotifications(times: DailyTimes) {
  const settings = getPrayerSettings();
  if (!settings.athan.notifications) return;
  // Only run on native
  // @ts-ignore
  const isNative = typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.();
  if (!isNative) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;
    await LocalNotifications.cancel({
      notifications: PRAYERS.map((_, i) => ({ id: 5000 + i })),
    }).catch(() => { /* none */ });
    const schedule = PRAYERS.map((p, i) => {
      const at = (times as any)[p] as Date;
      return {
        id: 5000 + i,
        title: `${prayerLabel(p)} prayer`,
        body: `It's time for ${prayerLabel(p)}`,
        schedule: { at },
      };
    }).filter((n) => n.schedule.at.getTime() > Date.now());
    if (schedule.length) await LocalNotifications.schedule({ notifications: schedule });
  } catch { /* plugin unavailable */ }
}
