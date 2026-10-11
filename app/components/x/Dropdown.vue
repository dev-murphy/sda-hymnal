<script lang="ts" setup>
import type { Option } from "~/types";

const props = withDefaults(
  defineProps<{
    id: string;
    modelValue: Option<number>;
    options: Option<number>[];
    direction?: "bottom" | "top";
    isSearchable?: boolean;
    searchInputPlaceholder?: string;
    showAllOptions?: boolean;
  }>(),
  {
    isSearchable: false,
    direction: "bottom",
    showAllOptions: true,
  },
);
defineEmits<{ (e: "update:modelValue", val: Option<number>): void }>();

const searchText = ref("");
function clearSearch() {
  searchText.value = "";
}

const isDropdownOpen = ref(false);
function toggleIsOpen() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

const filteredOptions = computed(() => {
  if (!props.showAllOptions) return props.options.filter((option) => option.name !== props.modelValue.name);
  return props.options;
});


const dropdownMenuRef = useTemplateRef("dropdown");
onClickOutside(dropdownMenuRef, () => {
  isDropdownOpen.value = false;
})
</script>

<template>
  <div ref="dropdown" class="relative">
    <button
      class="w-fit flex items-center gap-x-1 border border-neutral-300 font-[Archivo] text-sm px-2 py-1.5 select-none shadow cursor-pointer rounded-md"
      @click="toggleIsOpen()"
    >
      {{ modelValue.name }}
      <Icon name="tabler:chevron-down" size="18" :class="{'rotate-180': isDropdownOpen}" />
    </button>

    <div
      v-if="isDropdownOpen"
      :class="[
        'w-fit absolute bg-white flex flex-col gap-y-0.5 border border-neutral-100 p-1 shadow-md rounded-lg',
        {
          'bottom-full -translate-y-1': direction === 'top',
          'top-full translate-y-1': direction === 'bottom',
        },
      ]"
    >
      <div v-if="isSearchable" class="relative">
        <input
          type="text"
          :placeholder="searchInputPlaceholder"
          v-model="searchText"
          class="px-1 py-1 border border-neutral-300 text-sm font-[Archivo] outline-none rounded-md"
        />
        <button
          v-if="searchText"
          class="group absolute top-1/2 -translate-y-1/2 right-1 flex items-center justify-center hover:bg-red-200/50 p-0.5 transition-colors rounded-md"
          @click="clearSearch"
        >
          <Icon name="tabler:x" size="16" class="group-hover:text-red-500" />
        </button>
      </div>
      <button
        v-for="(option, index) in filteredOptions"
        :key="`${id}-${index}`"
        :class="[
          'text-sm px-3 py-0.5 rounded-md',
          {
            'bg-neutral-200': modelValue.name === option.name,
            'hover:bg-neutral-100': modelValue.name !== option.name,
          },
        ]"
        :disabled="modelValue.name === option.name"
        @click="$emit('update:modelValue', option)"
      >
        {{ option.name }}
      </button>
    </div>
  </div>
</template>
