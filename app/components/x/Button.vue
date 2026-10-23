<script lang="ts" setup>
withDefaults(
  defineProps<{
    buttonText?: string;
    type?: "raised";
    size?: "sm" | "md";
    iconPosition?: "left" | "right";
    disabled?: boolean;
  }>(),
  {
    type: "raised",
    iconPosition: "left",
    size: 'md'
  },
);
</script>

<template>
  <button
    :class="[
      'group flex items-center gap-x-1 font-[Archivo]',
      {
        'text-neutral-600 disabled:text-neutral-400 disabled:bg-neutral-100 border border-neutral-200 enabled:hover:border-accent disabled:border-neutral-100 transition-all shadow hover:shadow-md disabled:shadow-none disabled:cursor-not-allowed rounded-md':
          type === 'raised',
        'flex-row-reverse': iconPosition === 'right',
        'h-[26px] px-1.5': size === 'sm',
        'h-[34px] px-2': size === 'md',
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
