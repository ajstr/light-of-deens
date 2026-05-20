// Find nearby Sunni masjids and halal restaurants via OpenStreetMap Overpass API.
// No API key required. Uses public mirrors with a fallback.

export type PlaceKind = "masjid" | "halal";

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
  address?: string;
  phone?: string;
  website?: string;
  cuisine?: string;
  denomination?: string;
  diet?: string;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

// Haversine distance in meters
export function distanceMeters(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildQuery(kind: PlaceKind, lat: number, lng: number, radiusM: number): string {
  if (kind === "masjid") {
    // Mosques. Prefer denomination=sunni, but also include mosques with no
    // denomination tag (most mosques globally are Sunni by default and many
    // are simply untagged in OSM). We exclude explicitly non-Sunni ones.
    return `
[out:json][timeout:25];
(
  nwr["amenity"="place_of_worship"]["religion"="muslim"]["denomination"="sunni"](around:${radiusM},${lat},${lng});
  nwr["amenity"="place_of_worship"]["religion"="muslim"][!"denomination"](around:${radiusM},${lat},${lng});
);
out center tags 80;`;
  }
  // Halal restaurants: diet:halal=yes/only, plus any "halal" in cuisine.
  return `
[out:json][timeout:25];
(
  nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["diet:halal"~"^(yes|only)$"](around:${radiusM},${lat},${lng});
  nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["cuisine"~"halal",i](around:${radiusM},${lat},${lng});
);
out center tags 80;`;
}

async function runOverpass(query: string): Promise<any> {
  let lastErr: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) { lastErr = new Error(`Overpass ${res.status}`); continue; }
      const json = await res.json();
      if (!json || !Array.isArray(json.elements)) { lastErr = new Error("bad response"); continue; }
      return json;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("All Overpass endpoints failed");
}

function formatAddress(tags: Record<string, string>): string | undefined {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

export async function findNearby(
  kind: PlaceKind,
  lat: number,
  lng: number,
  radiusM = 5000,
  limit = 30,
): Promise<NearbyPlace[]> {
  const data = await runOverpass(buildQuery(kind, lat, lng, radiusM));
  const elements: any[] = data?.elements ?? [];
  const places: NearbyPlace[] = elements.map((el) => {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (typeof elLat !== "number" || typeof elLng !== "number") return null;
    const tags = el.tags ?? {};
    const name: string =
      tags.name ||
      tags["name:en"] ||
      tags["official_name"] ||
      (kind === "masjid" ? "Unnamed mosque" : "Unnamed restaurant");
    return {
      id: `${el.type}/${el.id}`,
      name,
      lat: elLat,
      lng: elLng,
      distanceM: distanceMeters(lat, lng, elLat, elLng),
      address: formatAddress(tags),
      phone: tags.phone || tags["contact:phone"],
      website: tags.website || tags["contact:website"],
      cuisine: tags.cuisine,
      denomination: tags.denomination,
      diet: tags["diet:halal"],
    } as NearbyPlace;
  }).filter(Boolean) as NearbyPlace[];

  // De-duplicate by name+coord rounding
  const seen = new Set<string>();
  const dedup = places.filter((p) => {
    const k = `${p.name}|${p.lat.toFixed(4)}|${p.lng.toFixed(4)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  dedup.sort((a, b) => a.distanceM - b.distanceM);
  return dedup.slice(0, limit);
}

export function formatDistance(m: number): string {
  const mi = m / 1609.344;
  if (mi < 0.1) return `${Math.round(m)} m`;
  return `${mi < 1 ? mi.toFixed(1) : mi.toFixed(0)} mi`;
}

export function mapsLink(p: NearbyPlace): string {
  // Universal geo link — works on iOS (Apple Maps), Android (Google Maps), web.
  const q = encodeURIComponent(p.name);
  return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}&query_place_id=${q}`;
}
