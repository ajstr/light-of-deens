import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, BookOpen } from "lucide-react";
import { getAllCategories, type DuaCategory, type Dua } from "@/lib/dua-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const DuaCard = ({ dua }: { dua: Dua }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
  >
    <Card className="mb-4">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-primary mb-3">{dua.title}</h3>
        <p
          className="font-arabic text-xl leading-[2.2] text-foreground text-right mb-3"
          dir="rtl"
        >
          {dua.arabic}
        </p>
        <p className="text-sm text-muted-foreground italic mb-2">
          {dua.transliteration}
        </p>
        <p className="text-sm text-foreground/80 mb-2">{dua.translation}</p>
        <p className="text-[10px] text-muted-foreground">{dua.reference}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const DuaPage = () => {
  const categories = getAllCategories();
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);

  if (selectedCategory) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className="mb-4 text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          All Categories
        </Button>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">{selectedCategory.icon}</span>
          <h2 className="text-xl font-semibold text-foreground">
            {selectedCategory.name}
          </h2>
        </div>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <AnimatePresence>
            {selectedCategory.duas.map((dua) => (
              <DuaCard key={dua.id} dua={dua} />
            ))}
          </AnimatePresence>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Duas & Supplications</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory(cat)}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors text-left"
          >
            <span className="text-2xl">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {cat.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {cat.duas.length} duas
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DuaPage;
