import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSurah, fetchWordByWord, fetchTajweedText, Surah, TRANSLATIONS } from "@/lib/quran-api";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp, BookOpen, Palette, Play, Square, Bookmark, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import QuranNavigator from "@/components/QuranNavigator";
import TajweedLegend from "@/components/TajweedLegend";
import { addBookmark, removeBookmark, isBookmarked, saveLastRead, getSettings, saveSettings } from "@/lib/storage";
import { getFontClass } from "@/components/FontPreview";

interface SurahReaderProps {
  surah: Surah;
  onBack: () => void;
  onSurahChange?: (surahNumber: number, ayah: number) => void;
  initialAyah?: number;
  currentAyah: number;
  onAyahChange: (ayah: number) => void;
  playTrigger: number | null;
  onPlayTriggerChange: (trigger: number | null) => void;
  isAudioPlaying: boolean;
}

const SurahReader = ({ surah, onBack, onSurahChange, initialAyah = 0, currentAyah, onAyahChange, playTrigger, onPlayTriggerChange, isAudioPlaying }: SurahReaderProps) => {
  const settings = getSettings();
  const [wbwEnabled, setWbwEnabled] = useState(false);
  const [tajweedEnabled, setTajweedEnabled] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(settings.showTranslation);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fontSizeClass = ["text-xl", "text-2xl", "text-3xl", "text-4xl"][settings.fontSize - 1] || "text-2xl";
  const arabicFontClass = getFontClass(settings.arabicFont);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset ayah and bookmarks when surah changes
  useEffect(() => {
    onAyahChange(initialAyah);
    // Load bookmarked state for this surah
    const marked = new Set<number>();
    for (let i = 1; i <= surah.numberOfAyahs; i++) {
      if (isBookmarked(surah.number, i)) marked.add(i);
    }
    setBookmarkedAyahs(marked);
  }, [surah.number, initialAyah]);

  // Save last read position
  useEffect(() => {
    saveLastRead(surah.number, currentAyah);
  }, [surah.number, currentAyah]);

  const toggleBookmark = (ayahNumberInSurah: number) => {
    if (bookmarkedAyahs.has(ayahNumberInSurah)) {
      removeBookmark(surah.number, ayahNumberInSurah);
      setBookmarkedAyahs((prev) => {
        const next = new Set(prev);
        next.delete(ayahNumberInSurah);
        return next;
      });
    } else {
      addBookmark({
        surahNumber: surah.number,
        surahName: surah.name,
        surahEnglishName: surah.englishName,
        ayahNumber: ayahNumberInSurah,
        timestamp: Date.now(),
      });
      setBookmarkedAyahs((prev) => new Set(prev).add(ayahNumberInSurah));
    }
  };

  useEffect(() => {
    ayahRefs.current[currentAyah]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentAyah]);

  const { data, isLoading } = useQuery({
    queryKey: ["surah", surah.number],
    queryFn: () => fetchSurah(surah.number),
  });

  const { data: wbwData, isLoading: wbwLoading } = useQuery({
    queryKey: ["wbw", surah.number],
    queryFn: () => fetchWordByWord(surah.number),
    enabled: wbwEnabled,
  });

  const { data: tajweedData, isLoading: tajweedLoading } = useQuery({
    queryKey: ["tajweed", surah.number],
    queryFn: () => fetchTajweedText(surah.number),
    enabled: tajweedEnabled,
  });

  const handleSurahChange = (surahNumber: number, ayah: number) => {
    if (onSurahChange) {
      onSurahChange(surahNumber, ayah);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Surahs
        </Button>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="tajweed-toggle" className="text-sm text-muted-foreground cursor-pointer">
              Tajweed
            </Label>
            <Switch
              id="tajweed-toggle"
              checked={tajweedEnabled}
              onCheckedChange={(v) => {
                setTajweedEnabled(v);
                if (v) setWbwEnabled(false);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="wbw-toggle" className="text-sm text-muted-foreground cursor-pointer">
              Word by Word
            </Label>
            <Switch
              id="wbw-toggle"
              checked={wbwEnabled}
              onCheckedChange={(v) => {
                setWbwEnabled(v);
                if (v) setTajweedEnabled(false);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="translation-toggle" className="text-sm text-muted-foreground cursor-pointer">
              Translation
            </Label>
            <Switch
              id="translation-toggle"
              checked={translationEnabled}
              onCheckedChange={(v) => {
                setTranslationEnabled(v);
                saveSettings({ ...settings, showTranslation: v });
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <QuranNavigator
          surah={surah}
          currentAyah={currentAyah}
          onAyahChange={onAyahChange}
          onSurahChange={handleSurahChange}
        />
      </div>

      {/* Tajweed Legend */}
      {tajweedEnabled && (
        <div className="mb-6">
          <TajweedLegend />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className={`${arabicFontClass} text-4xl text-primary mb-2`}>{surah.name}</h2>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-1">
          {surah.englishName}
        </h3>
        <p className="text-muted-foreground">
          {surah.englishNameTranslation} · {surah.numberOfAyahs} Ayahs ·{" "}
          {surah.revelationType}
        </p>
        <div className="ornament-divider mt-6 mx-auto max-w-xs" />
      </motion.div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <p className={`${arabicFontClass} text-3xl text-center text-primary mb-8 leading-loose`}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.ayahs.map((ayah, i) => {
            const verseWords = wbwData?.find(
              (v) => v.verseNumber === ayah.numberInSurah
            );

            return (
              <motion.div
                key={ayah.number}
                ref={(el) => (ayahRefs.current[i] = el)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 1) }}
                className={`bg-card rounded-lg p-6 group transition-colors ${
                  currentAyah === i ? "ring-2 ring-primary/30" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0 mt-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {ayah.numberInSurah}
                    </span>
                    <button
                      onClick={() => {
                        if (isAudioPlaying && currentAyah === i) {
                          onPlayTriggerChange(-Infinity); // signal stop
                        } else {
                          onPlayTriggerChange(playTrigger === i ? -(i + 1) : i);
                        }
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isAudioPlaying && currentAyah === i
                          ? "bg-destructive/15 hover:bg-destructive/25 text-destructive"
                          : "bg-primary/10 hover:bg-primary/20 text-primary"
                      }`}
                      title={isAudioPlaying && currentAyah === i ? `Stop Ayah ${ayah.numberInSurah}` : `Play Ayah ${ayah.numberInSurah}`}
                    >
                      {isAudioPlaying && currentAyah === i ? (
                        <Square className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3 ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleBookmark(ayah.numberInSurah)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        bookmarkedAyahs.has(ayah.numberInSurah)
                          ? "bg-accent/20 text-accent"
                          : "bg-primary/10 hover:bg-primary/20 text-primary"
                      }`}
                      title={bookmarkedAyahs.has(ayah.numberInSurah) ? "Remove bookmark" : "Bookmark this ayah"}
                    >
                      <Bookmark className={`w-3 h-3 ${bookmarkedAyahs.has(ayah.numberInSurah) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Word-by-word view */}
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
                    ) : tajweedEnabled && tajweedData?.[i] ? (
                      <p
                        className={`${arabicFontClass} ${fontSizeClass} leading-[2.2] text-right tajweed-text`}
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: tajweedData[i] }}
                      />
                    ) : (
                      <p
                        className={`${arabicFontClass} ${fontSizeClass} leading-[2.2] text-foreground text-right`}
                        dir="rtl"
                      >
                        {ayah.text}
                      </p>
                    )}

                    {/* Full verse translation */}
                    {translationEnabled && (
                      <p className="text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-3">
                        {ayah.translation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default SurahReader;
