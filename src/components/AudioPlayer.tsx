import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReciters, fetchAudioUrls, Reciter } from "@/lib/quran-api";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  surahNumber: number;
  totalAyahs: number;
  currentAyah: number;
  onAyahChange: (ayah: number) => void;
  playTrigger?: number | null; // ayah index to play, set externally
}

const AudioPlayer = ({
  surahNumber,
  totalAyahs,
  currentAyah,
  onAyahChange,
  playTrigger,
}: AudioPlayerProps) => {
  const [reciterId, setReciterId] = useState<number>(7); // Mishari Rashid al-Afasy
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: reciters } = useQuery({
    queryKey: ["reciters"],
    queryFn: fetchReciters,
  });

  const { data: audioUrls } = useQuery({
    queryKey: ["audio", surahNumber, reciterId],
    queryFn: () => fetchAudioUrls(surahNumber, reciterId),
  });

  const playAyah = useCallback(
    (index: number) => {
      if (!audioUrls || index < 0 || index >= audioUrls.length) return;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrls[index]);
      audioRef.current = audio;
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
      });
      audio.addEventListener("ended", () => {
        if (index + 1 < audioUrls.length) {
          onAyahChange(index + 1);
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      });
      audio.play();
      setIsPlaying(true);
      onAyahChange(index);
    },
    [audioUrls, onAyahChange]
  );

  useEffect(() => {
    if (isPlaying && audioUrls) {
      playAyah(currentAyah);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAyah]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Stop when reciter changes
  useEffect(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setProgress(0);
  }, [reciterId]);

  // External play trigger (tap on ayah)
  useEffect(() => {
    if (playTrigger !== null && playTrigger !== undefined && audioUrls) {
      playAyah(playTrigger);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playTrigger]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioUrls) playAyah(currentAyah);
    }
  };

  const prev = () => {
    if (currentAyah > 0) {
      playAyah(currentAyah - 1);
    }
  };

  const next = () => {
    if (audioUrls && currentAyah < audioUrls.length - 1) {
      playAyah(currentAyah + 1);
    }
  };

  const displayName = (r: Reciter) =>
    r.style ? `${r.reciter_name} (${r.style})` : r.reciter_name;

  return (
    <div className="sticky bottom-0 z-50 bg-card border-t border-border p-3">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Reciter selector */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select
            value={String(reciterId)}
            onValueChange={(v) => setReciterId(Number(v))}
          >
            <SelectTrigger className="flex-1 h-8 text-xs">
              <SelectValue placeholder="Select reciter" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {reciters?.map((r) => (
                <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                  {displayName(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            className="flex-1"
            onValueChange={([v]) => {
              if (audioRef.current && audioRef.current.duration) {
                audioRef.current.currentTime = (v / 100) * audioRef.current.duration;
                setProgress(v);
              }
            }}
          />
          <span className="text-xs text-muted-foreground min-w-[60px] text-right">
            Ayah {currentAyah + 1}/{totalAyahs}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
