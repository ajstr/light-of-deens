import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReciters, fetchAudioUrls, Reciter } from "@/lib/quran-api";
import { getSettings } from "@/lib/storage";
import { Play, Pause, SkipBack, SkipForward, Volume2, Gauge, Timer, Repeat, Repeat1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AudioPlayerProps {
  surahNumber: number;
  totalAyahs: number;
  currentAyah: number;
  onAyahChange: (ayah: number) => void;
  playTrigger?: number | null;
  onPlayingChange?: (playing: boolean) => void;
  surahName?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];
const SLEEP_OPTIONS = [5, 10, 15, 30, 60, 90]; // minutes

const formatTime = (seconds: number) => {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({
  surahNumber,
  totalAyahs,
  currentAyah,
  onAyahChange,
  playTrigger,
  onPlayingChange,
  surahName,
}: AudioPlayerProps) => {
  const [reciterId, setReciterId] = useState<number>(() => getSettings().defaultReciterId);
  const [isPlaying, setIsPlayingRaw] = useState(false);
  const setIsPlaying = useCallback((v: boolean) => {
    setIsPlayingRaw(v);
    onPlayingChange?.(v);
  }, [onPlayingChange]);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const togglePlayRef = useRef<() => void>(() => {});
  const speedRef = useRef(1);
  const [sleepMinutesLeft, setSleepMinutesLeft] = useState<number | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sleepEndRef = useRef<number | null>(null);

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
      audio.playbackRate = speedRef.current;
      audioRef.current = audio;
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
        }
      });
      audio.addEventListener("ended", () => {
        if (index + 1 < audioUrls.length) {
          onAyahChange(index + 1);
        } else {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          setDuration(0);
        }
      });
      audio.play();
      setIsPlaying(true);
      onAyahChange(index);

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Ayah ${index + 1}`,
          artist: surahName || `Surah ${surahNumber}`,
          album: "The Noble Quran",
        });
        navigator.mediaSession.playbackState = "playing";
        navigator.mediaSession.setActionHandler("play", () => togglePlayRef.current());
        navigator.mediaSession.setActionHandler("pause", () => {
          audioRef.current?.pause();
          setIsPlaying(false);
          if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
          if (index > 0) playAyah(index - 1);
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
          if (audioUrls && index + 1 < audioUrls.length) playAyah(index + 1);
        });
      }
    },
    [audioUrls, onAyahChange, surahName, surahNumber]
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

  useEffect(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [reciterId]);

  useEffect(() => {
    if (playTrigger === -Infinity) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    if (playTrigger !== null && playTrigger !== undefined && audioUrls) {
      const idx = playTrigger < 0 ? -(playTrigger + 1) : playTrigger;
      playAyah(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playTrigger]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    } else {
      if (audioUrls) playAyah(currentAyah);
    }
  }, [isPlaying, audioUrls, currentAyah, playAyah, setIsPlaying]);

  useEffect(() => {
    togglePlayRef.current = togglePlay;
  }, [togglePlay]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    speedRef.current = speed;
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
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

  const startSleepTimer = (minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepEndRef.current = Date.now() + minutes * 60 * 1000;
    setSleepMinutesLeft(minutes);
    sleepTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil(((sleepEndRef.current || 0) - Date.now()) / 60000));
      setSleepMinutesLeft(remaining);
      if (remaining <= 0) {
        // Stop audio
        audioRef.current?.pause();
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setSleepMinutesLeft(null);
        sleepEndRef.current = null;
        if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    }, 10000);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepTimerRef.current = null;
    sleepEndRef.current = null;
    setSleepMinutesLeft(null);
  };

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

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

          {/* Timer */}
          <span className="text-xs text-muted-foreground min-w-[65px] text-center tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

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

          {/* Speed control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                <Gauge className="w-3 h-3" />
                {playbackSpeed}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {SPEED_OPTIONS.map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`text-xs justify-center ${speed === playbackSpeed ? "bg-accent font-semibold" : ""}`}
                >
                  {speed}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sleep timer */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 text-xs gap-1 ${sleepMinutesLeft !== null ? "text-primary" : ""}`}
              >
                <Timer className="w-3 h-3" />
                {sleepMinutesLeft !== null ? `${sleepMinutesLeft}m` : ""}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[100px]">
              {SLEEP_OPTIONS.map((mins) => (
                <DropdownMenuItem
                  key={mins}
                  onClick={() => startSleepTimer(mins)}
                  className="text-xs justify-center"
                >
                  {mins} min
                </DropdownMenuItem>
              ))}
              {sleepMinutesLeft !== null && (
                <DropdownMenuItem
                  onClick={cancelSleepTimer}
                  className="text-xs justify-center text-destructive"
                >
                  Cancel timer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-xs text-muted-foreground min-w-[60px] text-right">
            Ayah {currentAyah + 1}/{totalAyahs}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
