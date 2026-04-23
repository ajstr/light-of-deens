// Compact home-screen prayer card showing next prayer + countdown.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import {
  computeTimes, detectLocation, getPrayerLocation, nextPrayer, formatTime,
  prayerLabel, getHijri, getPrayerSettings, PrayerLocation,
} from "@/lib/prayer-times";

interface PrayerCardProps {
  onOpen: () => void;
}

const PrayerCard = ({ onOpen }: PrayerCardProps) => {
  const [loc, setLoc] = useState<PrayerLocation | null>(getPrayerLocation());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!loc) {
      detectLocation().then(setLoc).catch(() => { /* ignore */ });
    }
  }, [loc]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!loc) {
    return (
      <button
        onClick={onOpen}
        className="block w-full max-w-2xl mx-auto px-4 mb-6"
      >
        <div className="rounded-xl border border-border bg-card p-4 text-left text-sm text-muted-foreground">
          Detecting location for prayer times…
        </div>
      </button>
    );
  }

  const settings = getPrayerSettings();
  const times = computeTimes(loc, new Date(), settings);
  const next = nextPrayer(times);
  const hijri = getHijri(new Date(), settings.hijriOffset);
  const diff = Math.max(0, next.at.getTime() - Date.now());
  const hrs = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);

  // tick referenced to ensure recompute every 30s
  void tick;

  return (
    <div className="px-4 mb-6 max-w-2xl mx-auto">
      <motion.button
        onClick={onOpen}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 p-4 shadow-sm hover:border-primary/40 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{loc.city ?? loc.country ?? "Your location"}</span>
              <span className="mx-1">·</span>
              <span className="truncate">{hijri.day} {hijri.monthName} {hijri.year} AH</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-foreground">{prayerLabel(next.name)}</span>
              <span className="text-sm text-muted-foreground">at {formatTime(next.at)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-primary">
              <Clock className="w-3.5 h-3.5" />
              <span>in {hrs > 0 ? `${hrs}h ` : ""}{mins}m</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
        </div>

        {/* Mini timeline */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {(["fajr","dhuhr","asr","maghrib","isha"] as const).map((p) => {
            const isNext = p === next.name;
            return (
              <div key={p} className={`text-center rounded-lg py-1.5 ${isNext ? "bg-primary/10 border border-primary/30" : "bg-muted/40"}`}>
                <div className={`text-[10px] uppercase ${isNext ? "text-primary font-semibold" : "text-muted-foreground"}`}>{prayerLabel(p)}</div>
                <div className={`text-xs ${isNext ? "text-foreground font-semibold" : "text-foreground/80"}`}>
                  {formatTime((times as any)[p])}
                </div>
              </div>
            );
          })}
        </div>
      </motion.button>
    </div>
  );
};

export default PrayerCard;
