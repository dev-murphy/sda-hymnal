<script lang="ts" setup>
withDefaults(
  defineProps<{ min?: number; max?: number; modelValue: number }>(),
  {
    min: 0,
    max: 1,
  },
);
defineEmits<{
  (e: "update:modelValue", val: number): void;
  (e: "triggerEvent", val: MouseEvent): void;
}>();
</script>

<template>
  <div
    class="h-2 bg-neutral-300 border border-neutral-400 rounded-full overflow-hidden"
    @click="$emit('triggerEvent', $event)"
  >
    <div class="h-full bg-blue-400" :style="{ width: modelValue + '%' }"></div>
  </div>
</template>
