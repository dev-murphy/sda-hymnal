<script lang="ts" setup>
defineProps<{
  number?: number;
  title?: string;
  firstLine?: string;
}>();
</script>

<template>
  <div class="relative">
    <img src="/hymn-og-image.png" alt="Default Hymn OG Image" />
    <div class="absolute top-43 left-10 flex flex-col">
      <h1 class="w-170 text-white text-8xl font-[Archivo] font-bold">
        <span class="font-[Syne] font-extrabold bg-linear-to-b from-yellow-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent">{{ number }}</span>
        <span class="opacity-0"> - </span>
        <span class="mt-3 block text-5xl font-normal">{{ title }}</span>
      </h1>
      <div class="h-0.75 w-60 bg-linear-to-r from-orange-500 to-transparent my-5 rounded-full"></div>
      <p v-if="firstLine" class="relative w-150 text-white/70 text-4xl font-thin">{{ firstLine }}</p>
    </div>
  </div>
</template>
