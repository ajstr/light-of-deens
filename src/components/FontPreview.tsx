import { Check } from "lucide-react";
import { motion } from "framer-motion";

const SAMPLE_TEXT = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

const FONTS = [
  { id: "kfgqpc", label: "KFGQPC Uthmanic", cssClass: "font-arabic-kfgqpc", description: "Traditional Mushaf style" },
  { id: "amiri-quran", label: "Amiri Quran", cssClass: "font-arabic-amiri-quran", description: "Elegant Naskh with ligatures" },
  { id: "scheherazade", label: "Scheherazade New", cssClass: "font-arabic-scheherazade", description: "Clean, modern Naskh" },
  { id: "noto", label: "Noto Naskh Arabic", cssClass: "font-arabic-noto", description: "Google's clean Arabic font" },
  { id: "kitab", label: "Kitab", cssClass: "font-arabic-kitab", description: "Classic book style" },
  { id: "amiri", label: "Amiri", cssClass: "font-arabic-amiri", description: "Traditional Naskh printing" },
] as const;

export type FontId = typeof FONTS[number]["id"];

interface FontPreviewProps {
  selected: string;
  onSelect: (fontId: FontId) => void;
}

const FontPreview = ({ selected, onSelect }: FontPreviewProps) => {
  return (
    <div className="space-y-2">
      {FONTS.map((font) => (
        <motion.button
          key={font.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(font.id)}
          className={`w-full text-right rounded-lg border p-4 transition-colors ${
            selected === font.id
              ? "border-primary bg-primary/10"
              : "border-border bg-background hover:bg-accent/10"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {selected === font.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
              <span className="text-xs font-medium text-foreground">{font.label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{font.description}</span>
          </div>
          <p className={`${font.cssClass} text-2xl text-foreground leading-loose`} dir="rtl">
            {SAMPLE_TEXT}
          </p>
        </motion.button>
      ))}
    </div>
  );
};

export function getFontClass(fontId: string): string {
  return FONTS.find((f) => f.id === fontId)?.cssClass ?? "font-arabic";
}

export { FONTS };
export default FontPreview;
