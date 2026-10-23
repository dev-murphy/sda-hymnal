<script lang="ts" setup>
import type { Theme } from "~/types";

const appStore = useAppStore();

// Appearance survives reloads in a cookie, so the server already renders the
// chosen theme and the page doesn't flash light before switching
type Appearance = {
  theme: Theme;
  accent: string;
  highContrast: boolean;
  reduceMotion: boolean;
};
const appearance = useCookie<Partial<Appearance>>("appearance", {
  default: () => ({}),
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
});

const saved = appearance.value ?? {};
if (saved.theme && ["auto", "light", "dark"].includes(saved.theme)) {
  appStore.setTheme(saved.theme);
}
if (saved.accent) appStore.setAccent(saved.accent);
if (typeof saved.highContrast === "boolean") {
  appStore.setHighContrast(saved.highContrast);
}
if (typeof saved.reduceMotion === "boolean") {
  appStore.setReduceMotion(saved.reduceMotion);
}

watch(
  () => ({
    theme: appStore.theme,
    accent: appStore.accent,
    highContrast: appStore.highContrast,
    reduceMotion: appStore.reduceMotion,
  }),
  (value) => {
    appearance.value = value;
  },
);

useHead({
  htmlAttrs: {
    // auto leaves it off, so the system setting decides
    "data-theme": () => (appStore.theme === "auto" ? undefined : appStore.theme),
    "data-contrast": () => (appStore.highContrast ? "high" : undefined),
    "data-reduce-motion": () => (appStore.reduceMotion ? "" : undefined),
    style: () => accentStyle(findAccent(appStore.accent)),
  },
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <SettingsModal />
  </div>
</template>
