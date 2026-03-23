import { useState, useEffect } from "react";
import { Settings, Sun, Moon, Type, Volume2, Home, BookOpen, Bookmark, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchReciters, fetchSurahs, Reciter, Surah } from "@/lib/quran-api";
import { getSettings, saveSettings, AppSettings } from "@/lib/storage";
import QuranNavigator from "@/components/QuranNavigator";

const fontSizeLabels = ["Small", "Medium", "Large", "Extra Large"];
const fontSizeClasses = ["text-xl", "text-2xl", "text-3xl", "text-4xl"];

interface SettingsPageProps {
  onTabChange?: (tab: string) => void;
  onSurahChange?: (surahNumber: number, ayah: number) => void;
}

const SettingsPage = ({ onTabChange, onSurahChange }: SettingsPageProps) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  const { data: reciters } = useQuery({
    queryKey: ["reciters"],
    queryFn: fetchReciters,
  });

  const { data: surahs } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
  });

  const [navSurahNumber, setNavSurahNumber] = useState(1);
  const [navAyah, setNavAyah] = useState(0);

  const currentNavSurah = surahs?.find((s) => s.number === navSurahNumber) ?? null;

  useEffect(() => {
    saveSettings(settings);
    // Apply theme
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings]);

  const update = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const displayName = (r: Reciter) =>
    r.style ? `${r.reciter_name} (${r.style})` : r.reciter_name;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Settings
        </h2>

        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.theme === "dark" ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-accent" />
                )}
                <div>
                  <Label className="text-foreground font-medium">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {settings.theme === "dark" ? "Dark theme active" : "Light theme active"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.theme === "dark"}
                onCheckedChange={(v) => update({ theme: v ? "dark" : "light" })}
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-foreground font-medium">Arabic Font Size</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {fontSizeLabels[settings.fontSize - 1]}
                </p>
              </div>
            </div>
            <Slider
              value={[settings.fontSize]}
              min={1}
              max={4}
              step={1}
              onValueChange={([v]) => update({ fontSize: v })}
              className="mb-3"
            />
            <p
              className={`font-arabic ${fontSizeClasses[settings.fontSize - 1]} text-foreground text-center leading-relaxed mt-2`}
              dir="rtl"
            >
              بِسْمِ ٱللَّهِ
            </p>
          </div>

          {/* Default Reciter */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Volume2 className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-foreground font-medium">Default Reciter</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Used for audio playback
                </p>
              </div>
            </div>
            <Select
              value={String(settings.defaultReciterId)}
              onValueChange={(v) => update({ defaultReciterId: Number(v) })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select reciter" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {reciters?.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)} className="text-sm">
                    {displayName(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
