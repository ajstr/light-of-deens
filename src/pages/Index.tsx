import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Book } from "lucide-react";
import SurahList from "@/components/SurahList";
import SurahReader from "@/components/SurahReader";
import { Surah, fetchSurahs } from "@/lib/quran-api";

const Index = () => {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [initialAyah, setInitialAyah] = useState(0);

  const { data: surahs } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
  });

  const handleSurahChange = useCallback(
    (surahNumber: number, ayah: number) => {
      const target = surahs?.find((s) => s.number === surahNumber);
      if (target) {
        setInitialAyah(ayah);
        setSelectedSurah(target);
      }
    },
    [surahs]
  );

  const handleSelect = (surah: Surah) => {
    setInitialAyah(0);
    setSelectedSurah(surah);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="py-8 text-center border-b border-border mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <Book className="w-7 h-7 text-gold" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            القرآن الكريم
          </h1>
          <Book className="w-7 h-7 text-gold" />
        </motion.div>
        <p className="text-muted-foreground font-display text-lg">The Noble Quran</p>
        <div className="ornament-divider mt-4 mx-auto max-w-xs" />
      </header>

      {selectedSurah ? (
        <SurahReader
          surah={selectedSurah}
          onBack={() => setSelectedSurah(null)}
          onSurahChange={handleSurahChange}
          initialAyah={initialAyah}
        />
      ) : (
        <SurahList onSelect={handleSelect} />
      )}
    </div>
  );
};

export default Index;
