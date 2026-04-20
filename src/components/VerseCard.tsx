import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Play, Square, Bookmark, BookText } from "lucide-react";

interface VerseWord {
  arabic: string;
  transliteration: string;
  translation: string;
}

interface VerseCardProps {
  ayah: {
    number: number;
    numberInSurah: number;
    text: string;
    translation?: string;
  };
  index: number;
  currentAyah: number;
  highlightedAyah: number | null;
  onHighlightToggle: (index: number) => void;
  isAudioPlaying: boolean;
  onPlayToggle: (index: number) => void;
  isBookmarked: boolean;
  onBookmarkToggle: (numberInSurah: number) => void;
  onTafsirOpen: (numberInSurah: number) => void;
  translationEnabled: boolean;
  fontSizeClass: string;
  arabicFontClass: string;
  // Word-by-word
  wbwEnabled: boolean;
  wbwLoading: boolean;
  verseWords?: { words: VerseWord[] };
  // Tajweed
  tajweedEnabled: boolean;
  tajweedLoading: boolean;
  tajweedHtml?: string;
  // Range repeat
  inActiveRange?: boolean;
}

const VerseCard = forwardRef<HTMLDivElement, VerseCardProps>(
  (
    {
      ayah,
      index,
      currentAyah,
      highlightedAyah,
      onHighlightToggle,
      isAudioPlaying,
      onPlayToggle,
      isBookmarked: bookmarked,
      onBookmarkToggle,
      onTafsirOpen,
      translationEnabled,
      fontSizeClass,
      arabicFontClass,
      wbwEnabled,
      wbwLoading,
      verseWords,
      tajweedEnabled,
      tajweedLoading,
      tajweedHtml,
      inActiveRange = false,
    },
    ref
  ) => {
    const isCurrentlyPlaying = isAudioPlaying && currentAyah === index;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(index * 0.03, 1) }}
        className={`bg-card rounded-lg p-6 group transition-all duration-300 cursor-pointer ${
          currentAyah === index ? "ring-2 ring-primary/30" : ""
        } ${highlightedAyah === index ? "bg-primary/10 shadow-md" : ""} ${
          inActiveRange ? "bg-accent/10 ring-1 ring-accent/30" : ""
        }`}
        onClick={() => onHighlightToggle(index)}
      >
        <div className="flex items-start gap-4">
          {/* Side controls */}
          <div className="flex flex-col items-center gap-1 shrink-0 mt-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              {ayah.numberInSurah}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayToggle(index);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isCurrentlyPlaying
                  ? "bg-destructive/15 hover:bg-destructive/25 text-destructive"
                  : "bg-primary/10 hover:bg-primary/20 text-primary"
              }`}
              title={isCurrentlyPlaying ? `Stop Ayah ${ayah.numberInSurah}` : `Play Ayah ${ayah.numberInSurah}`}
            >
              {isCurrentlyPlaying ? (
                <Square className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 ml-0.5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(ayah.numberInSurah);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                bookmarked
                  ? "bg-accent/20 text-accent"
                  : "bg-primary/10 hover:bg-primary/20 text-primary"
              }`}
              title={bookmarked ? "Remove bookmark" : "Bookmark this ayah"}
            >
              <Bookmark className={`w-3 h-3 ${bookmarked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTafsirOpen(ayah.numberInSurah);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors bg-primary/10 hover:bg-primary/20 text-primary"
              title="View Tafsir"
            >
              <BookText className="w-3 h-3" />
            </button>
          </div>

          {/* Verse content */}
          <div className="flex-1 space-y-3">
            {wbwEnabled && verseWords ? (
              <div className="flex flex-wrap gap-3 justify-end" dir="rtl">
                {verseWords.words.map((word, wi) => (
                  <div
                    key={wi}
                    className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors min-w-[60px]"
                  >
                    <span className={`${arabicFontClass} text-xl text-foreground leading-relaxed`}>
                      {word.arabic}
                    </span>
                    <span className="text-[10px] text-muted-foreground italic" dir="ltr">
                      {word.transliteration}
                    </span>
                    <span className="text-xs text-primary font-medium" dir="ltr">
                      {word.translation}
                    </span>
                  </div>
                ))}
              </div>
            ) : wbwEnabled && wbwLoading ? (
              <div className="h-16 bg-muted animate-pulse rounded-md" />
            ) : tajweedEnabled && tajweedLoading ? (
              <div className="h-16 bg-muted animate-pulse rounded-md" />
            ) : tajweedEnabled && tajweedHtml ? (
              <p
                className={`${arabicFontClass} ${fontSizeClass} leading-[2.2] text-right tajweed-text`}
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: tajweedHtml }}
              />
            ) : (
              <p
                className={`${arabicFontClass} ${fontSizeClass} leading-[2.2] text-foreground text-right`}
                dir="rtl"
              >
                {ayah.text}
              </p>
            )}

            {translationEnabled && (
              <p className="text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-3">
                {ayah.translation}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

VerseCard.displayName = "VerseCard";

export default VerseCard;
