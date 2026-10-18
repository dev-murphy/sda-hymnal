<script lang="ts" setup>
import type { FuseResult } from "fuse.js";
import type { Option, HymnData } from "~/types";

const appStore = useAppStore();

function setSort(sort: string) {
  if (appStore.paginate.sort === sort) {
    const order = appStore.paginate.order === "asc" ? "desc" : "asc";
    appStore.setSort(sort, order);
    return;
  }

  appStore.setSort(sort, "asc");
}

// "Viewed" times are relative to when the rows last changed (load, sort,
// page, filter, search), not a live clock
const now = ref(new Date());

const selected = computed({
  get: () =>
    PER_PAGE_OPTIONS.find((o) => o.value === appStore.paginate.limit) ??
    PER_PAGE_OPTIONS[0]!,
  set: (option: Option<number>) => appStore.setLimit(option.value),
});

watch(
  () => appStore.paginate.limit,
  () => {
    scrollToTop();
    appStore.paginate.currentPage = 1;
  },
);

function menuFor(hymnNo: number): Option<string>[] {
  return [
    {
      name: "Present",
      value: "present",
      icon: { name: "tabler:presentation", size: "16" },
    },
    appStore.isFavorite(hymnNo)
      ? {
          name: "Unlike",
          value: "favorite",
          icon: { name: "tabler:heart-off", size: "16" },
        }
      : {
          name: "Like",
          value: "favorite",
          icon: { name: "tabler:heart", size: "16" },
        },
    {
      name: "Share",
      value: "share",
      icon: { name: "tabler:share", size: "16" },
    },
  ];
}
// the menu is an action list, so nothing is ever shown as selected
const noMenuSelection: Option<string> = { name: "", value: "" };

function handleMenuAction(option: Option<string>, hymnNo: number) {
  if (option.value === "favorite") appStore.toggleFavorite(hymnNo);
}

const hymnTableRef = ref<HTMLElement | null>();
const hasReachedEnd = ref(false);
const atBeginnning = ref(true);
function handleScroll() {
  const element = hymnTableRef.value;
  if (!element) return;

  if (element.scrollTop > 20) {
    atBeginnning.value = false;
  } else {
    atBeginnning.value = true;
  }

  hasReachedEnd.value =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
}

function scrollToTop() {
  if (hymnTableRef.value) {
    hymnTableRef.value.scrollTop = 0;
  }
}

// Only run Fuse once typing pauses for 250ms
const debouncedSearchText = refDebounced(toRef(appStore, "searchText"), 250);
const searchedHymns = computed<FuseResult<HymnData[number]>[]>(() =>
  debouncedSearchText.value ? appStore.search(debouncedSearchText.value) : [],
);

const plainText = (text = ""): HighlightChunk[] => [{ text, match: false }];

const rows = computed(() => {
  if (appStore.searchText && searchedHymns.value.length > 0) {
    return searchedHymns.value.map(({ item, matches = [] }) => {
      const lyricMatch = matches.find((m) => m.key === "stanzas.text");
      const snippet = lyricMatch && getLyricSnippet(lyricMatch);

      return {
        hymn: item,
        subtitle: snippet
          ? highlightMatches(snippet.text, snippet.indices)
          : plainText(item.first_line),
      };
    });
  }

  return appStore.renderredPages.map((hymn) => ({
    hymn,
    subtitle: plainText(hymn?.first_line),
  }));
});

watch(rows, () => {
  now.value = new Date();
});
</script>

<template>
  <!-- Desktop Table -->
  <div class="w-full max-w-310 mx-auto">
    <p
      v-if="appStore.selectedCategory"
      class="w-fit flex items-center gap-x-1 border border-neutral-300 mb-2 px-2 py-0.5 rounded-full"
      @click="appStore.setCategory('')"
    >
      {{ appStore.selectedCategory }} <Icon name="tabler:x" size="15" />
    </p>

    <div class="relative">
      <div
        ref="hymnTableRef"
        class="h-150.5 border border-neutral-200 rounded-xl overflow-y-auto scroll-smooth"
        @scroll="handleScroll"
      >
        <table class="w-full table-fixed front-[Spectral] border-collapse">
          <thead class="font-[Archivo] sticky top-0 z-10">
            <tr class="bg-neutral-100 text-left">
              <th class="w-20 py-2">
                <div
                  class="flex items-center justify-center gap-x-1 select-none"
                  @click="setSort('number')"
                >
                  No.
                  <SortIndicator
                    :is-sorted="appStore.paginate.sort !== 'number'"
                    :order="appStore.paginate.order"
                  />
                </div>
              </th>
              <th>
                <div class="flex gap-x-1 select-none" @click="setSort('title')">
                  Title
                  <SortIndicator
                    :is-sorted="appStore.paginate.sort !== 'title'"
                    :order="appStore.paginate.order"
                  />
                </div>
              </th>
              <th class="w-52 text-left">
                <div class="flex items-center gap-x-1 select-none">
                  {{
                    appStore.selectedCategory === ""
                      ? "Category"
                      : "Subcategory"
                  }}
                </div>
              </th>
              <th v-if="appStore.visibility.author" class="w-52">
                <div
                  class="flex items-center gap-x-1 select-none"
                  @click="setSort('author')"
                >
                  Author
                  <SortIndicator
                    :is-sorted="appStore.paginate.sort !== 'author'"
                    :order="appStore.paginate.order"
                  />
                </div>
              </th>
              <th v-if="appStore.visibility.composer" class="w-52">
                <div
                  class="flex items-center gap-x-1 select-none"
                  @click="setSort('composer')"
                >
                  Composer
                  <SortIndicator
                    :is-sorted="appStore.paginate.sort !== 'composer'"
                    :order="appStore.paginate.order"
                  />
                </div>
              </th>
              <th v-if="appStore.visibility.key" class="w-24">Key</th>
              <th v-if="appStore.paginate.filter.flags.recentlyViewed" class="w-32">
                <div
                  class="flex items-center gap-x-1 select-none"
                  @click="setSort('viewed')"
                >
                  Viewed
                  <SortIndicator
                    :is-sorted="appStore.paginate.sort !== 'viewed'"
                    :order="appStore.paginate.order"
                  />
                </div>
              </th>
              <th class="w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="({ hymn, subtitle }, index) in rows">
              <td class="text-2xl text-center font-[Spectral] font-bold">
                {{ hymn?.hymn_number }}
              </td>
              <td class="py-1.5">
                <NuxtLink
                  v-if="hymn"
                  :to="`/hymn/${hymn.hymn_number}-${slugify(hymn.title)}`"
                >
                  <div class="w-full group font-[Archivo]">
                    <span class="flex items-center gap-x-1">
                      <span class="group-hover:underline">
                        {{ hymn.title }}
                      </span>
                      <Icon
                        v-if="appStore.isFavorite(hymn.hymn_number)"
                        name="tabler:heart-filled"
                        size="14"
                        class="text-red-500"
                        aria-label="Favorited"
                      />
                    </span>
                    <span
                      class="w-[80%] block text-sm text-neutral-400 font-[Spectral] truncate"
                    >
                      <HighlightText :chunks="subtitle" />
                    </span>
                  </div>
                </NuxtLink>
              </td>
              <td>
                <button
                  v-if="!appStore.selectedCategory"
                  class="border borer-neutral-200 px-2 py-1.5 text-sm text-neutral-400 font-[Archivo] rounded-full"
                  @click="hymn && appStore.setCategory(hymn.category)"
                >
                  {{ hymn?.category }}
                </button>
                <button
                  v-else
                  class="border borer-neutral-200 px-2 py-1.5 text-sm text-neutral-400 font-[Archivo] rounded-full"
                  @click="hymn && appStore.setCategory(hymn.category)"
                >
                  {{ hymn?.subcategory }}
                </button>
              </td>
              <td v-if="appStore.visibility.author">{{ hymn?.author }}</td>
              <td v-if="appStore.visibility.composer">{{ hymn?.composer }}</td>
              <td v-if="appStore.visibility.key">
                {{ hymn?.key }}
              </td>
              <td
                v-if="appStore.paginate.filter.flags.recentlyViewed"
                class="text-sm text-neutral-500"
              >
                <time
                  v-if="hymn && appStore.recentlyViewed[hymn.hymn_number]"
                  :datetime="new Date(appStore.recentlyViewed[hymn.hymn_number]!).toISOString()"
                  :title="new Date(appStore.recentlyViewed[hymn.hymn_number]!).toLocaleString()"
                >
                  {{ timeAgo(appStore.recentlyViewed[hymn.hymn_number]!, now.getTime()) }}
                </time>
              </td>
              <td>
                <div class="flex items-center gap-x-2">
                  <XButton
                    size="sm"
                    :buttonText="
                      appStore.isPlaying &&
                      appStore.selectedHymn === hymn?.hymn_number
                        ? 'Pause'
                        : 'Play'
                    "
                    @click="appStore.togglePlayHymn(hymn!.hymn_number)"
                  >
                    <Icon
                      v-if="
                        appStore.isPlaying &&
                        appStore.selectedHymn === hymn?.hymn_number
                      "
                      name="solar:pause-bold"
                      size="14"
                      class="text-neutral-300"
                    />
                    <Icon
                      v-else
                      name="solar:play-bold"
                      size="14"
                      class="text-neutral-300"
                    />
                  </XButton>

                  <XDropdown
                    id="hymn-menu"
                    :model-value="noMenuSelection"
                    :options="menuFor(hymn!.hymn_number)"
                    @update:model-value="handleMenuAction($event, hymn!.hymn_number)"
                    alignment="right"
                    text-styles="text-left text-neutral-600 font-[Archivo]"
                    :direction="
                      appStore.paginate.limit - index < 3 &&
                      appStore.renderredPages.length > 8
                        ? 'top'
                        : 'bottom'
                    "
                  >
                    <template #default="{ triggerEvent }">
                      <XButton size="sm" @click="triggerEvent()"
                        ><Icon
                          name="tabler:dots"
                          size="14"
                          class="text-neutral-300"
                      /></XButton>
                    </template>
                  </XDropdown>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        v-if="appStore.paginate.limit > 10 && (atBeginnning || hasReachedEnd)"
        :class="[
          'absolute bottom-2 left-1/2 -translate-x-1/2 bg-neutral-200 px-6 py-2 flex flex-col items-center text-sm rounded-full',
          hasReachedEnd ? 'flex-col-reverse' : 'flex-col',
        ]"
        @click="hasReachedEnd && scrollToTop()"
      >
        <span v-if="atBeginnning">Scroll Down</span>
        <span v-if="hasReachedEnd">Back to top</span>
        <Icon
          name="tabler:chevron-down"
          size="20"
          class="-m-1"
          :class="{ 'rotate-180': hasReachedEnd }"
        />
      </button>
    </div>

    <!-- Pagination -->
    <div class="relative flex items-center justify-end gap-x-1 mt-4">
      <Transition name="reveal">
        <AudioPlayer
          v-if="appStore.getSelectedHymn"
          :hymn="appStore.getSelectedHymn"
        />
      </Transition>
      <p>Items:</p>
      <XDropdown
        id="opt"
        v-model="selected"
        :options="PER_PAGE_OPTIONS"
        direction="top"
      />
      <div class="flex gap-x-3 ml-2">
        <XButton
          button-text="Prev"
          type="raised"
          :disabled="appStore.paginate.currentPage === 1"
          @click="appStore.previousPage()"
          ><Icon name="tabler:arrow-left" size="18"
        /></XButton>
        <div
          class="flex items-center gap-x-1 text-neutral-400 font-[Archivo] font-medium"
        >
          {{
            (appStore.paginate.currentPage - 1) * appStore.paginate.limit + 1
          }}/{{ appStore.paginate.currentPage * appStore.paginate.limit }}
          <span v-if="appStore.selectedCategory">(of 695)</span>
        </div>
        <XButton
          button-text="Next"
          type="raised"
          icon-position="right"
          :disabled="appStore.paginate.currentPage === appStore.totalPages"
          @click="appStore.nextPage()"
          ><Icon name="tabler:arrow-right" size="18"
        /></XButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease-in-out, filter 0.5s ease-out;
}

.reveal-enter-from,
.reveal-leave-to {
  transform: scale(0.5);
  filter: blur(50px);
  opacity: 0;
}
</style>