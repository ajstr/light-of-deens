import { useEffect, useRef, useState } from "react";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface QiblaCompassProps {
  qiblaBearing: number; // degrees from North to Qibla
}

// Live Qibla finder. Listens to deviceorientation; iOS requires user permission gesture.
const QiblaCompass = ({ qiblaBearing }: QiblaCompassProps) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPerm, setNeedsPerm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<() => void>();
  const lastBuzzRef = useRef<number>(0);

  const start = () => {
    setError(null);
    const handler = (e: DeviceOrientationEvent) => {
      // iOS provides webkitCompassHeading (true heading)
      // @ts-ignore
      const wkh = (e as any).webkitCompassHeading;
      if (typeof wkh === "number") {
        setHeading(wkh);
      } else if (typeof e.alpha === "number") {
        setHeading(360 - e.alpha);
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
    if (NeedsPerm) {
      setNeedsPerm(true);
    } else {
      start();
    }
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

  // Light haptic pulse when newly aligned (every 2s max)
  useEffect(() => {
    if (!aligned) return;
    const now = Date.now();
    if (now - lastBuzzRef.current < 2000) return;
    lastBuzzRef.current = now;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(40); } catch { /* noop */ }
    }
  }, [aligned]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* LIVE indicator */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            heading != null ? "bg-accent animate-pulse" : "bg-muted-foreground/40"
          )}
        />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
          {heading != null ? "Live" : "Awaiting compass"}
        </span>
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
    </div>
  );
};

export default QiblaCompass;
