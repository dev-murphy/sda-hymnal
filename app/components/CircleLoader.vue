<script lang="ts" setup>
const props = withDefaults(defineProps<{ strokeWidth?: number }>(), {
  strokeWidth: 1.75,
});

const radius = computed(() => 11 - props.strokeWidth / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      :r="radius"
      class="stroke-accent"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      :stroke-dasharray="`${circumference / 4} ${circumference}`"
      transform="rotate(180 12 12)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        dur="0.75s"
        values="180 12 12;540 12 12"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
</template>
