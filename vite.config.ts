import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      base: "/",
      includeAssets: ["fyla.png"],
      manifest: {
        name: "fyla",
        short_name: "fyla",

        description: "PWA for P2P file-sharing",
        theme_color: "#121212",
        icons: [
          {
            src: "fyla_512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "fyla_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  define: {
    global: {},
  },
});
