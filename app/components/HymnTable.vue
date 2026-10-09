<script lang="ts" setup>
import { useAppStore } from "~/stores/app";

const appStore = useAppStore();

function setSort(sort: string) {
  if (appStore.paginate.sort === sort) {
    const order = appStore.paginate.order === "asc" ? "desc" : "asc";
    appStore.setSort(sort, order);
    return;
  }

  appStore.setSort(sort, "asc");
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
    <div class="border border-neutral-200 rounded-xl overflow-hidden">
      <table class="w-full table-fixed font-[Spectral]">
        <thead class="font-[Archivo]">
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
                  appStore.selectedCategory === "" ? "Category" : "Subcategory"
                }}
              </div>
            </th>
            <th class="w-24">Key</th>
            <th class="w-36">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hymn in appStore.renderredPages">
            <td class="text-2xl text-center font-bold">
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
              <div class="flex items-center gap-x-1">
                <button
                  class="flex items-center gap-x-1.5 border border-neutral-300 px-1.5 py-0.5 text-neutral-700 font-[Archivo] text-sm rounded-md transition-all shadow hover:shadow-md"
                >
                  <Icon
                    name="solar:play-bold"
                    size="14"
                    class="text-neutral-300"
                  />
                  Play
                </button>
                <button
                  class="flex items-center gap-x-1.5 border border-neutral-300 px-1.5 py-0.5 text-neutral-700 font-[Archivo] text-sm rounded-md transition-all shadow hover:shadow-md"
                >
                  <Icon
                    name="tabler:arrows-diagonal"
                    size="14"
                    class="text-neutral-300"
                  />
                  View
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div>
      <div class="flex gap-x-3 mt-4">
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
