import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchReciters } from "@/lib/quran-api";
import { getSettings } from "@/lib/storage";
import { RUQYA_SESSION, buildQueue, fetchAyahAudioUrl } from "@/lib/ruqya-audio";

const RuqyaSessionPlayer = () => {
  const queue = useMemo(() => buildQueue(RUQYA_SESSION), []);
  const [reciterId, setReciterId] = useState<number>(() => getSettings().defaultReciterId || 7);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loop, setLoop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: reciters } = useQuery({ queryKey: ["reciters"], queryFn: fetchReciters });

  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      audioRef.current = a;
    }
    const a = audioRef.current!;
    const onEnded = () => {
      const nextIdx = idx + 1;
      if (nextIdx >= queue.length) {
        if (loop) {
          setIdx(0);
        } else {
          setPlaying(false);
        }
      } else {
        setIdx(nextIdx);
      }
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [idx, queue.length, loop]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  // Load + (auto)play current entry when idx, reciter, or playing changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const entry = queue[idx];
    if (!entry) return;
    let cancelled = false;
    setLoading(true);
    fetchAyahAudioUrl(reciterId, entry.surah, entry.ayah)
      .then((url) => {
        if (cancelled) return;
        if (a.src !== url) a.src = url;
        if (playing) a.play().catch(() => setPlaying(false));
      })
      .catch(() => { if (!cancelled) setPlaying(false); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [idx, reciterId, playing, queue]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      setPlaying(true);
      if (a.src) a.play().catch(() => setPlaying(false));
    }
  };

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(queue.length - 1, i + 1));

  const entry = queue[idx];
  const itemNumber = entry.itemIndex + 1;
  const totalItems = RUQYA_SESSION.length;
  const progressPct = ((idx + 1) / queue.length) * 100;

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-xl p-4 mb-5 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Full Ruqyah Recitation
        </p>
      </div>

      <p className="text-sm font-medium text-foreground mb-1 truncate" dir="auto">
        {entry.itemTitle}
      </p>
      <p className="text-[11px] text-muted-foreground mb-3">
        Passage {itemNumber} of {totalItems} · Ayah {entry.surah}:{entry.ayah}
      </p>

      <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prev} disabled={idx === 0} className="h-9 w-9">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="icon" onClick={toggle} className="h-11 w-11 rounded-full">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={next} disabled={idx === queue.length - 1} className="h-9 w-9">
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant={loop ? "default" : "ghost"}
            size="icon"
            onClick={() => setLoop((v) => !v)}
            className="h-9 w-9"
            title="Repeat session"
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        <Select value={String(reciterId)} onValueChange={(v) => setReciterId(Number(v))}>
          <SelectTrigger className="h-9 w-[150px] text-xs">
            <SelectValue placeholder="Reciter" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {reciters?.map((r) => (
              <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                {r.reciter_name}{r.style ? ` (${r.style})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RuqyaSessionPlayer;
