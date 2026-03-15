import { useQuery } from "@tanstack/react-query";
import { fetchSurah, Surah } from "@/lib/quran-api";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SurahReaderProps {
  surah: Surah;
  onBack: () => void;
}

const SurahReader = ({ surah, onBack }: SurahReaderProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["surah", surah.number],
    queryFn: () => fetchSurah(surah.number),
  });

  return (
    <div className="max-w-3xl mx-auto px-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Surahs
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="font-arabic text-4xl text-primary mb-2">{surah.name}</h2>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-1">
          {surah.englishName}
        </h3>
        <p className="text-muted-foreground">
          {surah.englishNameTranslation} · {surah.numberOfAyahs} Ayahs ·{" "}
          {surah.revelationType}
        </p>
        <div className="ornament-divider mt-6 mx-auto max-w-xs" />
      </motion.div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <p className="font-arabic text-3xl text-center text-primary mb-8 leading-loose">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.ayahs.map((ayah, i) => (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.03, 1) }}
              className="bg-card rounded-lg p-6 group"
            >
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0 mt-2">
                  {ayah.numberInSurah}
                </span>
                <div className="flex-1 space-y-3">
                  <p className="font-arabic text-2xl leading-[2.2] text-foreground text-right" dir="rtl">
                    {ayah.text}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-3">
                    {ayah.translation}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurahReader;
