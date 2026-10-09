<script lang="ts" setup>
withDefaults(
  defineProps<{
    buttonText: string;
    type?: "raised";
    iconPosition?: "left" | "right";
    disabled: boolean;
  }>(),
  {
    type: "raised",
    iconPosition: "left",
  },
);
</script>

<template>
  <button
    :class="[
      'group flex items-center gap-x-1 font-[Archivo]',
      {
        'text-neutral-600 disabled:text-neutral-400 disabled:bg-neutral-100 border border-neutral-200 disabled:border-neutral-100 px-2 py-1 transition-all shadow hover:shadow-md disabled:shadow-none disabled:cursor-not-allowed rounded-md':
          type === 'raised',
        'flex-row-reverse': iconPosition === 'right',
      },
    ]"
    :disabled="disabled"
  >
    <div class="flex items-center text-neutral-300 group-disabled:text-neutral-400">
      <slot />
    </div>
    {{ buttonText }}
  </button>
</template>
