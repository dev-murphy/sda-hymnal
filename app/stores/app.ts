import { defineStore } from "pinia";
import { data } from "~/assets/json/hymns.json";
import type { HymnData, SortOrder } from "~/types";

export const useAppStore = defineStore("app", {
  state: () => ({
    hymns: data,
    visibility: {
      author: true,
      composer: true,
      key: true
    },
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

      const direction = state.paginate.order === 'desc' ? -1 : 1;

      const compareText = (a?: string, b?: string) => {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        return a.localeCompare(b) * direction;
      };

      return paginatedHymns.sort((a, b) => {
        switch (state.paginate.sort) {
          case 'title':
            return compareText(a.title, b.title);
          case 'author':
            return compareText(a.author, b.author);
          case 'composer':
            return compareText(a.composer, b.composer);
          default:
            return (a.hymn_number - b.hymn_number) * direction;
        }
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
    },
    toggleVisibility(columnName: 'author' | 'composer' | 'key') {
      if (columnName === 'author') {
        this.visibility.author = !this.visibility.author;
      }

      if (columnName === 'composer') {
        this.visibility.composer = !this.visibility.composer;
      }

      if (columnName === 'key') {
        this.visibility.key = !this.visibility.key;
      }
    }
  },
});
