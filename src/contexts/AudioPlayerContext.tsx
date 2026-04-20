import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

export interface AudioControls {
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  openReader: () => void;
}

export interface NowPlaying {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  currentAyah: number;        // 0-based
  isPlaying: boolean;
  progress: number;           // 0-100
  repeatMode: "none" | "surah" | "ayah";
  repeatCount: number;        // 0 = infinite
  repeatIteration: number;    // current loop number (1-based) when in ayah-repeat
}

interface Ctx {
  nowPlaying: NowPlaying | null;
  setNowPlaying: (n: NowPlaying | null) => void;
  registerControls: (c: AudioControls | null) => void;
  controls: AudioControls | null;
  registerOpenReader: (fn: (surahNumber: number, ayah: number) => void) => void;
  requestOpenReader: (surahNumber: number, ayah: number) => void;
}

const AudioPlayerContext = createContext<Ctx | null>(null);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [nowPlaying, setNowPlayingState] = useState<NowPlaying | null>(null);
  const controlsRef = useRef<AudioControls | null>(null);
  const [, force] = useState(0);
  const openReaderRef = useRef<((s: number, a: number) => void) | null>(null);

  const setNowPlaying = useCallback((n: NowPlaying | null) => {
    setNowPlayingState(n);
  }, []);

  const registerControls = useCallback((c: AudioControls | null) => {
    controlsRef.current = c;
    force((x) => x + 1);
  }, []);

  const registerOpenReader = useCallback((fn: (s: number, a: number) => void) => {
    openReaderRef.current = fn;
  }, []);

  const requestOpenReader = useCallback((s: number, a: number) => {
    openReaderRef.current?.(s, a);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        nowPlaying,
        setNowPlaying,
        registerControls,
        controls: controlsRef.current,
        registerOpenReader,
        requestOpenReader,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return ctx;
};
