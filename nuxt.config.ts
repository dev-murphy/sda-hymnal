// https://nuxt.com/docs/api/configuration/nuxt-config
import { FONTS } from "./app/utils/fonts";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: [
    "@nuxt/icon/module",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@vueuse/nuxt/module",
  ],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  // Icons
  icon: {
    mode: "css",
    cssLayer: "base",
    serverBundle: {
      collections: ["tabler", "solar"],
    },
  },
  // Fonts
  fonts: {
    families: FONTS.map((font) => ({
      name: font.name,
      provider: "google",
      // fonts are applied with inline styles, so they can't be auto-detected from CSS
      global: true,
      ...(font.weights && { weights: font.weights }),
    })),
  },
});
