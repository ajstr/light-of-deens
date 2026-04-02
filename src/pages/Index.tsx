import { useState, useCallback } from "react";
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
import ContinueReading from "@/components/ContinueReading";
import ReadingProgress from "@/components/ReadingProgress";
import BottomTabBar from "@/components/BottomTabBar";
import AudioPlayer from "@/components/AudioPlayer";
import InstallPrompt from "@/components/InstallPrompt";
import { Surah, fetchSurahs } from "@/lib/quran-api";
import { saveLastRead } from "@/lib/storage";

const Index = () => {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [initialAyah, setInitialAyah] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [currentAyah, setCurrentAyah] = useState(0);
  const [playTrigger, setPlayTrigger] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

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
      case "duas":
        return <DuaPage />;
      case "downloads":
        return <DownloadsPage />;
      case "settings":
        return <SettingsPage onTabChange={handleTabChange} onSurahChange={(surahNum, ayah) => {
          handleSurahChange(surahNum, ayah);
          setActiveTab("read");
        }} />;
      default:
        return <SurahList onSelect={handleSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="py-8 text-center border-b border-border mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <Book className="w-7 h-7 text-gold" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            القرآن الكريم
          </h1>
          <Book className="w-7 h-7 text-gold" />
        </motion.div>
        <p className="text-muted-foreground font-display text-lg">The Noble Quran</p>
        <div className="ornament-divider mt-4 mx-auto max-w-xs" />
      </header>

      {activeTab === "home" && (
        <>
          <DailyDua />
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
      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
