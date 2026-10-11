import { defineStore } from "pinia";
import { data } from "~/assets/json/hymns.json";
import type { HymnData, SortOrder } from "~/types";

export const useAppStore = defineStore("app", {
  state: () => ({
    hymns: data,
    paginate: {
      sort: 'number',
      order: 'asc' as SortOrder,
      limit: 10,
      currentPage: 1,
      offset: 0,
      filter: {
        category: '',
        subcategory: ''
      }
    },
  }),
  getters: {
    filteredHymns(state) {
     return state.paginate.filter.category !== '' ? state.hymns.filter((hymn) => hymn.category === state.paginate.filter.category) : state.hymns;
    }, 
    renderredPages(state): Partial<HymnData> {
      const paginatedHymns = this.filteredHymns.slice(
        (this.paginate.currentPage - 1) * this.paginate.limit,
        state.paginate.currentPage * this.paginate.limit,
      )

      return paginatedHymns.sort((a, b) => {
        if (state.paginate.sort === 'title' && state.paginate.order === 'asc') {
          return a.title.localeCompare(b.title);
        }
        if (state.paginate.sort === 'title' && state.paginate.order === 'desc') {
          return b.title.localeCompare(a.title);
        }
        if (state.paginate.sort === 'number' && state.paginate.order === 'desc') {
          return b.hymn_number - a.hymn_number;
        }

        // defaults to hymn_number descending order
        return a.hymn_number - b.hymn_number;
      })
    },
    selectedCategory(state) {
      return state.paginate.filter.category;
    },
    totalPages(state): number {
      return Math.ceil(this.filteredHymns.length / state.paginate.limit);
    },
  },
  actions: {
    setLimit(limit: number) {
      this.paginate.limit = limit;
    },
    nextPage() {
      if (this.paginate.currentPage  < this.totalPages) {
        this.paginate.currentPage++;
      }
    },
    previousPage() {
      if (this.paginate.currentPage > 1) {
        this.paginate.currentPage--;
      }
    },
    setSort(sort: string, order: SortOrder) {
      this.paginate.sort = sort;
      this.paginate.order = order;
    },
    setCategory(category: string) {
      this.paginate.currentPage = 1;
      this.paginate.filter.category = category;
    },
    setSubCategory(subcategory: string) {
      this.paginate.currentPage = 1;
      this.paginate.filter.subcategory = subcategory;
    }
  },
});
