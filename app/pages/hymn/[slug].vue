<script lang="ts" setup>
import type { Option } from "~/types";

const appStore = useAppStore();
const route = useRoute();

const getHymnNo = computed(() => {
  const routeSegments = route.fullPath.split("/")[2]!.split("-");
  return routeSegments[0] ? parseInt(routeSegments[0]) : NaN;
});

appStore.setCurrentlyPlayedHymns(getHymnNo.value);
appStore.addRecentlyViewed(getHymnNo.value);

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

// Sticky header collapse: 0 = expanded, 1 = compact
const HEADER_PADDING = { expanded: 20, compact: 12 };
const TITLE_FONT_SIZE = { expanded: 36, compact: 20 };
const TITLE_LINE_HEIGHT = 1.2;
const BACK_BUTTON_SIZE = 28; // h-7, the tallest item in the compact row
const COMPACT_HEADER_HEIGHT =
  HEADER_PADDING.compact * 2 +
  Math.max(TITLE_FONT_SIZE.compact * TITLE_LINE_HEIGHT, BACK_BUTTON_SIZE) +
  1; // border-b
// Pages with barely any scroll skip the animation — it would just snap.
const MIN_COLLAPSE_DISTANCE = 20;

const pageRef = useTemplateRef<HTMLElement>("page");
const navRef = useTemplateRef<HTMLElement>("nav");
const headerRef = useTemplateRef<HTMLElement>("header");
const hymnNoRef = useTemplateRef<HTMLElement>("hymnNo");
const pillsRef = useTemplateRef<HTMLElement>("pills");

const { height: pageHeight } = useElementSize(pageRef, undefined, {
  box: "border-box",
});
const { height: navHeight } = useElementSize(navRef, undefined, {
  box: "border-box",
});
const { height: headerHeight } = useElementSize(headerRef, undefined, {
  box: "border-box",
});
const { width: hymnNoWidth } = useElementSize(hymnNoRef);
const { height: pillsHeight } = useElementSize(pillsRef, undefined, {
  box: "border-box",
});
const { height: windowHeight } = useWindowSize();

// The sticky wrapper keeps the expanded height in the layout while the header
// inside it shrinks. If the layout shrank too, content below would shift up,
// the browser would correct scrollY (scroll anchoring), and the collapse would
// fight the scroll position — that's the jitter.
const expandedHeaderHeight = ref(0);

// Collapse over the scroll it takes for the audio player row to reach the
// bottom of the compact header: the nav row scrolling away plus the space the
// header gives up. That way the blank gap closes exactly as the header
// finishes collapsing.
const fullCollapseDistance = computed(() =>
  expandedHeaderHeight.value
    ? navHeight.value + expandedHeaderHeight.value - COMPACT_HEADER_HEIGHT
    : 0,
);

// Short hymns that scroll a little, but not the full distance, get extra
// room at the bottom so the header can still collapse completely.
const runwayRef = useTemplateRef<HTMLElement>("runway");
const maxScroll = ref(0);
const naturalMaxScroll = ref(0);
watchEffect(
  () => {
    // re-measure whenever the page or viewport resizes
    void pageHeight.value;
    void windowHeight.value;
    if (import.meta.server) return;
    const de = document.documentElement;
    maxScroll.value = de.scrollHeight - de.clientHeight;
    naturalMaxScroll.value =
      maxScroll.value - (runwayRef.value?.offsetHeight ?? 0);
  },
  { flush: "post" },
);
const scrollRunway = computed(() =>
  naturalMaxScroll.value >= MIN_COLLAPSE_DISTANCE
    ? Math.max(fullCollapseDistance.value - naturalMaxScroll.value, 0)
    : 0,
);

const collapseDistance = computed(() =>
  Math.min(fullCollapseDistance.value, maxScroll.value),
);

const collapse = computed(() =>
  collapseDistance.value >= MIN_COLLAPSE_DISTANCE
    ? Math.min(Math.max(scrollY.value / collapseDistance.value, 0), 1)
    : 0,
);

const lerp = (from: number, to: number, t = collapse.value) =>
  from + (to - from) * t;

watchEffect(() => {
  if (collapse.value === 0 && headerHeight.value) {
    expandedHeaderHeight.value = headerHeight.value;
  }
});
const headerWrapperStyle = computed(() =>
  expandedHeaderHeight.value
    ? { height: `${expandedHeaderHeight.value}px` }
    : {},
);

const headerStyle = computed(() => ({
  paddingTop: `${lerp(HEADER_PADDING.expanded, HEADER_PADDING.compact)}px`,
  paddingBottom: `${lerp(HEADER_PADDING.expanded, HEADER_PADDING.compact)}px`,
}));

// Title slides right during the first half and rises beside the hymn number
// during the second, so the two never overlap mid-collapse
const slideProgress = computed(() => Math.min(collapse.value * 2, 1));
const riseProgress = computed(() => Math.max(collapse.value * 2 - 1, 0));

// hymn number: text-sm (20px line) — centers within the compact row
const hymnNoStyle = computed(() => ({
  top: `${lerp(0, (TITLE_FONT_SIZE.compact * TITLE_LINE_HEIGHT - 20) / 2, riseProgress.value)}px`,
}));

const titleStyle = computed(() => ({
  fontSize: `${lerp(TITLE_FONT_SIZE.expanded, TITLE_FONT_SIZE.compact)}px`,
  lineHeight: TITLE_LINE_HEIGHT,
  paddingTop: `${lerp(20, 0, riseProgress.value)}px`,
  paddingLeft: `${lerp(0, hymnNoWidth.value + 12, slideProgress.value)}px`,
}));

// Back + Present buttons fade into the compact header (the nav row has
// scrolled away by then)
const compactActionStyle = computed(() => ({
  opacity: collapse.value,
  visibility: collapse.value === 0 ? ("hidden" as const) : undefined,
}));
const backStyle = computed(() => ({
  ...compactActionStyle.value,
  width: `${lerp(0, BACK_BUTTON_SIZE)}px`,
  marginRight: `${lerp(0, 8)}px`,
}));

const pillsStyle = computed(() => {
  // leave layout untouched until measured (SSR / first paint)
  if (collapse.value === 0 || !pillsHeight.value) return {};
  return {
    height: `${lerp(pillsHeight.value, 0)}px`,
    opacity: 1 - collapse.value,
    transform: `scale(${lerp(1, 0.6)})`,
    visibility: collapse.value === 1 ? ("hidden" as const) : undefined,
  };
});

onUnmounted(() => {
  appStore.setCurrentlyPlayedHymns(null);
});

const author = computed(() => {
  return hymn.value?.author ? " by " + hymn.value.author : "";
});

useSeoMeta({
  title: () => `${hymn.value?.hymn_number} - ${hymn.value?.title} | SDA Hymnal`,
  description: () =>
    `Read the lyrics of hymn #${hymn.value?.hymn_number}, ${hymn.value?.title}${author.value} - SDA Hymnal`,
  ogTitle: () =>
    `${hymn.value?.hymn_number} - ${hymn.value?.title} | SDA Hymnal`,
  ogDescription: () =>
    `Read the lyrics of hymn #${hymn.value?.hymn_number}, ${hymn.value?.title}${author.value} - SDA Hymnal`,
});

defineOgImage("Hymn.takumi", {
  number: hymn.value?.hymn_number,
  title: hymn.value?.title,
  firstLine: hymn.value?.first_line,
});
</script>

<template>
  <div v-if="hymn" ref="page" class="min-h-screen flex flex-col">
    <div ref="nav" class="pt-5">
      <div class="w-full max-w-5xl mx-auto">
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
              :to="`${getHymnNo - 1}-${slugify(appStore.previousHymn(getHymnNo)?.title)}`"
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
              Present <Icon name="tabler:arrows-diagonal" size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="sticky top-0 z-30 pointer-events-none"
      :style="headerWrapperStyle"
    >
      <div
        ref="header"
        class="pointer-events-auto bg-white border-b border-neutral-300"
        :style="headerStyle"
      >
        <div class="w-full max-w-5xl mx-auto">
          <div class="flex items-center">
            <NuxtLink
              to="/"
              class="shrink-0 grid place-items-center h-7 overflow-hidden border border-neutral-300 rounded-md"
              aria-label="All Hymns"
              :style="backStyle"
            >
              <Icon name="tabler:arrow-left" size="16" />
            </NuxtLink>

            <div class="relative min-w-0 flex-1">
              <p
                ref="hymnNo"
                class="absolute left-0 w-max text-sm text-neutral-400"
                :style="hymnNoStyle"
              >
                Hymn #{{ String(hymn.hymn_number).padStart(3, "0") }}
              </p>
              <h1 :class="{ truncate: collapse > 0 }" :style="titleStyle">
                {{ hymn.title }}
              </h1>
            </div>

            <button
              class="shrink-0 w-fit flex items-center gap-x-2 px-2 py-0.5 ml-2 text-sm border border-neutral-200 rounded-md"
              :style="compactActionStyle"
            >
              Present <Icon name="tabler:arrows-diagonal" size="16" />
            </button>
          </div>

          <div
            class="origin-top-left overflow-hidden"
            :style="pillsStyle"
            :aria-hidden="collapse === 1"
          >
            <div
              ref="pills"
              class="flex flex-wrap items-center gap-1 pt-2 text-xs"
            >
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
    </div>

    <div class="flex items-center justify-between py-2">
      <div class="w-full max-w-5xl flex items-center justify-between mx-auto">
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

          <!-- Font Size -->
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
                  <Icon name="tabler:plus" size="20" />
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
                    @change="onFontSizeChange"
                    @keydown.enter="($event.target as HTMLInputElement).blur()"
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
                  <Icon name="tabler:minus" size="20" />
                </button>
              </template>
            </XTooltip>
          </div>
        </div>
      </div>
    </div>

    <div
      class="stanza w-full max-w-5xl grow space-y-4 mx-auto"
      :style="selectedFont.style"
    >
      <div
        v-for="(stanza, index) in expandedHymns"
        :key="`${hymn.hymn_number}-verse-${index}`"
        class="space-y-1"
      >
        <p
          class="font-black"
          :style="{ fontSize: `${appStore.stanzaLabelFontSize}px` }"
        >
          {{ formatVerseType(stanza.type) }}
        </p>
        <p
          class="whitespace-pre"
          :style="{ fontSize: `${appStore.fontSize}px` }"
        >
          {{ stanza.text }}
        </p>
      </div>
    </div>

    <div
      ref="runway"
      aria-hidden="true"
      class="shrink-0"
      :style="{ height: `${scrollRunway}px` }"
    />

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
        class="w-full max-w-310 flex items-center justify-between p-2 mx-auto"
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
            <span class="flex items-center justify-end gap-x-0.5 -mb-1 text-sm">
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
