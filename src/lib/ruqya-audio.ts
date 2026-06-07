// Ordered Ruqya recitation session — Quranic passages mapped to ayah ranges.
// The player streams per-ayah audio sequentially from Quran.com API.

export interface RuqyaItem {
  title: string;
  surah: number;
  from: number; // inclusive
  to: number;   // inclusive
  repeat?: number; // default 1
}

export const RUQYA_SESSION: RuqyaItem[] = [
  { title: "Al-Fātiḥah (7×)",                   surah: 1,   from: 1,   to: 7,   repeat: 7 },
  { title: "Al-Baqarah 1–5",                    surah: 2,   from: 1,   to: 5 },
  { title: "Ayat al-Kursī (2:255)",             surah: 2,   from: 255, to: 255, repeat: 3 },
  { title: "Al-Baqarah 285–286",                surah: 2,   from: 285, to: 286 },
  { title: "Al-Baqarah 102 (Against Siḥr)",     surah: 2,   from: 102, to: 102 },
  { title: "Al-Baqarah 163–164",                surah: 2,   from: 163, to: 164 },
  { title: "Āl ʿImrān 18",                      surah: 3,   from: 18,  to: 18  },
  { title: "Al-Aʿrāf 54–56",                    surah: 7,   from: 54,  to: 56  },
  { title: "Al-Aʿrāf 117–122 (Mūsā vs Magic)",  surah: 7,   from: 117, to: 122 },
  { title: "Yūnus 81–82",                       surah: 10,  from: 81,  to: 82  },
  { title: "Ṭā-Hā 69",                          surah: 20,  from: 69,  to: 69  },
  { title: "Du'ā of Yūnus (21:87)",             surah: 21,  from: 87,  to: 87  },
  { title: "Al-Mu'minūn 115–118",               surah: 23,  from: 115, to: 118 },
  { title: "Aṣ-Ṣāffāt 1–10",                    surah: 37,  from: 1,   to: 10  },
  { title: "Al-Aḥqāf 29–32",                    surah: 46,  from: 29,  to: 32  },
  { title: "Ar-Raḥmān 33–36",                   surah: 55,  from: 33,  to: 36  },
  { title: "Al-Ḥashr 21–24",                    surah: 59,  from: 21,  to: 24  },
  { title: "Al-Jinn 1–9",                       surah: 72,  from: 1,   to: 9   },
  { title: "Al-Kāfirūn",                        surah: 109, from: 1,   to: 6   },
  { title: "Al-Ikhlāṣ (3×)",                    surah: 112, from: 1,   to: 4,   repeat: 3 },
  { title: "Al-Falaq (3×)",                     surah: 113, from: 1,   to: 5,   repeat: 3 },
  { title: "An-Nās (3×)",                       surah: 114, from: 1,   to: 6,   repeat: 3 },
];

const ayahAudioCache = new Map<string, string>();

/** Fetch URL for a single ayah's recitation. */
export async function fetchAyahAudioUrl(
  reciterId: number,
  surah: number,
  ayah: number,
): Promise<string> {
  const key = `${reciterId}-${surah}:${ayah}`;
  if (ayahAudioCache.has(key)) return ayahAudioCache.get(key)!;
  const res = await fetch(
    `https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah/${surah}:${ayah}`,
  );
  if (!res.ok) throw new Error("audio fetch failed");
  const json = await res.json();
  const raw: string = json.audio_files?.[0]?.url ?? "";
  const url = raw.startsWith("http") ? raw : raw.startsWith("//") ? `https:${raw}` : `https://verses.quran.com/${raw}`;
  ayahAudioCache.set(key, url);
  return url;
}

/** Flatten the session into an ordered list of (item, surah, ayah) for playback. */
export interface QueueEntry {
  itemIndex: number;
  itemTitle: string;
  surah: number;
  ayah: number;
}

export function buildQueue(items: RuqyaItem[] = RUQYA_SESSION): QueueEntry[] {
  const q: QueueEntry[] = [];
  items.forEach((it, idx) => {
    const repeat = it.repeat ?? 1;
    for (let r = 0; r < repeat; r++) {
      for (let a = it.from; a <= it.to; a++) {
        q.push({ itemIndex: idx, itemTitle: it.title, surah: it.surah, ayah: a });
      }
    }
  });
  return q;
}
