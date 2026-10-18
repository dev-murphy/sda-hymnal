<script lang="ts" setup>
import type { Option, Theme } from "~/types";

const appStore = useAppStore();

// matches the store's initial fontFamily
const DEFAULT_FONT = "Archivo";

const themeOptions: { name: string; value: Theme; icon?: string }[] = [
  { name: "Auto", value: "auto" },
  { name: "Light", value: "light", icon: "tabler:sun" },
  { name: "Dark", value: "dark", icon: "tabler:moon" },
];
const themeIndex = computed(() =>
  themeOptions.findIndex((option) => option.value === appStore.theme),
);

const selectedLimit = computed({
  get: () =>
    PER_PAGE_OPTIONS.find((o) => o.value === appStore.paginate.limit) ??
    PER_PAGE_OPTIONS[0]!,
  set: (option: Option<number>) => appStore.setLimit(option.value),
});

function updateFontSize(event: Event) {
  const input = event.target as HTMLInputElement;
  appStore.setFontSize(parseFloat(input.value));
  input.value = String(appStore.fontSize);
}

const fontOptions: Option<string>[] = FONTS.map((font) => ({
  name: font.name === DEFAULT_FONT ? `${font.name} [Default]` : font.name,
  value: font.name,
  style: { fontFamily: toFontFamily(font) },
}));

const selectedFont = computed({
  get: () =>
    fontOptions.find((font) => font.value === appStore.fontFamily) ??
    fontOptions[0]!,
  set: (font: Option<string>) => appStore.setFontFamily(font.value),
});

// the font family tooltip stays hidden while its menu is open
const isFontMenuOpen = ref(false);

// first verse of the first hymn shows the current font settings
const previewStanza = appStore.hymns[0]!.stanzas[0]!;
</script>

<template>
  <dialog
    id="settings-dialog"
    class="w-125 max-w-[calc(100vw-2rem)] open:flex flex-col items-center overflow-visible rounded-xl shadow-lg"
  >
    <div
      class="w-full flex items-center justify-between border-b border-neutral-300 px-4 py-2"
    >
      <h2 class="font-[Archivo] text-2xl">Settings</h2>
      <button
        commandfor="settings-dialog"
        command="close"
        class="grid place-item-center"
      >
        <Icon name="tabler:x" size="24" />
      </button>
    </div>
    <div class="w-full flex flex-col gap-y-3 p-4">
      <div class="w-full flex items-center justify-between">
        <p>Theme</p>
        <div class="border border-neutral-300 p-1 rounded-full">
          <div class="relative h-7.5  flex items-center">
            <div
              class="absolute top-0 left-0 w-12.5 h-full bg-red-100 transition-transform duration-300 ease-out rounded-full"
              :style="{ transform: `translateX(${themeIndex * 100}%)` }"
            ></div>
            <button
              v-for="option in themeOptions"
              :key="option.value"
              :aria-label="`${option.value} theme`"
              :aria-pressed="appStore.theme === option.value"
              class="relative z-10 w-12.5 h-full flex items-center justify-center text-sm"
              @click="appStore.setTheme(option.value)"
            >
              <Icon v-if="option.icon" :name="option.icon" size="20" />
              <template v-else>{{ option.name }}</template>
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <p>Default number of items/page</p>
        <XDropdown
          id="default-limit"
          v-model="selectedLimit"
          :options="PER_PAGE_OPTIONS"
          alignment="right"
          text-styles="text-left text-sm"
        />
      </div>
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <p>Default Font Settings</p>
        <div class="flex items-center gap-x-2">
          <XTooltip text="Font family">
            <template #default="{ triggerOpen, triggerClose }">
              <div
                @mouseenter="!isFontMenuOpen && triggerOpen()"
                @mouseleave="triggerClose"
              >
                <XDropdown
                  id="font-family"
                  v-model="selectedFont"
                  :options="fontOptions"
                  alignment="right"
                  text-styles="text-left text-sm"
                  is-searchable
                  search-input-placeholder="Search fonts"
                  @open-change="
                    (isOpen: boolean) => {
                      isFontMenuOpen = isOpen;
                      if (isOpen) triggerClose();
                    }
                  "
                />
              </div>
            </template>
          </XTooltip>
          <div
            class="flex items-center border border-neutral-300 divide-x divide-neutral-200 rounded-md"
          >
            <XTooltip text="Font decrease">
              <template #default="{ triggerOpen, triggerClose }">
                <button
                  class="grid place-items-center px-1.5 disabled:opacity-40"
                  :disabled="appStore.fontSize <= 12"
                  aria-label="Decrease font size"
                  @click="appStore.decreaseFontSize()"
                  @mouseenter="triggerOpen"
                  @mouseleave="triggerClose"
                >
                  <Icon name="tabler:minus" size="20" />
                </button>
              </template>
            </XTooltip>
            <XTooltip text="Font Size">
              <template #default="{ triggerOpen, triggerClose }">
                <label
                  class="relative flex items-center gap-x-1 px-1 my-1.5 text-sm"
                  @mouseenter="triggerOpen"
                  @mouseleave="triggerClose"
                >
                  <input
                    :value="appStore.fontSize"
                    type="number"
                    min="12"
                    max="48"
                    class="w-12 px-1 text-left outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Font size"
                    @change="updateFontSize"
                  />
                  <span
                    class="absolute top-1/2 -translate-y-1/2 right-2 text-neutral-400"
                    >px</span
                  >
                </label>
              </template>
            </XTooltip>
            <XTooltip text="Font increase">
              <template #default="{ triggerOpen, triggerClose }">
                <button
                  class="grid place-items-center px-1.5 disabled:opacity-40"
                  :disabled="appStore.fontSize >= 48"
                  aria-label="Increase font size"
                  @click="appStore.increaseFontSize()"
                  @mouseenter="triggerOpen"
                  @mouseleave="triggerClose"
                >
                  <Icon name="tabler:plus" size="20" />
                </button>
              </template>
            </XTooltip>
          </div>
        </div>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-neutral-500">Preview</p>
        <div
          class="max-h-48 overflow-y-auto border border-neutral-300 rounded-md p-3 space-y-1"
          :style="selectedFont.style"
        >
          <p
            class="font-black"
            :style="{ fontSize: `${appStore.stanzaLabelFontSize}px` }"
          >
            {{ formatVerseType(previewStanza.type) }}
          </p>
          <p
            class="whitespace-pre-line"
            :style="{ fontSize: `${appStore.fontSize}px` }"
          >
            {{ previewStanza.text }}
          </p>
        </div>
      </div>
    </div>
  </dialog>
</template>
