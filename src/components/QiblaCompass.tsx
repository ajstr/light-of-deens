import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QiblaCompassProps {
  qiblaBearing: number;
}

type CalQuality = "unknown" | "calibrating" | "poor" | "fair" | "good";

const CAL_DISMISSED_KEY = "qibla:cal:dismissed";

const QiblaCompass = ({ qiblaBearing }: QiblaCompassProps) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPerm, setNeedsPerm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iosAccuracy, setIosAccuracy] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);

  const cleanupRef = useRef<() => void>();
  const lastBuzzRef = useRef<number>(0);
  const samplesRef = useRef<number[]>([]);
  const poorSinceRef = useRef<number | null>(null);

  const start = () => {
    setError(null);
    samplesRef.current = [];
    const handler = (e: DeviceOrientationEvent) => {
      // @ts-ignore
      const wkh = (e as any).webkitCompassHeading;
      // @ts-ignore — iOS-only accuracy in degrees (-1 invalid, lower is better)
      const wka = (e as any).webkitCompassAccuracy;
      let h: number | null = null;
      if (typeof wkh === "number") {
        h = wkh;
        if (typeof wka === "number") setIosAccuracy(wka);
      } else if (typeof e.alpha === "number") {
        h = 360 - e.alpha;
      }
      if (h == null) return;
      setHeading(h);

      // Track ~30 recent samples → angular spread for jitter (Android proxy for accuracy)
      const buf = samplesRef.current;
      buf.push(h);
      if (buf.length > 30) buf.shift();
      if (buf.length >= 10) {
        const sin = buf.reduce((s, v) => s + Math.sin((v * Math.PI) / 180), 0) / buf.length;
        const cos = buf.reduce((s, v) => s + Math.cos((v * Math.PI) / 180), 0) / buf.length;
        const mean = (Math.atan2(sin, cos) * 180) / Math.PI;
        const dev =
          buf.reduce((s, v) => s + Math.abs(((v - mean + 540) % 360) - 180), 0) / buf.length;
        setJitter(dev);
      }
    };
    const evtName: any =
      "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(evtName, handler as any, true);
    cleanupRef.current = () => window.removeEventListener(evtName, handler as any, true);
  };

  useEffect(() => {
    // @ts-ignore
    const NeedsPerm =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function";
    if (NeedsPerm) setNeedsPerm(true);
    else start();
    return () => cleanupRef.current?.();
  }, []);

  const requestPerm = async () => {
    try {
      // @ts-ignore
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === "granted") {
        setNeedsPerm(false);
        start();
      } else {
        setError("Permission denied — enable Motion & Orientation Access in Settings.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Permission failed");
    }
  };

  const dialRotation = heading != null ? -heading : 0;
  const offset = heading != null ? ((qiblaBearing - heading + 540) % 360) - 180 : 0;
  const aligned = heading != null && Math.abs(offset) < 5;

  const quality: CalQuality = useMemo(() => {
    if (heading == null) return "unknown";
    if (iosAccuracy != null) {
      if (iosAccuracy < 0) return "poor";
      if (iosAccuracy <= 15) return "good";
      if (iosAccuracy <= 35) return "fair";
      return "poor";
    }
    if (jitter == null) return "calibrating";
    if (jitter < 2) return "good";
    if (jitter < 6) return "fair";
    return "poor";
  }, [heading, iosAccuracy, jitter]);

  // Auto-open figure-8 overlay first time, or after 2s of "poor" quality
  useEffect(() => {
    if (heading == null) return;
    const dismissed = localStorage.getItem(CAL_DISMISSED_KEY) === "1";
    if (!dismissed) { setShowCalibration(true); return; }
    if (quality === "poor") {
      if (poorSinceRef.current == null) poorSinceRef.current = Date.now();
      else if (Date.now() - poorSinceRef.current > 2000) setShowCalibration(true);
    } else {
      poorSinceRef.current = null;
    }
  }, [quality, heading]);

  const dismissCalibration = () => {
    localStorage.setItem(CAL_DISMISSED_KEY, "1");
    setShowCalibration(false);
  };

  const recalibrate = () => {
    samplesRef.current = [];
    setJitter(null);
    setIosAccuracy(null);
    setShowCalibration(true);
  };

  useEffect(() => {
    if (!aligned || quality === "poor" || quality === "calibrating") return;
    const now = Date.now();
    if (now - lastBuzzRef.current < 2000) return;
    lastBuzzRef.current = now;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(40); } catch { /* noop */ }
    }
  }, [aligned, quality]);

  const qualityMeta: Record<CalQuality, { label: string; color: string; dot: string }> = {
    unknown:     { label: "Awaiting compass", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
    calibrating: { label: "Calibrating…",     color: "text-gold",             dot: "bg-gold animate-pulse" },
    poor:        { label: "Poor accuracy",    color: "text-destructive",      dot: "bg-destructive animate-pulse" },
    fair:        { label: "Fair accuracy",    color: "text-gold",             dot: "bg-gold" },
    good:        { label: "Good accuracy",    color: "text-accent",           dot: "bg-accent animate-pulse" },
  };
  const qm = qualityMeta[quality];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Calibration status pill */}
      <div className="flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full", qm.dot)} />
        <span className={cn("text-[10px] uppercase tracking-[0.2em] font-medium", qm.color)}>
          {qm.label}
        </span>
        {iosAccuracy != null && iosAccuracy >= 0 && (
          <span className="text-[10px] text-muted-foreground font-mono">±{Math.round(iosAccuracy)}°</span>
        )}
      </div>

      <div className="relative w-72 h-72">
        {/* Outer aligned glow */}
        <div
          className={cn(
            "absolute -inset-3 rounded-full transition-opacity duration-500",
            aligned ? "opacity-100" : "opacity-0"
          )}
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.35), transparent 70%)" }}
        />

        {/* Outer bezel */}
        <div className="absolute inset-0 rounded-full glass-surface" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, hsl(var(--gold) / 0.5), hsl(var(--gold) / 0.1) 25%, hsl(var(--gold) / 0.5) 50%, hsl(var(--gold) / 0.1) 75%, hsl(var(--gold) / 0.5))",
            mask: "radial-gradient(circle, transparent 49%, black 49.5%, black 50%, transparent 50.5%)",
            WebkitMask:
              "radial-gradient(circle, transparent 49%, black 49.5%, black 50%, transparent 50.5%)",
          }}
        />

        {/* Rotating dial */}
        <div
          className="absolute inset-4 rounded-full transition-transform duration-150 ease-out"
          style={{ transform: `rotate(${dialRotation}deg)` }}
        >
          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const major = i % 9 === 0;
            return (
              <div
                key={i}
                className="absolute top-0 left-1/2 origin-bottom"
                style={{
                  width: major ? "2px" : "1px",
                  height: major ? "10px" : "5px",
                  background: major ? "hsl(var(--gold) / 0.8)" : "hsl(var(--foreground) / 0.25)",
                  transform: `translateX(-50%) rotate(${i * 5}deg)`,
                  transformOrigin: "50% 144px",
                }}
              />
            );
          })}

          {/* Cardinal labels */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-base font-bold text-destructive">
            N
          </span>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-base font-bold text-muted-foreground">
            S
          </span>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">
            W
          </span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">
            E
          </span>

          {/* Qibla marker (Kaaba) */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              width: "0",
              height: "calc(50% - 18px)",
              transform: `translate(-50%, -100%) rotate(${qiblaBearing}deg)`,
              transformOrigin: "bottom center",
            }}
          >
            <div
              className={cn(
                "absolute -top-1 -translate-x-1/2 left-0 flex flex-col items-center transition-all duration-200",
                aligned ? "scale-110" : "scale-100"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold border-2",
                  aligned
                    ? "bg-accent text-accent-foreground border-accent shadow-[0_0_24px_hsl(var(--accent))]"
                    : "bg-card text-foreground border-gold"
                )}
              >
                ﷲ
              </div>
              <div
                className={cn(
                  "w-0.5 h-3 mt-0.5",
                  aligned ? "bg-accent" : "bg-gold"
                )}
              />
            </div>
          </div>
        </div>

        {/* Fixed center needle (always points up = device front) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-2 h-32 -mt-2">
            <div
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[14px] border-l-transparent border-r-transparent transition-colors",
                aligned ? "border-b-accent" : "border-b-gold"
              )}
            />
            <div
              className={cn(
                "absolute top-3 left-1/2 -translate-x-1/2 w-0.5 rounded-full",
                aligned ? "bg-accent" : "bg-gold"
              )}
              style={{ height: "calc(100% - 12px)" }}
            />
          </div>
          {/* Center hub */}
          <div className="absolute w-4 h-4 rounded-full bg-card border-2 border-gold" />
        </div>

        {/* Calibration overlay */}
        {showCalibration && heading != null && (
          <div className="absolute inset-0 rounded-full bg-background/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-10 animate-in fade-in duration-300">
            <button
              onClick={dismissCalibration}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <svg viewBox="0 0 100 70" className="w-28 h-20 mb-3" aria-hidden>
              <path
                d="M 20 35 Q 20 10 50 35 Q 80 60 80 35 Q 80 10 50 35 Q 20 60 20 35 Z"
                fill="none"
                stroke="hsl(var(--gold) / 0.3)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <g style={{ animation: "qibla-fig8 3s ease-in-out infinite" }}>
                <rect x="-5" y="-8" width="10" height="16" rx="2" fill="hsl(var(--gold))" />
                <rect x="-3" y="-6" width="6" height="11" fill="hsl(var(--background))" />
              </g>
            </svg>
            <h4 className="text-sm font-semibold text-foreground mb-1">Calibrate compass</h4>
            <p className="text-[11px] text-center text-muted-foreground leading-relaxed max-w-[200px]">
              Move your phone in a <span className="text-gold font-medium">figure-8</span> motion until accuracy improves.
            </p>
            {(quality === "good" || quality === "fair") && (
              <button
                onClick={dismissCalibration}
                className="mt-3 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold"
              >
                Done ✓
              </button>
            )}
          </div>
        )}
      </div>

      {/* Readout */}
      <div className="text-center space-y-1">
        {needsPerm ? (
          <button
            onClick={requestPerm}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground text-sm font-semibold shadow-[var(--shadow-gold)] hover:scale-105 transition-transform"
          >
            <Compass className="inline w-4 h-4 mr-1.5" />
            Enable Live Compass
          </button>
        ) : error ? (
          <p className="text-xs text-destructive max-w-xs">{error}</p>
        ) : (
          <>
            <div className="flex items-center justify-center gap-6 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Qibla</div>
                <div className="font-mono text-base font-semibold text-foreground">
                  {qiblaBearing.toFixed(1)}°
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Heading</div>
                <div className="font-mono text-base font-semibold text-foreground">
                  {heading != null ? `${heading.toFixed(0)}°` : "—"}
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Off by</div>
                <div className={cn(
                  "font-mono text-base font-semibold",
                  aligned ? "text-accent" : "text-foreground"
                )}>
                  {heading != null ? `${Math.abs(offset).toFixed(0)}°` : "—"}
                </div>
              </div>
            </div>
            {aligned && (
              <p className="text-accent font-semibold text-sm pt-1 animate-pulse">
                ✓ Facing the Qibla
              </p>
            )}
            {heading == null && (
              <p className="text-[11px] text-muted-foreground pt-1">
                Hold device flat. Move in a figure-8 to calibrate.
              </p>
            )}
          </>
        )}
      </div>

      {/* Recalibrate action */}
      {heading != null && !needsPerm && !error && (
        <button
          onClick={recalibrate}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Recalibrate
        </button>
      )}
    </div>
  );
};

export default QiblaCompass;
