import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.lightofdeen',
  appName: 'light-of-deens',
  webDir: 'dist',
  server: {
    url: 'https://51c1bf19-3e78-4a72-aea8-75a88e717517.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
