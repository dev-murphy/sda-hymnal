<script lang="ts" setup>
const appStore = useAppStore();
const options = ref([
  { name: "Favorites", value: "fav" },
  { name: "Recently Viewed", value: "view" },
]);
const selectedOptions = ref(options.value[0]!);
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
          <XTooltip text="Filter">
            <template #default="{ triggerOpen, triggerClose }">
              <XDropdown
                id="filter"
                v-model="selectedOptions"
                :options="options"
                alignment="right"
              >
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
                    <Icon name="tabler:filter-2" size="20" />
                  </button>
                </template>
              </XDropdown>
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
                    <div
                      class="grid grid-cols-[1fr_20px] grid-flow-row px-2 text-sm"
                    >
                      <p class="text-neutral-300 py-0.5 font-bold">Number</p>
                      <button class="disabled:text-neutral-300" disabled>
                        <Icon name="tabler:eye" size="20" />
                      </button>

                      <p class="text-neutral-300 py-0.5 font-bold">Title</p>
                      <button class="disabled:text-neutral-300" disabled>
                        <Icon name="tabler:eye" size="20" />
                      </button>

                      <p class="text-neutral-300 py-0.5 font-bold">Category</p>
                      <button class="disabled:text-neutral-300" disabled>
                        <Icon name="tabler:eye" size="20" />
                      </button>

                      <p class="py-0.5">Author</p>
                      <button @click="appStore.toggleVisibility('author')">
                        <Icon v-if="appStore.visibility.author" name="tabler:eye-off" size="20" />
                        <Icon v-else name="tabler:eye" size="20" />
                      </button>

                      <p class="py-0.5">Composer</p>
                      <button @click="appStore.toggleVisibility('composer')">
                        <Icon v-if="appStore.visibility.composer" name="tabler:eye-off" size="20" />
                        <Icon v-else name="tabler:eye" size="20" />
                      </button>

                      <p class="py-0.5">Key</p>
                      <button @click="appStore.toggleVisibility('key')">
                        <Icon v-if="appStore.visibility.key" name="tabler:eye-off" size="20" />
                        <Icon v-else name="tabler:eye" size="20" />
                      </button>

                      <p class="text-neutral-300 py-0.5 font-bold">Actions</p>
                      <button class="disabled:text-neutral-300" disabled>
                        <Icon name="tabler:eye" size="20" />
                      </button>
                    </div>
                  </div>
                </template>
              </XMenu>
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
