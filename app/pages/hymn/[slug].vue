<script lang="ts" setup>
import type { Option } from "~/types";

const appStore = useAppStore();
const route = useRoute();

const getHymnNo = computed(() => {
  const routeSegments = route.fullPath.split("/")[2]!.split("-");
  return routeSegments[0] ? parseInt(routeSegments[0]) : NaN;
});

appStore.setCurrentlyPlayedHymns(getHymnNo.value);

const hymn = computed(() => {
  if (isNaN(getHymnNo.value)) {
    createError("Page Not Found");
    return;
  }

  return appStore.currentHymn(getHymnNo.value);
});

const expandedHymns = computed(() => {
  const stanzas = hymn.value?.stanzas;
  if (!stanzas) return [];
  const refrain = stanzas.find((stanza) => stanza.type === "REFRAIN");

  if (!refrain) return stanzas;

  const result = [];
  for (const stanza of stanzas) {
    if (stanza.type === "REFRAIN") continue;
    result.push(stanza);
    if (stanza.type.startsWith("VERSE")) result.push(refrain);
  }
  return result;
});

const fontOptions: Option<string>[] = FONTS.map((font) => ({
  name: font.name,
  value: font.name,
  style: { fontFamily: toFontFamily(font) },
}));

const selectedFont = computed({
  get: () =>
    fontOptions.find((font) => font.value === appStore.fontFamily) ??
    fontOptions[0]!,
  set: (font: Option<string>) => appStore.setFontFamily(font.value),
});

const onFontSizeChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  appStore.setFontSize(parseFloat(input.value));
  // reset the field in case the value was clamped or invalid
  input.value = String(appStore.fontSize);
};

const { y: scrollY } = useWindowScroll({ behavior: "smooth" });

function scrollToTop() {
  scrollY.value = 0;
}

onUnmounted(() => {
  appStore.setCurrentlyPlayedHymns(null);
});
</script>

<template>
  <div v-if="hymn" class="h-screen">
    <div class="border-b border-neutral-300 py-5">
      <div class="w-full max-w-[1024px] space-y-5 mx-auto">
        <div class="flex">
          <NuxtLink
            to="/"
            class="w-fit flex items-center gap-x-1 border border-neutral-300 px-2 p-0.5 text-sm rounded-md"
          >
            <Icon name="tabler:arrow-left" size="16" />
            All Hymns
          </NuxtLink>
    
          <div class="flex items-center gap-x-2 text-sm ml-auto">
            <NuxtLink
              v-if="appStore.previousHymn(getHymnNo)"
              :to="`${getHymnNo - 1}-${slugify(appStore.nextHymn(getHymnNo)?.title)}`"
              class="w-fit flex items-center gap-x-2 px-2 py-0.5 border border-neutral-200 rounded-md"
            >
              <Icon name="tabler:arrow-left" size="16" />
              #{{ hymn.hymn_number - 1 }}
            </NuxtLink>
            <NuxtLink
              v-if="appStore.nextHymn(getHymnNo)"
              :to="`${getHymnNo + 1}-${slugify(appStore.nextHymn(getHymnNo)?.title)}`"
              class="w-fit flex items-center gap-x-2 px-2 py-0.5 border border-neutral-200 rounded-md"
            >
              #{{ hymn.hymn_number + 1
              }}<Icon name="tabler:arrow-right" size="16"
            /></NuxtLink>
            <button
              class="w-fit flex items-center gap-x-2 px-2 py-0.5 border border-neutral-200 rounded-md"
            >
              Present <Icon name="tabler:arrows-diagonal" size="16"
            /></button>
          </div>
        </div>
        
        <div>
          <p class="text-sm text-neutral-400">Hymn #{{ String(hymn.hymn_number).padStart(3, "0") }}</p>
          <h1 class="text-4xl">{{ hymn.title }}</h1>
    
          <div class="flex items-center gap-x-1 pt-2 text-xs">
            <span
              v-if="hymn.key"
              class="bg-neutral-200 py-1.5 px-3 rounded-full"
              >{{ hymn.key }}</span
            >
            <div class="w-fit flex items-center bg-neutral-200 rounded-full">
              <p class="py-1.5 px-3">{{ hymn.category }}</p>
              <p
                v-if="hymn.subcategory"
                :class="[
                  'py-1.5 px-3',
                  { 'border-l border-white': hymn.subcategory },
                ]"
              >
                {{ hymn.subcategory }}
              </p>
            </div>
            <div class="w-fit flex items-center bg-neutral-200 rounded-full">
              <XTooltip v-if="hymn.author" text="Author">
                <template #default="{ triggerOpen, triggerClose }">
                  <p
                    class="py-1.5 px-3"
                    @mouseenter="triggerOpen"
                    @mouseleave="triggerClose"
                  >
                    {{ hymn.author }}
                  </p>
                </template>
              </XTooltip>
              <XTooltip v-if="hymn.composer" text="Composer">
                <template #default="{ triggerOpen, triggerClose }">
                  <p
                    :class="[
                      'py-1.5 px-3',
                      {
                        'border-l border-white': hymn.composer && hymn.author,
                      },
                    ]"
                    @mouseenter="triggerOpen"
                    @mouseleave="triggerClose"
                  >
                    {{ hymn.composer }}
                  </p>
                </template>
              </XTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="flex items-center justify-between py-2">
      <div class="w-full max-w-[1024px] flex items-center justify-between mx-auto">
        <AudioPlayer
          :hymn="hymn"
          type="inline"
          hide-title
          hide-extra-controls
          manual-play
        />
        <div class="flex items-center gap-x-2">
          <XDropdown
            id="font-family"
            v-model="selectedFont"
            :options="fontOptions"
            alignment="right"
            text-styles="text-left text-sm"
            is-searchable
            search-input-placeholder="Search fonts"
          />
          <XTooltip text="Font decrease">
            <template #default="{ triggerOpen, triggerClose }">
              <button
                class="grid place-items-center p-1.5 border border-neutral-300 rounded-lg disabled:opacity-40"
                :disabled="appStore.fontSize <= 12"
                aria-label="Decrease font size"
                @click="appStore.decreaseFontSize()"
                @mouseenter="triggerOpen"
                @mouseleave="triggerClose"
              >
                <Icon name="tabler:text-decrease" size="20" />
              </button>
            </template>
          </XTooltip>
          <label class="flex items-center gap-x-1 px-2 py-1 border border-neutral-300 rounded-lg text-sm">
            <input
              :value="appStore.fontSize"
              type="number"
              min="12"
              max="48"
              class="w-8 text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Font size"
              @change="onFontSizeChange"
              @keydown.enter="($event.target as HTMLInputElement).blur()"
            />
            <span class="text-neutral-400">px</span>
          </label>
          <XTooltip text="Font increase">
            <template #default="{ triggerOpen, triggerClose }">
              <button
                class="grid place-items-center p-1.5 border border-neutral-300 rounded-lg disabled:opacity-40"
                :disabled="appStore.fontSize >= 48"
                aria-label="Increase font size"
                @click="appStore.increaseFontSize()"
                @mouseenter="triggerOpen"
                @mouseleave="triggerClose"
              >
                <Icon name="tabler:text-increase" size="20" />
              </button>
            </template>
          </XTooltip>
        </div>
      </div>
    </div>

    <div
      class="stanza w-full max-w-[1024px] grow space-y-4 overflow-y-auto mx-auto"
      :style="selectedFont.style"
    >
      <div
        v-for="(stanza, index) in expandedHymns"
        :key="`${hymn.hymn_number}-verse-${index}`"
        class="space-y-1"
      >
        <p class="font-black" :style="{ fontSize: `${appStore.stanzaLabelFontSize}px` }">{{ formatVerseType(stanza.type) }}</p>
        <p class="whitespace-pre" :style="{ fontSize: `${appStore.fontSize}px` }">{{ stanza.text }}</p>
      </div>
    </div>

    <Transition name="fade">
      <button
        v-if="scrollY > 200"
        class="fixed bottom-20 right-6 z-50 grid place-items-center p-2 bg-white border border-neutral-300 shadow-md rounded-full"
        aria-label="Scroll to top"
        @click="scrollToTop"
      >
        <Icon name="tabler:arrow-up" size="20" />
      </button>
    </Transition>

    <div
      class="sticky bottom-0 bg-white flex items-center justify-between mt-2 border-t border-neutral-300"
    >
      <div
        class="w-full max-w-[1240px] flex items-center justify-between p-2 mx-auto"
      >
        <NuxtLink
          v-if="appStore.previousHymn(getHymnNo)"
          :to="`${getHymnNo - 1}-${slugify(appStore.previousHymn(getHymnNo)?.title)}`"
          class="cursor-pointer"
        >
          <p class="w-max flex flex-col">
            <span class="flex items-center gap-x-0.5 -mb-1 text-sm">
              <Icon name="tabler:arrow-left" size="14" />
              Previous
            </span>
            <span class="text-xl">{{
              appStore.previousHymn(getHymnNo)?.title
            }}</span>
          </p>
        </NuxtLink>
        <NuxtLink
          v-if="appStore.nextHymn(getHymnNo)"
          :to="`${getHymnNo + 1}-${slugify(appStore.nextHymn(getHymnNo)?.title)}`"
          class="cursor-pointer ml-auto"
        >
          <p class="w-max flex flex-col">
            <span
              class="flex items-center justify-end gap-x-0.5 -mb-1 text-sm"
            >
              Next
              <Icon name="tabler:arrow-right" size="14" />
            </span>
            <span class="text-xl">{{
              appStore.nextHymn(getHymnNo)?.title
            }}</span>
          </p>
        </NuxtLink>
      </div>
    </div>
   
  </div>
</template>
