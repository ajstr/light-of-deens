import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HardDriveDownload, Trash2, WifiOff, Music, Download, Loader2, X, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDownloadedSurahs, deleteSurahAudio, downloadSurahForOffline, isSurahDownloaded, getAudioBlob } from "@/lib/offline-audio";
import { fetchSurahs, fetchReciters, fetchAudioUrls, Reciter } from "@/lib/quran-api";
import { getSettings } from "@/lib/storage";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
  const cancelRef = useRef(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState("");

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

  const handleDownloadAll = async () => {
    if (!surahs || bulkDownloading) return;
    setBulkDownloading(true);
    cancelRef.current = false;

    try {
      for (let i = 0; i < surahs.length; i++) {
        if (cancelRef.current) break;
        const surah = surahs[i];
        const alreadyDownloaded = await isSurahDownloaded(surah.number, bulkReciterId);
        if (alreadyDownloaded) {
          setBulkProgress({ current: i + 1, total: surahs.length, surahName: surah.englishName, ayahsDone: surah.numberOfAyahs, ayahsTotal: surah.numberOfAyahs });
          continue;
        }

        setBulkProgress({ current: i, total: surahs.length, surahName: surah.englishName, ayahsDone: 0, ayahsTotal: surah.numberOfAyahs });

        const audioUrls = await fetchAudioUrls(surah.number, bulkReciterId);
        if (cancelRef.current) break;

        await downloadSurahForOffline(surah.number, bulkReciterId, audioUrls, (done, total) => {
          setBulkProgress(p => ({ ...p, ayahsDone: done, ayahsTotal: total }));
        });
        setBulkProgress(p => ({ ...p, current: i + 1 }));
      }
    } catch (e) {
      console.error("Bulk download failed", e);
    } finally {
      setBulkDownloading(false);
      await loadDownloads();
    }
  };

  const getSurahName = (num: number) => {
    const s = surahs?.find((s) => s.number === num);
    return s ? `${s.englishName} (${s.name})` : `Surah ${num}`;
  };

  const getReciterName = (id: number) => {
    const r = reciters?.find((r) => r.id === id);
    if (!r) return `Reciter #${id}`;
    return r.style ? `${r.reciter_name} (${r.style})` : r.reciter_name;
  };

  const displayName = (r: Reciter) =>
    r.style ? `${r.reciter_name} (${r.style})` : r.reciter_name;

  const handleExportSurah = async (entry: DownloadEntry) => {
    const key = `${entry.reciterId}-${entry.surahNumber}`;
    if (exporting) return;
    setExporting(key);
    try {
      const zip = new JSZip();
      for (let i = 0; i < entry.totalAyahs; i++) {
        setExportProgress(`${i + 1}/${entry.totalAyahs}`);
        const blob = await getAudioBlob(entry.surahNumber, i, entry.reciterId);
        if (blob) {
          zip.file(`ayah-${String(i + 1).padStart(3, "0")}.mp3`, blob);
        }
      }
      setExportProgress("Zipping…");
      const content = await zip.generateAsync({ type: "blob" });
      const reciterName = getReciterName(entry.reciterId).replace(/\s+/g, "-");
      const surahName = surahs?.find(s => s.number === entry.surahNumber)?.englishName || `surah-${entry.surahNumber}`;
      saveAs(content, `${surahName.replace(/\s+/g, "-")}-${reciterName}.zip`);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(null);
      setExportProgress("");
    }
  };

  const handleExportAll = async () => {
    if (exporting || downloads.length === 0) return;
    setExporting("all");
    try {
      const zip = new JSZip();
      let totalAyahs = downloads.reduce((a, d) => a + d.totalAyahs, 0);
      let done = 0;
      for (const entry of downloads) {
        const surahName = surahs?.find(s => s.number === entry.surahNumber)?.englishName || `surah-${entry.surahNumber}`;
        const folder = zip.folder(`${String(entry.surahNumber).padStart(3, "0")}-${surahName.replace(/\s+/g, "-")}`)!;
        for (let i = 0; i < entry.totalAyahs; i++) {
          done++;
          setExportProgress(`${done}/${totalAyahs}`);
          const blob = await getAudioBlob(entry.surahNumber, i, entry.reciterId);
          if (blob) {
            folder.file(`ayah-${String(i + 1).padStart(3, "0")}.mp3`, blob);
          }
        }
      }
      setExportProgress("Zipping…");
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `quran-audio-export.zip`);
    } catch (e) {
      console.error("Bulk export failed", e);
    } finally {
      setExporting(null);
      setExportProgress("");
    }
  };

  const estimatedSize = downloads.reduce((acc, d) => acc + d.totalAyahs * 0.3, 0);
  const overallPercent = bulkProgress.total > 0
    ? ((bulkProgress.current + (bulkProgress.ayahsTotal > 0 ? bulkProgress.ayahsDone / bulkProgress.ayahsTotal : 0)) / bulkProgress.total) * 100
    : 0;

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

        {/* Download All Section */}
        <div className="bg-card rounded-lg p-4 mb-6 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Download All Surahs</h3>
          {bulkDownloading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Surah {bulkProgress.current}/{bulkProgress.total} — {bulkProgress.surahName}</span>
                <span>{Math.round(overallPercent)}%</span>
              </div>
              <Progress value={overallPercent} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Ayah {bulkProgress.ayahsDone}/{bulkProgress.ayahsTotal}
                </span>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 px-2 text-xs text-destructive gap-1"
                  onClick={() => { cancelRef.current = true; }}
                >
                  <X className="w-3 h-3" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Select value={String(bulkReciterId)} onValueChange={(v) => setBulkReciterId(Number(v))}>
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="Select reciter" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {reciters?.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                      {displayName(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8 gap-1 text-xs shrink-0" onClick={handleDownloadAll}>
                <Download className="w-3 h-3" /> Download All
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-12">
            <WifiOff className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No offline downloads</p>
            <p className="text-muted-foreground/70 text-sm max-w-sm mx-auto">
              Save surahs for offline playback from the audio player or use "Download All" above.
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
