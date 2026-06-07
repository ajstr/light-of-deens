// Curated daily hadith collection — short, authentic, beneficial.
// Selected from Sahih al-Bukhari, Muslim, and the 40 Hadith of An-Nawawi.

export interface DailyHadithEntry {
  english: string;
  arabic: string;
  reference: string;
  narrator?: string;
}

export const DAILY_HADITHS: DailyHadithEntry[] = [
  {
    english: "Actions are but by intentions, and every man shall have only that which he intended.",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    reference: "Bukhari 1, Muslim 1907 — 40 Hadith of Nawawi #1",
    narrator: "Umar ibn al-Khattab",
  },
  {
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    reference: "Bukhari 13, Muslim 45 — Nawawi #13",
    narrator: "Anas ibn Malik",
  },
  {
    english: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    reference: "Bukhari 6018, Muslim 47 — Nawawi #15",
    narrator: "Abu Hurayrah",
  },
  {
    english: "Part of the perfection of a person's Islam is leaving that which does not concern him.",
    arabic: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
    reference: "Tirmidhi 2317 — Nawawi #12",
    narrator: "Abu Hurayrah",
  },
  {
    english: "The strong is not the one who overcomes people by his strength, but the strong is the one who controls himself while in anger.",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    reference: "Bukhari 6114, Muslim 2609",
    narrator: "Abu Hurayrah",
  },
  {
    english: "Smiling in the face of your brother is charity.",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ",
    reference: "Tirmidhi 1956",
    narrator: "Abu Dharr",
  },
  {
    english: "Be in this world as though you were a stranger or a wayfarer.",
    arabic: "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ",
    reference: "Bukhari 6416 — Nawawi #40",
    narrator: "Ibn 'Umar",
  },
  {
    english: "Fear Allah wherever you are, follow a bad deed with a good one to wipe it out, and treat people with good character.",
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
    reference: "Tirmidhi 1987 — Nawawi #18",
    narrator: "Abu Dharr & Mu'adh",
  },
  {
    english: "The most beloved of deeds to Allah are those done consistently, even if they are few.",
    arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    reference: "Bukhari 6464, Muslim 783",
    narrator: "'A'ishah",
  },
  {
    english: "Whoever does not show mercy to people, Allah will not show mercy to him.",
    arabic: "مَنْ لاَ يَرْحَمِ النَّاسَ لاَ يَرْحَمْهُ اللَّهُ",
    reference: "Bukhari 7376, Muslim 2319",
    narrator: "Jarir ibn 'Abdullah",
  },
  {
    english: "Allah does not look at your appearances or your wealth, but He looks at your hearts and your deeds.",
    arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    reference: "Muslim 2564",
    narrator: "Abu Hurayrah",
  },
  {
    english: "Religion is sincerity. We said: To whom? He said: To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk.",
    arabic: "الدِّينُ النَّصِيحَةُ، قُلْنَا لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
    reference: "Muslim 55 — Nawawi #7",
    narrator: "Tamim ad-Dari",
  },
  {
    english: "A good word is charity.",
    arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    reference: "Bukhari 2989, Muslim 1009",
    narrator: "Abu Hurayrah",
  },
  {
    english: "Whoever recites a letter from the Book of Allah, he earns a reward, and the reward is multiplied by ten.",
    arabic: "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا",
    reference: "Tirmidhi 2910",
    narrator: "Ibn Mas'ud",
  },
  {
    english: "Whoever takes a path in search of knowledge, Allah makes easy for him a path to Paradise.",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    reference: "Muslim 2699",
    narrator: "Abu Hurayrah",
  },
  {
    english: "The best of you are those who are best to their families, and I am the best of you to my family.",
    arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي",
    reference: "Tirmidhi 3895",
    narrator: "'A'ishah",
  },
  {
    english: "The seeker of knowledge is in the path of Allah until he returns.",
    arabic: "مَنْ خَرَجَ فِي طَلَبِ الْعِلْمِ فَهُوَ فِي سَبِيلِ اللَّهِ حَتَّى يَرْجِعَ",
    reference: "Tirmidhi 2647",
    narrator: "Anas ibn Malik",
  },
  {
    english: "Modesty brings nothing but good.",
    arabic: "الْحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ",
    reference: "Bukhari 6117, Muslim 37",
    narrator: "'Imran ibn Husayn",
  },
  {
    english: "Whoever fasts Ramadan out of faith and hoping for reward, his previous sins will be forgiven.",
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    reference: "Bukhari 38, Muslim 760",
    narrator: "Abu Hurayrah",
  },
  {
    english: "Two blessings most people are deceived about: good health and free time.",
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
    reference: "Bukhari 6412",
    narrator: "Ibn 'Abbas",
  },
  {
    english: "Make things easy and do not make them difficult; give glad tidings and do not repel.",
    arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا",
    reference: "Bukhari 69, Muslim 1734",
    narrator: "Anas ibn Malik",
  },
  {
    english: "Whoever covers the faults of a Muslim, Allah will cover his faults in this world and the next.",
    arabic: "مَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالْآخِرَةِ",
    reference: "Muslim 2699",
    narrator: "Abu Hurayrah",
  },
  {
    english: "Cleanliness is half of faith.",
    arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
    reference: "Muslim 223",
    narrator: "Abu Malik al-Ash'ari",
  },
  {
    english: "Beware of suspicion, for suspicion is the most false of speech.",
    arabic: "إِيَّاكُمْ وَالظَّنَّ، فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ",
    reference: "Bukhari 5143, Muslim 2563",
    narrator: "Abu Hurayrah",
  },
  {
    english: "The best of you are those who have the best manners and character.",
    arabic: "خِيَارُكُمْ أَحَاسِنُكُمْ أَخْلَاقًا",
    reference: "Bukhari 3559",
    narrator: "'Abdullah ibn 'Amr",
  },
  {
    english: "He who shows mercy receives mercy. Show mercy to those on earth, and the One above the heavens will show mercy to you.",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا أَهْلَ الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ",
    reference: "Abu Dawud 4941, Tirmidhi 1924",
    narrator: "'Abdullah ibn 'Amr",
  },
  {
    english: "Whoever does not thank people has not thanked Allah.",
    arabic: "مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ",
    reference: "Abu Dawud 4811, Tirmidhi 1955",
    narrator: "Abu Hurayrah",
  },
  {
    english: "When one of you sees something evil, let him change it with his hand; if he cannot, then with his tongue; if he cannot, then with his heart — and that is the weakest of faith.",
    arabic: "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ",
    reference: "Muslim 49 — Nawawi #34",
    narrator: "Abu Sa'id al-Khudri",
  },
  {
    english: "A Muslim is the one from whose tongue and hand other Muslims are safe.",
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    reference: "Bukhari 10, Muslim 40",
    narrator: "'Abdullah ibn 'Amr",
  },
  {
    english: "Allah is gentle and loves gentleness in all matters.",
    arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الْأَمْرِ كُلِّهِ",
    reference: "Bukhari 6927, Muslim 2165",
    narrator: "'A'ishah",
  },
];

function dayKey(d = new Date()): number {
  // Days since epoch (UTC) — stable across timezones for a given calendar day.
  return Math.floor(d.getTime() / 86400000);
}

export function getTodaysHadith(d = new Date()): DailyHadithEntry {
  const idx = ((dayKey(d) % DAILY_HADITHS.length) + DAILY_HADITHS.length) % DAILY_HADITHS.length;
  return DAILY_HADITHS[idx];
}
