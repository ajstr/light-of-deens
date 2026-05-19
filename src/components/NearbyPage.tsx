// Nearby page: find Sunni masjids and halal restaurants around the user.
// Uses OpenStreetMap Overpass API (free, no key).

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapPin, RefreshCw, Phone, Globe, Navigation2, Building2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  detectLocation,
  getPrayerLocation,
  PrayerLocation,
} from "@/lib/prayer-times";
import {
  findNearby,
  mapsLink,
  NearbyPlace,
  PlaceKind,
} from "@/lib/nearby-places";

// Fixed search radius — show nearest results within ~6 miles.
const SEARCH_RADIUS_M = 9656;

interface NearbyPageProps {
  initialKind?: PlaceKind;
}

const NearbyPage = ({ initialKind = "masjid" }: NearbyPageProps) => {
  const [kind, setKind] = useState<PlaceKind>(initialKind);
  const [loc, setLoc] = useState<PrayerLocation | null>(getPrayerLocation());
  const [locating, setLocating] = useState(false);
  
  const [places, setPlaces] = useState<Record<PlaceKind, NearbyPlace[] | null>>({
    masjid: null,
    halal: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureLocation = async (force = false): Promise<PrayerLocation | null> => {
    if (loc && !force) return loc;
    setLocating(true);
    try {
      const next = await detectLocation({ forceFresh: force });
      setLoc(next);
      return next;
    } catch {
      setError("Could not determine your location. Enable location access and try again.");
      return null;
    } finally {
      setLocating(false);
    }
  };

  const load = async (k: PlaceKind, force = false) => {
    setError(null);
    const here = await ensureLocation();
    if (!here) return;
    setLoading(true);
    try {
      const list = await findNearby(k, here.lat, here.lng, SEARCH_RADIUS_M);
      setPlaces((p) => ({ ...p, [k]: list }));
    } catch (e) {
      console.error(e);
      setError("Could not load nearby places. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when tab changes
  useEffect(() => {
    void load(kind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const list = places[kind];

  const headerIcon = kind === "masjid" ? Building2 : UtensilsCrossed;
  const HeaderIcon = headerIcon;
  const headerTitle = kind === "masjid" ? "Sunni Masjids" : "Halal Restaurants";

  return (
    <div className="px-4 max-w-2xl mx-auto pb-8">
      <Helmet>
        <title>Nearby Masjids & Halal Food — Noor Al Deen</title>
        <meta name="description" content="Find the closest Sunni mosques and halal restaurants around you, with phone and directions." />
      </Helmet>

      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HeaderIcon className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-semibold">{headerTitle} Near You</h1>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => load(kind, true)}
          disabled={loading || locating}
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <Tabs value={kind} onValueChange={(v) => setKind(v as PlaceKind)} className="mb-3">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="masjid">
            <Building2 className="w-4 h-4 mr-1" /> Masjids
          </TabsTrigger>
          <TabsTrigger value="halal">
            <UtensilsCrossed className="w-4 h-4 mr-1" /> Halal Food
          </TabsTrigger>
        </TabsList>
        <TabsContent value="masjid" />
        <TabsContent value="halal" />
      </Tabs>

      <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground flex-wrap">
        <MapPin className="w-3.5 h-3.5" />
        {loc ? (
          <span className="truncate">
            {loc.city || `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`}
            {loc.country ? `, ${loc.country}` : ""}
          </span>
        ) : (
          <span>Locating…</span>
        )}
        <span className="mx-1">·</span>
        <span>Nearest results</span>
        <button
          onClick={() => ensureLocation(true)}
          className="ml-auto underline-offset-2 hover:underline"
          disabled={locating}
        >
          {locating ? "Updating…" : "Update location"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3 mb-3">
          {error}
        </div>
      )}

      {loading && !list && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!loading && list && list.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No {kind === "masjid" ? "Sunni masjids" : "halal restaurants"} found nearby.
        </Card>
      )}

      <ul className="space-y-2">
        {list?.map((p) => (
          <li key={p.id}>
            <Card className="p-3 flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-medium truncate">{p.name}</h2>
                </div>
                {p.address && (
                  <p className="text-xs text-muted-foreground truncate">{p.address}</p>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                  {kind === "masjid" && p.denomination && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
                      {p.denomination}
                    </span>
                  )}
                  {kind === "halal" && p.diet && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      halal: {p.diet}
                    </span>
                  )}
                  {p.cuisine && kind === "halal" && (
                    <span className="capitalize">{p.cuisine.replace(/;/g, ", ")}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <a href={mapsLink(p)} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="default" className="h-7 text-[11px]">
                      <Navigation2 className="w-3 h-3" /> Directions
                    </Button>
                  </a>
                  {p.phone && (
                    <a href={`tel:${p.phone}`}>
                      <Button size="sm" variant="outline" className="h-7 text-[11px]">
                        <Phone className="w-3 h-3" /> Call
                      </Button>
                    </a>
                  )}
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-7 text-[11px]">
                        <Globe className="w-3 h-3" /> Website
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-muted-foreground text-center mt-6">
        Data from OpenStreetMap contributors. Some places may be untagged or out of date —
        always confirm halal certification with the venue.
      </p>
    </div>
  );
};

export default NearbyPage;
