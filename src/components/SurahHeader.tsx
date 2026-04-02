import { motion } from "framer-motion";
import { Surah } from "@/lib/quran-api";

interface SurahHeaderProps {
  surah: Surah;
  arabicFontClass: string;
}

const SurahHeader = ({ surah, arabicFontClass }: SurahHeaderProps) => (
  <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <h2 className={`${arabicFontClass} text-4xl text-primary mb-2`}>{surah.name}</h2>
      <h3 className="font-display text-2xl font-semibold text-foreground mb-1">
        {surah.englishName}
      </h3>
      <p className="text-muted-foreground">
        {surah.englishNameTranslation} · {surah.numberOfAyahs} Ayahs · {surah.revelationType}
      </p>
      <div className="ornament-divider mt-6 mx-auto max-w-xs" />
    </motion.div>

    {surah.number !== 1 && surah.number !== 9 && (
      <p className={`${arabicFontClass} text-3xl text-center text-primary mb-8 leading-loose`}>
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
    )}
  </>
);

export default SurahHeader;
