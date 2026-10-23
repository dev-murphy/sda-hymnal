<script lang="ts" setup>
import type { HymnData } from "~/types";

withDefaults(
  defineProps<{
    // what Enter does with the hymn, shown in the key hints
    actionLabel?: string;
  }>(),
  { actionLabel: "open" },
);

const emit = defineEmits<{ select: [hymn: HymnData[number]] }>();

const appStore = useAppStore();

const dialogRef = useTemplateRef<HTMLDialogElement>("search-dialog");
const inputRef = useTemplateRef<HTMLInputElement>("search-input");
const searchText = ref("");
const debouncedSearchText = refDebounced(searchText, 200);

const plainText = (text = ""): HighlightChunk[] => [{ text, match: false }];

// each result shows the matched lyric line highlighted, like the hymn table
const searchResults = computed(() => {
  const query = debouncedSearchText.value.trim();
  if (!query) return [];

  // a plain number jumps straight to that hymn
  const byNumber = /^\d+$/.test(query)
    ? appStore.currentHymn(parseInt(query))
    : undefined;
  const matches = appStore
    .search(query)
    .filter(({ item }) => item.hymn_number !== byNumber?.hymn_number)
    .map(({ item, matches = [] }) => {
      const lyricMatch = matches.find((m) => m.key === "stanzas.text");
      const snippet = lyricMatch && getLyricSnippet(lyricMatch);
      return {
        hymn: item,
        subtitle: snippet
          ? highlightMatches(snippet.text, snippet.indices)
          : plainText(item.first_line),
      };
    });

  return [
    ...(byNumber
      ? [{ hymn: byNumber, subtitle: plainText(byNumber.first_line) }]
      : []),
    ...matches,
  ].slice(0, 8);
});

// the result ↑/↓ moves to and Enter opens
const activeResult = ref(0);
watch(searchResults, () => {
  activeResult.value = 0;
});

function moveActiveResult(step: number) {
  const count = searchResults.value.length;
  if (!count) return;
  activeResult.value = (activeResult.value + step + count) % count;
  nextTick(() =>
    document
      .getElementById(`search-result-${activeResult.value}`)
      ?.scrollIntoView({ block: "nearest" }),
  );
}

function open() {
  searchText.value = "";
  activeResult.value = 0;
  dialogRef.value?.showModal();
}

// pressed again while open, it goes back to the query
useShortcut("k", () => {
  if (dialogRef.value?.open) inputRef.value?.select();
  else open();
});

function selectResult(hymn: HymnData[number] | undefined) {
  if (!hymn) return;
  dialogRef.value?.close();
  emit("select", hymn);
}

defineExpose({ open });
</script>

<template>
  <dialog
    ref="search-dialog"
    class="w-150 max-w-[calc(100vw-2rem)] mx-auto mt-[15vh] p-0 overflow-hidden rounded-xl shadow-lg backdrop:backdrop-blur-sm"
    aria-label="Search hymns"
    @click="
      (event: MouseEvent) => event.target === dialogRef && dialogRef?.close()
    "
  >
    <div class="flex items-center gap-x-3 border-b border-neutral-300 px-5">
      <Icon name="tabler:search" size="22" class="shrink-0 text-neutral-400" />
      <input
        ref="search-input"
        v-model="searchText"
        type="text"
        autofocus
        placeholder="Search hymns"
        class="grow min-w-0 py-5 bg-transparent text-xl font-[Archivo] outline-none placeholder:text-neutral-400"
        role="combobox"
        aria-controls="search-results"
        :aria-expanded="searchResults.length > 0"
        :aria-activedescendant="
          searchResults.length ? `search-result-${activeResult}` : undefined
        "
        @keydown.down.prevent="moveActiveResult(1)"
        @keydown.up.prevent="moveActiveResult(-1)"
        @keydown.enter.prevent="selectResult(searchResults[activeResult]?.hymn)"
      />
    </div>

    <ul
      v-if="searchResults.length"
      id="search-results"
      role="listbox"
      class="max-h-80 overflow-y-auto p-2"
    >
      <li
        v-for="(result, resultIndex) in searchResults"
        :id="`search-result-${resultIndex}`"
        :key="result.hymn.hymn_number"
        role="option"
        :aria-selected="resultIndex === activeResult"
      >
        <button
          tabindex="-1"
          :class="[
            'w-full flex items-baseline gap-x-3 px-3 py-2 text-left rounded-md',
            { 'bg-accent/10': resultIndex === activeResult },
          ]"
          @click="selectResult(result.hymn)"
          @mousemove="activeResult = resultIndex"
        >
          <span class="w-10 shrink-0 text-sm text-neutral-400 tabular-nums">
            #{{ result.hymn.hymn_number }}
          </span>
          <span class="min-w-0">
            <span class="block truncate font-[Archivo]">
              {{ result.hymn.title }}
            </span>
            <span
              class="block truncate text-sm text-neutral-400 font-[Spectral]"
            >
              <HighlightText :chunks="result.subtitle" />
            </span>
          </span>
        </button>
      </li>
    </ul>
    <p
      v-else-if="debouncedSearchText.trim()"
      class="px-5 py-4 text-sm text-neutral-400"
    >
      No hymns match "{{ debouncedSearchText.trim() }}"
    </p>
    <!-- before a search: a hint over the faded logo -->
    <div
      v-else
      class="relative h-48 grid place-items-center overflow-hidden px-8 accent-wash"
    >
      <img
        src="/favicon.svg"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute size-40 opacity-[0.07] grayscale"
      />
      <p
        class="relative max-w-72 text-center text-lg text-neutral-500 font-[Archivo]"
      >
        Try typing the title, number, or lyrics you remember
      </p>
    </div>

    <!-- how to drive the menu from the keyboard -->
    <div
      class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-neutral-200 bg-neutral-50 px-5 py-2.5 text-xs text-neutral-500 font-[Archivo] select-none"
    >
      <span class="flex items-center gap-x-1.5">
        <kbd class="search-key"><Icon name="tabler:arrow-up" size="12" /></kbd>
        <kbd class="search-key"><Icon name="tabler:arrow-down" size="12" /></kbd>
        to navigate
      </span>
      <span class="flex items-center gap-x-1.5">
        <kbd class="search-key">
          <Icon name="tabler:corner-down-left" size="12" />
        </kbd>
        to {{ actionLabel }}
      </span>
      <span class="flex items-center gap-x-1.5">
        <!-- Tabler has no Escape icon -->
        <kbd class="search-key px-1.5">esc</kbd>
        to close
      </span>
    </div>
  </dialog>
</template>

<style scoped>
@reference "tailwindcss";
.search-key {
  @apply min-w-5 h-5 inline-grid place-items-center border border-neutral-300 bg-white text-[11px] text-neutral-600 shadow-xs rounded;
}
</style>
