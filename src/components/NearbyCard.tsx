// Home-screen card linking to the Nearby page (masjids + halal food).

import { motion } from "framer-motion";
import { Building2, UtensilsCrossed, ChevronRight } from "lucide-react";
import { PlaceKind } from "@/lib/nearby-places";

interface NearbyCardProps {
  onOpen: (kind: PlaceKind) => void;
}

const NearbyCard = ({ onOpen }: NearbyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 mb-6"
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
          <h2 className="text-sm font-medium">Find Nearby</h2>
          <span className="text-[10px] text-muted-foreground">via OpenStreetMap</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border/60">
          <button
            onClick={() => onOpen("masjid")}
            className="flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">Sunni Masjids</div>
                <div className="text-[11px] text-muted-foreground">Nearest to you</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
          <button
            onClick={() => onOpen("halal")}
            className="flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">Halal Food</div>
                <div className="text-[11px] text-muted-foreground">Restaurants & cafes</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NearbyCard;
