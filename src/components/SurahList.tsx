import { useQuery } from "@tanstack/react-query";
import { fetchSurahs, Surah } from "@/lib/quran-api";
import { motion } from "framer-motion";
import { Book, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SurahListProps {
  onSelect: (surah: Surah) => void;
}

const SurahList = ({ onSelect }: SurahListProps) => {
  const [search, setSearch] = useState("");
  const { data: surahs, isLoading } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
  });

  const filtered = surahs?.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.number.toString().includes(search) ||
      s.name.includes(search)
  );

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <Input
          placeholder="Search surahs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border-border font-sans text-base"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered?.map((surah, i) => (
            <motion.button
              key={surah.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              onClick={() => onSelect(surah)}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-secondary transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                {surah.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-semibold text-foreground">
                    {surah.englishName}
                  </h3>
                  <span className="font-arabic text-xl text-primary shrink-0">
                    {surah.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{surah.englishNameTranslation}</span>
                  <span>·</span>
                  <span>{surah.numberOfAyahs} Ayahs</span>
                  <span>·</span>
                  <span>{surah.revelationType}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurahList;
