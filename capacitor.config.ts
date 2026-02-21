import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.CAP_DEV_SERVER === "true";

const config: CapacitorConfig = {
  appId: "com.it.gotcha.app",
  appName: "GOTCHA!",
  webDir: "out",
  server: {
    ...(isDev && { url: "https://dev.gotcha.it.com" }),
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#ffffff",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
