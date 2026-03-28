import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReciters, fetchAudioUrls, Reciter } from "@/lib/quran-api";
import { getSettings } from "@/lib/storage";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Gauge, Timer,
  Repeat, Repeat1, Download, Loader2, HardDriveDownload, Trash2, WifiOff, ShieldCheck
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  getAudioBlob, downloadSurahForOffline, isSurahDownloaded, deleteSurahAudio
} from "@/lib/offline-audio";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
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
const SLEEP_OPTIONS = [5, 10, 15, 30, 60, 90];

const formatTime = (seconds: number) => {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({
  surahNumber, totalAyahs, currentAyah, onAyahChange,
  playTrigger, onPlayingChange, surahName,
}: AudioPlayerProps) => {
  const [reciterId, setReciterId] = useState<number>(() => getSettings().defaultReciterId);
  const [isPlaying, setIsPlayingRaw] = useState(false);
  const wakeLockFnRef = useRef<{ request: () => void; release: () => void }>({ request: () => {}, release: () => {} });
  const setIsPlaying = useCallback((v: boolean) => {
    setIsPlayingRaw(v);
    onPlayingChange?.(v);
    if (v) wakeLockFnRef.current.request();
    else wakeLockFnRef.current.release();
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
  const [repeatMode, setRepeatMode] = useState<"none" | "surah" | "ayah">("none");
  const repeatModeRef = useRef<"none" | "surah" | "ayah">("none");
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Request Wake Lock to keep audio playing in background
  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
          setWakeLockActive(false);
        });
      }
    } catch {
      // Wake Lock not supported or failed silently
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
    setWakeLockActive(false);
  }, []);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isPlaying) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying, requestWakeLock]);

  // Connect wake lock functions to ref so setIsPlaying can use them without circular deps
  useEffect(() => {
    wakeLockFnRef.current = { request: requestWakeLock, release: releaseWakeLock };
  }, [requestWakeLock, releaseWakeLock]);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState("");
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);

  // Check offline availability when surah/reciter changes
  useEffect(() => {
    isSurahDownloaded(surahNumber, reciterId).then(setIsOfflineAvailable);
  }, [surahNumber, reciterId]);

  const { data: reciters } = useQuery({
    queryKey: ["reciters"],
    queryFn: fetchReciters,
  });

  const { data: audioUrls } = useQuery({
    queryKey: ["audio", surahNumber, reciterId],
    queryFn: () => fetchAudioUrls(surahNumber, reciterId),
  });

  /** Get audio source — prefer offline cache, fall back to URL */
  const getAudioSource = useCallback(async (index: number): Promise<string | null> => {
    if (!audioUrls || index < 0 || index >= audioUrls.length) return null;
    // Try offline cache first
    try {
      const blob = await getAudioBlob(surahNumber, index, reciterId);
      if (blob) return URL.createObjectURL(blob);
    } catch {
      // Fall through to online
    }
    return audioUrls[index];
  }, [audioUrls, surahNumber, reciterId]);

  const playAyah = useCallback(
    async (index: number) => {
      if (!audioUrls || index < 0 || index >= audioUrls.length) return;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const src = await getAudioSource(index);
      if (!src) return;

      const audio = new Audio(src);
      audio.playbackRate = speedRef.current;
      audioRef.current = audio;
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
        }
      });
      audio.addEventListener("ended", () => {
        // Revoke blob URL if it was one
        if (src.startsWith("blob:")) URL.revokeObjectURL(src);
        if (repeatModeRef.current === "ayah") {
          playAyah(index);
        } else if (index + 1 < audioUrls.length) {
          onAyahChange(index + 1);
        } else if (repeatModeRef.current === "surah") {
          onAyahChange(0);
          playAyah(0);
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
    [audioUrls, onAyahChange, surahName, surahNumber, getAudioSource]
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
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

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

  useEffect(() => { togglePlayRef.current = togglePlay; }, [togglePlay]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    speedRef.current = speed;
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };

  const prev = () => { if (currentAyah > 0) playAyah(currentAyah - 1); };
  const next = () => { if (audioUrls && currentAyah < audioUrls.length - 1) playAyah(currentAyah + 1); };

  const startSleepTimer = (minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepEndRef.current = Date.now() + minutes * 60 * 1000;
    setSleepMinutesLeft(minutes);
    sleepTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil(((sleepEndRef.current || 0) - Date.now()) / 60000));
      setSleepMinutesLeft(remaining);
      if (remaining <= 0) {
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

  const cycleRepeatMode = () => {
    const next = repeatMode === "none" ? "surah" : repeatMode === "surah" ? "ayah" : "none";
    setRepeatMode(next);
    repeatModeRef.current = next;
  };

  const handleSaveOffline = async () => {
    if (!audioUrls || downloading) return;
    setDownloading(true);
    try {
      await downloadSurahForOffline(surahNumber, reciterId, audioUrls, (done, total) => {
        setDownloadProgress(`${done}/${total}`);
      });
      setIsOfflineAvailable(true);
    } catch (e) {
      console.error("Offline save failed", e);
    } finally {
      setDownloading(false);
      setDownloadProgress("");
    }
  };

  const handleRemoveOffline = async () => {
    try {
      await deleteSurahAudio(surahNumber, reciterId, totalAyahs);
      setIsOfflineAvailable(false);
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleDownloadZip = async () => {
    if (!audioUrls || downloading) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < audioUrls.length; i++) {
        setDownloadProgress(`${i + 1}/${audioUrls.length}`);
        // Prefer cached blob
        let blob = await getAudioBlob(surahNumber, i, reciterId);
        if (!blob) {
          const res = await fetch(audioUrls[i]);
          blob = await res.blob();
        }
        zip.file(`ayah-${String(i + 1).padStart(3, "0")}.mp3`, blob);
      }
      setDownloadProgress("Zipping…");
      const content = await zip.generateAsync({ type: "blob" });
      const reciterName = reciters?.find(r => r.id === reciterId)?.reciter_name || "reciter";
      saveAs(content, `surah-${surahNumber}-${reciterName.replace(/\s+/g, "-")}.zip`);
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloading(false);
      setDownloadProgress("");
    }
  };

  useEffect(() => {
    return () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current); };
  }, []);

  const displayName = (r: Reciter) =>
    r.style ? `${r.reciter_name} (${r.style})` : r.reciter_name;

  return (
    <div className="sticky bottom-16 z-40 bg-card border-t border-border p-3">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Reciter selector */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          {wakeLockActive && (
            <span className="flex items-center gap-1 text-[10px] text-accent-foreground shrink-0" title="Background playback active">
              <ShieldCheck className="w-3 h-3 text-primary" /> BG
            </span>
          )}
          {isOfflineAvailable && (
            <span className="flex items-center gap-1 text-[10px] text-primary shrink-0">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
          <Select value={String(reciterId)} onValueChange={(v) => setReciterId(Number(v))}>
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

        {/* Controls row 1: playback */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="default" size="icon" className="h-9 w-9 rounded-full" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
            <SkipForward className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground min-w-[65px] text-center tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <Slider
            value={[progress]} max={100} step={0.1} className="flex-1"
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

        {/* Controls row 2: speed, sleep, download, repeat */}
        <div className="flex items-center justify-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                <Gauge className="w-3 h-3" />
                {playbackSpeed}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[80px]">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="sm"
                className={`h-7 px-2 text-xs gap-1 ${sleepMinutesLeft !== null ? "text-primary font-semibold" : ""}`}
              >
                <Timer className="w-3 h-3" />
                {sleepMinutesLeft !== null ? `${sleepMinutesLeft}m` : "Sleep"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[100px]">
              {SLEEP_OPTIONS.map((mins) => (
                <DropdownMenuItem key={mins} onClick={() => startSleepTimer(mins)} className="text-xs justify-center">
                  {mins} min
                </DropdownMenuItem>
              ))}
              {sleepMinutesLeft !== null && (
                <DropdownMenuItem onClick={cancelSleepTimer} className="text-xs justify-center text-destructive">
                  Cancel timer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download & Offline */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="sm"
                className={`h-7 px-2 text-xs gap-1 ${isOfflineAvailable ? "text-primary font-semibold" : ""}`}
                disabled={downloading}
              >
                {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {downloading ? downloadProgress : isOfflineAvailable ? "Saved" : "Download"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[160px]">
              <DropdownMenuItem className="text-xs gap-2" onClick={() => {
                if (!audioUrls || !audioUrls[currentAyah]) return;
                const link = document.createElement("a");
                link.href = audioUrls[currentAyah];
                link.download = `surah-${surahNumber}-ayah-${currentAyah + 1}.mp3`;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
                <Download className="w-3 h-3" /> Current Ayah
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2" disabled={downloading} onClick={handleDownloadZip}>
                <Download className="w-3 h-3" /> Surah as ZIP
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isOfflineAvailable ? (
                <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={handleRemoveOffline}>
                  <Trash2 className="w-3 h-3" /> Remove offline data
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-xs gap-2" disabled={downloading} onClick={handleSaveOffline}>
                  <HardDriveDownload className="w-3 h-3" /> Save for offline
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost" size="sm"
            className={`h-7 px-2 text-xs gap-1 ${repeatMode !== "none" ? "text-primary font-semibold" : ""}`}
            onClick={cycleRepeatMode}
            title={repeatMode === "none" ? "No repeat" : repeatMode === "surah" ? "Repeat surah" : "Repeat ayah"}
          >
            {repeatMode === "ayah" ? <Repeat1 className="w-3 h-3" /> : <Repeat className="w-3 h-3" />}
            {repeatMode === "none" ? "Repeat" : repeatMode === "surah" ? "Surah" : "Ayah"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
