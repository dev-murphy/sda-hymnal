<script lang="ts" setup>
import { useAppStore } from "~/stores/app";
import type { Option } from "~/types";

const appStore = useAppStore();

function setSort(sort: string) {
  if (appStore.paginate.sort === sort) {
    const order = appStore.paginate.order === "asc" ? "desc" : "asc";
    appStore.setSort(sort, order);
    return;
  }

  appStore.setSort(sort, "asc");
}

const perPage = ref<Option<number>[]>([
  {
    name: "10 / page",
    value: 10,
  },
  {
    name: "15 / page",
    value: 15,
  },
  {
    name: "20 / page",
    value: 20,
  },
]);
const selected = ref(perPage.value[0]!);

watch(selected, (perPage) => {
  scrollToTop();
  appStore.paginate.currentPage = 1;
  appStore.setLimit(perPage.value);
});

const menu = ref([
  {
    name: "Present",
    value: "present",
  },
  {
    name: "Like",
    value: "favorite",
  },
]);
const selectedMenuOption = ref(menu.value[0]!);

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
</script>

<template>
  <!-- Desktop Table -->
  <div class="w-full max-w-[1240px] mx-auto">
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
        class="h-[602px] border border-neutral-200 rounded-xl overflow-y-auto scroll-smooth"
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
              <th class="w-24">Key</th>
              <th class="w-36">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(hymn, index) in appStore.renderredPages">
              <td class="text-2xl text-center font-[Spectral] font-bold">
                {{ hymn?.hymn_number }}
              </td>
              <td class="py-1.5">
                <div class="font-[Archivo]">
                  {{ hymn?.title }}
                  <span class="block text-sm text-neutral-400 font-[Spectral]">
                    {{ hymn?.first_line }}
                  </span>
                </div>
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
              <td class="font-serif">{{ hymn?.key }}</td>
              <td>
                <div class="flex items-center gap-x-2">
                  <XButton size="sm" buttonText="Play">
                    <Icon
                      name="solar:play-bold"
                      size="14"
                      class="text-neutral-300"
                    />
                  </XButton>

                  <XDropdown
                    id="hymn-menu"
                    v-model="selectedMenuOption"
                    :options="menu"
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
    <div class="flex items-center justify-end gap-x-3 mt-4">
      <XDropdown
        id="opt"
        v-model="selected"
        :options="perPage"
        direction="top"
      />
      <div class="flex gap-x-3">
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
