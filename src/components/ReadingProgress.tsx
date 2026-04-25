import { useEffect, useState } from "react";
import { getTotalAyahsRead, TOTAL_QURAN_AYAHS, getReadingProgress, subscribeProgressChange } from "@/lib/storage";
import { BookOpen, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ReadingProgress = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeProgressChange(() => setTick((t) => t + 1));
  }, []);

  const totalRead = getTotalAyahsRead();
  const percentage = Math.min(Math.round((totalRead / TOTAL_QURAN_AYAHS) * 100), 100);
  const progress = getReadingProgress();
  const surahsStarted = Object.keys(progress).length;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-6">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Reading Progress
            </p>
            <p className="text-foreground font-semibold text-lg leading-tight">
              {percentage}% Complete
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {totalRead.toLocaleString()} / {TOTAL_QURAN_AYAHS.toLocaleString()} ayahs
            </span>
            <span>{surahsStarted} / 114 surahs started</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgress;
