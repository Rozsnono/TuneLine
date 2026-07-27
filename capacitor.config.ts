import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'tuneline',
  webDir: 'public',
  appendUserAgent: "TuneLine",
  server: {
    url: 'https://tune-line.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0c0709", // Matches our pastel background
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    },
    NativeBiometric: {
      // Custom configuration for biometrics plugin
    }
  }
};

export default config;
