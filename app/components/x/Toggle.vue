<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);
const emits = defineEmits<{ (e: "update:modelValue", val: boolean): void }>();

function toggle() {
  if (props.disabled) return;
  emits("update:modelValue", !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    :class="[
      'relative w-9 h-5 shrink-0 p-0.5 transition-colors duration-200 rounded-full disabled:opacity-40 disabled:cursor-not-allowed',
      modelValue ? 'accent-gradient' : 'bg-neutral-300',
    ]"
    @click="toggle"
  >
    <span
      :class="[
        'block w-4 h-4 bg-[#fff] shadow transition-transform duration-200 ease-out rounded-full',
        modelValue ? 'translate-x-4' : 'translate-x-0',
      ]"
    />
  </button>
</template>
