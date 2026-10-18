// https://nuxt.com/docs/api/configuration/nuxt-config
import { FONTS } from "./app/utils/fonts";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: [
    "@nuxt/icon/module",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@vueuse/nuxt/module",
    "nuxt-og-image",
  ],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  // Default SEO meta tags
  app: {
    head: {
      title: "Seventh-Day Adventist Hymnal",
      htmlAttrs: {
        lang: "en",
      },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      ],
    },
  },
  // Website Config for OG images
  site: {
    url: "https://sda-hymnal.zcodes.dev",
    name: "Seventh-Day Adventist Hymnal"
  },
  // Match the 1200x630 background in public/hymn-og-image.png
  ogImage: {
    defaults: {
      width: 1200,
      height: 630,
    },
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
    families: [
      ...FONTS.map((font) => ({
        name: font.name,
        provider: "google",
        // fonts are applied with inline styles, so they can't be auto-detected from CSS
        global: true,
        ...(font.weights && { weights: font.weights }),
      })),
      // hymn number in the OG image (not offered in the font selector)
      { name: "Syne", provider: "google", global: true, weights: ["400 800"] },
    ],
  },
});
