<script lang="ts" setup generic="T">
const props = withDefaults(
  defineProps<{
    id: string;
    modelValue: Option<T>;
    options: Option<T>[];
    direction?: "bottom" | "top";
    alignment?: "left" | "right" | "center";
    textStyles?: string;
    isSearchable?: boolean;
    searchInputPlaceholder?: string;
    showAllOptions?: boolean;
  }>(),
  {
    isSearchable: false,
    direction: "bottom",
    showAllOptions: true,
    alignment: "center",
  },
);
const emits = defineEmits<{
  (e: "update:modelValue", val: Option<T>): void;
  (e: "openChange", isOpen: boolean): void;
}>();

const searchText = ref("");
function clearSearch() {
  searchText.value = "";
}

const isDropdownOpen = ref(false);
function toggleIsOpen() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

watch(isDropdownOpen, (isOpen) => {
  if (!isOpen) clearSearch();
  emits("openChange", isOpen);
});

const filteredOptions = computed(() => {
  const search = searchText.value.trim().toLowerCase();

  return props.options.filter((option) => {
    if (!props.showAllOptions && option.name === props.modelValue.name)
      return false;
    return !search || option.name.toLowerCase().includes(search);
  });
});

function setDropdownOption(option: Option<T>) {
  emits('update:modelValue', option);
  isDropdownOpen.value = false;
}

const dropdownMenuRef = useTemplateRef("dropdown");
onClickOutside(dropdownMenuRef, () => {
  isDropdownOpen.value = false;
});
</script>

<template>
  <div ref="dropdown" class="relative">
    <slot v-if="$slots.default" :is-open="isDropdownOpen" :trigger-event="toggleIsOpen" />
    <button
      v-else
      class="w-fit flex items-center gap-x-1 border border-neutral-300 font-[Archivo] text-sm px-2 py-1.5 select-none shadow cursor-pointer rounded-md"
      :style="modelValue.style"
      @click="toggleIsOpen()"
    >
      {{ modelValue.name }}
      <Icon
        name="tabler:chevron-down"
        size="18"
        :class="{ 'rotate-180': isDropdownOpen }"
      />
    </button>

    <div
      v-if="isDropdownOpen"
      :class="[
        'w-max absolute bg-white z-[100] flex flex-col gap-y-0.5 border border-neutral-100 p-1 shadow-md rounded-lg',
        {
          'bottom-full -translate-y-1': direction === 'top',
          'top-full translate-y-1': direction === 'bottom',
          'right-0': alignment === 'right',
          'left-0': alignment === 'left',
          'left-1/2 -translate-x-1/2': alignment === 'center',
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
      <div class="max-h-[250px] flex flex-col gap-y-0.5 overflow-y-auto">
        <button
          v-for="(option, index) in filteredOptions"
          :key="`${id}-${index}`"
          :class="[
            `flex items-center gap-x-1 px-3 py-0.5 rounded-md`,
            textStyles,
            {
              'bg-neutral-200': modelValue.name === option.name,
              'hover:bg-neutral-100': modelValue.name !== option.name,
            },
          ]"
          :style="option.style"
          :disabled="modelValue.name === option.name"
          @click="setDropdownOption(option)"
        >
          <Icon v-if="option.icon" v-bind="option.icon" />
          {{ option.name }}
        </button>
        <p
          v-if="!filteredOptions.length"
          class="px-3 py-0.5 text-sm text-neutral-400 font-[Archivo]"
        >
          No results
        </p>
      </div>
    </div>
  </div>
</template>
