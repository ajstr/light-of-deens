import { getLastRead } from "@/lib/storage";
import { BookOpen, ChevronRight } from "lucide-react";
import { Surah } from "@/lib/quran-api";

interface ContinueReadingProps {
  surahs: Surah[];
  onContinue: (surahNumber: number, ayahIndex: number) => void;
}

const ContinueReading = ({ surahs, onContinue }: ContinueReadingProps) => {
  const lastRead = getLastRead();

  if (!lastRead || surahs.length === 0) return null;

  const surah = surahs.find((s) => s.number === lastRead.surahNumber);
  const displayName = surah ? surah.englishName : `Surah ${lastRead.surahNumber}`;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-6">
      <button
        onClick={() => onContinue(lastRead.surahNumber, lastRead.ayahIndex)}
        className="w-full flex items-center gap-4 bg-card hover:bg-accent/10 border border-border rounded-xl px-5 py-4 transition-colors text-left group"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Continue Reading</p>
          <p className="text-foreground font-semibold truncate">
            {displayName} — Ayah {lastRead.ayahIndex + 1}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </button>
    </div>
  );
};

export default ContinueReading;
