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

async function fetchEdition(name: string): Promise<RawEdition> {
  if (cache.has(name)) return cache.get(name)!;
  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${name}.min.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`);
  const data = (await res.json()) as RawEdition;
  cache.set(name, data);
  return data;
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
