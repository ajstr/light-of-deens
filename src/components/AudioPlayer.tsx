import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReciters, fetchAudioUrls, Reciter } from "@/lib/quran-api";
import { getSettings, saveLastSession, getLastSession, type RepeatMode } from "@/lib/storage";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Gauge, Timer,
  Repeat, Repeat1, Download, Loader2, HardDriveDownload, Trash2, WifiOff, ShieldCheck, Infinity as InfinityIcon, ListRestart
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  getAudioBlob, downloadSurahForOffline, isSurahDownloaded, deleteSurahAudio
} from "@/lib/offline-audio";
import {
  getPersistentAudio, startSilentKeepalive, stopSilentKeepalive, isIOS
} from "@/lib/ios-audio";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import RangeRepeatDialog from "@/components/RangeRepeatDialog";


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
const REPEAT_COUNT_OPTIONS = [5, 10, 15, 25, 50]; // 0 = infinite


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
  const { setNowPlaying, registerControls } = useAudioPlayer();
  const [reciterId, setReciterId] = useState<number>(() => {
    const sess = getLastSession();
    return sess?.surahNumber === surahNumber ? sess.reciterId : getSettings().defaultReciterId;
  });
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

  // Repeat: mode + count (0 = infinite, otherwise total target loops). Count only applies when mode === "ayah"
  const initialSession = useRef(getLastSession()).current;
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(
    initialSession?.surahNumber === surahNumber ? initialSession.repeatMode : "none"
  );
  const [repeatCount, setRepeatCount] = useState<number>(
    initialSession?.surahNumber === surahNumber ? initialSession.repeatCount : 10
  );
  const [repeatIteration, setRepeatIteration] = useState<number>(1);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const repeatCountRef = useRef<number>(repeatCount);
  const repeatIterationRef = useRef<number>(1);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const pendingResumeTimeRef = useRef<number | null>(
    initialSession?.surahNumber === surahNumber ? initialSession.currentTime : null
  );

  // Range repeat state — when active, plays ayahs [rangeStart..rangeEnd] (0-based, inclusive),
  // repeating each ayah `rangeAyahCount` times before advancing, looping the entire range
  // `rangeLoopCount` times (0 = infinite).
  const [rangeActive, setRangeActive] = useState<boolean>(
    !!(initialSession?.surahNumber === surahNumber &&
       initialSession.rangeStart !== undefined &&
       initialSession.rangeEnd !== undefined)
  );
  const [rangeStart, setRangeStart] = useState<number>(
    initialSession?.rangeStart ?? 0
  );
  const [rangeEnd, setRangeEnd] = useState<number>(
    initialSession?.rangeEnd ?? Math.max(0, totalAyahs - 1)
  );
  const [rangeLoopCount, setRangeLoopCount] = useState<number>(
    initialSession?.rangeCount ?? 10
  );
  const [rangeAyahCount, setRangeAyahCount] = useState<number>(1);
  const [rangeIteration, setRangeIteration] = useState<number>(1);
  const [rangeAyahIteration, setRangeAyahIteration] = useState<number>(1);
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);

  const rangeActiveRef = useRef(rangeActive);
  const rangeStartRef = useRef(rangeStart);
  const rangeEndRef = useRef(rangeEnd);
  const rangeLoopCountRef = useRef(rangeLoopCount);
  const rangeAyahCountRef = useRef(rangeAyahCount);
  const rangeIterationRef = useRef(1);
  const rangeAyahIterationRef = useRef(1);



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

      const src = await getAudioSource(index);
      if (!src) return;

      // Start silent keepalive on iOS to maintain audio session between tracks
      if (isIOS()) startSilentKeepalive();

      // Reuse persistent audio element (critical for iOS background playback)
      const audio = getPersistentAudio();

      // Remove old event listeners by cloning approach — instead, we use
      // named handlers stored on the element to allow cleanup
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        // Apply pending resume time (only once, on first ayah load after restore)
        if (pendingResumeTimeRef.current !== null && pendingResumeTimeRef.current > 0 && pendingResumeTimeRef.current < audio.duration) {
          audio.currentTime = pendingResumeTimeRef.current;
        }
        pendingResumeTimeRef.current = null;
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
        }
      };
      audio.onended = () => {
        // Revoke blob URL if it was one
        if (src.startsWith("blob:")) URL.revokeObjectURL(src);

        // ----- Range repeat takes precedence -----
        if (rangeActiveRef.current) {
          const rs = rangeStartRef.current;
          const re = rangeEndRef.current;
          const ayahTarget = rangeAyahCountRef.current;
          const loopTarget = rangeLoopCountRef.current;

          // Repeat the same ayah inside the range first
          if (rangeAyahIterationRef.current < ayahTarget) {
            rangeAyahIterationRef.current += 1;
            setRangeAyahIteration(rangeAyahIterationRef.current);
            playAyah(index);
            return;
          }
          // Per-ayah quota satisfied — reset and advance
          rangeAyahIterationRef.current = 1;
          setRangeAyahIteration(1);

          if (index < re) {
            // Move to next ayah within the range
            playAyah(index + 1);
            return;
          }
          // Reached end of range — bump range iteration
          if (loopTarget === 0 || rangeIterationRef.current < loopTarget) {
            rangeIterationRef.current += 1;
            setRangeIteration(rangeIterationRef.current);
            playAyah(rs);
            return;
          }
          // Range fully complete — clear and stop
          rangeIterationRef.current = 1;
          setRangeIteration(1);
          rangeActiveRef.current = false;
          setRangeActive(false);
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          setDuration(0);
          stopSilentKeepalive();
          return;
        }

        if (repeatModeRef.current === "ayah") {
          // Infinite (count = 0) or still under the target → loop again
          const target = repeatCountRef.current;
          if (target === 0 || repeatIterationRef.current < target) {
            repeatIterationRef.current += 1;
            setRepeatIteration(repeatIterationRef.current);
            playAyah(index);
            return;
          }
          // Reached target — reset and continue to next ayah (or stop)
          repeatIterationRef.current = 1;
          setRepeatIteration(1);
        }

        if (index + 1 < audioUrls.length) {
          onAyahChange(index + 1);
        } else if (repeatModeRef.current === "surah") {
          onAyahChange(0);
          playAyah(0);
        } else {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          setDuration(0);
          stopSilentKeepalive();
        }
      };


      audio.playbackRate = speedRef.current;
      audio.src = src;
      audioRef.current = audio;
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
    [audioUrls, onAyahChange, surahName, surahNumber, getAudioSource, setIsPlaying]
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
      stopSilentKeepalive();
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

  const prev = () => {
    repeatIterationRef.current = 1;
    setRepeatIteration(1);
    if (currentAyah > 0) playAyah(currentAyah - 1);
  };
  const next = () => {
    repeatIterationRef.current = 1;
    setRepeatIteration(1);
    if (audioUrls && currentAyah < audioUrls.length - 1) playAyah(currentAyah + 1);
  };

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
        stopSilentKeepalive();
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

  const setRepeatModeAndCount = (mode: RepeatMode, count?: number) => {
    setRepeatMode(mode);
    repeatModeRef.current = mode;
    if (typeof count === "number") {
      setRepeatCount(count);
      repeatCountRef.current = count;
    }
    repeatIterationRef.current = 1;
    setRepeatIteration(1);
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

  // Publish now-playing state to global context (drives the GlobalMiniPlayer)
  useEffect(() => {
    setNowPlaying({
      surahNumber,
      surahName: surahName || `Surah ${surahNumber}`,
      totalAyahs,
      currentAyah,
      isPlaying,
      progress,
      repeatMode,
      repeatCount,
      repeatIteration,
      rangeActive,
      rangeStart,
      rangeEnd,
      rangeCount: rangeLoopCount,
      rangeIteration,
    });
  }, [setNowPlaying, surahNumber, surahName, totalAyahs, currentAyah, isPlaying, progress, repeatMode, repeatCount, repeatIteration, rangeActive, rangeStart, rangeEnd, rangeLoopCount, rangeIteration]);

  // Register controls so GlobalMiniPlayer can call play/pause/next/prev/stop
  useEffect(() => {
    registerControls({
      toggle: () => togglePlayRef.current(),
      next: () => {
        repeatIterationRef.current = 1;
        setRepeatIteration(1);
        rangeAyahIterationRef.current = 1;
        setRangeAyahIteration(1);
        if (audioUrls && currentAyah < audioUrls.length - 1) playAyah(currentAyah + 1);
      },
      prev: () => {
        repeatIterationRef.current = 1;
        setRepeatIteration(1);
        rangeAyahIterationRef.current = 1;
        setRangeAyahIteration(1);
        if (currentAyah > 0) playAyah(currentAyah - 1);
      },
      stop: () => {
        audioRef.current?.pause();
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        stopSilentKeepalive();
      },
      openReader: () => { /* handled at page level via requestOpenReader */ },
    });
    return () => registerControls(null);
  }, [registerControls, audioUrls, currentAyah, playAyah, setIsPlaying]);

  // Persist session continuously
  useEffect(() => {
    saveLastSession({
      surahNumber,
      surahName,
      ayahIndex: currentAyah,
      reciterId,
      wasPlaying: isPlaying,
      currentTime,
      repeatMode,
      repeatCount,
      rangeStart: rangeActive ? rangeStart : undefined,
      rangeEnd: rangeActive ? rangeEnd : undefined,
      rangeCount: rangeActive ? rangeLoopCount : undefined,
    });
  }, [surahNumber, surahName, currentAyah, reciterId, isPlaying, currentTime, repeatMode, repeatCount, rangeActive, rangeStart, rangeEnd, rangeLoopCount]);

  // Save fresh state on tab hide / unload
  useEffect(() => {
    const persist = () => {
      saveLastSession({
        surahNumber,
        surahName,
        ayahIndex: currentAyah,
        reciterId,
        wasPlaying: isPlaying,
        currentTime: audioRef.current?.currentTime ?? currentTime,
        repeatMode,
        repeatCount,
        rangeStart: rangeActive ? rangeStart : undefined,
        rangeEnd: rangeActive ? rangeEnd : undefined,
        rangeCount: rangeActive ? rangeLoopCount : undefined,
      });
    };
    window.addEventListener("beforeunload", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", persist);
    };
  }, [surahNumber, surahName, currentAyah, reciterId, isPlaying, currentTime, repeatMode, repeatCount, rangeActive, rangeStart, rangeEnd, rangeLoopCount]);

  const applyRange = (start: number, end: number, loopCount: number, ayahCount: number) => {
    rangeStartRef.current = start;
    rangeEndRef.current = end;
    rangeLoopCountRef.current = loopCount;
    rangeAyahCountRef.current = ayahCount;
    rangeIterationRef.current = 1;
    rangeAyahIterationRef.current = 1;
    rangeActiveRef.current = true;
    setRangeStart(start);
    setRangeEnd(end);
    setRangeLoopCount(loopCount);
    setRangeAyahCount(ayahCount);
    setRangeIteration(1);
    setRangeAyahIteration(1);
    setRangeActive(true);
    // Disable conflicting modes while range is active
    repeatModeRef.current = "none";
    setRepeatMode("none");
    // Jump to start ayah and begin playback
    playAyah(start);
  };

  const clearRange = () => {
    rangeActiveRef.current = false;
    setRangeActive(false);
    rangeIterationRef.current = 1;
    setRangeIteration(1);
    rangeAyahIterationRef.current = 1;
    setRangeAyahIteration(1);
  };


  const displayName = (r: Reciter) =>
    r.style ? `${r.reciter_name} (${r.style})` : r.reciter_name;

  return (
    <div className="sticky bottom-16 z-40 bg-card border-t border-border p-2 sm:p-3">
      <div className="max-w-3xl mx-auto space-y-1.5 sm:space-y-2">
        {/* Reciter selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
          {wakeLockActive && (
            <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-accent-foreground shrink-0" title="Background playback active">
              <ShieldCheck className="w-3 h-3 text-primary" /> BG
            </span>
          )}
          {isOfflineAvailable && (
            <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-primary shrink-0">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
          <Select value={String(reciterId)} onValueChange={(v) => setReciterId(Number(v))}>
            <SelectTrigger className="flex-1 h-7 sm:h-8 text-[11px] sm:text-xs">
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

        {/* Controls: playback + progress */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" onClick={prev}>
            <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <Button variant="default" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" onClick={next}>
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>

          <Slider
            value={[progress]} max={100} step={0.1} className="flex-1 min-w-0"
            onValueChange={([v]) => {
              if (audioRef.current && audioRef.current.duration) {
                audioRef.current.currentTime = (v / 100) * audioRef.current.duration;
                setProgress(v);
              }
            }}
          />

          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 tabular-nums">
            {formatTime(currentTime)}/{formatTime(duration)}
          </span>
        </div>

        {/* Controls row 2: speed, sleep, download, repeat, ayah counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-0.5 sm:gap-1">
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
                  className={`h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-0.5 sm:gap-1 ${sleepMinutesLeft !== null ? "text-primary font-semibold" : ""}`}
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
                  className={`h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-0.5 sm:gap-1 ${isOfflineAvailable ? "text-primary font-semibold" : ""}`}
                  disabled={downloading}
                >
                  {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  <span className="hidden xs:inline">{downloading ? downloadProgress : isOfflineAvailable ? "Saved" : "DL"}</span>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className={`h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-0.5 sm:gap-1 ${repeatMode !== "none" ? "text-primary font-semibold" : ""}`}
                  title={
                    repeatMode === "none" ? "No repeat"
                    : repeatMode === "surah" ? "Repeat surah"
                    : `Repeat ayah ${repeatCount === 0 ? "∞" : repeatCount + "×"}`
                  }
                >
                  {repeatMode === "ayah" ? <Repeat1 className="w-3 h-3" /> : <Repeat className="w-3 h-3" />}
                  <span className="hidden xs:inline">
                    {repeatMode === "none"
                      ? "Repeat"
                      : repeatMode === "surah"
                        ? "Surah"
                        : repeatCount === 0
                          ? `${repeatIteration}/∞`
                          : `${repeatIteration}/${repeatCount}`}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[140px]">
                <DropdownMenuItem
                  onClick={() => setRepeatModeAndCount("none")}
                  className={`text-xs justify-between ${repeatMode === "none" ? "bg-accent font-semibold" : ""}`}
                >
                  <span>Off</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRepeatModeAndCount("surah")}
                  className={`text-xs justify-between ${repeatMode === "surah" ? "bg-accent font-semibold" : ""}`}
                >
                  <span className="flex items-center gap-1.5"><Repeat className="w-3 h-3" /> Repeat surah</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Repeat ayah
                </DropdownMenuLabel>
                {REPEAT_COUNT_OPTIONS.map((c) => (
                  <DropdownMenuItem
                    key={c}
                    onClick={() => setRepeatModeAndCount("ayah", c)}
                    className={`text-xs justify-between ${repeatMode === "ayah" && repeatCount === c ? "bg-accent font-semibold" : ""}`}
                  >
                    <span className="flex items-center gap-1.5"><Repeat1 className="w-3 h-3" /> {c}×</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setRepeatModeAndCount("ayah", 0)}
                  className={`text-xs justify-between ${repeatMode === "ayah" && repeatCount === 0 ? "bg-accent font-semibold" : ""}`}
                >
                  <span className="flex items-center gap-1.5"><InfinityIcon className="w-3 h-3" /> Infinite</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums shrink-0">
            Ayah {currentAyah + 1}/{totalAyahs}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
