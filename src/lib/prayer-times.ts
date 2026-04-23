// Prayer times, Qibla, Hijri, and settings.
// adhan-js for calculation; hijri-converter for Hijri dates.

import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  HighLatitudeRule,
  Qibla,
  SunnahTimes,
  CalculationParameters,
} from "adhan";
// @ts-ignore - hijri-converter has no shipped types
import { toHijri } from "hijri-converter";

export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
export type MethodKey =
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "MoonsightingCommittee"
  | "Singapore"
  | "Turkey"
  | "Tehran"
  | "NorthAmerica";

export interface PrayerLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  countryCode?: string; // ISO-2
  source: "gps" | "ip" | "manual";
  updatedAt: number;
}

export interface PrayerOffsets {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface PrayerSettings {
  method: MethodKey;
  autoMethod: boolean;
  madhhab: "shafi" | "hanafi";
  highLatitudeRule: "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle" | "Auto";
  offsets: PrayerOffsets;
  hijriOffset: number; // days, -2..+2
  athan: {
    enabled: boolean;
    sound: "makkah" | "madinah" | "silent";
    volume: number; // 0-1
    notifications: boolean;
  };
}

const PRAYER_LOC_KEY = "prayer-location";
const PRAYER_SETTINGS_KEY = "prayer-settings";

export const DEFAULT_OFFSETS: PrayerOffsets = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export const DEFAULT_SETTINGS: PrayerSettings = {
  method: "MuslimWorldLeague",
  autoMethod: true,
  madhhab: "shafi",
  highLatitudeRule: "Auto",
  offsets: DEFAULT_OFFSETS,
  hijriOffset: 0,
  athan: {
    enabled: true,
    sound: "makkah",
    volume: 0.85,
    notifications: true,
  },
};

// ISO country code → recommended calculation method
const COUNTRY_METHOD: Record<string, MethodKey> = {
  SA: "UmmAlQura", AE: "Dubai", QA: "Qatar", KW: "Kuwait", BH: "Qatar", OM: "Qatar",
  EG: "Egyptian", LY: "Egyptian", SD: "Egyptian", DZ: "Egyptian", TN: "Egyptian", MA: "Egyptian",
  PK: "Karachi", IN: "Karachi", BD: "Karachi", AF: "Karachi", LK: "Karachi",
  TR: "Turkey",
  IR: "Tehran",
  SG: "Singapore", MY: "Singapore", ID: "Singapore", BN: "Singapore",
  US: "NorthAmerica", CA: "NorthAmerica",
  GB: "MoonsightingCommittee", IE: "MoonsightingCommittee",
  FR: "MuslimWorldLeague", DE: "MuslimWorldLeague", NL: "MuslimWorldLeague",
  BE: "MuslimWorldLeague", IT: "MuslimWorldLeague", ES: "MuslimWorldLeague",
  SE: "MuslimWorldLeague", NO: "MuslimWorldLeague", FI: "MuslimWorldLeague",
  AU: "MuslimWorldLeague", NZ: "MuslimWorldLeague",
};

// Hanafi madhhab is most common in these countries
const HANAFI_COUNTRIES = new Set([
  "PK", "IN", "BD", "AF", "TR", "TJ", "TM", "UZ", "KZ", "KG", "AZ", "ALB",
]);

export function methodForCountry(cc?: string): MethodKey {
  if (!cc) return "MuslimWorldLeague";
  return COUNTRY_METHOD[cc.toUpperCase()] ?? "MuslimWorldLeague";
}

export function madhhabForCountry(cc?: string): "shafi" | "hanafi" {
  return cc && HANAFI_COUNTRIES.has(cc.toUpperCase()) ? "hanafi" : "shafi";
}

// ---------- Settings storage ----------
export function getPrayerSettings(): PrayerSettings {
  try {
    const raw = localStorage.getItem(PRAYER_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      offsets: { ...DEFAULT_OFFSETS, ...(parsed.offsets ?? {}) },
      athan: { ...DEFAULT_SETTINGS.athan, ...(parsed.athan ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function savePrayerSettings(s: Partial<PrayerSettings>): PrayerSettings {
  const merged = { ...getPrayerSettings(), ...s };
  try { localStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify(merged)); } catch { /* quota */ }
  return merged;
}

export function getPrayerLocation(): PrayerLocation | null {
  try {
    const raw = localStorage.getItem(PRAYER_LOC_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function savePrayerLocation(loc: PrayerLocation): void {
  try { localStorage.setItem(PRAYER_LOC_KEY, JSON.stringify(loc)); } catch { /* quota */ }
}

// ---------- Location detection ----------
export async function detectLocation(): Promise<PrayerLocation> {
  // 1) GPS
  const gps = await getGpsLocation().catch(() => null);
  if (gps) {
    const meta = await reverseGeocode(gps.lat, gps.lng).catch(() => ({}));
    const loc: PrayerLocation = {
      ...gps,
      ...meta,
      source: "gps",
      updatedAt: Date.now(),
    };
    savePrayerLocation(loc);
    return loc;
  }
  // 2) IP fallback
  const ip = await getIpLocation();
  savePrayerLocation(ip);
  return ip;
}

function getGpsLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

async function reverseGeocode(lat: number, lng: number): Promise<Partial<PrayerLocation>> {
  // Open-Meteo reverse geocoding — free, no key, CORS-friendly
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    );
    const j = await r.json();
    return {
      city: j.address?.city || j.address?.town || j.address?.village || j.address?.state,
      country: j.address?.country,
      countryCode: j.address?.country_code?.toUpperCase(),
    };
  } catch {
    return {};
  }
}

async function getIpLocation(): Promise<PrayerLocation> {
  const r = await fetch("https://ipapi.co/json/");
  if (!r.ok) throw new Error("ip lookup failed");
  const j = await r.json();
  return {
    lat: j.latitude,
    lng: j.longitude,
    city: j.city,
    country: j.country_name,
    countryCode: j.country_code,
    source: "ip",
    updatedAt: Date.now(),
  };
}

// ---------- Calculation ----------
function getParams(s: PrayerSettings, cc?: string): CalculationParameters {
  const methodKey = s.autoMethod ? methodForCountry(cc) : s.method;
  const params = (CalculationMethod as any)[methodKey]?.() ?? CalculationMethod.MuslimWorldLeague();
  params.madhab = s.madhhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  if (s.highLatitudeRule !== "Auto") {
    params.highLatitudeRule = (HighLatitudeRule as any)[s.highLatitudeRule];
  }
  params.adjustments = {
    fajr: s.offsets.fajr,
    sunrise: s.offsets.sunrise,
    dhuhr: s.offsets.dhuhr,
    asr: s.offsets.asr,
    maghrib: s.offsets.maghrib,
    isha: s.offsets.isha,
  };
  return params;
}

export interface DailyTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  lastThird: Date;
}

export function computeTimes(loc: PrayerLocation, when = new Date(), settings = getPrayerSettings()): DailyTimes {
  const coords = new Coordinates(loc.lat, loc.lng);
  const params = getParams(settings, loc.countryCode);
  const pt = new PrayerTimes(coords, when, params);
  const sunnah = new SunnahTimes(pt);
  return {
    fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr,
    asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha,
    midnight: sunnah.middleOfTheNight,
    lastThird: sunnah.lastThirdOfTheNight,
  };
}

export function nextPrayer(times: DailyTimes, now = new Date()): { name: PrayerName; at: Date } {
  const order: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  for (const name of order) {
    if ((times as any)[name].getTime() > now.getTime()) {
      return { name, at: (times as any)[name] };
    }
  }
  return { name: "fajr", at: times.fajr }; // tomorrow handled by recompute
}

export function getQibla(loc: PrayerLocation): number {
  return Qibla(new Coordinates(loc.lat, loc.lng));
}

// ---------- Hijri ----------
export function getHijri(date = new Date(), offsetDays = 0) {
  const d = new Date(date);
  d.setDate(d.getDate() + offsetDays);
  const h = toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const months = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
  ];
  return {
    year: h.hy,
    month: h.hm,
    day: h.hd,
    monthName: months[h.hm - 1],
  };
}

export function formatTime(d: Date, h12 = true): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: h12 });
}

export function prayerLabel(p: PrayerName): string {
  return { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" }[p];
}

export function prayerArabic(p: PrayerName): string {
  return { fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء" }[p];
}
