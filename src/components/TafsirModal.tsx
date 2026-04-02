import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchVerseTafsir, TAFSIR_SOURCES } from "@/lib/quran-api";

interface TafsirModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

const TafsirModal = ({ open, onOpenChange, surahNumber, ayahNumber, surahName }: TafsirModalProps) => {
  const [tafsirId, setTafsirId] = useState(TAFSIR_SOURCES[0].id);

  const { data: tafsirText, isLoading } = useQuery({
    queryKey: ["tafsir-verse", surahNumber, ayahNumber, tafsirId],
    queryFn: () => fetchVerseTafsir(surahNumber, ayahNumber, tafsirId),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Tafsir — {surahName} : Ayah {ayahNumber}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Scholarly explanation for verse {ayahNumber} of {surahName}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-3">
          <Select value={String(tafsirId)} onValueChange={(v) => setTafsirId(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tafsir source" />
            </SelectTrigger>
            <SelectContent>
              {TAFSIR_SOURCES.map((src) => (
                <SelectItem key={src.id} value={String(src.id)}>
                  {src.name} — {src.author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
              <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            </div>
          ) : tafsirText ? (
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-line py-2">
              {tafsirText}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No tafsir available for this verse.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TafsirModal;
