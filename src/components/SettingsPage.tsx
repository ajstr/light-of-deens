import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Settings, Sun, Moon, Type, Volume2, Home, BookOpen, Bookmark, Compass, Paintbrush, Languages, Palette, ChevronRight, Shield, HelpCircle } from "lucide-react";
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
import { fetchReciters, fetchSurahs, Reciter, Surah, TRANSLATIONS } from "@/lib/quran-api";
import { getSettings, saveSettings, AppSettings } from "@/lib/storage";
import QuranNavigator from "@/components/QuranNavigator";
import FontPreview, { FontId } from "@/components/FontPreview";

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

          {/* Theme Preview / Color Picker */}
          <Link
            to="/theme"
            className="block bg-card rounded-lg p-4 border border-border hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-accent" />
                <div>
                  <Label className="text-foreground font-medium cursor-pointer">Theme Preview & Colors</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pick custom colors for light & dark mode
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          {/* Translation Toggle */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-foreground font-medium">Show Translation</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {settings.showTranslation ? "English translation visible" : "Translation hidden"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.showTranslation}
                onCheckedChange={(v) => update({ showTranslation: v })}
              />
            </div>
          </div>

          {/* Translation Edition */}
          {settings.showTranslation && (
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Languages className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-foreground font-medium">Translation Edition</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose your preferred English translation
                  </p>
                </div>
              </div>
              <Select
                value={String(settings.translationId)}
                onValueChange={(v) => update({ translationId: Number(v) })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select translation" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TRANSLATIONS.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)} className="text-sm">
                      {t.name} — {t.author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          {/* Arabic Font Style */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Paintbrush className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-foreground font-medium">Arabic Font Style</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose your preferred Quran text style
                </p>
              </div>
            </div>
            <FontPreview
              selected={settings.arabicFont}
              onSelect={(fontId: FontId) => update({ arabicFont: fontId })}
            />
          </div>
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

          {/* Quick Links */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Compass className="w-5 h-5 text-primary" />
              <Label className="text-foreground font-medium">Quick Navigation</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "read", label: "Read", icon: BookOpen },
                { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quran Navigator */}
          {currentNavSurah && (
            <div className="bg-card rounded-lg p-4 border border-border space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <BookOpen className="w-5 h-5 text-primary" />
                <Label className="text-foreground font-medium">Jump to Location</Label>
              </div>
              <Select
                value={String(navSurahNumber)}
                onValueChange={(v) => { setNavSurahNumber(Number(v)); setNavAyah(0); }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Surah" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {surahs?.map((s) => (
                    <SelectItem key={s.number} value={String(s.number)} className="text-xs">
                      {s.number}. {s.englishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <QuranNavigator
                surah={currentNavSurah}
                currentAyah={navAyah}
                onAyahChange={(ayah) => {
                  setNavAyah(ayah);
                  onSurahChange?.(navSurahNumber, ayah);
                }}
                onSurahChange={(surahNum, ayah) => {
                  setNavSurahNumber(surahNum);
                  setNavAyah(ayah);
                  onSurahChange?.(surahNum, ayah);
                }}
              />
            </div>
          )}

          {/* Privacy Policy */}
          <Link
            to="/privacy"
            className="block bg-card rounded-lg p-4 border border-border hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-foreground font-medium cursor-pointer">Privacy Policy</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    How your data is handled
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
