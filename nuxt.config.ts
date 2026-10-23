// https://nuxt.com/docs/api/configuration/nuxt-config
import { FONTS } from "./app/utils/fonts";
import { categoryPath, slugify } from "./app/utils/index";
import { data as hymns } from "./app/assets/json/hymns.json";
import tailwindcss from "@tailwindcss/vite";

// hymn and category pages come from route params, so the sitemap can't find
// them on its own: one URL per hymn, category and subcategory
function sitemapUrls() {
  const hymnUrls = hymns.map(
    (hymn) => `/hymn/${hymn.hymn_number}-${slugify(hymn.title)}`,
  );
  const categoryUrls = new Set<string>();
  for (const hymn of hymns) {
    categoryUrls.add(categoryPath(hymn.category));
    if (hymn.subcategory) {
      categoryUrls.add(categoryPath(hymn.category, hymn.subcategory));
    }
  }
  // already URL-safe; left alone so "+" isn't escaped and matches the canonical link
  return [...hymnUrls, ...categoryUrls].map((loc) => ({ loc, _encoded: true }));
}

export default defineNuxtConfig({
  modules: [
    "@nuxt/icon/module",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@vueuse/nuxt/module",
    "nuxt-og-image",
    "@nuxtjs/sitemap",
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
      meta: [
        // Google Search Console ownership
        {
          name: "google-site-verification",
          content: "7jfiGMzwRmL54y9q1Mflw1ynuH4XBHY3aAk-xIMpg_g",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      ],
    },
  },
  sitemap: {
    urls: sitemapUrls,
    // presenting is the hymn page again, full screen; the hymn page is the one to index
    exclude: ["/present/**"],
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
