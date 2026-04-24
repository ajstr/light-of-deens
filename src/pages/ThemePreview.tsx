import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, saveSettings } from "@/lib/storage";

type EditableToken = {
  name: string;
  varName: string;
  textOn?: string;
  /** Default HSL string ("H S% L%") for light and dark modes */
  defaults: { light: string; dark: string };
};

const SURFACE_TOKENS: EditableToken[] = [
  {
    name: "Background",
    varName: "--background",
    textOn: "--foreground",
    defaults: { light: "40 30% 96%", dark: "160 20% 8%" },
  },
  {
    name: "Foreground",
    varName: "--foreground",
    textOn: "--background",
    defaults: { light: "150 30% 12%", dark: "40 20% 90%" },
  },
  {
    name: "Card",
    varName: "--card",
    textOn: "--card-foreground",
    defaults: { light: "40 25% 93%", dark: "160 15% 12%" },
  },
  {
    name: "Muted",
    varName: "--muted",
    textOn: "--muted-foreground",
    defaults: { light: "40 15% 90%", dark: "160 10% 16%" },
  },
  {
    name: "Secondary",
    varName: "--secondary",
    textOn: "--secondary-foreground",
    defaults: { light: "40 20% 88%", dark: "160 10% 18%" },
  },
  {
    name: "Border",
    varName: "--border",
    defaults: { light: "40 20% 85%", dark: "160 10% 20%" },
  },
];

const ACCENT_TOKENS: EditableToken[] = [
  {
    name: "Primary",
    varName: "--primary",
    textOn: "--primary-foreground",
    defaults: { light: "153 50% 22%", dark: "153 45% 40%" },
  },
  {
    name: "Accent",
    varName: "--accent",
    textOn: "--accent-foreground",
    defaults: { light: "43 80% 55%", dark: "43 70% 50%" },
  },
  {
    name: "Destructive",
    varName: "--destructive",
    textOn: "--destructive-foreground",
    defaults: { light: "0 84.2% 60.2%", dark: "0 70% 50%" },
  },
  {
    name: "Gold",
    varName: "--gold",
    defaults: { light: "43 80% 55%", dark: "43 70% 50%" },
  },
  {
    name: "Gold Light",
    varName: "--gold-light",
    defaults: { light: "43 60% 75%", dark: "43 50% 35%" },
  },
  {
    name: "Emerald Deep",
    varName: "--emerald-deep",
    defaults: { light: "153 50% 18%", dark: "153 45% 30%" },
  },
];

const ALL_TOKENS = [...SURFACE_TOKENS, ...ACCENT_TOKENS];

/* ---------- HSL <-> HEX helpers ---------- */
function parseHsl(hsl: string): { h: number; s: number; l: number } | null {
  const m = hsl.trim().match(/^(-?\d*\.?\d+)\s+(-?\d*\.?\d+)%\s+(-?\d*\.?\d+)%$/);
  if (!m) return null;
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}

function hslToHex(hslStr: string): string {
  const parsed = parseHsl(hslStr);
  if (!parsed) return "#000000";
  let { h, s, l } = parsed;
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "0 0% 0%";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/* ---------- Color picker row ---------- */
const ColorEditor = ({
  token,
  value,
  onChange,
  onReset,
}: {
  token: EditableToken;
  value: string;
  onChange: (hsl: string) => void;
  onReset: () => void;
}) => {
  const hex = useMemo(() => hslToHex(value), [value]);
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div
        className="h-16 w-full flex items-center justify-center text-sm font-medium"
        style={{
          backgroundColor: `hsl(${value})`,
          color: token.textOn ? `hsl(var(${token.textOn}))` : "hsl(var(--foreground))",
        }}
      >
        {token.name}
      </div>
      <div className="px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(hexToHsl(e.target.value))}
            className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
            aria-label={`Pick ${token.name} color`}
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs font-mono"
            spellCheck={false}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onReset}
            aria-label={`Reset ${token.name}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground truncate">
          hsl(var({token.varName}))
        </div>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
const ThemePreview = () => {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  // Per-mode overrides: { light: { '--primary': '153 50% 22%' }, dark: {...} }
  const [overrides, setOverrides] = useState<{ light: Record<string, string>; dark: Record<string, string> }>({
    light: {},
    dark: {},
  });

  const mode = isDark ? "dark" : "light";

  // Apply theme class + persist setting
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    const settings = getSettings();
    saveSettings({ ...settings, theme: isDark ? "dark" : "light" });
  }, [isDark]);

  // Apply current override values to :root inline (cleared on unmount)
  useEffect(() => {
    const root = document.documentElement;
    const active = overrides[mode];
    const applied: string[] = [];
    Object.entries(active).forEach(([varName, val]) => {
      root.style.setProperty(varName, val);
      applied.push(varName);
    });
    return () => {
      applied.forEach((v) => root.style.removeProperty(v));
    };
  }, [overrides, mode]);

  // Cleanup ALL overrides when leaving the page
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      ALL_TOKENS.forEach((t) => root.style.removeProperty(t.varName));
    };
  }, []);

  const getValue = (token: EditableToken) =>
    overrides[mode][token.varName] ?? token.defaults[mode];

  const setValue = (token: EditableToken, hsl: string) => {
    setOverrides((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [token.varName]: hsl },
    }));
  };

  const resetToken = (token: EditableToken) => {
    setOverrides((prev) => {
      const next = { ...prev[mode] };
      delete next[token.varName];
      return { ...prev, [mode]: next };
    });
  };

  const resetAll = () => {
    setOverrides((prev) => ({ ...prev, [mode]: {} }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="font-display text-xl font-semibold">Theme Preview</h1>
          <div className="flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
            <Switch checked={isDark} onCheckedChange={setIsDark} aria-label="Toggle dark mode" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Editor controls */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
                Surfaces · {mode}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Pick a color to override the token live. Reset per-token or all at once.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SURFACE_TOKENS.map((t) => (
              <ColorEditor
                key={t.varName}
                token={t}
                value={getValue(t)}
                onChange={(v) => setValue(t, v)}
                onReset={() => resetToken(t)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Accents · {mode}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACCENT_TOKENS.map((t) => (
              <ColorEditor
                key={t.varName}
                token={t}
                value={getValue(t)}
                onChange={(v) => setValue(t, v)}
                onReset={() => resetToken(t)}
              />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Typography</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h1 className="font-display text-4xl font-bold text-foreground">Display Heading</h1>
              <h2 className="font-display text-2xl font-semibold text-foreground">Section Title</h2>
              <p className="text-base text-foreground">
                Body text on the card surface — the quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-sm text-muted-foreground">
                Muted helper text used for hints, captions, and secondary information.
              </p>
              <p className="font-arabic text-3xl text-foreground text-right" dir="rtl">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Buttons</h2>
          <Card>
            <CardContent className="pt-6 flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Cards</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>Uses --card and --card-foreground tokens.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </CardContent>
            </Card>
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle className="text-primary">Primary Accent</CardTitle>
                <CardDescription>Highlighted with primary border color.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="demo-input">Sample input</Label>
                <Input id="demo-input" placeholder="Type something..." />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gradient sample */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Gradient & Ornament
          </h2>
          <div className="rounded-lg overflow-hidden border border-border">
            <div
              className="h-24 flex items-center justify-center font-display text-xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--emerald-deep)), hsl(var(--primary)) 60%, hsl(var(--gold)))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Emerald → Gold
            </div>
            <div className="bg-card p-4">
              <div className="ornament-divider" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ThemePreview;
