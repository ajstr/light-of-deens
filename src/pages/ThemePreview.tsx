import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, saveSettings } from "@/lib/storage";

type Token = {
  name: string;
  varName: string;
  textOn?: string;
};

const SURFACE_TOKENS: Token[] = [
  { name: "Background", varName: "--background", textOn: "--foreground" },
  { name: "Card", varName: "--card", textOn: "--card-foreground" },
  { name: "Popover", varName: "--popover", textOn: "--popover-foreground" },
  { name: "Muted", varName: "--muted", textOn: "--muted-foreground" },
  { name: "Secondary", varName: "--secondary", textOn: "--secondary-foreground" },
];

const ACCENT_TOKENS: Token[] = [
  { name: "Primary", varName: "--primary", textOn: "--primary-foreground" },
  { name: "Accent", varName: "--accent", textOn: "--accent-foreground" },
  { name: "Destructive", varName: "--destructive", textOn: "--destructive-foreground" },
  { name: "Gold", varName: "--gold" },
  { name: "Gold Light", varName: "--gold-light" },
  { name: "Emerald Deep", varName: "--emerald-deep" },
];

const SwatchCard = ({ token }: { token: Token }) => (
  <div className="rounded-lg border border-border overflow-hidden">
    <div
      className="h-20 w-full flex items-center justify-center text-sm font-medium"
      style={{
        backgroundColor: `hsl(var(${token.varName}))`,
        color: token.textOn ? `hsl(var(${token.textOn}))` : "hsl(var(--foreground))",
      }}
    >
      {token.name}
    </div>
    <div className="bg-card px-3 py-2 text-xs font-mono text-muted-foreground">
      hsl(var({token.varName}))
    </div>
  </div>
);

const ThemePreview = () => {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    const settings = getSettings();
    saveSettings({ ...settings, theme: isDark ? "dark" : "light" });
  }, [isDark]);

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
        {/* Surfaces */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Surfaces</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SURFACE_TOKENS.map((t) => (
              <SwatchCard key={t.varName} token={t} />
            ))}
          </div>
        </section>

        {/* Accents */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Accents</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ACCENT_TOKENS.map((t) => (
              <SwatchCard key={t.varName} token={t} />
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

        {/* Gold gradient sample */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Gradient & Ornament</h2>
          <div className="rounded-lg overflow-hidden border border-border">
            <div
              className="h-24 flex items-center justify-center font-display text-xl"
              style={{
                background: "linear-gradient(135deg, hsl(var(--emerald-deep)), hsl(var(--primary)) 60%, hsl(var(--gold)))",
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
