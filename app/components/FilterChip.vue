<script lang="ts" setup>
import type { Option } from "~/types";

defineProps<{
  id: string;
  options: Option<string>[];
  modelValue?: Option<string>;
  // shown in place of the name while nothing is selected
  placeholder?: string;
  searchPlaceholder?: string;
  clearLabel: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [option: Option<string>];
  clear: [];
}>();
</script>

<template>
  <div class="relative w-fit flex items-center">
    <XDropdown
      :id="id"
      :model-value="modelValue"
      :options="options"
      alignment="left"
      text-styles="text-left text-sm"
      is-searchable
      :search-input-placeholder="searchPlaceholder"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <template #default="{ triggerEvent, isOpen }">
        <button
          class="grid place-items-center bg-neutral-200 mr-px py-1 pl-1.5 pr-1 cursor-pointer rounded-l-full"
          @click="triggerEvent"
        >
          <Icon
            name="tabler:chevron-down"
            size="16"
            :class="{
              'rotate-180': isOpen,
            }"
          />
        </button>
      </template>
    </XDropdown>
    <p
      :class="[
        'bg-neutral-200 px-2 py-0.5 text-sm',
        { 'text-neutral-500 pr-2.5 rounded-r-full': !modelValue },
      ]"
    >
      {{ modelValue?.name ?? placeholder }}
    </p>
    <button
      v-if="modelValue"
      :aria-label="clearLabel"
      class="grid place-items-center bg-neutral-200 hover:bg-neutral-300 py-1.25 pr-1.5 pl-1 transition-colors cursor-pointer rounded-r-full"
      @click="emit('clear')"
    >
      <Icon name="tabler:x" size="14" />
    </button>
  </div>
</template>
