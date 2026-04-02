import { Palette, BookOpen, Languages } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ReaderToolbarProps {
  tajweedEnabled: boolean;
  onTajweedChange: (v: boolean) => void;
  wbwEnabled: boolean;
  onWbwChange: (v: boolean) => void;
  translationEnabled: boolean;
  onTranslationChange: (v: boolean) => void;
}

const ReaderToolbar = ({
  tajweedEnabled,
  onTajweedChange,
  wbwEnabled,
  onWbwChange,
  translationEnabled,
  onTranslationChange,
}: ReaderToolbarProps) => (
  <div className="flex items-center gap-4 flex-wrap">
    <div className="flex items-center gap-2">
      <Palette className="w-4 h-4 text-muted-foreground" />
      <Label htmlFor="tajweed-toggle" className="text-sm text-muted-foreground cursor-pointer">
        Tajweed
      </Label>
      <Switch id="tajweed-toggle" checked={tajweedEnabled} onCheckedChange={onTajweedChange} />
    </div>
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-muted-foreground" />
      <Label htmlFor="wbw-toggle" className="text-sm text-muted-foreground cursor-pointer">
        Word by Word
      </Label>
      <Switch id="wbw-toggle" checked={wbwEnabled} onCheckedChange={onWbwChange} />
    </div>
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-muted-foreground" />
      <Label htmlFor="translation-toggle" className="text-sm text-muted-foreground cursor-pointer">
        Translation
      </Label>
      <Switch id="translation-toggle" checked={translationEnabled} onCheckedChange={onTranslationChange} />
    </div>
  </div>
);

export default ReaderToolbar;
