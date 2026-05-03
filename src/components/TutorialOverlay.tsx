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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TUTORIAL_KEY = "lod_tutorial_seen_v1";

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  bullets: { icon: React.ComponentType<{ className?: string }>; text: string }[];
  accent: string;
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to Light of Deen",
    body: "Your daily companion for Quran, Prayer, and Dua. Here's a quick tour of what you can do.",
    bullets: [
      { icon: BookOpen, text: "Read the Quran in beautiful Uthmanic script" },
      { icon: Volume2, text: "Listen with your favorite reciter" },
      { icon: Compass, text: "Prayer times, Qibla and daily duas" },
    ],
    accent: "from-primary/20 to-accent/10",
  },
  {
    icon: BookOpen,
    title: "Read & Navigate the Quran",
    body: "Browse all 114 Surahs or jump straight to a Mushaf page.",
    bullets: [
      { icon: BookOpen, text: "Tap a Surah from the Read tab to open it" },
      { icon: Bookmark, text: "Long-press an ayah to bookmark or open Tafsir" },
      { icon: Hand, text: "Swipe left/right to move between Surahs" },
    ],
    accent: "from-emerald-500/20 to-primary/10",
  },
  {
    icon: Volume2,
    title: "Audio & Repeat Modes",
    body: "Choose any reciter and let the player follow along ayah by ayah.",
    bullets: [
      { icon: Repeat, text: "Repeat a single ayah, the whole surah, or a custom range" },
      { icon: Volume2, text: "The mini-player stays at the top across every page" },
      { icon: Download, text: "Download surahs to listen fully offline" },
    ],
    accent: "from-amber-500/20 to-primary/10",
  },
  {
    icon: Compass,
    title: "Prayer Times & Qibla",
    body: "Accurate prayer times for your location, with Athan notifications.",
    bullets: [
      { icon: MapPin, text: "Allow location for precise times & Qibla direction" },
      { icon: Compass, text: "Open the Prayer tab to see today's schedule" },
      { icon: Volume2, text: "Enable Athan to be notified at each prayer time" },
    ],
    accent: "from-sky-500/20 to-primary/10",
  },
  {
    icon: Sparkles,
    title: "Duas, Tafsir & Downloads",
    body: "A full library of authentic supplications and offline tools.",
    bullets: [
      { icon: Sparkles, text: "Browse duas by category or read the daily featured dua" },
      { icon: BookOpen, text: "Tap an ayah → Tafsir to read Ibn Kathir's commentary" },
      { icon: Download, text: "Manage offline audio in the Downloads tab" },
    ],
    accent: "from-rose-500/20 to-primary/10",
  },
];

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
}

const TutorialOverlay = ({ open, onClose }: TutorialOverlayProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm safe-pt safe-pb px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
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
          <motion.ul
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-5 space-y-3"
          >
            {current.bullets.map((b, i) => {
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
          </motion.ul>
        </AnimatePresence>

        <div className="px-6 pb-5 pt-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
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
