/**
 * iOS Background Audio Helper
 *
 * iOS Safari kills audio playback when the screen is locked if:
 * 1. New Audio() elements are created per track (breaks the audio session)
 * 2. There's a gap between tracks (iOS suspends the session)
 *
 * This module provides:
 * - A singleton persistent <audio> element that's reused across tracks
 * - A silent audio keepalive loop to prevent session suspension between tracks
 */

let persistentAudio: HTMLAudioElement | null = null;
let silentAudio: HTMLAudioElement | null = null;

// Tiny silent WAV (44 bytes header + minimal samples) as a data URI
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

/**
 * Get or create the singleton audio element.
 * Must be called initially from a user gesture context (tap/click).
 */
export function getPersistentAudio(): HTMLAudioElement {
  if (!persistentAudio) {
    persistentAudio = new Audio();
    persistentAudio.setAttribute("playsinline", "true");
    persistentAudio.setAttribute("webkit-playsinline", "true");
    // Prevent iOS from reclaiming the audio element
    persistentAudio.preload = "auto";
  }
  return persistentAudio;
}

/**
 * Start a silent audio loop to keep the iOS audio session alive
 * during transitions between ayahs. Call once on first user-initiated play.
 */
export function startSilentKeepalive(): void {
  if (silentAudio) return;
  silentAudio = new Audio(SILENT_WAV);
  silentAudio.loop = true;
  silentAudio.volume = 0.001; // Near-silent but not 0 (iOS ignores volume=0)
  silentAudio.setAttribute("playsinline", "true");
  silentAudio.setAttribute("webkit-playsinline", "true");
  silentAudio.play().catch(() => {
    // Will be retried on next user gesture
    silentAudio = null;
  });
}

/**
 * Stop the silent keepalive (e.g., when all playback stops).
 */
export function stopSilentKeepalive(): void {
  if (silentAudio) {
    silentAudio.pause();
    silentAudio.src = "";
    silentAudio = null;
  }
}

/**
 * Check if we're likely on iOS
 */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
