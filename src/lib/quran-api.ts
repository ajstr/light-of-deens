// Quran data sourced from Tanzil.net (https://tanzil.net)
// Text: Simple Imlaei script via jsdelivr CDN

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
}

// Tanzil metadata (from tanzil.net/res/text/metadata/quran-data.xml)
const SURAH_META: { ayas: number; start: number; name: string; tname: string; ename: string; type: string }[] = [
  { ayas: 7, start: 0, name: "الفاتحة", tname: "Al-Faatiha", ename: "The Opening", type: "Meccan" },
  { ayas: 286, start: 7, name: "البقرة", tname: "Al-Baqara", ename: "The Cow", type: "Medinan" },
  { ayas: 200, start: 293, name: "آل عمران", tname: "Aal-i-Imraan", ename: "The Family of Imraan", type: "Medinan" },
  { ayas: 176, start: 493, name: "النساء", tname: "An-Nisaa", ename: "The Women", type: "Medinan" },
  { ayas: 120, start: 669, name: "المائدة", tname: "Al-Maaida", ename: "The Table", type: "Medinan" },
  { ayas: 165, start: 789, name: "الأنعام", tname: "Al-An'aam", ename: "The Cattle", type: "Meccan" },
  { ayas: 206, start: 954, name: "الأعراف", tname: "Al-A'raaf", ename: "The Heights", type: "Meccan" },
  { ayas: 75, start: 1160, name: "الأنفال", tname: "Al-Anfaal", ename: "The Spoils of War", type: "Medinan" },
  { ayas: 129, start: 1235, name: "التوبة", tname: "At-Tawba", ename: "The Repentance", type: "Medinan" },
  { ayas: 109, start: 1364, name: "يونس", tname: "Yunus", ename: "Jonas", type: "Meccan" },
  { ayas: 123, start: 1473, name: "هود", tname: "Hud", ename: "Hud", type: "Meccan" },
  { ayas: 111, start: 1596, name: "يوسف", tname: "Yusuf", ename: "Joseph", type: "Meccan" },
  { ayas: 43, start: 1707, name: "الرعد", tname: "Ar-Ra'd", ename: "The Thunder", type: "Medinan" },
  { ayas: 52, start: 1750, name: "إبراهيم", tname: "Ibrahim", ename: "Abraham", type: "Meccan" },
  { ayas: 99, start: 1802, name: "الحجر", tname: "Al-Hijr", ename: "The Rock", type: "Meccan" },
  { ayas: 128, start: 1901, name: "النحل", tname: "An-Nahl", ename: "The Bee", type: "Meccan" },
  { ayas: 111, start: 2029, name: "الإسراء", tname: "Al-Israa", ename: "The Night Journey", type: "Meccan" },
  { ayas: 110, start: 2140, name: "الكهف", tname: "Al-Kahf", ename: "The Cave", type: "Meccan" },
  { ayas: 98, start: 2250, name: "مريم", tname: "Maryam", ename: "Mary", type: "Meccan" },
  { ayas: 135, start: 2348, name: "طه", tname: "Taa-Haa", ename: "Taa-Haa", type: "Meccan" },
  { ayas: 112, start: 2483, name: "الأنبياء", tname: "Al-Anbiyaa", ename: "The Prophets", type: "Meccan" },
  { ayas: 78, start: 2595, name: "الحج", tname: "Al-Hajj", ename: "The Pilgrimage", type: "Medinan" },
  { ayas: 118, start: 2673, name: "المؤمنون", tname: "Al-Muminoon", ename: "The Believers", type: "Meccan" },
  { ayas: 64, start: 2791, name: "النور", tname: "An-Noor", ename: "The Light", type: "Medinan" },
  { ayas: 77, start: 2855, name: "الفرقان", tname: "Al-Furqaan", ename: "The Criterion", type: "Meccan" },
  { ayas: 227, start: 2932, name: "الشعراء", tname: "Ash-Shu'araa", ename: "The Poets", type: "Meccan" },
  { ayas: 93, start: 3159, name: "النمل", tname: "An-Naml", ename: "The Ant", type: "Meccan" },
  { ayas: 88, start: 3252, name: "القصص", tname: "Al-Qasas", ename: "The Stories", type: "Meccan" },
  { ayas: 69, start: 3340, name: "العنكبوت", tname: "Al-Ankaboot", ename: "The Spider", type: "Meccan" },
  { ayas: 60, start: 3409, name: "الروم", tname: "Ar-Room", ename: "The Romans", type: "Meccan" },
  { ayas: 34, start: 3469, name: "لقمان", tname: "Luqman", ename: "Luqman", type: "Meccan" },
  { ayas: 30, start: 3503, name: "السجدة", tname: "As-Sajda", ename: "The Prostration", type: "Meccan" },
  { ayas: 73, start: 3533, name: "الأحزاب", tname: "Al-Ahzaab", ename: "The Clans", type: "Medinan" },
  { ayas: 54, start: 3606, name: "سبأ", tname: "Saba", ename: "Sheba", type: "Meccan" },
  { ayas: 45, start: 3660, name: "فاطر", tname: "Faatir", ename: "The Originator", type: "Meccan" },
  { ayas: 83, start: 3705, name: "يس", tname: "Yaseen", ename: "Yaseen", type: "Meccan" },
  { ayas: 182, start: 3788, name: "الصافات", tname: "As-Saaffaat", ename: "Those drawn up in Ranks", type: "Meccan" },
  { ayas: 88, start: 3970, name: "ص", tname: "Saad", ename: "The Letter Saad", type: "Meccan" },
  { ayas: 75, start: 4058, name: "الزمر", tname: "Az-Zumar", ename: "The Groups", type: "Meccan" },
  { ayas: 85, start: 4133, name: "غافر", tname: "Ghafir", ename: "The Forgiver", type: "Meccan" },
  { ayas: 54, start: 4218, name: "فصلت", tname: "Fussilat", ename: "Explained in detail", type: "Meccan" },
  { ayas: 53, start: 4272, name: "الشورى", tname: "Ash-Shura", ename: "Consultation", type: "Meccan" },
  { ayas: 89, start: 4325, name: "الزخرف", tname: "Az-Zukhruf", ename: "Ornaments of gold", type: "Meccan" },
  { ayas: 59, start: 4414, name: "الدخان", tname: "Ad-Dukhaan", ename: "The Smoke", type: "Meccan" },
  { ayas: 37, start: 4473, name: "الجاثية", tname: "Al-Jaathiya", ename: "Crouching", type: "Meccan" },
  { ayas: 35, start: 4510, name: "الأحقاف", tname: "Al-Ahqaf", ename: "The Dunes", type: "Meccan" },
  { ayas: 38, start: 4545, name: "محمد", tname: "Muhammad", ename: "Muhammad", type: "Medinan" },
  { ayas: 29, start: 4583, name: "الفتح", tname: "Al-Fath", ename: "The Victory", type: "Medinan" },
  { ayas: 18, start: 4612, name: "الحجرات", tname: "Al-Hujuraat", ename: "The Inner Apartments", type: "Medinan" },
  { ayas: 45, start: 4630, name: "ق", tname: "Qaaf", ename: "The Letter Qaaf", type: "Meccan" },
  { ayas: 60, start: 4675, name: "الذاريات", tname: "Adh-Dhaariyat", ename: "The Winnowing Winds", type: "Meccan" },
  { ayas: 49, start: 4735, name: "الطور", tname: "At-Tur", ename: "The Mount", type: "Meccan" },
  { ayas: 62, start: 4784, name: "النجم", tname: "An-Najm", ename: "The Star", type: "Meccan" },
  { ayas: 55, start: 4846, name: "القمر", tname: "Al-Qamar", ename: "The Moon", type: "Meccan" },
  { ayas: 78, start: 4901, name: "الرحمن", tname: "Ar-Rahmaan", ename: "The Beneficent", type: "Medinan" },
  { ayas: 96, start: 4979, name: "الواقعة", tname: "Al-Waaqia", ename: "The Inevitable", type: "Meccan" },
  { ayas: 29, start: 5075, name: "الحديد", tname: "Al-Hadid", ename: "The Iron", type: "Medinan" },
  { ayas: 22, start: 5104, name: "المجادلة", tname: "Al-Mujaadila", ename: "The Pleading Woman", type: "Medinan" },
  { ayas: 24, start: 5126, name: "الحشر", tname: "Al-Hashr", ename: "The Exile", type: "Medinan" },
  { ayas: 13, start: 5150, name: "الممتحنة", tname: "Al-Mumtahana", ename: "She that is to be examined", type: "Medinan" },
  { ayas: 14, start: 5163, name: "الصف", tname: "As-Saff", ename: "The Ranks", type: "Medinan" },
  { ayas: 11, start: 5177, name: "الجمعة", tname: "Al-Jumu'a", ename: "Friday", type: "Medinan" },
  { ayas: 11, start: 5188, name: "المنافقون", tname: "Al-Munaafiqoon", ename: "The Hypocrites", type: "Medinan" },
  { ayas: 18, start: 5199, name: "التغابن", tname: "At-Taghaabun", ename: "Mutual Disillusion", type: "Medinan" },
  { ayas: 12, start: 5217, name: "الطلاق", tname: "At-Talaaq", ename: "Divorce", type: "Medinan" },
  { ayas: 12, start: 5229, name: "التحريم", tname: "At-Tahrim", ename: "The Prohibition", type: "Medinan" },
  { ayas: 30, start: 5241, name: "الملك", tname: "Al-Mulk", ename: "The Sovereignty", type: "Meccan" },
  { ayas: 52, start: 5271, name: "القلم", tname: "Al-Qalam", ename: "The Pen", type: "Meccan" },
  { ayas: 52, start: 5323, name: "الحاقة", tname: "Al-Haaqqa", ename: "The Reality", type: "Meccan" },
  { ayas: 44, start: 5375, name: "المعارج", tname: "Al-Ma'aarij", ename: "The Ascending Stairways", type: "Meccan" },
  { ayas: 28, start: 5419, name: "نوح", tname: "Nooh", ename: "Noah", type: "Meccan" },
  { ayas: 28, start: 5447, name: "الجن", tname: "Al-Jinn", ename: "The Jinn", type: "Meccan" },
  { ayas: 20, start: 5475, name: "المزمل", tname: "Al-Muzzammil", ename: "The Enshrouded One", type: "Meccan" },
  { ayas: 56, start: 5495, name: "المدثر", tname: "Al-Muddaththir", ename: "The Cloaked One", type: "Meccan" },
  { ayas: 40, start: 5551, name: "القيامة", tname: "Al-Qiyaama", ename: "The Resurrection", type: "Meccan" },
  { ayas: 31, start: 5591, name: "الإنسان", tname: "Al-Insaan", ename: "Man", type: "Medinan" },
  { ayas: 50, start: 5622, name: "المرسلات", tname: "Al-Mursalaat", ename: "The Emissaries", type: "Meccan" },
  { ayas: 40, start: 5672, name: "النبأ", tname: "An-Naba", ename: "The Announcement", type: "Meccan" },
  { ayas: 46, start: 5712, name: "النازعات", tname: "An-Naazi'aat", ename: "Those who drag forth", type: "Meccan" },
  { ayas: 42, start: 5758, name: "عبس", tname: "Abasa", ename: "He frowned", type: "Meccan" },
  { ayas: 29, start: 5800, name: "التكوير", tname: "At-Takwir", ename: "The Overthrowing", type: "Meccan" },
  { ayas: 19, start: 5829, name: "الانفطار", tname: "Al-Infitaar", ename: "The Cleaving", type: "Meccan" },
  { ayas: 36, start: 5848, name: "المطففين", tname: "Al-Mutaffifin", ename: "Defrauding", type: "Meccan" },
  { ayas: 25, start: 5884, name: "الانشقاق", tname: "Al-Inshiqaaq", ename: "The Splitting Open", type: "Meccan" },
  { ayas: 22, start: 5909, name: "البروج", tname: "Al-Burooj", ename: "The Mansions of the Stars", type: "Meccan" },
  { ayas: 17, start: 5931, name: "الطارق", tname: "At-Taariq", ename: "The Morning Star", type: "Meccan" },
  { ayas: 19, start: 5948, name: "الأعلى", tname: "Al-A'laa", ename: "The Most High", type: "Meccan" },
  { ayas: 26, start: 5967, name: "الغاشية", tname: "Al-Ghaashiya", ename: "The Overwhelming", type: "Meccan" },
  { ayas: 30, start: 5993, name: "الفجر", tname: "Al-Fajr", ename: "The Dawn", type: "Meccan" },
  { ayas: 20, start: 6023, name: "البلد", tname: "Al-Balad", ename: "The City", type: "Meccan" },
  { ayas: 15, start: 6043, name: "الشمس", tname: "Ash-Shams", ename: "The Sun", type: "Meccan" },
  { ayas: 21, start: 6058, name: "الليل", tname: "Al-Lail", ename: "The Night", type: "Meccan" },
  { ayas: 11, start: 6079, name: "الضحى", tname: "Ad-Dhuhaa", ename: "The Morning Hours", type: "Meccan" },
  { ayas: 8, start: 6090, name: "الشرح", tname: "Ash-Sharh", ename: "The Consolation", type: "Meccan" },
  { ayas: 8, start: 6098, name: "التين", tname: "At-Tin", ename: "The Fig", type: "Meccan" },
  { ayas: 19, start: 6106, name: "العلق", tname: "Al-Alaq", ename: "The Clot", type: "Meccan" },
  { ayas: 5, start: 6125, name: "القدر", tname: "Al-Qadr", ename: "The Power, Pair", type: "Meccan" },
  { ayas: 8, start: 6130, name: "البينة", tname: "Al-Bayyina", ename: "The Evidence", type: "Medinan" },
  { ayas: 8, start: 6138, name: "الزلزلة", tname: "Az-Zalzala", ename: "The Earthquake", type: "Medinan" },
  { ayas: 11, start: 6146, name: "العاديات", tname: "Al-Aadiyaat", ename: "The Chargers", type: "Meccan" },
  { ayas: 11, start: 6157, name: "القارعة", tname: "Al-Qaari'a", ename: "The Calamity", type: "Meccan" },
  { ayas: 8, start: 6168, name: "التكاثر", tname: "At-Takaathur", ename: "Competition", type: "Meccan" },
  { ayas: 3, start: 6176, name: "العصر", tname: "Al-Asr", ename: "The Declining Day, Epoch", type: "Meccan" },
  { ayas: 9, start: 6179, name: "الهمزة", tname: "Al-Humaza", ename: "The Traducer", type: "Meccan" },
  { ayas: 5, start: 6188, name: "الفيل", tname: "Al-Fil", ename: "The Elephant", type: "Meccan" },
  { ayas: 4, start: 6193, name: "قريش", tname: "Quraish", ename: "Quraysh", type: "Meccan" },
  { ayas: 7, start: 6197, name: "الماعون", tname: "Al-Maa'un", ename: "Almsgiving", type: "Meccan" },
  { ayas: 3, start: 6204, name: "الكوثر", tname: "Al-Kawthar", ename: "Abundance", type: "Meccan" },
  { ayas: 6, start: 6207, name: "الكافرون", tname: "Al-Kaafiroon", ename: "The Disbelievers", type: "Meccan" },
  { ayas: 3, start: 6213, name: "النصر", tname: "An-Nasr", ename: "Divine Support", type: "Medinan" },
  { ayas: 5, start: 6216, name: "المسد", tname: "Al-Masad", ename: "The Palm Fibre", type: "Meccan" },
  { ayas: 4, start: 6221, name: "الإخلاص", tname: "Al-Ikhlaas", ename: "Sincerity", type: "Meccan" },
  { ayas: 5, start: 6225, name: "الفلق", tname: "Al-Falaq", ename: "The Daybreak", type: "Meccan" },
  { ayas: 6, start: 6230, name: "الناس", tname: "An-Naas", ename: "Mankind", type: "Meccan" },
];

const TEXT_URL = "https://cdn.jsdelivr.net/npm/ar.tanzil.quran-simple.txt@1.0.0/content.json";

let cachedAyahs: string[] | null = null;

async function loadAllAyahs(): Promise<string[]> {
  if (cachedAyahs) return cachedAyahs;
  const res = await fetch(TEXT_URL);
  cachedAyahs = await res.json();
  return cachedAyahs!;
}

export function fetchSurahs(): Promise<Surah[]> {
  return Promise.resolve(
    SURAH_META.map((s, i) => ({
      number: i + 1,
      name: s.name,
      englishName: s.tname,
      englishNameTranslation: s.ename,
      numberOfAyahs: s.ayas,
      revelationType: s.type,
    }))
  );
}

export async function fetchSurah(number: number): Promise<SurahDetail> {
  const meta = SURAH_META[number - 1];
  const allAyahs = await loadAllAyahs();
  const ayahs: Ayah[] = [];

  for (let i = 0; i < meta.ayas; i++) {
    ayahs.push({
      number: meta.start + i + 1,
      text: allAyahs[meta.start + i],
      numberInSurah: i + 1,
    });
  }

  return {
    number,
    name: meta.name,
    englishName: meta.tname,
    englishNameTranslation: meta.ename,
    revelationType: meta.type,
    ayahs,
  };
}
