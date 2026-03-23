import { useState, useEffect } from "react";
import { Bookmark as BookmarkIcon, Trash2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getBookmarks, removeBookmark, getLastRead, Bookmark } from "@/lib/storage";

interface BookmarksPageProps {
  onNavigate: (surahNumber: number, ayahNumber: number) => void;
}

const BookmarksPage = ({ onNavigate }: BookmarksPageProps) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const lastRead = getLastRead();

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (surahNumber: number, ayahNumber: number) => {
    removeBookmark(surahNumber, ayahNumber);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Last Read */}
      {lastRead && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Continue Reading
          </h2>
          <button
            onClick={() => onNavigate(lastRead.surahNumber, lastRead.ayahIndex)}
            className="w-full bg-card rounded-lg p-4 text-left hover:ring-2 hover:ring-primary/30 transition-all border border-border"
          >
            <p className="text-foreground font-display font-medium">
              Surah {lastRead.surahNumber}, Ayah {lastRead.ayahIndex + 1}
            </p>
            <p className="text-muted-foreground text-sm mt-1">Tap to continue where you left off</p>
          </button>
        </motion.div>
      )}

      {/* Bookmarks */}
      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <BookmarkIcon className="w-5 h-5 text-accent" />
        Saved Bookmarks
      </h2>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <BookmarkIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-display">No bookmarks yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Tap the bookmark icon on any ayah to save it
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {bookmarks.map((b) => (
              <motion.div
                key={`${b.surahNumber}-${b.ayahNumber}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-card rounded-lg p-4 flex items-center justify-between border border-border"
              >
                <button
                  onClick={() => onNavigate(b.surahNumber, b.ayahNumber - 1)}
                  className="text-left flex-1"
                >
                  <p className="font-arabic text-lg text-foreground">{b.surahName}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.surahEnglishName} · Ayah {b.ayahNumber}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(b.timestamp).toLocaleDateString()}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(b.surahNumber, b.ayahNumber)}
                  className="text-destructive hover:text-destructive/80 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
