import { useEffect, useState } from "react";

/**
 * Tracks vertical scroll direction with a small threshold.
 * Returns true when the UI chrome (top mini-player, bottom tab bar) should be hidden.
 * - Always shown near the top (< 80px)
 * - Hidden when scrolling down by > 10px
 * - Shown when scrolling up by > 10px
 */
export const useHideOnScroll = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < 80) {
        setHidden(false);
      } else if (delta > 10) {
        setHidden(true);
      } else if (delta < -10) {
        setHidden(false);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
};
