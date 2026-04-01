import { getLastRead } from "@/lib/storage";
import { BookOpen, ChevronRight } from "lucide-react";
import { SURAH_NAMES } from "@/lib/quran-metadata";

interface ContinueReadingProps {
  onContinue: (surahNumber: number, ayahIndex: number) => void;
}

const ContinueReading = ({ onContinue }: ContinueReadingProps) => {
  const lastRead = getLastRead();

  if (!lastRead) return null;

  const surahName = SURAH_NAMES[lastRead.surahNumber - 1];

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
            {surahName ?? `Surah ${lastRead.surahNumber}`} — Ayah {lastRead.ayahIndex + 1}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </button>
    </div>
  );
};

export default ContinueReading;
