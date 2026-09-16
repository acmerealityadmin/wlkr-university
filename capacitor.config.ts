import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.wlkr.university',
  appName: 'WLKR University',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      // brand-600 from tailwind.config.ts (indigo/violet)
      backgroundColor: '#7c3aed',
    },
    StatusBar: {
      style: 'DARK',
      overlaysWebView: false,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
