import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Book } from "lucide-react";
import SurahList from "@/components/SurahList";
import SurahReader from "@/components/SurahReader";
import BookmarksPage from "@/components/BookmarksPage";
import DownloadsPage from "@/components/DownloadsPage";
import SettingsPage from "@/components/SettingsPage";
import DuaPage from "@/components/DuaPage";
import DailyDua from "@/components/DailyDua";
import PrayerPage from "@/components/PrayerPage";
import PrayerCard from "@/components/PrayerCard";
import ContinueReading from "@/components/ContinueReading";
import ReadingProgress from "@/components/ReadingProgress";
import BottomTabBar from "@/components/BottomTabBar";
import AudioPlayer from "@/components/AudioPlayer";
import InstallPrompt from "@/components/InstallPrompt";
import TutorialOverlay, { hasSeenTutorial } from "@/components/TutorialOverlay";
import { Surah, fetchSurahs } from "@/lib/quran-api";
import { saveLastRead, getLastSession } from "@/lib/storage";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { toast } from "sonner";

const Index = () => {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [initialAyah, setInitialAyah] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [currentAyah, setCurrentAyah] = useState(0);
  const [playTrigger, setPlayTrigger] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { registerOpenReader, nowPlaying } = useAudioPlayer();

  useEffect(() => {
    if (!hasSeenTutorial()) {
      const t = setTimeout(() => setShowTutorial(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const { data: surahs } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
  });

  const handleSurahChange = useCallback(
    (surahNumber: number, ayah: number) => {
      const target = surahs?.find((s) => s.number === surahNumber);
      if (target) {
        setInitialAyah(ayah);
        setSelectedSurah(target);
      }
    },
    [surahs]
  );

  const handleSelect = (surah: Surah) => {
    setInitialAyah(0);
    setSelectedSurah(surah);
    setActiveTab("read");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      setSelectedSurah(null);
    }
  };

  // Register the "open reader" handler so the GlobalMiniPlayer can navigate
  useEffect(() => {
    registerOpenReader((surahNumber: number, ayah: number) => {
      handleSurahChange(surahNumber, ayah);
      setActiveTab("read");
    });
  }, [registerOpenReader, handleSurahChange]);

  // Restore last session on first mount once surahs are loaded
  useEffect(() => {
    if (!surahs || surahs.length === 0) return;
    if (selectedSurah) return; // user already opened something
    const session = getLastSession();
    if (!session) return;
    const target = surahs.find((s) => s.number === session.surahNumber);
    if (!target) return;
    setInitialAyah(session.ayahIndex);
    setSelectedSurah(target);
    setActiveTab("read");
    if (session.wasPlaying) {
      // iOS blocks autoplay — surface a one-tap resume
      toast("Continue listening?", {
        description: `${target.englishName} • Ayah ${session.ayahIndex + 1}`,
        action: {
          label: "Resume",
          onClick: () => setPlayTrigger(session.ayahIndex),
        },
        duration: 8000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahs]);


  const renderContent = () => {
    switch (activeTab) {
      case "read":
        if (selectedSurah) {
          return (
            <SurahReader
              surah={selectedSurah}
              onBack={() => {
                setSelectedSurah(null);
                setActiveTab("home");
              }}
              onSurahChange={handleSurahChange}
              initialAyah={initialAyah}
              currentAyah={currentAyah}
              onAyahChange={setCurrentAyah}
              playTrigger={playTrigger}
              onPlayTriggerChange={setPlayTrigger}
              isAudioPlaying={isAudioPlaying}
            />
          );
        }
        return <SurahList onSelect={handleSelect} />;
      case "bookmarks":
        return (
          <BookmarksPage
            onNavigate={(surahNumber, ayahIndex) => {
              handleSurahChange(surahNumber, ayahIndex);
              setActiveTab("read");
            }}
          />
        );
      case "prayer":
        return <PrayerPage />;
      case "duas":
        return <DuaPage />;
      case "downloads":
        return <DownloadsPage />;
      case "settings":
        return <SettingsPage onTabChange={handleTabChange} onShowTutorial={() => setShowTutorial(true)} onSurahChange={(surahNum, ayah) => {
          handleSurahChange(surahNum, ayah);
          setActiveTab("read");
        }} />;
      default:
        return <SurahList onSelect={handleSelect} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background pb-20 ${nowPlaying ? "pt-12 sm:pt-14" : ""}`}>
      {/* Header */}
      <header className="hero-surface py-10 text-center mb-8 shadow-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <Book className="w-7 h-7" style={{ color: "hsl(var(--gold-light))" }} />
          <h1 className="font-display text-3xl font-bold tracking-tight">
            القرآن الكريم
          </h1>
          <Book className="w-7 h-7" style={{ color: "hsl(var(--gold-light))" }} />
        </motion.div>
        <p className="hero-muted font-display text-lg">The Noble Quran</p>
        <div className="ornament-divider mt-4 mx-auto max-w-xs" />
      </header>

      {activeTab === "home" && (
        <>
          <PrayerCard onOpen={() => setActiveTab("prayer")} />
          <DailyDua />
          <ReadingProgress />
          <ContinueReading
            surahs={surahs ?? []}
            onContinue={(surahNum, ayah) => {
              handleSurahChange(surahNum, ayah);
              setActiveTab("read");
            }}
          />
        </>
      )}
      {renderContent()}

      {selectedSurah && (
        <AudioPlayer
          surahNumber={selectedSurah.number}
          totalAyahs={selectedSurah.numberOfAyahs}
          currentAyah={currentAyah}
          onAyahChange={setCurrentAyah}
          playTrigger={playTrigger}
          onPlayingChange={setIsAudioPlaying}
          surahName={selectedSurah.englishName}
        />
      )}

      <InstallPrompt />
      <TutorialOverlay open={showTutorial} onClose={() => setShowTutorial(false)} />
      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
