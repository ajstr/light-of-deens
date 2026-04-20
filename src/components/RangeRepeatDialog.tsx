import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Infinity as InfinityIcon, ListRestart } from "lucide-react";

interface RangeRepeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAyahs: number;
  initialStart: number;     // 0-based
  initialEnd: number;       // 0-based, inclusive
  initialRangeCount: number;     // 0 = infinite
  initialAyahCount: number;      // per-ayah repeats inside range
  onApply: (start: number, end: number, rangeCount: number, ayahCount: number) => void;
  onClear: () => void;
  hasActiveRange: boolean;
}

const RangeRepeatDialog = ({
  open, onOpenChange, totalAyahs,
  initialStart, initialEnd, initialRangeCount, initialAyahCount,
  onApply, onClear, hasActiveRange,
}: RangeRepeatDialogProps) => {
  // Display values are 1-based for the user
  const [startStr, setStartStr] = useState(String(initialStart + 1));
  const [endStr, setEndStr] = useState(String(initialEnd + 1));
  const [rangeCountStr, setRangeCountStr] = useState(
    initialRangeCount === 0 ? "10" : String(initialRangeCount)
  );
  const [ayahCountStr, setAyahCountStr] = useState(
    initialAyahCount <= 0 ? "1" : String(initialAyahCount)
  );
  const [rangeInfinite, setRangeInfinite] = useState(initialRangeCount === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStartStr(String(initialStart + 1));
      setEndStr(String(initialEnd + 1));
      setRangeCountStr(initialRangeCount === 0 ? "10" : String(initialRangeCount));
      setAyahCountStr(initialAyahCount <= 0 ? "1" : String(initialAyahCount));
      setRangeInfinite(initialRangeCount === 0);
      setError(null);
    }
  }, [open, initialStart, initialEnd, initialRangeCount, initialAyahCount]);

  const handleApply = () => {
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    const rangeCount = rangeInfinite ? 0 : Math.max(1, Math.min(999, parseInt(rangeCountStr, 10) || 1));
    const ayahCount = Math.max(1, Math.min(999, parseInt(ayahCountStr, 10) || 1));

    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < 1) {
      setError("Start and End must be valid ayah numbers.");
      return;
    }
    if (start > totalAyahs || end > totalAyahs) {
      setError(`Ayahs must be between 1 and ${totalAyahs}.`);
      return;
    }
    if (start > end) {
      setError("Start ayah must be less than or equal to End ayah.");
      return;
    }
    setError(null);
    onApply(start - 1, end - 1, rangeCount, ayahCount);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListRestart className="w-4 h-4 text-primary" />
            Range Repeat
          </DialogTitle>
          <DialogDescription>
            Loop a range of ayahs. Each ayah inside the range can also repeat individually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Range bounds */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="range-start" className="text-xs">Start ayah</Label>
              <Input
                id="range-start"
                type="number"
                inputMode="numeric"
                min={1}
                max={totalAyahs}
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="range-end" className="text-xs">End ayah</Label>
              <Input
                id="range-end"
                type="number"
                inputMode="numeric"
                min={1}
                max={totalAyahs}
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Surah has {totalAyahs} ayahs.</p>

          {/* Per-ayah repeat */}
          <div className="space-y-1.5">
            <Label htmlFor="ayah-count" className="text-xs">Repeat each ayah</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ayah-count"
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                value={ayahCountStr}
                onChange={(e) => setAyahCountStr(e.target.value)}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">time(s) before moving to the next ayah</span>
            </div>
          </div>

          {/* Range loop count */}
          <div className="space-y-1.5">
            <Label htmlFor="range-count" className="text-xs">Loop the range</Label>
            <div className="flex items-center gap-2">
              <Input
                id="range-count"
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                value={rangeCountStr}
                onChange={(e) => setRangeCountStr(e.target.value)}
                disabled={rangeInfinite}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">time(s)</span>
              <div className="ml-auto flex items-center gap-1.5">
                <InfinityIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <Label htmlFor="range-infinite" className="text-xs cursor-pointer">∞</Label>
                <Switch
                  id="range-infinite"
                  checked={rangeInfinite}
                  onCheckedChange={setRangeInfinite}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {hasActiveRange && (
            <Button
              variant="ghost"
              onClick={() => { onClear(); onOpenChange(false); }}
              className="text-destructive hover:text-destructive"
            >
              Clear range
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply}>Start range</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RangeRepeatDialog;
