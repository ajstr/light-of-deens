import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Volume2,
  Compass,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Download,
  MapPin,
  Bookmark,
  Hand,
  PlayCircle,
  Bell,
  WifiOff,
  Layers,
  Heart,
  ScrollText,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTutorialVideoId } from "@/lib/storage";

const TUTORIAL_KEY = "lod_tutorial_seen_v2";

interface BulletItem {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

interface Step {
  kind?: "video" | "info";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  bullets?: BulletItem[];
  accent: string;
}

const STEPS: Step[] = [
  {
    kind: "video",
    icon: PlayCircle,
    title: "Watch the full video tutorial",
    body: "A short walkthrough of every feature — Quran, audio, prayer, duas and more.",
    accent: "from-primary/25 to-accent/10",
  },
  {
    icon: Sparkles,
    title: "Welcome to Light of Deen",
    body: "Your daily companion for Quran, Prayer, and Dua. Here's a quick tour of what you can do.",
    bullets: [
      { icon: BookOpen, text: "Read the Quran in beautiful Uthmanic script with tajweed" },
      { icon: Volume2, text: "Listen with your favorite reciter, ayah by ayah" },
      { icon: Compass, text: "Prayer times, Qibla compass, and a full dua library" },
    ],
    accent: "from-primary/20 to-accent/10",
  },
  {
    icon: BookOpen,
    title: "Read & Navigate the Quran",
    body: "Browse all 114 Surahs or jump straight to a Mushaf page.",
    bullets: [
      { icon: BookOpen, text: "Tap a Surah from the Read tab to open it" },
      { icon: Layers, text: "Switch between Surah list and Mushaf page (1–604)" },
      { icon: Hand, text: "Swipe left/right to move between Surahs" },
      { icon: Search, text: "Quickly jump to any ayah using the navigator" },
    ],
    accent: "from-emerald-500/20 to-primary/10",
  },
  {
    icon: ScrollText,
    title: "Tajweed, Word-by-Word & Tafsir",
    body: "Deepen your understanding of every ayah.",
    bullets: [
      { icon: Sparkles, text: "Color-coded tajweed rules highlight pronunciation" },
      { icon: BookOpen, text: "Tap an ayah → Tafsir for Ibn Kathir's commentary" },
      { icon: ScrollText, text: "Enable Word-by-Word mode in Settings for translations" },
    ],
    accent: "from-amber-500/20 to-primary/10",
  },
  {
    icon: Volume2,
    title: "Audio & Repeat Modes",
    body: "Choose any reciter and let the player follow along ayah by ayah.",
    bullets: [
      { icon: Repeat, text: "Repeat one ayah, the whole surah, or a custom range" },
      { icon: Volume2, text: "Mini-player stays at the top across every screen" },
      { icon: PlayCircle, text: "Surahs play continuously — auto-advances to the next" },
    ],
    accent: "from-amber-500/20 to-primary/10",
  },
  {
    icon: Bookmark,
    title: "Bookmarks & Continue Reading",
    body: "Never lose your place.",
    bullets: [
      { icon: Bookmark, text: "Long-press an ayah to bookmark it" },
      { icon: BookOpen, text: "Home shows your last read position to continue" },
      { icon: Sparkles, text: "Reading progress tracks your daily streak" },
    ],
    accent: "from-rose-500/20 to-primary/10",
  },
  {
    icon: Compass,
    title: "Prayer Times, Qibla & Athan",
    body: "Accurate prayer times for your location, with Athan notifications.",
    bullets: [
      { icon: MapPin, text: "Allow location for precise times & Qibla direction" },
      { icon: Compass, text: "Prayer tab shows today's schedule and Hijri date" },
      { icon: Bell, text: "Enable Athan notifications for each prayer time" },
    ],
    accent: "from-sky-500/20 to-primary/10",
  },
  {
    icon: Heart,
    title: "Duas — Daily & Library",
    body: "A full library of authentic supplications.",
    bullets: [
      { icon: Sparkles, text: "A new featured dua appears every day on Home" },
      { icon: Heart, text: "Browse duas by category in the Duas tab" },
      { icon: ScrollText, text: "Each dua includes Arabic, transliteration & meaning" },
    ],
    accent: "from-rose-500/20 to-primary/10",
  },
  {
    icon: Download,
    title: "Downloads & Offline Mode",
    body: "Take the Quran with you, anywhere.",
    bullets: [
      { icon: Download, text: "Download a full Surah's audio for offline playback" },
      { icon: WifiOff, text: "Read and listen with no internet connection" },
      { icon: Layers, text: "Manage storage from the Downloads tab" },
    ],
    accent: "from-emerald-500/20 to-primary/10",
  },
  {
    icon: Sparkles,
    title: "You're all set",
    body: "May Allah accept your time spent with His Book. You can replay this tutorial anytime from Settings → How to use the app.",
    bullets: [
      { icon: BookOpen, text: "Start with Surah Al-Fatiha from the Read tab" },
      { icon: Volume2, text: "Pick your favorite reciter in Settings" },
      { icon: Bell, text: "Enable Athan to be reminded for every prayer" },
    ],
    accent: "from-primary/25 to-accent/10",
  },
];

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
  initialStep?: number;
}

const TutorialOverlay = ({ open, onClose, initialStep = 0 }: TutorialOverlayProps) => {
  const [step, setStep] = useState(initialStep);
  const [videoId, setVideoId] = useState<string>(() => getTutorialVideoId());

  useEffect(() => {
    if (open) {
      setStep(initialStep);
      setVideoId(getTutorialVideoId());
    }
  }, [open, initialStep]);

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  const finish = () => {
    try {
      localStorage.setItem(TUTORIAL_KEY, "1");
    } catch {
      /* ignore */
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm safe-pt safe-pb px-4 overflow-y-auto py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-auto"
      >
        <button
          onClick={finish}
          aria-label="Close tutorial"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`bg-gradient-to-br ${current.accent} px-6 pt-8 pb-6`}>
          <div className="w-14 h-14 rounded-2xl bg-card/80 border border-border flex items-center justify-center mb-4 shadow-sm">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-1.5">
            {current.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-5"
          >
            {current.kind === "video" ? (
              <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
                {videoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title="Light of Deen — Video Tutorial"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center px-4 py-8">
                    <PlayCircle className="w-10 h-10 text-primary mx-auto mb-3 opacity-70" />
                    <p className="text-sm font-medium text-foreground">
                      Video tutorial coming soon
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tap “Next” to walk through every feature step by step.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                {current.bullets?.map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <BIcon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-foreground leading-snug">{b.text}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="px-6 pb-5 pt-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 flex-wrap max-w-[55%]">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
                className="h-9"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish} className="h-9">
                Get started
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)} className="h-9">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const hasSeenTutorial = () => {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === "1";
  } catch {
    return true;
  }
};

export default TutorialOverlay;
