<script lang="ts" setup>
withDefaults(
  defineProps<{
    text: string;
    direction?: "top" | "bottom";
    alignment?: "left" | "right" | "center";
  }>(),
  {
    direction: "top",
    alignment: "center",
  },
);

const isTooltip = ref(false);
function setIsTooltip(tooltipState: boolean) {
  isTooltip.value = tooltipState;
}
</script>

<template>
  <div class="relative">
    <slot
      :trigger-open="() => setIsTooltip(true)"
      :trigger-close="() => setIsTooltip(false)"
    />
    <Transition name="fade">
      
    <p
      v-if="isTooltip"
      :class="[
        'absolute w-max bg-neutral-100 border border-neutral-300 px-2 py-0.5 text-sm z-[100] rounded-md',
        {
          'top-full translate-y-1': direction === 'bottom',
          'bottom-full -translate-y-1': direction === 'top',
          'left-0': alignment === 'left',
          'right-0': alignment === 'right',
          'left-1/2 -translate-x-1/2': alignment === 'center',
        },
      ]"
    >
      {{ text }}
    </p>
    </Transition>
  </div>
</template>
