import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getDailyDua } from "@/lib/dua-data";
import { Card, CardContent } from "@/components/ui/card";

const DailyDua = () => {
  const dua = getDailyDua();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-2xl mx-auto px-4 mb-6"
    >
      <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Daily Dua
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{dua.title}</h3>
          <p
            className="font-arabic text-xl leading-[2.2] text-foreground text-right mb-3"
            dir="rtl"
          >
            {dua.arabic}
          </p>
          <p className="text-sm text-muted-foreground italic mb-2">
            {dua.transliteration}
          </p>
          <p className="text-sm text-foreground/80">{dua.translation}</p>
          <p className="text-[10px] text-muted-foreground mt-3">{dua.reference}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyDua;
