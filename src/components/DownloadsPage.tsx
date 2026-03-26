import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HardDriveDownload, Trash2, WifiOff, Music, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDownloadedSurahs, deleteSurahAudio, downloadSurahForOffline, isSurahDownloaded } from "@/lib/offline-audio";
import { fetchSurahs, fetchReciters, fetchAudioUrls } from "@/lib/quran-api";
import { getSettings } from "@/lib/storage";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface DownloadEntry {
  surahNumber: number;
  reciterId: number;
  totalAyahs: number;
  downloadedAt: number;
}

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkReciterId, setBulkReciterId] = useState<number>(() => getSettings().defaultReciterId);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 114, surahName: "", ayahsDone: 0, ayahsTotal: 0 });
  const [bulkCancelled, setBulkCancelled] = useState(false);

  const { data: surahs } = useQuery({ queryKey: ["surahs"], queryFn: fetchSurahs });
  const { data: reciters } = useQuery({ queryKey: ["reciters"], queryFn: fetchReciters });

  const loadDownloads = async () => {
    setLoading(true);
    const data = await getDownloadedSurahs();
    setDownloads(data);
    setLoading(false);
  };

  useEffect(() => { loadDownloads(); }, []);

  const handleDelete = async (entry: DownloadEntry) => {
    const key = `${entry.reciterId}-${entry.surahNumber}`;
    setDeleting(key);
    await deleteSurahAudio(entry.surahNumber, entry.reciterId, entry.totalAyahs);
    await loadDownloads();
    setDeleting(null);
  };

  const handleDeleteAll = async () => {
    for (const entry of downloads) {
      await deleteSurahAudio(entry.surahNumber, entry.reciterId, entry.totalAyahs);
    }
    await loadDownloads();
  };

  const handleDownloadAll = useCallback(async () => {
    if (!surahs || bulkDownloading) return;
    setBulkDownloading(true);
    setBulkCancelled(false);
    const cancelledRef = { current: false };

    // We need a ref-like approach since state won't update in the loop
    const checkCancelled = () => cancelledRef.current;

    try {
      for (let i = 0; i < surahs.length; i++) {
        if (checkCancelled()) break;
        const surah = surahs[i];
        const alreadyDownloaded = await isSurahDownloaded(surah.number, bulkReciterId);
        if (alreadyDownloaded) {
          setBulkProgress(p => ({ ...p, current: i + 1, surahName: surah.englishName, ayahsDone: surah.numberOfAyahs, ayahsTotal: surah.numberOfAyahs }));
          continue;
        }

        setBulkProgress({ current: i, total: surahs.length, surahName: surah.englishName, ayahsDone: 0, ayahsTotal: surah.numberOfAyahs });

        const audioUrls = await fetchAudioUrls(surah.number, bulkReciterId);
        if (checkCancelled()) break;

        await downloadSurahForOffline(surah.number, bulkReciterId, audioUrls, (done, total) => {
          setBulkProgress(p => ({ ...p, current: i, ayahsDone: done, ayahsTotal: total }));
        });
        setBulkProgress(p => ({ ...p, current: i + 1 }));
      }
    } catch (e) {
      console.error("Bulk download failed", e);
    } finally {
      setBulkDownloading(false);
      await loadDownloads();
    }

    // Expose cancel mechanism
    setBulkCancelled(false);
    // Store cancel fn on window for the cancel button
    (window as any).__cancelBulkDownload = () => { cancelledRef.current = true; setBulkCancelled(true); };
  }, [surahs, bulkReciterId, bulkDownloading]);

  // Wrap handleDownloadAll to set up cancel before starting
  const startBulkDownload = useCallback(() => {
    // Reset
    const cancelledRef = { current: false };
    (window as any).__cancelBulkDownload = () => { cancelledRef.current = true; setBulkCancelled(true); };
    handleDownloadAll();
  }, [handleDownloadAll]);

  const getSurahName = (num: number) => {
    const s = surahs?.find((s) => s.number === num);
    return s ? `${s.englishName} (${s.name})` : `Surah ${num}`;
  };

  const getReciterName = (id: number) => {
    const r = reciters?.find((r) => r.id === id);
    if (!r) return `Reciter #${id}`;
    return r.style ? `${r.reciter_name} (${r.style})` : r.reciter_name;
  };

  const estimatedSize = downloads.reduce((acc, d) => acc + d.totalAyahs * 0.3, 0); // ~300KB per ayah avg

  return (
    <div className="max-w-3xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <HardDriveDownload className="w-6 h-6 text-primary" />
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Offline Downloads
            </h2>
            <p className="text-sm text-muted-foreground">
              {downloads.length} surah{downloads.length !== 1 ? "s" : ""} saved
              {downloads.length > 0 && ` · ~${estimatedSize.toFixed(0)} MB`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-16">
            <WifiOff className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No offline downloads</p>
            <p className="text-muted-foreground/70 text-sm max-w-sm mx-auto">
              Save surahs for offline playback from the audio player's download menu while reading.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {downloads
                .sort((a, b) => b.downloadedAt - a.downloadedAt)
                .map((entry) => {
                  const key = `${entry.reciterId}-${entry.surahNumber}`;
                  const isDeleting = deleting === key;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {getSurahName(entry.surahNumber)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getReciterName(entry.reciterId)} · {entry.totalAyahs} ayahs
                          · ~{(entry.totalAyahs * 0.3).toFixed(0)} MB
                        </p>
                        <p className="text-[10px] text-muted-foreground/60">
                          Saved {new Date(entry.downloadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                        disabled={isDeleting}
                        onClick={() => handleDelete(entry)}
                        title="Remove offline data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
            </div>

            {downloads.length > 1 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove All Downloads
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DownloadsPage;
