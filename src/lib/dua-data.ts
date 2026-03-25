export interface Dua {
  id: number;
  category: string;
  title: string;
  arabic: string;
  translation: string;
  transliteration: string;
  reference: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  icon: string;
  duas: Dua[];
}

const duaDatabase: DuaCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    icon: "☀️",
    duas: [
      {
        id: 1,
        category: "morning",
        title: "Upon Waking Up",
        arabic: "الحَمْدُ لِلَّهِ الَّذِي أحْيَانَا بَعْدَ مَا أمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        translation: "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
        transliteration: "Alhamdu lillahil-lathee ahyana baAAda ma amatana wa-ilayhin-nushoor",
        reference: "Sahih Al-Bukhari",
      },
      {
        id: 2,
        category: "morning",
        title: "Morning Remembrance",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        translation: "We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.",
        transliteration: "Asbahna wa-asbahal-mulku lillah, walhamdu lillah, la ilaha illal-lahu wahdahu la shareeka lah, lahul-mulku walahul-hamdu wahuwa AAala kulli shay-in qadeer",
        reference: "Abu Dawud 4/317",
      },
      {
        id: 3,
        category: "morning",
        title: "Sayyid al-Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ",
        translation: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant. I abide by Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.",
        transliteration: "Allahumma anta rabbee la ilaha illa ant, khalaqtanee wa-ana AAabduk, wa-ana AAala AAahdika wawaAAdika mas-tataAAt, aAAoothu bika min sharri ma sanaAAt, aboo-o laka biniAAmatika AAalay, wa-aboo-o bithanbee faghfir lee fa-innahu la yaghfiruth-thunooba illa ant",
        reference: "Sahih Al-Bukhari 7/150",
      },
    ],
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    icon: "🌙",
    duas: [
      {
        id: 4,
        category: "evening",
        title: "Evening Remembrance",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        translation: "We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent.",
        transliteration: "Amsayna wa-amsal-mulku lillah, walhamdu lillah, la ilaha illal-lahu wahdahu la shareeka lah, lahul-mulku walahul-hamdu wahuwa AAala kulli shay-in qadeer",
        reference: "Abu Dawud 4/317",
      },
      {
        id: 5,
        category: "evening",
        title: "Seeking Protection at Night",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        transliteration: "AAAoothu bikalimatil-lahit-tammati min sharri ma khalaq",
        reference: "Muslim 4/2081",
      },
      {
        id: 6,
        category: "evening",
        title: "Before Sleeping",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        translation: "In Your name O Allah, I live and die.",
        transliteration: "Bismika Allahumma amootu wa-ahya",
        reference: "Sahih Al-Bukhari 11/113",
      },
    ],
  },
  {
    id: "prayer",
    name: "Prayer",
    icon: "🕌",
    duas: [
      {
        id: 7,
        category: "prayer",
        title: "After the Adhan",
        arabic: "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ",
        translation: "O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and favor, and raise him to the honored station You have promised him.",
        transliteration: "Allahumma rabba hathihid-daAAawatit-tammah, wassalatil-qa-imah, ati Muhammadanil-waseelata walfadeelah, wabAAath-hu maqaman mahmoodanil-lathee waAAadtah",
        reference: "Sahih Al-Bukhari 1/152",
      },
      {
        id: 8,
        category: "prayer",
        title: "Opening Supplication in Prayer",
        arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
        translation: "How perfect You are O Allah, and I praise You. Blessed be Your name, and lofty is Your position and none has the right to be worshipped except You.",
        transliteration: "Subhanakal-lahumma wabihamdik, watabarakas-muk, wataAAala jadduk, wala ilaha ghayruk",
        reference: "Abu Dawud, At-Tirmidhi, An-Nasa'i",
      },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    icon: "✈️",
    duas: [
      {
        id: 9,
        category: "travel",
        title: "Dua for Travelling",
        arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ",
        translation: "Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. How perfect He is, the One who has placed this (transport) at our service and we ourselves would not have been capable of that, and to our Lord is our final destiny.",
        transliteration: "Allahu akbar, Allahu akbar, Allahu akbar, subhanal-lathee sakh-khara lana hatha wama kunna lahu muqrineen, wa-inna ila rabbina lamunqaliboon",
        reference: "Muslim 2/978",
      },
      {
        id: 10,
        category: "travel",
        title: "Returning from Travel",
        arabic: "آيِبُونَ، تائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ",
        translation: "We return, repent, worship and praise our Lord.",
        transliteration: "Aayiboona, ta-iboona, AAabidoona, lirabbina hamidoon",
        reference: "Muslim 2/980",
      },
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icon: "🍽️",
    duas: [
      {
        id: 11,
        category: "food",
        title: "Before Eating",
        arabic: "بِسْمِ اللهِ",
        translation: "In the name of Allah.",
        transliteration: "Bismillah",
        reference: "Abu Dawud 3/347, At-Tirmidhi 4/288",
      },
      {
        id: 12,
        category: "food",
        title: "After Eating",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        translation: "All praise is for Allah who fed me this and provided it for me without any might or power from myself.",
        transliteration: "Alhamdu lillahil-lathee atAAamanee hatha warazaqaneehi min ghayri hawlin minnee wala quwwah",
        reference: "At-Tirmidhi, Abu Dawud, Ibn Majah",
      },
    ],
  },
  {
    id: "protection",
    name: "Protection",
    icon: "🛡️",
    duas: [
      {
        id: 13,
        category: "protection",
        title: "Protection from Evil Eye",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
        translation: "I seek refuge in the perfect words of Allah from every devil and every poisonous reptile, and from every evil eye.",
        transliteration: "AAAoothu bikalimatil-lahit-tammati min kulli shaytanin wahammah, wamin kulli AAaynin lammah",
        reference: "Sahih Al-Bukhari 4/119",
      },
      {
        id: 14,
        category: "protection",
        title: "For Anxiety and Sorrow",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        translation: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
        transliteration: "Allahumma innee aAAoothu bika minal-hammi walhuzn, walAAajzi walksal, walbukhl, walJubn, wadalaAAid-dayni waghalabatir-rijal",
        reference: "Sahih Al-Bukhari 7/158",
      },
      {
        id: 15,
        category: "protection",
        title: "Entering the Home",
        arabic: "بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا",
        translation: "In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.",
        transliteration: "Bismil-lahi walajna, wabismil-lahi kharajna, waAAala rabbina tawakkalna",
        reference: "Abu Dawud 4/325",
      },
    ],
  },
  {
    id: "health",
    name: "Health & Healing",
    icon: "💚",
    duas: [
      {
        id: 16,
        category: "health",
        title: "Visiting the Sick",
        arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
        translation: "Do not worry, it will be a purification (for you), if Allah wills.",
        transliteration: "La ba'sa tahoorun insha'Allah",
        reference: "Sahih Al-Bukhari",
      },
      {
        id: 17,
        category: "health",
        title: "Dua for Healing",
        arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمَاً",
        translation: "O Allah, Lord of mankind, remove the affliction. Cure him, for You are the One who cures. There is no cure except Your cure — a cure that leaves no illness behind.",
        transliteration: "Allahumma rabban-nas, athhibil-ba's, ishfihi wa-antash-shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama",
        reference: "Sahih Al-Bukhari, Sahih Muslim",
      },
    ],
  },
];

export function getAllCategories(): DuaCategory[] {
  return duaDatabase;
}

export function getDuasByCategory(categoryId: string): Dua[] {
  return duaDatabase.find((c) => c.id === categoryId)?.duas ?? [];
}

export function getDailyDua(): Dua {
  const allDuas = duaDatabase.flatMap((c) => c.duas);
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return allDuas[dayOfYear % allDuas.length];
}

export function getAllDuas(): Dua[] {
  return duaDatabase.flatMap((c) => c.duas);
}
