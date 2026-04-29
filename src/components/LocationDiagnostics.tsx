import { useState } from "react";
import { Stethoscope, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Capacitor } from "@capacitor/core";

type CheckStatus = "ok" | "warn" | "fail" | "pending";
interface CheckRow {
  label: string;
  status: CheckStatus;
  detail: string;
}

const StatusIcon = ({ s }: { s: CheckStatus }) => {
  if (s === "ok") return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
  if (s === "fail") return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
  if (s === "warn") return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />;
};

const LocationDiagnostics = () => {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [summary, setSummary] = useState<string>("");

  const run = async () => {
    setRunning(true);
    setSummary("");
    const out: CheckRow[] = [];
    const push = (r: CheckRow) => { out.push(r); setRows([...out]); };

    // 1. Platform
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    push({
      label: "Platform",
      status: "ok",
      detail: `${platform}${isNative ? " (native app)" : " (web)"}`,
    });

    // 2. Secure context (web only)
    if (!isNative) {
      const secure = window.isSecureContext;
      push({
        label: "Secure context (HTTPS)",
        status: secure ? "ok" : "fail",
        detail: secure ? "Page served over HTTPS — geolocation allowed." : "Geolocation requires HTTPS or localhost.",
      });
    }

    // 3. API available
    const hasGeo = typeof navigator !== "undefined" && "geolocation" in navigator;
    push({
      label: "Geolocation API",
      status: hasGeo ? "ok" : "fail",
      detail: hasGeo ? "navigator.geolocation is available." : "Not available in this browser.",
    });
    if (!hasGeo) { setSummary("This browser does not support geolocation."); setRunning(false); return; }

    // 4. Permission state (Permissions API, may not exist on iOS Safari)
    let permState: string = "unknown";
    try {
      // @ts-ignore
      if (navigator.permissions?.query) {
        // @ts-ignore
        const p = await navigator.permissions.query({ name: "geolocation" });
        permState = p.state; // granted | denied | prompt
      }
    } catch { /* ignore */ }

    if (permState === "granted") {
      push({ label: "Permission state", status: "ok", detail: "granted — the app may read your location." });
    } else if (permState === "denied") {
      push({
        label: "Permission state",
        status: "fail",
        detail: isNative
          ? "denied — open iOS Settings → Light of Deen → Location and choose 'While Using'."
          : "denied — click the 🔒 / location icon in the address bar and allow location, then retry.",
      });
    } else if (permState === "prompt") {
      push({ label: "Permission state", status: "warn", detail: "prompt — the OS will ask the next time we request a fix." });
    } else {
      push({ label: "Permission state", status: "warn", detail: "Unknown (Permissions API unavailable). We'll request a fix to find out." });
    }

    // 5. Try to get a fix
    push({ label: "GPS fix", status: "pending", detail: "Requesting current position…" });

    const result = await new Promise<{ ok: boolean; detail: string; coords?: GeolocationCoordinates; }>((resolve) => {
      const timer = setTimeout(() => {
        resolve({ ok: false, detail: "Timed out after 15s — no GPS fix received. Try outdoors or near a window." });
      }, 15500);
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(timer); resolve({ ok: true, detail: "Coordinates received.", coords: pos.coords }); },
        (err) => {
          clearTimeout(timer);
          const map: Record<number, string> = {
            1: "PERMISSION_DENIED — the user or OS blocked access.",
            2: "POSITION_UNAVAILABLE — device cannot determine a location right now.",
            3: "TIMEOUT — the request took too long.",
          };
          resolve({ ok: false, detail: map[err.code] ?? err.message });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });

    // replace the pending row
    out.pop();
    if (result.ok && result.coords) {
      const c = result.coords;
      push({
        label: "GPS fix",
        status: "ok",
        detail: `lat ${c.latitude.toFixed(5)}, lng ${c.longitude.toFixed(5)} (±${Math.round(c.accuracy)}m)`,
      });
      setSummary("✅ Location is working. Coordinates are being received.");
    } else {
      push({ label: "GPS fix", status: "fail", detail: result.detail });
      setSummary(
        isNative
          ? "❌ Coordinates not received. Check iOS Settings → Privacy → Location Services is ON, and that this app is allowed."
          : "❌ Coordinates not received. Allow location in your browser, or use the manual coordinates option in Settings.",
      );
    }
    setRunning(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setRows([]); setSummary(""); run(); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full mb-2">
          <Stethoscope className="w-4 h-4" />
          Diagnose location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Location diagnostics</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {rows.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Running checks…
            </div>
          )}
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2 items-start text-sm">
              <StatusIcon s={r.status} />
              <div className="min-w-0">
                <div className="font-medium">{r.label}</div>
                <div className="text-muted-foreground break-words">{r.detail}</div>
              </div>
            </div>
          ))}
          {summary && (
            <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
              {summary}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={run} disabled={running}>
            {running ? "Running…" : "Run again"}
          </Button>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDiagnostics;
