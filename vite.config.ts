import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { spawnSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// Syncs iOS MARKETING_VERSION + CURRENT_PROJECT_VERSION from package.json
// into ios/App/App.xcodeproj/project.pbxproj on every production build.
const syncIosVersionPlugin = (): PluginOption => ({
  name: "sync-ios-version",
  apply: "build",
  buildStart() {
    const result = spawnSync(
      process.execPath,
      [path.resolve(__dirname, "scripts/sync-ios-version.mjs")],
      { stdio: "inherit" }
    );
    if (result.status !== 0) {
      this.warn("sync-ios-version script exited with a non-zero status.");
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    syncIosVersionPlugin(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["fonts/kitab.woff2", "placeholder.svg", "robots.txt"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "quran-data",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.quran\.com\/api\/v4\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "quran-api",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      manifest: {
        name: "AJS Muslim Companion - Quran Reader",
        short_name: "AJS Muslim Companion",
        description: "Beautiful Quran reader with audio recitation, tajweed, and offline support",
        theme_color: "#1a1a2e",
        background_color: "#1a1a2e",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
