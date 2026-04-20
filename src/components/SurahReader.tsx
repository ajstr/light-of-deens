import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSurah, fetchWordByWord, fetchTajweedText, Surah } from "@/lib/quran-api";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import TafsirModal from "@/components/TafsirModal";
import QuranNavigator from "@/components/QuranNavigator";
import TajweedLegend from "@/components/TajweedLegend";
import SurahHeader from "@/components/SurahHeader";
import ReaderToolbar from "@/components/ReaderToolbar";
import VerseCard from "@/components/VerseCard";
import { addBookmark, removeBookmark, isBookmarked, saveLastRead, getSettings, saveSettings, markAyahRead } from "@/lib/storage";
import { getFontClass } from "@/components/FontPreview";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

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
  const { nowPlaying } = useAudioPlayer();
  const [wbwEnabled, setWbwEnabled] = useState(false);
  const [tajweedEnabled, setTajweedEnabled] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(settings.showTranslation);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
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

  useEffect(() => {
    onAyahChange(initialAyah);
    const marked = new Set<number>();
    for (let i = 1; i <= surah.numberOfAyahs; i++) {
      if (isBookmarked(surah.number, i)) marked.add(i);
    }
    setBookmarkedAyahs(marked);
  }, [surah.number, initialAyah]);

  useEffect(() => {
    saveLastRead(surah.number, currentAyah);
    // Mark current ayah as read (ayahIndex is 0-based, ayahNumber is 1-based)
    if (currentAyah >= 0) {
      markAyahRead(surah.number, currentAyah + 1);
    }
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

  const handlePlayToggle = (index: number) => {
    if (isAudioPlaying && currentAyah === index) {
      onPlayTriggerChange(-Infinity);
    } else {
      onPlayTriggerChange(playTrigger === index ? -(index + 1) : index);
    }
  };

  useEffect(() => {
    ayahRefs.current[currentAyah]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentAyah]);

  const { data, isLoading } = useQuery({
    queryKey: ["surah", surah.number, settings.translationId],
    queryFn: () => fetchSurah(surah.number, settings.translationId),
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

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Surahs
        </Button>
        <ReaderToolbar
          tajweedEnabled={tajweedEnabled}
          onTajweedChange={(v) => { setTajweedEnabled(v); if (v) setWbwEnabled(false); }}
          wbwEnabled={wbwEnabled}
          onWbwChange={(v) => { setWbwEnabled(v); if (v) setTajweedEnabled(false); }}
          translationEnabled={translationEnabled}
          onTranslationChange={(v) => { setTranslationEnabled(v); saveSettings({ ...settings, showTranslation: v }); }}
        />
      </div>

      {/* Navigator */}
      <div className="mb-6">
        <QuranNavigator
          surah={surah}
          currentAyah={currentAyah}
          onAyahChange={onAyahChange}
          onSurahChange={(n, a) => onSurahChange?.(n, a)}
        />
      </div>

      {tajweedEnabled && <div className="mb-6"><TajweedLegend /></div>}

      <SurahHeader surah={surah} arabicFontClass={arabicFontClass} />

      {/* Verses */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.ayahs.map((ayah, i) => {
            const isInRange =
              !!nowPlaying?.rangeActive &&
              nowPlaying.surahNumber === surah.number &&
              i >= nowPlaying.rangeStart &&
              i <= nowPlaying.rangeEnd;
            return (
              <VerseCard
                key={ayah.number}
                ref={(el) => (ayahRefs.current[i] = el)}
                ayah={ayah}
                index={i}
                currentAyah={currentAyah}
                highlightedAyah={highlightedAyah}
                onHighlightToggle={(idx) => setHighlightedAyah(highlightedAyah === idx ? null : idx)}
                isAudioPlaying={isAudioPlaying}
                onPlayToggle={handlePlayToggle}
                isBookmarked={bookmarkedAyahs.has(ayah.numberInSurah)}
                onBookmarkToggle={toggleBookmark}
                onTafsirOpen={setTafsirAyah}
                translationEnabled={translationEnabled}
                fontSizeClass={fontSizeClass}
                arabicFontClass={arabicFontClass}
                wbwEnabled={wbwEnabled}
                wbwLoading={wbwLoading}
                verseWords={wbwData?.find((v) => v.verseNumber === ayah.numberInSurah)}
                tajweedEnabled={tajweedEnabled}
                tajweedLoading={tajweedLoading}
                tajweedHtml={tajweedData?.[i]}
                inActiveRange={isInRange}
              />
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
          <Button onClick={scrollToTop} size="icon" className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12">
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}

      <TafsirModal
        open={tafsirAyah !== null}
        onOpenChange={(open) => { if (!open) setTafsirAyah(null); }}
        surahNumber={surah.number}
        ayahNumber={tafsirAyah ?? 1}
        surahName={surah.englishName}
      />
    </div>
  );
};

export default SurahReader;
