<script lang="ts" setup>
// attrs (placeholder, type, class, ...) go on the input itself, not a wrapper
defineOptions({ inheritAttrs: false });

const model = defineModel<string>({ default: "" });
</script>

<template>
  <input
    v-model="model"
    type="text"
    v-bind="$attrs"
    class="w-full min-w-0 h-9 bg-transparent border border-neutral-200 px-3 py-1 text-base md:text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-neutral-500 focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/30 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
  />
</template>
