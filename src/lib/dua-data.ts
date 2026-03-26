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

let nextId = 1;
function d(category: string, title: string, arabic: string, translation: string, transliteration: string, reference: string): Dua {
  return { id: nextId++, category, title, arabic, translation, transliteration, reference };
}

const duaDatabase: DuaCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    icon: "☀️",
    duas: [
      d("morning", "Upon Waking Up", "الحَمْدُ لِلَّهِ الَّذِي أحْيَانَا بَعْدَ مَا أمَاتَنَا وَإِلَيْهِ النُّشُورُ", "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.", "Alhamdu lillahil-lathee ahyana baAAda ma amatana wa-ilayhin-nushoor", "Sahih Al-Bukhari"),
      d("morning", "Morning Remembrance", "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", "We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.", "Asbahna wa-asbahal-mulku lillah, walhamdu lillah, la ilaha illal-lahu wahdahu la shareeka lah, lahul-mulku walahul-hamdu wahuwa AAala kulli shay-in qadeer", "Abu Dawud 4/317"),
      d("morning", "Sayyid al-Istighfar", "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ", "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant. I abide by Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.", "Allahumma anta rabbee la ilaha illa ant, khalaqtanee wa-ana AAabduk, wa-ana AAala AAahdika wawaAAdika mas-tataAAt, aAAoothu bika min sharri ma sanaAAt, aboo-o laka biniAAmatika AAalay, wa-aboo-o bithanbee faghfir lee fa-innahu la yaghfiruth-thunooba illa ant", "Sahih Al-Bukhari 7/150"),
      d("morning", "Ayat al-Kursi", "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.", "Allahu la ilaha illa huwal-hayyul-qayyoom, la ta'khuthahu sinatun wala nawm, lahu ma fis-samawati wama fil-ard...", "Al-Baqarah 2:255"),
      d("morning", "Morning Tasbih", "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", "How perfect Allah is and I praise Him by the number of His creation and His pleasure, and by the weight of His throne, and the ink of His words.", "Subhanal-lahi wabihamdih, AAadada khalqih, warida nafsih, wazinata AAarshih, wamidada kalimatih", "Muslim 4/2090"),
      d("morning", "Morning Protection", "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing.", "Bismil-lahil-lathee la yadurru maAAas-mihi shay-on fil-ardi wala fis-sama-i wahuwas-sameeAAul-AAaleem", "Abu Dawud 4/323, At-Tirmidhi 5/465"),
      d("morning", "Placing Trust in Allah", "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", "Allah is sufficient for me. There is no deity except Him. I have placed my trust in Him, and He is Lord of the Great Throne.", "Hasbiyal-lahu la ilaha illa huwa, AAalayhi tawakkalt, wahuwa rabbul-AAarshil-AAatheem", "Abu Dawud"),
    ],
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    icon: "🌙",
    duas: [
      d("evening", "Evening Remembrance", "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", "We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.", "Amsayna wa-amsal-mulku lillah, walhamdu lillah, la ilaha illal-lahu wahdahu la shareeka lah, lahul-mulku walahul-hamdu wahuwa AAala kulli shay-in qadeer", "Abu Dawud 4/317"),
      d("evening", "Seeking Protection at Night", "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "I seek refuge in the perfect words of Allah from the evil of what He has created.", "AAAoothu bikalimatil-lahit-tammati min sharri ma khalaq", "Muslim 4/2081"),
      d("evening", "Before Sleeping", "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", "In Your name O Allah, I live and die.", "Bismika Allahumma amootu wa-ahya", "Sahih Al-Bukhari 11/113"),
      d("evening", "Evening Tasbih", "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "How perfect Allah is and I praise Him. (100 times)", "Subhanal-lahi wabihamdih", "Muslim 4/2071"),
      d("evening", "Surah Al-Ikhlas, Al-Falaq, An-Nas", "قُلْ هُوَ اللَّهُ أَحَدٌ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ", "Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas three times each in the evening.", "Qul huwal-lahu ahad... Qul aAAoothu birabbil-falaq... Qul aAAoothu birabbin-nas", "Abu Dawud 4/322, At-Tirmidhi 5/567"),
      d("evening", "Evening Supplication for Protection", "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", "O Allah, by Your leave we have reached the evening, by Your leave we have reached the morning, by Your leave we live and die, and unto You is our return.", "Allahumma bika amsayna, wabika asbahna, wabika nahya, wabika namootu wa-ilaykal-maseer", "At-Tirmidhi 5/466"),
    ],
  },
  {
    id: "prayer",
    name: "Prayer",
    icon: "🕌",
    duas: [
      d("prayer", "After the Adhan", "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ", "O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and favor, and raise him to the honored station You have promised him.", "Allahumma rabba hathihid-daAAawatit-tammah, wassalatil-qa-imah, ati Muhammadanil-waseelata walfadeelah, wabAAath-hu maqaman mahmoodanil-lathee waAAadtah", "Sahih Al-Bukhari 1/152"),
      d("prayer", "Opening Supplication in Prayer", "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ", "How perfect You are O Allah, and I praise You. Blessed be Your name, and lofty is Your position and none has the right to be worshipped except You.", "Subhanakal-lahumma wabihamdik, watabarakas-muk, wataAAala jadduk, wala ilaha ghayruk", "Abu Dawud, At-Tirmidhi, An-Nasa'i"),
      d("prayer", "Between the Two Prostrations", "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي", "My Lord, forgive me. My Lord, forgive me.", "Rabbighfir lee, rabbighfir lee", "Abu Dawud 1/231"),
      d("prayer", "After Tashahud Before Salam", "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ", "O Allah, I seek refuge in You from the punishment of the grave, from the punishment of Hell-fire, from the trials of life and death, and from the evil of the trial of the False Messiah.", "Allahumma innee aAAoothu bika min AAathabil-qabr, wamin AAathabi jahannam, wamin fitnatil-mahya walmamat, wamin sharri fitnatil-maseehid-dajjal", "Sahih Al-Bukhari 2/102, Muslim 1/412"),
      d("prayer", "After Salam", "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ", "I seek Allah's forgiveness. I seek Allah's forgiveness. I seek Allah's forgiveness.", "Astaghfirul-lah, astaghfirul-lah, astaghfirul-lah", "Muslim 1/414"),
      d("prayer", "Tasbeeh After Prayer", "سُبْحَانَ اللَّهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللَّهُ أَكْبَرُ (33) لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", "SubhanAllah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times, then: None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.", "Subhanal-lah (33), Alhamdulillah (33), Allahu akbar (33), La ilaha illal-lahu wahdahu la shareeka lah, lahul-mulku walahul-hamdu wahuwa AAala kulli shay-in qadeer", "Muslim 1/418"),
    ],
  },
  {
    id: "travel",
    name: "Travel",
    icon: "✈️",
    duas: [
      d("travel", "Dua for Travelling", "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ", "Allah is the Greatest (3 times). How perfect He is, the One who has placed this transport at our service and we ourselves would not have been capable of that, and to our Lord is our final destiny.", "Allahu akbar (3x), subhanal-lathee sakh-khara lana hatha wama kunna lahu muqrineen, wa-inna ila rabbina lamunqaliboon", "Muslim 2/978"),
      d("travel", "Returning from Travel", "آيِبُونَ، تائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ", "We return, repent, worship and praise our Lord.", "Aayiboona, ta-iboona, AAabidoona, lirabbina hamidoon", "Muslim 2/980"),
      d("travel", "Entering a Town or City", "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الْأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ، أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا", "O Allah, Lord of the seven heavens and all that they envelop, Lord of the seven earths and all that they carry, Lord of the devils and all whom they misguide, Lord of the winds and all whom they whisk away. I ask You for the goodness of this village and the goodness of its inhabitants. I seek refuge in You from its evil, the evil of its inhabitants and the evil within it.", "Allahumma rabbas-samawatis-sabAAi wama athlaln, warabbal-aradeenas-sabAAi wama aqlaln, warabba ash-shayateeni wama adlaln, warabbar-riyahi wama tharayn, as-aluka khayra hathihil-qaryati wa khayra ahlihaa, wa aAAoothu bika min sharrihaa wa sharri ahlihaa wa sharri maa feehaa", "Al-Hakim 2/100"),
      d("travel", "Dua When Stopping at a Place", "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "I seek refuge in Allah's perfect words from the evil of what He has created.", "AAAoothu bikalimatil-lahit-tammati min sharri ma khalaq", "Muslim 4/2080"),
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icon: "🍽️",
    duas: [
      d("food", "Before Eating", "بِسْمِ اللهِ", "In the name of Allah.", "Bismillah", "Abu Dawud 3/347, At-Tirmidhi 4/288"),
      d("food", "Forgetting to Say Bismillah", "بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ", "In the name of Allah at the beginning and at the end.", "Bismillahi fee awwalihi wa-aakhirih", "Abu Dawud 3/347, At-Tirmidhi 4/288"),
      d("food", "After Eating", "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", "All praise is for Allah who fed me this and provided it for me without any might or power from myself.", "Alhamdu lillahil-lathee atAAamanee hatha warazaqaneehi min ghayri hawlin minnee wala quwwah", "At-Tirmidhi, Abu Dawud, Ibn Majah"),
      d("food", "When Breaking Fast", "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ", "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.", "Thahabath-thama-u wabtallatil-AAurooqu wathabatal-ajru insha-Allah", "Abu Dawud 2/306"),
      d("food", "Dua for the Host", "اللَّهُمَّ أَطْعِمْ مَنْ أَطْعَمَنِي وَاسْقِ مَنْ سَقَانِي", "O Allah, feed the one who fed me and give drink to the one who gave me drink.", "Allahuma atAAim man atAAamanee wasqi man saqanee", "Muslim 3/1626"),
    ],
  },
  {
    id: "protection",
    name: "Protection",
    icon: "🛡️",
    duas: [
      d("protection", "Protection from Evil Eye", "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ", "I seek refuge in the perfect words of Allah from every devil and every poisonous reptile, and from every evil eye.", "AAAoothu bikalimatil-lahit-tammati min kulli shaytanin wahammah, wamin kulli AAaynin lammah", "Sahih Al-Bukhari 4/119"),
      d("protection", "For Anxiety and Sorrow", "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.", "Allahumma innee aAAoothu bika minal-hammi walhuzn, walAAajzi walksal, walbukhl, walJubn, wadalaAAid-dayni waghalabatir-rijal", "Sahih Al-Bukhari 7/158"),
      d("protection", "Entering the Home", "بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا", "In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.", "Bismil-lahi walajna, wabismil-lahi kharajna, waAAala rabbina tawakkalna", "Abu Dawud 4/325"),
      d("protection", "Leaving the Home", "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.", "Bismil-lah, tawakkaltu AAalal-lah, wala hawla wala quwwata illa billah", "Abu Dawud 4/325, At-Tirmidhi 5/490"),
      d("protection", "When in Distress", "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ", "None has the right to be worshipped except Allah, the Magnificent, the Tolerant. None has the right to be worshipped except Allah, Lord of the Magnificent Throne. None has the right to be worshipped except Allah, Lord of the heavens, Lord of the earth and Lord of the Noble Throne.", "La ilaha illal-lahul-AAatheemul-haleem, la ilaha illal-lahu rabbul-AAarshil-AAatheem, la ilaha illal-lahu rabbus-samawati warabbul-ardi warabbul-AAarshil-kareem", "Sahih Al-Bukhari 8/154, Muslim 4/2092"),
      d("protection", "Entering the Masjid", "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ", "I seek refuge with Allah, The Supreme and with His Noble Face, and His eternal authority from the accursed devil.", "AAAoothu billahil-AAatheem, wabiwajhihil-kareem, wasultanihil-qadeem, minash-shaytanir-rajeem", "Abu Dawud"),
    ],
  },
  {
    id: "health",
    name: "Health & Healing",
    icon: "💚",
    duas: [
      d("health", "Visiting the Sick", "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ", "Do not worry, it will be a purification (for you), if Allah wills.", "La ba'sa tahoorun insha'Allah", "Sahih Al-Bukhari"),
      d("health", "Dua for Healing", "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمَاً", "O Allah, Lord of mankind, remove the affliction. Cure him, for You are the One who cures. There is no cure except Your cure — a cure that leaves no illness behind.", "Allahumma rabban-nas, athhibil-ba's, ishfihi wa-antash-shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama", "Sahih Al-Bukhari, Sahih Muslim"),
      d("health", "Placing Hand on Pain", "بِسْمِ اللَّهِ (ثَلَاثًا) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ", "In the name of Allah (three times). I seek refuge in Allah and His power from the evil of what I find and fear.", "Bismillah (3x), aAAoothu billahi waqudratih min sharri ma ajidu wa-uhaathir", "Muslim 4/1728"),
      d("health", "When Experiencing Pain", "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ", "I ask Allah the Supreme, Lord of the Magnificent Throne, to cure you. (7 times)", "As-alul-lahal-AAatheem, rabbal-AAarshil-AAatheem, an yashfiyak (7x)", "At-Tirmidhi 2/210, Abu Dawud"),
    ],
  },
  {
    id: "forgiveness",
    name: "Forgiveness",
    icon: "🤲",
    duas: [
      d("forgiveness", "Seeking Forgiveness", "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", "I seek the forgiveness of Allah, there is no deity but He, the Living, the Sustainer, and I repent to Him.", "Astaghfirul-lahal-lathee la ilaha illa huwal-hayyul-qayyoomu wa-atoobu ilayh", "Abu Dawud 2/85, At-Tirmidhi 5/569"),
      d("forgiveness", "Comprehensive Forgiveness", "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ", "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.", "Rabbana thalamna anfusana wa-in lam taghfir lana watarhamna lanakoonanna minal-khasireen", "Al-A'raf 7:23"),
      d("forgiveness", "Dua of Yunus (AS)", "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.", "La ilaha illa anta subhanaka innee kuntu minath-thalimeen", "Al-Anbiya 21:87"),
      d("forgiveness", "Istighfar 100 Times", "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", "I seek Allah's forgiveness and repent to Him. (100 times daily)", "Astaghfirul-laha wa-atoobu ilayh", "Sahih Al-Bukhari 11/101, Muslim 4/2075"),
      d("forgiveness", "Prayer of Repentance", "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", "O Allah, You are my Lord, there is no deity but You. You created me and I am Your servant. I keep Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your blessings upon me, and I acknowledge my sin. So forgive me, for none forgives sins but You.", "Allahumma anta rabbee la ilaha illa ant...", "Sahih Al-Bukhari 7/150"),
    ],
  },
  {
    id: "knowledge",
    name: "Knowledge & Guidance",
    icon: "📖",
    duas: [
      d("knowledge", "Increase in Knowledge", "رَبِّ زِدْنِي عِلْمًا", "My Lord, increase me in knowledge.", "Rabbi zidnee AAilma", "Ta-Ha 20:114"),
      d("knowledge", "Dua for Guidance (Istikhara)", "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ", "O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty. You have power, I have none. And You know, I know not. You are the Knower of hidden things.", "Allahumma innee astakheeruka biAAilmik, wa-astaqdiruka biqudratik, wa-as-aluka min fadlikal-AAatheem, fa-innaka taqdiru wala aqdir, wataAAlamu wala aAAlam, wa-anta AAallamul-ghuyoob", "Sahih Al-Bukhari 7/162"),
      d("knowledge", "Before Studying", "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا", "O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.", "Allahumma-nfaAAnee bima AAallamtanee, waAAallimnee ma yanfaAAunee, wazidnee AAilma", "At-Tirmidhi, Ibn Majah"),
      d("knowledge", "Seeking Beneficial Knowledge", "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا", "O Allah, I ask You for beneficial knowledge, goodly provision and acceptable deeds.", "Allahumma innee as-aluka AAilman nafiAAa, warizqan tayyiba, waAAamalan mutaqabbala", "Ibn Majah"),
    ],
  },
  {
    id: "parents",
    name: "Parents & Family",
    icon: "👨‍👩‍👧‍👦",
    duas: [
      d("parents", "For Parents", "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", "My Lord, have mercy upon them as they brought me up when I was small.", "Rabbir-hamhuma kama rabbayani sagheera", "Al-Isra 17:24"),
      d("parents", "For Offspring", "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.", "Rabbana hab lana min azwajina wathurriyyatina qurrata aAAyunin wajAAalna lilmuttaqeena imama", "Al-Furqan 25:74"),
      d("parents", "For Righteous Children", "رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ", "My Lord, grant me from among the righteous.", "Rabbi hab lee minas-saliheen", "As-Saffat 37:100"),
      d("parents", "For Family Unity", "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ", "Our Lord, forgive me and my parents and the believers the Day the account is established.", "Rabbana-ghfir lee waliwalidayya walilmu'mineena yawma yaqoomul-hisab", "Ibrahim 14:41"),
    ],
  },
  {
    id: "wealth",
    name: "Wealth & Provision",
    icon: "💎",
    duas: [
      d("wealth", "For Halal Provision", "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ", "O Allah, suffice me with what You have allowed instead of what You have forbidden, and make me independent of all others besides You.", "Allahummak-finee bihalalika AAan haramik, wa-aghninee bifadlika AAamman siwak", "At-Tirmidhi 5/560"),
      d("wealth", "Seeking Sustenance", "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى", "O Allah, I ask You for guidance, piety, chastity and self-sufficiency.", "Allahumma innee as-alukal-huda, wattuqa, walAAafaf, walghina", "Muslim 4/2087"),
      d("wealth", "Protection from Debt", "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْمَأْثَمِ وَالْمَغْرَمِ", "O Allah, I seek refuge in You from sin and heavy debt.", "Allahumma innee aAAoothu bika minal-ma'thami walmaghram", "Sahih Al-Bukhari, Muslim"),
      d("wealth", "Barakah in Provision", "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", "O Allah, bless us in what You have provided us and protect us from the punishment of the Fire.", "Allahumma barik lana feema razaqtana waqina AAathaban-nar", "Ibn As-Sunni"),
    ],
  },
  {
    id: "daily",
    name: "Daily Life",
    icon: "🌿",
    duas: [
      d("daily", "Entering the Bathroom", "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", "O Allah, I seek refuge in You from the male and female evil spirits.", "Allahumma innee aAAoothu bika minal-khubthi walkhaba-ith", "Sahih Al-Bukhari 1/45, Muslim 1/283"),
      d("daily", "Leaving the Bathroom", "غُفْرَانَكَ", "I seek Your forgiveness.", "Ghufranaka", "Abu Dawud 1/30, At-Tirmidhi 1/12"),
      d("daily", "Wearing New Clothes", "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ خَيْرَهُ وَخَيْرَ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ", "O Allah, all praise is for You. You have clothed me with it. I ask You for its goodness and the goodness for which it was made, and I seek refuge in You from its evil and the evil for which it was made.", "Allahumma lakal-hamdu anta kasawtaneeh, as-aluka khayrahu wa khayra ma suniAAa lah, wa-aAAoothu bika min sharrihi wa sharri ma suniAAa lah", "Abu Dawud 4/41, At-Tirmidhi 5/543"),
      d("daily", "Looking in the Mirror", "اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي", "O Allah, You have made my outward form beautiful, so make my character beautiful too.", "Allahumma anta hassanta khalqee fahassin khuluqee", "Ahmad 1/403"),
      d("daily", "When it Rains", "اللَّهُمَّ صَيِّبًا نَافِعًا", "O Allah, let it be a beneficial rain.", "Allahumma sayyiban nafiAAa", "Sahih Al-Bukhari"),
      d("daily", "Upon Hearing Thunder", "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ", "How perfect He is, whom the thunder declares His perfection with His praise, as do the angels out of fear of Him.", "Subhanal-lathee yusabbihur-raAAdu bihamdih, walmalaa-ikatu min kheefatih", "Al-Muwatta 2/992"),
    ],
  },
  {
    id: "khatm",
    name: "Khatm al-Quran",
    icon: "📿",
    duas: [
      d("khatm", "Upon Completing the Quran", "صَدَقَ اللَّهُ الْعَظِيمُ", "Allah the Almighty has spoken the truth.", "Sadaqal-lahul-AAatheem", "Common practice"),
      d("khatm", "Dua after Khatm al-Quran", "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً", "O Allah, have mercy on me through the Quran, and make it for me a guide, a light, a source of guidance and mercy.", "Allahummar-hamnee bil-Quran, wajAAalhu lee imaman wa nooran wa hudan wa rahmah", "Al-Bayhaqi"),
      d("khatm", "Asking for Understanding", "اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ", "O Allah, remind me of what I forget from it, teach me what I am ignorant of in it, and grant me its recitation during the hours of the night and the ends of the day.", "Allahumma thakkirnee minhu ma naseet, waAAallimnee minhu ma jahilt, warzuqnee tilawatahu ana-al-layli wa-atrafan-nahar", "Al-Bayhaqi"),
      d("khatm", "Intercession of the Quran", "اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلاءَ حُزْنِي، وَذَهَابَ هَمِّي", "O Allah, make the Quran the spring of my heart, the light of my chest, the banisher of my sadness, and the reliever of my distress.", "AllahummajAAalil-Qurana rabeeAAa qalbee, wa noora sadree, wa jalaa-a huznee, wa thahaba hammee", "Ahmad 1/391"),
      d("khatm", "Protection Through the Quran", "اللَّهُمَّ اجْعَلِ الْقُرْآنَ حُجَّةً لِي وَلَا تَجْعَلْهُ حُجَّةً عَلَيَّ", "O Allah, make the Quran a proof for me and not a proof against me.", "AllahummajAAalil-Qurana hujjatan lee wala tajAAalhu hujjatan AAalayy", "Muslim"),
      d("khatm", "Steadfastness with the Quran", "اللَّهُمَّ ارْفَعْنِي بِالْقُرْآنِ وَلَا تَضَعْنِي بِدُونِهِ", "O Allah, elevate me through the Quran and do not lower me without it.", "Allahummar-faAAnee bil-Quran wala tadaAAnee bidoonih", "Narrated tradition"),
      d("khatm", "Completion Gratitude", "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ", "All praise is for Allah, by whose grace good deeds are completed.", "Alhamdu lillahil-lathee biniAAmatihee tatimmus-salihat", "Ibn As-Sunni, Al-Hakim"),
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
