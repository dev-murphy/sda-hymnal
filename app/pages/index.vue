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
  // no data to back this yet
  { label: "Recently Added", flag: "recentlyAdded", disabled: true },
];
</script>

<template>
  <div class="min-h-screen flex flex-col pb-10">
    <div class="w-full max-w-[1240px] mt-auto mb-2 mx-auto">
      <h1 class="text-4xl font-black font-[Epilogue] pb-2">
        Seventh-day Adventist Hymnals
      </h1>
      <p class="w-2/3 text-sm font-[Spectral] mb-10">
        Make a joyful noise unto the LORD, all ye lands. Serve the LORD with
        gladness: Come before his presence with singing. Know ye that the LORD
        he is God: It is he that hath made us, and not we ourselves; We are his
        people, and the sheep of his pasture. Enter into his gates with
        thanksgiving, And into his courts with praise: Be thankful unto him, and
        bless his name. For the LORD is good; his mercy is everlasting; And his
        truth endureth to all generations.
      </p>

      <div class="flex items-center border-b border-neutral-200">
        <button
          class="current-tab relative flex items-center gap-x-1 py-3 px-5"
        >
          <Icon name="tabler:list" size="15" />
          Hymns
        </button>
        <button
          class="relative flex items-center gap-x-1 py-3 px-3 text-neutral-300 cursor-not-allowed"
        >
          <Icon name="solar:pen-new-square-bold" size="15" />Edited
        </button>

        <div class="ml-auto flex items-center gap-x-2">
          <XTooltip text="Search" alignment="center">
            <template #default="{ triggerOpen, triggerClose }">
              <div
                @mouseenter="!appStore.searchText && triggerOpen()"
                @mouseleave="triggerClose()"
                :class="[
                  'group relative overflow-hidden transition-[width]',
                  appStore.searchText
                    ? 'w-[300px]'
                    : 'w-[20px] hover:w-[300px] focus-within:w-[300px]',
                ]"
              >
                <Icon
                  name="tabler:search"
                  size="20"
                  class="absolute top-1/2 right-0 -translate-y-1/2 pointer-events-none"
                />
                <input
                  id="search"
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
                    class="w-[220px] flex items-center p-2 border-b border-neutral-200"
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
                  <div class="">
                    <div
                      class="w-[200px] flex items-center p-2 border-b border-neutral-200"
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

          <XTooltip text="Settings">
            <template #default="{ triggerOpen, triggerClose }">
              <button
                command="show-modal"
                commandfor="settings-dialog"
                class="flex items-center"
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
.current-tab::before {
  content: "";
  position: absolute;

  width: 50%;
  background-color: black;
  @apply top-full left-1/2 -translate-x-1/2 -translate-y-full h-[3px] rounded-t-md;
}
</style>
