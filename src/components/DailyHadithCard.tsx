import { motion } from "framer-motion";
import { BookMarked } from "lucide-react";
import { getTodaysHadith } from "@/lib/daily-hadith";

interface Props {
  onOpen?: () => void;
}

const DailyHadithCard = ({ onOpen }: Props) => {
  const h = getTodaysHadith();
  return (
    <div className="max-w-2xl mx-auto px-4 mb-6">
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={onOpen}
        className="w-full text-left bg-gradient-to-br from-card via-card to-primary/5 border border-border rounded-xl p-5 hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookMarked className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Hadith of the Day
          </p>
        </div>
        <p
          className="font-arabic text-lg leading-[2.1] text-foreground text-right mb-3"
          dir="rtl"
        >
          {h.arabic}
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed mb-2">
          "{h.english}"
        </p>
        <p className="text-[11px] text-muted-foreground">
          {h.narrator ? `${h.narrator} · ` : ""}{h.reference}
        </p>
      </motion.button>
    </div>
  );
};

export default DailyHadithCard;
