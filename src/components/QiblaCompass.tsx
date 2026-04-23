import { useEffect, useRef, useState } from "react";
import { Compass, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface QiblaCompassProps {
  qiblaBearing: number; // degrees from North to Qibla
}

// Listens to deviceorientation. iOS requires permission via DeviceOrientationEvent.requestPermission().
const QiblaCompass = ({ qiblaBearing }: QiblaCompassProps) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPerm, setNeedsPerm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<() => void>();

  const start = () => {
    setError(null);
    const handler = (e: DeviceOrientationEvent) => {
      // iOS gives webkitCompassHeading (already true heading)
      // Android: alpha is rotation around Z axis (0..360)
      // @ts-ignore
      const wkh = (e as any).webkitCompassHeading;
      if (typeof wkh === "number") {
        setHeading(wkh);
      } else if (typeof e.alpha === "number") {
        // alpha 360 = North; convert to compass-heading
        setHeading(360 - e.alpha);
      }
    };
    const evtName: any = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(evtName, handler as any, true);
    cleanupRef.current = () => window.removeEventListener(evtName, handler as any, true);
  };

  useEffect(() => {
    // @ts-ignore
    const NeedsPerm = typeof DeviceOrientationEvent !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function";
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
      if (res === "granted") { setNeedsPerm(false); start(); }
      else setError("Permission denied");
    } catch (e: any) { setError(e?.message ?? "Permission failed"); }
  };

  // Rotation: compass dial rotates opposite to heading; needle is fixed pointing up
  // We rotate the entire dial so that North aligns with current heading negative,
  // and place a Qibla marker at qiblaBearing position on the dial.
  const dialRotation = heading != null ? -heading : 0;
  const aligned = heading != null && Math.abs(((qiblaBearing - heading + 540) % 360) - 180) < 5;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-64 h-64">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-border bg-card shadow-inner" />
        {/* Rotating dial */}
        <div
          className="absolute inset-2 rounded-full border border-border/50 transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${dialRotation}deg)` }}
        >
          {/* Cardinal labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-destructive">N</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>

          {/* Qibla marker on dial */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              width: "2px",
              height: "calc(50% - 12px)",
              transform: `translate(-50%, -100%) rotate(${qiblaBearing}deg)`,
              transformOrigin: "bottom center",
            }}
          >
            <div className={cn(
              "w-3 h-3 -ml-1.5 rounded-full",
              aligned ? "bg-accent shadow-[0_0_12px_hsl(var(--accent))]" : "bg-primary"
            )} />
          </div>
        </div>
        {/* Fixed center needle pointing up */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Navigation className={cn("w-8 h-8", aligned ? "text-accent" : "text-foreground")} />
        </div>
      </div>

      <div className="text-center">
        {needsPerm ? (
          <button
            onClick={requestPerm}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            <Compass className="inline w-4 h-4 mr-1" />
            Enable compass
          </button>
        ) : error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Qibla: {qiblaBearing.toFixed(1)}°
            {heading != null && ` • Heading: ${heading.toFixed(0)}°`}
            {aligned && <span className="text-accent font-semibold ml-2">Aligned ✓</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default QiblaCompass;
