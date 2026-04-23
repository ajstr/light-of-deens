import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, RefreshCw, Settings as SettingsIcon, Volume2, VolumeX,
  Play, Square, Bell, BellOff,
} from "lucide-react";
import {
  computeTimes, detectLocation, getPrayerLocation, savePrayerLocation,
  nextPrayer, formatTime, prayerLabel, prayerArabic, getHijri,
  getPrayerSettings, savePrayerSettings, getQibla,
  PrayerLocation, PrayerSettings, PrayerName, MethodKey,
} from "@/lib/prayer-times";
import { playAthanNow, stopAthan, rescheduleAthan } from "@/lib/athan-scheduler";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import QiblaCompass from "@/components/QiblaCompass";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const METHODS: { key: MethodKey; label: string }[] = [
  { key: "MuslimWorldLeague", label: "Muslim World League" },
  { key: "Egyptian", label: "Egyptian General Authority" },
  { key: "Karachi", label: "University of Islamic Sciences, Karachi" },
  { key: "UmmAlQura", label: "Umm al-Qura, Makkah" },
  { key: "Dubai", label: "Dubai" },
  { key: "Qatar", label: "Qatar" },
  { key: "Kuwait", label: "Kuwait" },
  { key: "MoonsightingCommittee", label: "Moonsighting Committee" },
  { key: "Singapore", label: "Singapore (MUIS)" },
  { key: "Turkey", label: "Diyanet (Turkey)" },
  { key: "Tehran", label: "Tehran" },
  { key: "NorthAmerica", label: "ISNA (North America)" },
];

const PRAYER_LIST: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

const PrayerPage = () => {
  const [loc, setLoc] = useState<PrayerLocation | null>(getPrayerLocation());
  const [settings, setSettings] = useState<PrayerSettings>(getPrayerSettings());
  const [loading, setLoading] = useState(false);
  const [, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!loc) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rescheduleAthan();
  }, [settings, loc]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const refresh = async (forceFresh = false) => {
    setLoading(true);
    try {
      const detected = await detectLocation({ forceFresh });
      setLoc(detected);
      setTick((t) => t + 1); // force timetable recompute immediately
      const src = detected.source === "gps" ? "GPS" : detected.source === "ip" ? "IP" : "manual";
      toast.success(`Location updated (${src}): ${detected.city ?? detected.country ?? `${detected.lat.toFixed(2)}, ${detected.lng.toFixed(2)}`}`);
    } catch {
      toast.error("Could not detect location. Set it manually below.");
    } finally { setLoading(false); }
  };

  const update = (patch: Partial<PrayerSettings>) => {
    const merged = savePrayerSettings(patch);
    setSettings(merged);
  };

  const updateOffset = (p: PrayerName, val: number) => {
    update({ offsets: { ...settings.offsets, [p]: val } });
  };

  const handlePlayAthan = async () => {
    if (playing) { stopAthan(); setPlaying(false); return; }
    setPlaying(true);
    await playAthanNow();
    // Reset state after audio likely ends (~3 min max)
    setTimeout(() => setPlaying(false), 180_000);
  };

  const setManualLocation = (lat: number, lng: number) => {
    const next: PrayerLocation = {
      lat, lng,
      source: "manual",
      updatedAt: Date.now(),
      countryCode: loc?.countryCode,
      country: loc?.country,
      city: loc?.city,
    };
    savePrayerLocation(next);
    setLoc(next);
  };

  if (!loc) {
    return (
      <div className="px-4 py-12 text-center max-w-md mx-auto">
        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="font-display text-2xl mb-2">Enable location</h2>
        <p className="text-muted-foreground text-sm mb-4">
          We need your location to compute prayer times.
        </p>
        <Button onClick={() => refresh(true)} disabled={loading}>
          {loading ? "Detecting…" : "Detect my location"}
        </Button>
      </div>
    );
  }

  const times = computeTimes(loc, new Date(), settings);
  const next = nextPrayer(times);
  const hijri = getHijri(new Date(), settings.hijriOffset);
  const qibla = getQibla(loc);

  return (
    <div className="px-4 max-w-3xl mx-auto pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-5 mb-5"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{loc.city ?? "—"}{loc.country ? `, ${loc.country}` : ""}</span>
            </div>
            <div className="font-display text-3xl font-bold text-foreground">
              {prayerLabel(next.name)} <span className="text-muted-foreground text-lg font-normal">{prayerArabic(next.name)}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {formatTime(next.at)} · {hijri.day} {hijri.monthName} {hijri.year} AH
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => refresh(false)} disabled={loading} aria-label="Refresh location">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <SettingsSheet settings={settings} onChange={update} loc={loc} onManualLoc={setManualLocation} />
          </div>
        </div>

        {/* Prominent re-detect button (forces fresh GPS fix) */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => refresh(true)}
          disabled={loading}
          className="w-full mb-2"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {loading ? "Detecting fresh GPS…" : "Re-detect location"}
        </Button>

        <Button
          size="sm"
          variant={playing ? "secondary" : "outline"}
          onClick={handlePlayAthan}
          className="w-full"
        >
          {playing ? <><Square className="w-4 h-4" /> Stop Athan</> : <><Play className="w-4 h-4" /> Play Athan now</>}
        </Button>
      </motion.div>

      {/* Times list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-5">
        {PRAYER_LIST.map((p, i) => {
          const isNext = p === next.name;
          return (
            <div
              key={p}
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0",
                isNext && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-1 h-8 rounded-full", isNext ? "bg-primary" : "bg-transparent")} />
                <div>
                  <div className={cn("font-medium", isNext && "text-primary")}>{prayerLabel(p)}</div>
                  <div className="text-xs text-muted-foreground" dir="rtl">{prayerArabic(p)}</div>
                </div>
              </div>
              <div className={cn("text-lg tabular-nums", isNext ? "font-semibold text-primary" : "text-foreground")}>
                {formatTime((times as any)[p])}
              </div>
            </div>
          );
        })}
      </div>

      {/* Qibla */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-5">
        <h3 className="font-display text-xl mb-4 text-center">Qibla Direction</h3>
        <QiblaCompass qiblaBearing={qibla} />
      </div>
    </div>
  );
};

// ---------------- Settings Sheet ----------------
const SettingsSheet = ({
  settings, onChange, loc, onManualLoc,
}: {
  settings: PrayerSettings;
  onChange: (p: Partial<PrayerSettings>) => void;
  loc: PrayerLocation;
  onManualLoc: (lat: number, lng: number) => void;
}) => {
  const [latStr, setLatStr] = useState(loc.lat.toString());
  const [lngStr, setLngStr] = useState(loc.lng.toString());

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Prayer settings">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Prayer Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Method */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Auto-select method by country</Label>
              <Switch checked={settings.autoMethod} onCheckedChange={(v) => onChange({ autoMethod: v })} />
            </div>
            <Select
              value={settings.method}
              onValueChange={(v) => onChange({ method: v as MethodKey, autoMethod: false })}
              disabled={settings.autoMethod}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {METHODS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Madhhab */}
          <section className="space-y-2">
            <Label>Madhhab (Asr calculation)</Label>
            <Select value={settings.madhhab} onValueChange={(v) => onChange({ madhhab: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shafi">Shafi'i / Maliki / Hanbali (standard)</SelectItem>
                <SelectItem value="hanafi">Hanafi (later Asr)</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {/* High latitude */}
          <section className="space-y-2">
            <Label>High-latitude rule</Label>
            <Select value={settings.highLatitudeRule} onValueChange={(v) => onChange({ highLatitudeRule: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Auto">Auto (use method default)</SelectItem>
                <SelectItem value="MiddleOfTheNight">Middle of the night</SelectItem>
                <SelectItem value="SeventhOfTheNight">Seventh of the night</SelectItem>
                <SelectItem value="TwilightAngle">Twilight angle</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {/* Per-prayer offsets */}
          <section className="space-y-2">
            <Label>Time adjustments (minutes)</Label>
            <div className="space-y-3">
              {PRAYER_LIST.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="w-20 text-sm">{prayerLabel(p)}</span>
                  <Slider
                    min={-30} max={30} step={1}
                    value={[settings.offsets[p]]}
                    onValueChange={(v) => onChange({ offsets: { ...settings.offsets, [p]: v[0] } })}
                    className="flex-1"
                  />
                  <span className="w-10 text-right text-sm tabular-nums">{settings.offsets[p] > 0 ? "+" : ""}{settings.offsets[p]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Hijri offset */}
          <section className="space-y-2">
            <Label>Hijri date offset (days)</Label>
            <div className="flex items-center gap-3">
              <Slider
                min={-2} max={2} step={1}
                value={[settings.hijriOffset]}
                onValueChange={(v) => onChange({ hijriOffset: v[0] })}
                className="flex-1"
              />
              <span className="w-10 text-right text-sm tabular-nums">
                {settings.hijriOffset > 0 ? "+" : ""}{settings.hijriOffset}
              </span>
            </div>
          </section>

          {/* Athan */}
          <section className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <Label>Auto-play Athan</Label>
              <Switch checked={settings.athan.enabled} onCheckedChange={(v) => onChange({ athan: { ...settings.athan, enabled: v } })} />
            </div>
            <Select
              value={settings.athan.sound}
              onValueChange={(v) => onChange({ athan: { ...settings.athan, sound: v as any } })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="makkah">Makkah</SelectItem>
                <SelectItem value="madinah">Madinah</SelectItem>
                <SelectItem value="silent">Silent</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3">
              {settings.athan.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <Slider
                min={0} max={100} step={5}
                value={[Math.round(settings.athan.volume * 100)]}
                onValueChange={(v) => onChange({ athan: { ...settings.athan, volume: v[0] / 100 } })}
                className="flex-1"
              />
              <span className="w-10 text-right text-sm tabular-nums">{Math.round(settings.athan.volume * 100)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                {settings.athan.notifications ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                Native notifications
              </Label>
              <Switch checked={settings.athan.notifications} onCheckedChange={(v) => onChange({ athan: { ...settings.athan, notifications: v } })} />
            </div>
          </section>

          {/* Manual location */}
          <section className="space-y-2 border-t border-border pt-5">
            <Label>Manual location</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Latitude" value={latStr} onChange={(e) => setLatStr(e.target.value)} />
              <Input placeholder="Longitude" value={lngStr} onChange={(e) => setLngStr(e.target.value)} />
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => {
                const lat = parseFloat(latStr), lng = parseFloat(lngStr);
                if (Number.isFinite(lat) && Number.isFinite(lng)) onManualLoc(lat, lng);
                else toast.error("Invalid coordinates");
              }}
            >
              Save coordinates
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PrayerPage;
