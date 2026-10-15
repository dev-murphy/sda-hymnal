<script lang="ts" setup>
defineProps<{ chunks: HighlightChunk[] }>();
</script>

<template>
  <template v-for="(chunk, i) in chunks" :key="i">
    <mark v-if="chunk.match" class="bg-yellow-200 text-inherit rounded-sm">{{ chunk.text }}</mark>
    <template v-else>{{ chunk.text }}</template>
  </template>
</template>
