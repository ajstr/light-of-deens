import { useState } from "react";
import { Hash, Layers, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  JUZ_DATA,
  HIZB_DATA,
  getJuzInSurah,
  getHizbsInSurah,
  findJuzForAyah,
  findHizbForAyah,
} from "@/lib/quran-metadata";
import { Surah } from "@/lib/quran-api";

interface QuranNavigatorProps {
  surah: Surah;
  currentAyah: number; // 0-indexed
  onAyahChange: (ayah: number) => void;
  onSurahChange: (surahNumber: number, ayah: number) => void;
}

const QuranNavigator = ({
  surah,
  currentAyah,
  onAyahChange,
  onSurahChange,
}: QuranNavigatorProps) => {
  const [tab, setTab] = useState("ayah");

  const currentJuz = findJuzForAyah(surah.number, currentAyah + 1);
  const currentHizb = findHizbForAyah(surah.number, currentAyah + 1);

  const handleAyahSelect = (value: string) => {
    onAyahChange(Number(value) - 1); // convert to 0-indexed
  };

  const handleJuzSelect = (value: string) => {
    const juz = JUZ_DATA.find((j) => j.juz === Number(value));
    if (!juz) return;
    if (juz.startSurah === surah.number) {
      onAyahChange(juz.startAyah - 1);
    } else {
      onSurahChange(juz.startSurah, juz.startAyah - 1);
    }
  };

  const handleHizbSelect = (value: string) => {
    const hizb = HIZB_DATA.find((h) => h.hizb === Number(value));
    if (!hizb) return;
    if (hizb.startSurah === surah.number) {
      onAyahChange(hizb.startAyah - 1);
    } else {
      onSurahChange(hizb.startSurah, hizb.startAyah - 1);
    }
  };

  return (
    <div className="bg-card/50 rounded-lg border border-border p-3 space-y-3">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-3 h-8">
          <TabsTrigger value="ayah" className="text-xs gap-1">
            <Hash className="w-3 h-3" />
            Ayah
          </TabsTrigger>
          <TabsTrigger value="juz" className="text-xs gap-1">
            <BookOpen className="w-3 h-3" />
            Juz
          </TabsTrigger>
          <TabsTrigger value="hizb" className="text-xs gap-1">
            <Layers className="w-3 h-3" />
            Hizb
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "ayah" && (
        <Select
          value={String(currentAyah + 1)}
          onValueChange={handleAyahSelect}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Go to Ayah..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {Array.from({ length: surah.numberOfAyahs }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)} className="text-xs cursor-pointer">
                Ayah {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {tab === "juz" && (
        <Select
          value={String(currentJuz)}
          onValueChange={handleJuzSelect}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Go to Juz..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {JUZ_DATA.map((j) => (
              <SelectItem key={j.juz} value={String(j.juz)} className="text-xs cursor-pointer">
                Juz {j.juz} — Surah {j.startSurah}:{j.startAyah}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {tab === "hizb" && (
        <Select
          value={String(currentHizb)}
          onValueChange={handleHizbSelect}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Go to Hizb..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {HIZB_DATA.map((h) => (
              <SelectItem key={h.hizb} value={String(h.hizb)} className="text-xs">
                Hizb {h.hizb} — Surah {h.startSurah}:{h.startAyah}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default QuranNavigator;
