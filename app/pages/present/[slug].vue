<script lang="ts" setup>
const appStore = useAppStore();
const route = useRoute();

const hymnNo = computed(() => parseInt(String(route.params.slug)));
const hymn = computed(() =>
  isNaN(hymnNo.value) ? undefined : appStore.currentHymn(hymnNo.value),
);
if (!hymn.value) {
  throw createError({ statusCode: 404, statusMessage: "Hymn not found" });
}

appStore.setCurrentlyPlayedHymns(hymnNo.value);
appStore.addRecentlyViewed(hymnNo.value);

onUnmounted(() => {
  // the next hymn's page can mount before this one unmounts
  if (appStore.selectedHymn === hymnNo.value) {
    appStore.setCurrentlyPlayedHymns(null);
  }
});

const hymnPath = (number: number, title?: string) =>
  `${number}-${slugify(title)}`;

function goToHymn(target: HymnData[number] | undefined) {
  if (!target) return;
  navigateTo(`/present/${hymnPath(target.hymn_number, target.title)}`, {
    replace: true,
  });
}

const previousHymn = computed(() => appStore.previousHymn(hymnNo.value));
const nextHymn = computed(() => appStore.nextHymn(hymnNo.value));

function exitPresentation() {
  if (!hymn.value) return navigateTo("/");
  navigateTo(`/hymn/${hymnPath(hymn.value.hymn_number, hymn.value.title)}`);
}

const {
  sequence,
  index,
  current,
  hasPrevious,
  hasNext,
} = usePresentation(hymn);

// Typography is set in the settings modal, independent of the hymn page
const stageRef = useTemplateRef<HTMLElement>("stage");
const measureRef = useTemplateRef<HTMLElement>("measure");

const { fittedSize, measuredStanza } = useFitFontSize({
  stage: stageRef,
  measure: measureRef,
  stanzas: sequence,
  fontFamily: () => appStore.presentation.fontFamily,
  // a manual size is checked against the whole stage to tell when it overflows
  heightScale: () =>
    appStore.presentation.autoFit ? appStore.presentation.fitScale / 100 : 1,
  min: PRESENTATION_FONT_SIZE.min,
  max: PRESENTATION_FONT_SIZE.max,
});

// switching to a manual size starts from the size that was showing
watch(
  () => appStore.presentation.autoFit,
  (autoFit) => {
    if (!autoFit && fittedSize.value !== null) {
      appStore.setPresentationFontSize(fittedSize.value);
    }
  },
);

const fontSize = computed(() =>
  appStore.presentation.autoFit
    ? fittedSize.value
    : appStore.presentation.fontSize,
);

// a manual size larger than the fitted one may not fit; the stage scrolls then
const isOversized = computed(
  () =>
    !appStore.presentation.autoFit &&
    fittedSize.value !== null &&
    appStore.presentation.fontSize > fittedSize.value,
);

const lyricsStyle = computed(() => ({
  fontFamily: toFontFamily(
    FONTS.find((font) => font.name === appStore.presentation.fontFamily) ??
      FONTS[0]!,
  ),
  fontSize: fontSize.value === null ? undefined : `${fontSize.value}px`,
}));

// Synced lyrics: follow the audio line by line when the hymn has timestamps
const playerRef = useTemplateRef<{ seek: (time: number) => void }>("player");
const playbackTime = ref(0);

const { isSynced, activeLine, activeStanza, startOf } = useLyricSync(
  sequence,
  () => hymn.value?.timestamps,
  playbackTime,
);

// auto-advance as the next stanza comes up
watch(activeStanza, (stanza) => {
  if (stanza !== null) index.value = stanza;
});

// once playback has started, the sung line is lit and the rest dimmed
const isHighlighting = computed(() => isSynced.value && playbackTime.value > 0);

function lineClass(line: number) {
  if (!isHighlighting.value) return undefined;
  const isActive =
    activeLine.value?.stanza === index.value && activeLine.value.line === line;
  return isActive ? "accent-gradient-text" : "text-neutral-300";
}

function seekTo(time: number | undefined) {
  if (time !== undefined) playerRef.value?.seek(Math.max(time, 0));
}

// moving by hand moves the audio too, otherwise the sync would pull it back
function goToStanza(target: number) {
  if (target < 0 || target >= sequence.value.length) return;
  index.value = target;
  // a moment early so the first word isn't clipped
  if (isSynced.value) seekTo((startOf(target) ?? 0) - 0.5);
}

const previousStanza = () => goToStanza(index.value - 1);
const nextStanza = () => goToStanza(index.value + 1);

function seekToLine(line: number) {
  if (isSynced.value) seekTo(startOf(index.value, line));
}

// Audio goes through the shared AudioPlayer / store playback state
function togglePlayback() {
  if (!hymn.value?.filename) return;
  appStore.setIsPlaying(!appStore.isPlaying);
}

// Search
const searchRef = useTemplateRef<{ open: () => void }>("search");
// the dialog handles ⌘K itself; this is only the tooltip label
const { label: searchShortcut } = useShortcut("k");
const { label: settingsShortcut } = useShortcut(",");

function selectSearchResult(result: HymnData[number]) {
  if (result.hymn_number !== hymnNo.value) goToHymn(result);
}

// Keyboard
useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
    return;
  if (isTypingTarget(event.target)) return;
  // the search and settings dialogs handle their own keys (Escape closes them)
  if (document.querySelector("dialog[open]")) return;

  switch (event.key) {
    case " ":
      // also stops a focused toolbar button from being clicked
      event.preventDefault();
      if (!event.repeat) togglePlayback();
      break;
    case "ArrowLeft":
      event.preventDefault();
      previousStanza();
      break;
    case "ArrowRight":
      event.preventDefault();
      nextStanza();
      break;
    case "Escape":
      exitPresentation();
      break;
  }
});

useSeoMeta({
  title: () =>
    `Presenting ${hymn.value?.hymn_number} - ${hymn.value?.title} | SDA Hymnal`,
});
</script>

<template>
  <div v-if="hymn" class="h-dvh flex flex-col bg-white">
    <!-- Toolbar -->
    <header
      class="shrink-0 flex flex-wrap items-center gap-2 border-b border-neutral-300 px-4 py-2 text-sm"
    >
      <XTooltip text="Exit (Esc)" direction="bottom" alignment="left">
        <template #default="{ triggerOpen, triggerClose }">
          <button
            class="grid place-items-center border border-neutral-300 hover:border-accent p-1 transition-colors rounded-md"
            aria-label="Exit presentation"
            @click="exitPresentation"
            @mouseenter="triggerOpen"
            @mouseleave="triggerClose"
          >
            <Icon name="tabler:arrow-left" size="16" />
          </button>
        </template>
      </XTooltip>

      <h1 class="min-w-0 truncate font-[Archivo]">
        <span class="text-neutral-400">#{{ hymn.hymn_number }}</span>
        {{ hymn.title }}
      </h1>

      <div class="flex flex-wrap items-center gap-2 ml-auto">
        <XTooltip :text="`Search hymns (${searchShortcut})`" direction="bottom">
          <template #default="{ triggerOpen, triggerClose }">
            <button
              class="grid place-items-center border border-neutral-300 hover:border-accent p-1 transition-colors rounded-md"
              aria-label="Search hymns"
              @click="
                () => {
                  triggerClose();
                  searchRef?.open();
                }
              "
              @mouseenter="triggerOpen"
              @mouseleave="triggerClose"
            >
              <Icon name="tabler:search" size="16" />
            </button>
          </template>
        </XTooltip>

        <div
          class="flex items-center border border-neutral-300 divide-x divide-neutral-200 rounded-md"
        >
          <XTooltip text="Previous hymn" direction="bottom">
            <template #default="{ triggerOpen, triggerClose }">
              <button
                class="grid place-items-center p-1 disabled:opacity-40"
                aria-label="Previous hymn"
                :disabled="!previousHymn"
                @click="goToHymn(previousHymn)"
                @mouseenter="triggerOpen"
                @mouseleave="triggerClose"
              >
                <Icon name="tabler:player-skip-back" size="16" />
              </button>
            </template>
          </XTooltip>
          <XTooltip text="Next hymn" direction="bottom">
            <template #default="{ triggerOpen, triggerClose }">
              <button
                class="grid place-items-center p-1 disabled:opacity-40"
                aria-label="Next hymn"
                :disabled="!nextHymn"
                @click="goToHymn(nextHymn)"
                @mouseenter="triggerOpen"
                @mouseleave="triggerClose"
              >
                <Icon name="tabler:player-skip-forward" size="16" />
              </button>
            </template>
          </XTooltip>
        </div>

        <XTooltip
          :text="`Settings (${settingsShortcut})`"
          direction="bottom"
          alignment="right"
        >
          <template #default="{ triggerOpen, triggerClose }">
            <button
              command="show-modal"
              commandfor="settings-dialog"
              class="grid place-items-center border border-neutral-300 hover:border-accent p-1 transition-colors rounded-md"
              aria-label="Settings"
              @mouseenter="triggerOpen"
              @mouseleave="triggerClose"
              @click="triggerClose"
            >
              <Icon name="tabler:settings" size="16" />
            </button>
          </template>
        </XTooltip>
      </div>
    </header>

    <!-- Lyrics -->
    <main
      ref="stage"
      :class="[
        'relative grow min-h-0 flex px-6 py-6 sm:px-12 accent-wash',
        isOversized ? 'overflow-auto' : 'overflow-hidden',
      ]"
      :style="lyricsStyle"
    >
      <div
        v-if="current"
        :key="index"
        :class="[
          'm-auto max-w-full text-center leading-[1.3]',
          { invisible: fittedSize === null },
        ]"
        :aria-label="formatVerseType(current.type)"
        aria-live="polite"
      >
        <p class="mb-[0.4em] text-[0.35em] text-neutral-400 font-[Archivo]">
          {{ formatVerseType(current.type) }}
        </p>
        <p>
          <span
            v-for="(line, lineIndex) in current.text.split('\n')"
            :key="lineIndex"
            :class="[
              'block w-fit mx-auto whitespace-pre-wrap transition-colors duration-300',
              lineClass(lineIndex),
              { 'cursor-pointer': isSynced },
            ]"
            @click="seekToLine(lineIndex)"
            >{{ line || "\u00a0" }}</span
          >
        </p>
      </div>
      <p v-else class="m-auto text-base text-neutral-400">
        This hymn has no lyrics to present.
      </p>

      <!-- same markup as above, for useFitFontSize to measure; never shown -->
      <div
        ref="measure"
        aria-hidden="true"
        class="invisible pointer-events-none absolute top-0 left-0 h-0 overflow-hidden text-center leading-[1.3]"
      >
        <template v-if="measuredStanza">
          <p class="mb-[0.4em] text-[0.35em] font-[Archivo]">
            {{ formatVerseType(measuredStanza.type) }}
          </p>
          <p>
            <span
              v-for="(line, lineIndex) in measuredStanza.text.split('\n')"
              :key="lineIndex"
              class="block whitespace-pre-wrap"
              >{{ line || "\u00a0" }}</span
            >
          </p>
        </template>
      </div>
    </main>

    <!-- Stanza navigation + audio -->
    <footer
      class="shrink-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-neutral-300 px-4 py-1"
    >
      <div class="flex items-center gap-x-2 text-sm font-[Archivo]">
        <XTooltip text="Previous stanza (←)">
          <template #default="{ triggerOpen, triggerClose }">
            <button
              class="grid place-items-center bg-black/10 p-2 disabled:text-neutral-400 rounded-full"
              aria-label="Previous stanza"
              :disabled="!hasPrevious"
              @click="previousStanza"
              @mouseenter="triggerOpen"
              @mouseleave="triggerClose"
            >
              <Icon name="tabler:chevron-left" size="14" />
            </button>
          </template>
        </XTooltip>
        <span class="tabular-nums" aria-live="polite">
          {{ sequence.length ? index + 1 : 0 }} / {{ sequence.length }}
        </span>
        <XTooltip text="Next stanza (→)">
          <template #default="{ triggerOpen, triggerClose }">
            <button
              class="grid place-items-center bg-black/10 p-2 disabled:text-neutral-400 rounded-full"
              aria-label="Next stanza"
              :disabled="!hasNext"
              @click="nextStanza"
              @mouseenter="triggerOpen"
              @mouseleave="triggerClose"
            >
              <Icon name="tabler:chevron-right" size="14" />
            </button>
          </template>
        </XTooltip>
      </div>

      <AudioPlayer
        ref="player"
        :hymn="hymn"
        type="inline"
        class="max-w-full"
        hide-title
        hide-extra-controls
        manual-play
        @timeupdate="playbackTime = $event"
      />
    </footer>

    <HymnSearchDialog
      ref="search"
      action-label="present"
      @select="selectSearchResult"
    />
  </div>
</template>

