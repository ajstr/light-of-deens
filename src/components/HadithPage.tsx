// Hadith collections browser: pick collection → book/section → hadiths.
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, BookMarked, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  COLLECTIONS,
  HadithCollection,
  HadithItem,
  HadithSection,
  getHadithsForSection,
  getSections,
} from "@/lib/hadith-api";

type View =
  | { kind: "collections" }
  | { kind: "sections"; collection: HadithCollection }
  | { kind: "hadiths"; collection: HadithCollection; section: HadithSection };

const HadithPage = () => {
  const [view, setView] = useState<View>({ kind: "collections" });
  const [sections, setSections] = useState<HadithSection[] | null>(null);
  const [hadiths, setHadiths] = useState<HadithItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError(null);
    if (view.kind === "sections") {
      setSections(null);
      setLoading(true);
      getSections(view.collection.slug)
        .then((s) => { if (!cancelled) setSections(s); })
        .catch((e) => { if (!cancelled) setError(String(e.message ?? e)); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else if (view.kind === "hadiths") {
      setHadiths(null);
      setLoading(true);
      getHadithsForSection(view.collection.slug, view.section.id)
        .then((h) => { if (!cancelled) setHadiths(h); })
        .catch((e) => { if (!cancelled) setError(String(e.message ?? e)); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }
    return () => { cancelled = true; };
  }, [view]);

  const filteredSections = useMemo(() => {
    if (!sections) return null;
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) => s.title.toLowerCase().includes(q));
  }, [sections, query]);

  return (
    <div className="px-4 max-w-2xl mx-auto pb-8">
      <Helmet>
        <title>Hadith Collections — Noor Al Deen</title>
        <meta name="description" content="Browse the major Sunni hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta, Musnad Ahmad, Darimi) in English and Arabic." />
      </Helmet>

      <header className="flex items-center gap-2 mb-4">
        {view.kind !== "collections" && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setQuery("");
              if (view.kind === "hadiths") setView({ kind: "sections", collection: view.collection });
              else setView({ kind: "collections" });
            }}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <BookMarked className="w-5 h-5 text-primary" />
        <h1 className="font-display text-xl font-semibold truncate">
          {view.kind === "collections" && "Hadith Collections"}
          {view.kind === "sections" && view.collection.name}
          {view.kind === "hadiths" && `${view.collection.name} · ${view.section.title}`}
        </h1>
      </header>

      {error && (
        <Card className="p-3 mb-3 text-sm text-destructive border-destructive/40 bg-destructive/10">
          {error}
        </Card>
      )}

      {view.kind === "collections" && (
        <ul className="space-y-2">
          {COLLECTIONS.map((c) => (
            <li key={c.slug}>
              <button
                className="w-full text-left"
                onClick={() => setView({ kind: "sections", collection: c })}
              >
                <Card className="p-3 hover:bg-accent transition-colors">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.author}</div>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      {view.kind === "sections" && (
        <>
          <Input
            placeholder="Search books…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-3"
          />
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {filteredSections && (
            <ul className="space-y-2">
              {filteredSections.map((s) => (
                <li key={s.id}>
                  <button
                    className="w-full text-left"
                    onClick={() => setView({ kind: "hadiths", collection: view.collection, section: s })}
                  >
                    <Card className="p-3 hover:bg-accent transition-colors flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8 shrink-0">#{s.id}</span>
                      <span className="font-medium truncate">{s.title}</span>
                    </Card>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {view.kind === "hadiths" && (
        <>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading hadiths…
            </div>
          )}
          {hadiths && hadiths.length === 0 && !loading && (
            <Card className="p-6 text-sm text-center text-muted-foreground">
              No hadiths found in this section.
            </Card>
          )}
          <ul className="space-y-3">
            {hadiths?.map((h) => (
              <li key={h.number}>
                <Card className="p-4">
                  <div className="text-[11px] text-muted-foreground mb-2">
                    Hadith #{h.number}
                  </div>
                  {h.arabic && (
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-arabic text-xl leading-loose mb-3 text-right"
                    >
                      {h.arabic}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{h.english}</p>
                  {h.grades && h.grades.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {h.grades.map((g, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-[10px] text-muted-foreground text-center mt-6">
        Hadith data via fawazahmed0/hadith-api (open-source, CDN cached).
      </p>
    </div>
  );
};

export default HadithPage;
