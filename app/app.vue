<script lang="ts" setup>
const appStore = useAppStore();

useHead({
  htmlAttrs: {
    "data-reduce-motion": () => (appStore.reduceMotion ? "" : undefined),
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
