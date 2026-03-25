// IndexedDB-based offline audio cache

const DB_NAME = "light-of-deen-audio";
const DB_VERSION = 1;
const STORE_NAME = "audio-files";
const META_STORE = "download-meta";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Build a cache key for an ayah audio file */
function audioKey(surahNumber: number, ayahIndex: number, reciterId: number): string {
  return `${reciterId}-${surahNumber}-${ayahIndex}`;
}

/** Build a meta key for a surah download */
function metaKey(surahNumber: number, reciterId: number): string {
  return `${reciterId}-${surahNumber}`;
}

/** Save a single audio blob to IndexedDB */
export async function saveAudioBlob(
  surahNumber: number,
  ayahIndex: number,
  reciterId: number,
  blob: Blob
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, audioKey(surahNumber, ayahIndex, reciterId));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Retrieve a cached audio blob, or null */
export async function getAudioBlob(
  surahNumber: number,
  ayahIndex: number,
  reciterId: number
): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(audioKey(surahNumber, ayahIndex, reciterId));
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** Mark a full surah as downloaded */
export async function markSurahDownloaded(
  surahNumber: number,
  reciterId: number,
  totalAyahs: number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put(
      { surahNumber, reciterId, totalAyahs, downloadedAt: Date.now() },
      metaKey(surahNumber, reciterId)
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Check if a surah is fully downloaded for a given reciter */
export async function isSurahDownloaded(
  surahNumber: number,
  reciterId: number
): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).get(metaKey(surahNumber, reciterId));
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Delete all cached audio for a surah + reciter */
export async function deleteSurahAudio(
  surahNumber: number,
  reciterId: number,
  totalAyahs: number
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME, META_STORE], "readwrite");
  const store = tx.objectStore(STORE_NAME);
  for (let i = 0; i < totalAyahs; i++) {
    store.delete(audioKey(surahNumber, i, reciterId));
  }
  tx.objectStore(META_STORE).delete(metaKey(surahNumber, reciterId));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Download all ayahs for a surah and cache them in IndexedDB.
 *  Returns a progress callback. */
export async function downloadSurahForOffline(
  surahNumber: number,
  reciterId: number,
  audioUrls: string[],
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < audioUrls.length; i++) {
    // Check if already cached
    const existing = await getAudioBlob(surahNumber, i, reciterId);
    if (!existing) {
      const res = await fetch(audioUrls[i]);
      const blob = await res.blob();
      await saveAudioBlob(surahNumber, i, reciterId, blob);
    }
    onProgress?.(i + 1, audioUrls.length);
  }
  await markSurahDownloaded(surahNumber, reciterId, audioUrls.length);
}

/** Get all downloaded surah metadata */
export async function getDownloadedSurahs(): Promise<
  Array<{ surahNumber: number; reciterId: number; totalAyahs: number; downloadedAt: number }>
> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
