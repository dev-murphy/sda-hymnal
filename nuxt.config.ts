// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/icon/module', '@nuxt/fonts', '@nuxtjs/tailwindcss', '@pinia/nuxt'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Icons
  icon: {
    mode: "css",
    cssLayer: "base",
    serverBundle: {
      collections: ["tabler", "solar"]
    }
  },
  // Fonts
  fonts: {
    families: [
      {
        name: 'Spectral',
        provider: 'google'
      },
      {
        name: "Archivo",
        provider: "google"
      },
      {
        name: "Epilogue",
        provider: "google",
        weights: ['400', '700']
      }
    ]
  }
})
