import { Play, Pause, SkipForward, SkipBack, X, Repeat1, Repeat, ListRestart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Button } from "@/components/ui/button";

const GlobalMiniPlayer = () => {
  const { nowPlaying, controls, requestOpenReader } = useAudioPlayer();

  if (!nowPlaying || !controls) return null;

  const {
    surahName, currentAyah, totalAyahs, isPlaying, progress,
    repeatMode, repeatCount, repeatIteration,
    rangeActive, rangeStart, rangeEnd, rangeCount, rangeIteration,
  } = nowPlaying;

  const handleOpen = () => {
    requestOpenReader(nowPlaying.surahNumber, currentAyah);
  };

  const showRepeatBadge = repeatMode === "ayah";
  const repeatLabel =
    repeatCount === 0 ? "∞" : `${repeatIteration}/${repeatCount}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Thin progress bar */}
        <div className="h-0.5 w-full bg-secondary">
          <div
            className="h-full bg-primary transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-2 sm:px-3 py-1.5 flex items-center gap-2">
          {/* Now-playing label — clickable to open reader */}
          <button
            onClick={handleOpen}
            className="flex-1 min-w-0 text-left flex items-center gap-2"
            aria-label="Open reader"
          >
            {/* Animated equalizer when playing */}
            <div className="flex items-end gap-0.5 h-4 shrink-0" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`w-0.5 bg-primary rounded-full ${isPlaying ? "animate-eq" : ""}`}
                  style={{
                    height: isPlaying ? undefined : "30%",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate leading-tight">
                {surahName}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate leading-tight flex items-center gap-1.5">
                <span className="tabular-nums">Ayah {currentAyah + 1}/{totalAyahs}</span>
                {showRepeatBadge && (
                  <span className="flex items-center gap-0.5 text-primary font-medium">
                    <Repeat1 className="w-2.5 h-2.5" />
                    {repeatLabel}
                  </span>
                )}
                {repeatMode === "surah" && (
                  <span className="flex items-center gap-0.5 text-primary font-medium">
                    <Repeat className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={controls.prev}
              aria-label="Previous ayah"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={controls.toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={controls.next}
              aria-label="Next ayah"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={controls.stop}
              aria-label="Close player"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalMiniPlayer;
