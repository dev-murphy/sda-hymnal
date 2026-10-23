<script lang="ts" setup>
const appStore = useAppStore();
import type { HymnFilterFlag } from "~/types";

const visibilityColumns: {
  label: string;
  key?: "author" | "composer" | "key";
}[] = [
  { label: "Number" },
  { label: "Title" },
  { label: "Category" },
  { label: "Author", key: "author" },
  { label: "Composer", key: "composer" },
  { label: "Key", key: "key" },
  { label: "Actions" },
];

const filterOptions: { label: string; flag: HymnFilterFlag; disabled?: boolean }[] = [
  { label: "Favorites", flag: "favorites" },
  { label: "Recently Viewed", flag: "recentlyViewed" },
];

definePageMeta({
  // a filtered list has its own URL to share and index, e.g.
  // /categories/Jesus+Christ/sub/Second+Advent
  alias: [
    "/categories/:category",
    "/categories/:category/sub/:subcategory",
  ],
  // one key for every alias, so changing the filter doesn't remount the page
  key: "hymn-list",
  // unknown categories 404 instead of showing an unfiltered list
  validate: (route) => {
    const appStore = useAppStore();
    const category = fromCategoryParam(route.params.category);
    const subcategory = fromCategoryParam(route.params.subcategory);
    if (!category) return true;
    if (!appStore.findCategory(category)) return false;
    if (!subcategory) return true;
    const value = toCategoryValue(subcategory);
    return appStore
      .subcategoriesOf(category)
      .some((option) => option.value === value);
  },
});

// the URL is the source of truth for the category filter
const route = useRoute();
watch(
  () => [route.params.category, route.params.subcategory],
  () => {
    const category = fromCategoryParam(route.params.category);
    const subcategory = fromCategoryParam(route.params.subcategory);
    // only on a change, so coming back to the same list keeps its page
    if (toCategoryValue(category) !== (appStore.selectedCategory?.value ?? "")) {
      appStore.setCategory(category);
    }
    if (
      toCategoryValue(subcategory) !==
      (appStore.selectedSubcategory?.value ?? "")
    ) {
      appStore.setSubCategory(subcategory);
    }
  },
  { immediate: true },
);

const filterName = computed(() => {
  const category = appStore.selectedCategory?.name;
  const subcategory = appStore.selectedSubcategory?.name;
  if (!category) return "";
  return subcategory ? `${subcategory} (${category})` : category;
});
const filterTitle = () =>
  filterName.value
    ? `${filterName.value} Hymns | SDA Hymnal`
    : "SDA Hymnal Online – Hymn Lyrics and Audio";
const filterDescription = () =>
  filterName.value
    ? `Browse Seventh-day Adventist hymns in ${filterName.value} - SDA Hymnal`
    : `Explore all ${appStore.hymns.length} hymns of the Seventh-day Adventist Hymnal. Search by number, title, or lyrics, and listen to recordings of every hymn.`;

const searchInputRef = useTemplateRef<HTMLInputElement>("search-input");
const { label: searchShortcut } = useShortcut("k", () =>
  searchInputRef.value?.select(),
);
const { label: settingsShortcut } = useShortcut(",");

const siteConfig = useSiteConfig();
useHead({
  link: [
    {
      rel: "canonical",
      // one form per list, whatever casing or spacing the visitor used
      href: () =>
        siteConfig.url +
        categoryPath(
          appStore.selectedCategory?.name,
          appStore.selectedSubcategory?.name,
        ),
    },
  ],
});
useSeoMeta({
  title: filterTitle,
  ogTitle: filterTitle,
  description: filterDescription,
  ogDescription: filterDescription,
  ogImage: {
    url: `${siteConfig.url}/og-image.png`,
    type: "image/png",
    alt: "Seventh-Day Adventist Hymnal",
  },
  twitterCard: "summary_large_image",
  twitterImage: `${siteConfig.url}/og-image.png`,
});
</script>

<template>
  <div class="min-h-screen flex flex-col pb-10 accent-wash">
    <div class="w-full max-w-310 mt-auto mb-2 mx-auto">
      <!-- title and psalm side by side on wide screens, so the table stays in view -->
      <header
        class="relative mb-8 grid gap-y-4 gap-x-12 md:grid-cols-[auto_1fr] md:items-end"
      >
        <!-- faded logo, like the search dialog's empty state -->
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          class="hero-logo pointer-events-none absolute -top-10 right-0 hidden md:block size-56 opacity-[0.06] grayscale"
        />

        <h1
          class="hero-rise relative font-[Epilogue] font-black leading-[0.9] tracking-tight"
        >
          <span
            class="block mb-1 text-xl md:text-2xl text-neutral-500 font-bold tracking-normal"
          >
            Seventh-day Adventist
          </span>
          <span class="accent-gradient-text text-6xl md:text-7xl">Hymnal</span>
        </h1>

        <figure
          class="hero-rise relative max-w-2xl pl-4 border-l-2 border-accent"
          style="animation-delay: 100ms"
        >
          <blockquote
            class="text-sm text-neutral-600 font-[Spectral] italic leading-relaxed"
          >
            Make a joyful noise unto the LORD, all ye lands. Serve the LORD with
            gladness: Come before his presence with singing. Know ye that the
            LORD he is God: It is he that hath made us, and not we ourselves; We
            are his people, and the sheep of his pasture. Enter into his gates
            with thanksgiving, And into his courts with praise: Be thankful unto
            him, and bless his name. For the LORD is good; his mercy is
            everlasting; And his truth endureth to all generations.
          </blockquote>
          <figcaption
            class="mt-1.5 text-xs text-neutral-400 font-[Archivo] tracking-widest uppercase"
          >
            Psalm 100
          </figcaption>
        </figure>
      </header>

      <div class="flex items-center border-b border-neutral-200">
        <button
          class="current-tab relative flex items-center gap-x-1 py-3 px-5"
        >
          <Icon name="tabler:list" size="15" />
          Hymns
        </button>

        <div class="ml-auto flex items-center gap-x-2">
          <XTooltip :text="`Search (${searchShortcut})`" alignment="center">
            <template #default="{ triggerOpen, triggerClose }">
              <div
                @mouseenter="!appStore.searchText && triggerOpen()"
                @mouseleave="triggerClose()"
                :class="[
                  'group relative overflow-hidden transition-[width]',
                  appStore.searchText
                    ? 'w-75'
                    : 'w-5 hover:w-75 focus-within:w-75',
                ]"
              >
                <Icon
                  name="tabler:search"
                  size="20"
                  class="absolute top-1/2 right-0 -translate-y-1/2 pointer-events-none"
                />
                <input
                  id="search"
                  ref="search-input"
                  type="text"
                  v-model="appStore.searchText"
                  @input="triggerClose()"
                  placeholder="Search for title, lyrics or number"
                  :class="[
                    'w-full border-b pl-1 pr-14 pb-1 outline-none',
                    appStore.searchText
                      ? 'border-neutral-200'
                      : 'border-transparent group-hover:border-neutral-200 group-focus-within:border-neutral-200',
                  ]"
                />
                <button
                  v-if="appStore.searchText"
                  type="button"
                  aria-label="Clear search"
                  class="absolute w-5 h-5 top-1/2 right-7 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center rounded-md"
                  @click="appStore.searchText = ''"
                >
                  <Icon name="tabler:x" size="14" />
                </button>
              </div>
            </template>
          </XTooltip>

          <XTooltip text="Filter">
            <template #default="{ triggerOpen, triggerClose }">
              <XMenu alignment="right">
                <template #default="{ triggerEvent, isOpen }">
                  <button
                    class="relative flex items-center"
                    @mouseenter="!isOpen && triggerOpen()"
                    @mouseleave="triggerClose()"
                    @click="
                      () => {
                        triggerEvent();
                        triggerClose();
                      }
                    "
                  >
                    <Icon name="tabler:filter-2" size="20" />
                    <span
                      v-if="appStore.activeFilterCount"
                      class="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 grid place-items-center bg-neutral-800 text-white text-[10px] font-bold rounded-full"
                    >
                      {{ appStore.activeFilterCount }}
                    </span>
                  </button>
                </template>

                <template #menu="{ triggerEvent }">
                  <div
                    class="w-55 flex items-center p-2 border-b border-neutral-200"
                  >
                    <p
                      class="mr-auto text-xs font-[Archivo] font-black tracking-widest"
                    >
                      Filter
                    </p>
                    <button
                      class="flex items-center justify-center bg-neutral-200/75 p-1 rounded-md"
                      @click="triggerEvent()"
                    >
                      <Icon name="tabler:x" size="14" class="text-neutral-600" />
                    </button>
                  </div>

                  <div class="flex flex-col gap-y-1.5 p-2 text-sm">
                    <label
                      v-for="option in filterOptions"
                      :key="option.flag"
                      :class="[
                        'flex items-center justify-between',
                        { 'text-neutral-300': option.disabled },
                      ]"
                    >
                      {{ option.label }}
                      <XToggle
                        :model-value="appStore.paginate.filter.flags[option.flag]"
                        :label="option.label"
                        :disabled="option.disabled"
                        @update:model-value="appStore.toggleFilterFlag(option.flag)"
                      />
                    </label>
                  </div>
                </template>
              </XMenu>
            </template>
          </XTooltip>

          <XTooltip text="Visibility">
            <template #default="{ triggerOpen, triggerClose }">
              <XMenu alignment="right">
                <template #default="{ triggerEvent, isOpen }">
                  <button
                    @mouseenter="!isOpen && triggerOpen()"
                    @mouseleave="triggerClose()"
                    class="flex items-center justify-center"
                    @click="
                      () => {
                        triggerEvent();
                        triggerClose();
                      }
                    "
                  >
                    <Icon name="tabler:eye-cog" size="20" />
                  </button>
                </template>

                <template #menu="{ triggerEvent }">
                  <div>
                    <div
                      class="w-50 flex items-center p-2 border-b border-neutral-200"
                    >
                      <p
                        class="mr-auto text-xs font-[Archivo] font-black tracking-widest"
                      >
                        Column Visibility
                      </p>
                      <button
                        class="flex items-center justify-center bg-neutral-200/75 p-1 rounded-md"
                        @click="triggerEvent()"
                      >
                        <Icon
                          name="tabler:x"
                          size="14"
                          class="text-neutral-600"
                        />
                      </button>
                    </div>

                    <!-- Column visibility -->
                    <div class="flex flex-col gap-y-1.5 p-2 text-sm">
                      <label
                        v-for="column in visibilityColumns"
                        :key="column.label"
                        :class="[
                          'flex items-center justify-between',
                          { 'text-neutral-300 font-bold': !column.key },
                        ]"
                      >
                        {{ column.label }}
                        <XToggle
                          :model-value="
                            column.key ? appStore.visibility[column.key] : true
                          "
                          :label="column.label"
                          :disabled="!column.key"
                          @update:model-value="
                            column.key && appStore.toggleVisibility(column.key)
                          "
                        />
                      </label>
                    </div>
                  </div>
                </template>
              </XMenu>
            </template>
          </XTooltip>

          <XTooltip :text="`Settings (${settingsShortcut})`">
            <template #default="{ triggerOpen, triggerClose }">
              <button
                command="show-modal"
                commandfor="settings-dialog"
                class="flex items-center justify-center"
                @mouseenter="triggerOpen"
                @mouseleave="triggerClose"
                @click="triggerClose"
              >
                <Icon name="tabler:settings" size="18" />
              </button>
            </template>
          </XTooltip>
        </div>
      </div>
    </div>

    <HymnTable />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

/* heading parts rise in one after another on load */
@keyframes hero-rise {
  from {
    opacity: 0;
    translate: 0 12px;
    filter: blur(4px);
  }
}
.hero-rise {
  animation: hero-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes hero-logo {
  from {
    opacity: 0;
    scale: 0.92;
    rotate: -6deg;
  }
}
.hero-logo {
  animation: hero-logo 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .hero-rise,
  .hero-logo {
    animation: none;
  }
}

.current-tab::before {
  content: "";
  position: absolute;

  width: 50%;
  background-color: var(--color-accent);
  @apply top-full left-1/2 -translate-x-1/2 -translate-y-full h-0.75 rounded-t-md;
}
</style>
