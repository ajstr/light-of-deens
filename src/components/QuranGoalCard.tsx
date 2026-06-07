import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  getGoalSettings,
  getTodayAyahs,
  effectiveDailyTarget,
  getStreak,
  subscribeGoalChange,
} from "@/lib/quran-goals";
import { getTotalAyahsRead, subscribeProgressChange } from "@/lib/storage";

const QuranGoalCard = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const a = subscribeGoalChange(() => setTick((t) => t + 1));
    const b = subscribeProgressChange(() => setTick((t) => t + 1));
    return () => { a(); b(); };
  }, []);

  const settings = getGoalSettings();
  const anyEnabled = settings.ayahsEnabled || settings.pagesEnabled || settings.khatmEnabled;
  if (!anyEnabled) return null;

  const totalRead = getTotalAyahsRead();
  const target = effectiveDailyTarget(settings, totalRead);
  const today = getTodayAyahs();
  const pct = target > 0 ? Math.min(100, Math.round((today / target) * 100)) : 0;
  const streak = getStreak(target);
  const met = target > 0 && today >= target;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Today's Quran Goal
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
              <Flame className="w-4 h-4" />
              <span>{streak}-day streak</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mb-2">
          <p className="text-2xl font-bold text-foreground">
            {today}<span className="text-sm text-muted-foreground font-normal"> / {target} ayahs</span>
          </p>
          <p className={`text-xs font-medium ${met ? "text-emerald-500" : "text-muted-foreground"}`}>
            {met ? "✓ Goal met" : `${pct}%`}
          </p>
        </div>
        <Progress value={pct} className="h-2 mb-3" />

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {settings.ayahsEnabled && <span>📖 {settings.dailyAyahs} ayahs/day</span>}
          {settings.pagesEnabled && <span>📄 {settings.dailyPages} page(s)/day</span>}
          {settings.khatmEnabled && settings.khatmDate && <span>🏁 Khatm by {settings.khatmDate}</span>}
        </div>
      </motion.div>
    </div>
  );
};

export default QuranGoalCard;
