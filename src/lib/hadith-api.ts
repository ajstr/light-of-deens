// Hadith API via fawazahmed0/hadith-api (free, no key, CDN-cached).
// Provides English + Arabic for major Sunni collections.

export interface HadithCollection {
  slug: string;      // e.g. "bukhari"
  name: string;      // e.g. "Sahih al-Bukhari"
  author: string;
}

export const COLLECTIONS: HadithCollection[] = [
  { slug: "bukhari",  name: "Sahih al-Bukhari",  author: "Imam al-Bukhari" },
  { slug: "muslim",   name: "Sahih Muslim",      author: "Imam Muslim" },
  { slug: "abudawud", name: "Sunan Abu Dawud",   author: "Imam Abu Dawud" },
  { slug: "tirmidhi", name: "Jami` at-Tirmidhi", author: "Imam at-Tirmidhi" },
  { slug: "nasai",    name: "Sunan an-Nasa'i",   author: "Imam an-Nasa'i" },
  { slug: "ibnmajah", name: "Sunan Ibn Majah",   author: "Imam Ibn Majah" },
  { slug: "malik",    name: "Muwatta Malik",     author: "Imam Malik" },
];

interface RawEdition {
  metadata: { name: string; sections: Record<string, string> };
  hadiths: Array<{
    hadithnumber: number;
    arabicnumber: number;
    text: string;
    grades?: Array<{ name: string; grade: string }>;
    reference?: { book: number; hadith: number };
  }>;
}

export interface HadithSection {
  id: number;
  title: string;
}

export interface HadithItem {
  number: number;
  english: string;
  arabic: string;
  grades?: string[];
}

const cache = new Map<string, RawEdition>();

// IndexedDB persistent cache so editions load offline after first fetch.
const IDB_NAME = "light-of-deen-hadith";
const IDB_STORE = "editions";
const IDB_VERSION = 1;

function openHadithDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<RawEdition | null> {
  try {
    const db = await openHadithDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(key);
      r.onsuccess = () => resolve((r.result as RawEdition) ?? null);
      r.onerror = () => reject(r.error);
    });
  } catch {
    return null;
  }
}

async function idbPut(key: string, value: RawEdition): Promise<void> {
  try {
    const db = await openHadithDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* quota or unsupported — ignore */
  }
}

async function idbKeys(): Promise<string[]> {
  try {
    const db = await openHadithDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).getAllKeys();
      r.onsuccess = () => resolve((r.result as string[]) ?? []);
      r.onerror = () => reject(r.error);
    });
  } catch {
    return [];
  }
}

async function fetchEdition(name: string): Promise<RawEdition> {
  if (cache.has(name)) return cache.get(name)!;

  // Try persistent cache first (works offline).
  const cached = await idbGet(name);
  if (cached) {
    cache.set(name, cached);
    // Refresh in background; ignore failures (offline).
    void (async () => {
      try {
        const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${name}.min.json`;
        const res = await fetch(url);
        if (!res.ok) return;
        const fresh = (await res.json()) as RawEdition;
        cache.set(name, fresh);
        await idbPut(name, fresh);
      } catch { /* offline */ }
    })();
    return cached;
  }

  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${name}.min.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`);
  const data = (await res.json()) as RawEdition;
  cache.set(name, data);
  await idbPut(name, data);
  return data;
}

/** Pre-download a collection (both English + Arabic editions) for offline use. */
export async function downloadCollectionForOffline(slug: string): Promise<void> {
  await Promise.all([fetchEdition(`eng-${slug}`), fetchEdition(`ara-${slug}`)]);
}

/** Check if a collection is available offline (both editions cached). */
export async function isCollectionCached(slug: string): Promise<boolean> {
  const keys = await idbKeys();
  return keys.includes(`eng-${slug}`) && keys.includes(`ara-${slug}`);
}

/** Remove cached editions for a collection. */
export async function removeCollectionCache(slug: string): Promise<void> {
  try {
    const db = await openHadithDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(`eng-${slug}`);
      tx.objectStore(IDB_STORE).delete(`ara-${slug}`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    cache.delete(`eng-${slug}`);
    cache.delete(`ara-${slug}`);
  } catch {/* ignore */}
}

export async function getSections(slug: string): Promise<HadithSection[]> {
  const eng = await fetchEdition(`eng-${slug}`);
  return Object.entries(eng.metadata.sections)
    .filter(([id, title]) => id !== "0" && title.trim().length > 0)
    .map(([id, title]) => ({ id: Number(id), title }));
}

export async function getHadithsForSection(
  slug: string,
  sectionId: number,
): Promise<HadithItem[]> {
  const [eng, ara] = await Promise.all([
    fetchEdition(`eng-${slug}`),
    fetchEdition(`ara-${slug}`),
  ]);
  const araMap = new Map(ara.hadiths.map((h) => [h.hadithnumber, h.text]));
  return eng.hadiths
    .filter((h) => h.reference?.book === sectionId)
    .map((h) => ({
      number: h.hadithnumber,
      english: h.text,
      arabic: araMap.get(h.hadithnumber) ?? "",
      grades: h.grades?.map((g) => `${g.name}: ${g.grade}`),
    }));
}

export function getCollection(slug: string): HadithCollection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
