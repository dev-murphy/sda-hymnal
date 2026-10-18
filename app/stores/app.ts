import Fuse from "fuse.js";
import { defineStore } from "pinia";
import { data } from "~/assets/json/hymns.json";
import type { HymnData, HymnFilterFlag, SortOrder, Theme } from "~/types";

let fuse: Fuse<HymnData[number]> | null = null;
function getFuse() {
  return (fuse ??= new Fuse(data, {
    keys: ["hymn_number", "title", "stanzas.text"],
    includeMatches: true,
    ignoreLocation: true,
    minMatchCharLength: 4,
    threshold: 0.3,
  }));
}

export const useAppStore = defineStore("app", {
  state: () => ({
    hymns: data,
    selectedHymn: null as number | null,
    isPlaying: false,
    fontSize: 16,
    fontFamily: "Archivo",
    theme: "auto" as Theme,
    reduceMotion: false,
    favorites: [] as number[],
    // hymn number -> when it was last viewed (ms)
    recentlyViewed: {} as Record<number, number>,
    visibility: {
      author: true,
      composer: true,
      key: true,
    },
    paginate: {
      sort: "number",
      order: "asc" as SortOrder,
      limit: 10,
      currentPage: 1,
      offset: 0,
      filter: {
        category: "",
        subcategory: "",
        flags: {
          recentlyAdded: false,
          recentlyViewed: false,
          favorites: false,
        } as Record<HymnFilterFlag, boolean>,
      },
    },
    searchText: ""
  }),
  getters: {
    getSelectedHymn(state) {
      return state.hymns.find(
        (hymn) => hymn.hymn_number === state.selectedHymn,
      );
    },
    filteredHymns(state) {
      const { category, flags } = state.paginate.filter;
      const favorites = new Set(state.favorites);

      return state.hymns.filter((hymn) => {
        if (category !== "" && hymn.category !== category) return false;
        if (flags.favorites && !favorites.has(hymn.hymn_number)) return false;
        if (flags.recentlyViewed && !(hymn.hymn_number in state.recentlyViewed))
          return false;
        return true;
      });
    },
    activeFilterCount(state): number {
      return Object.values(state.paginate.filter.flags).filter(Boolean).length;
    },
    isFavorite(state) {
      return (hymnNo: number) => state.favorites.includes(hymnNo);
    },
    // sort the whole list before paginating so order holds across pages
    sortedHymns(state): HymnData {
      const direction = state.paginate.order === "desc" ? -1 : 1;

      const compareText = (a?: string, b?: string) => {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        return a.localeCompare(b) * direction;
      };

      const compareViewed = (a: number, b: number) => {
        const viewedA = state.recentlyViewed[a];
        const viewedB = state.recentlyViewed[b];
        if (viewedA === undefined && viewedB === undefined) return 0;
        if (viewedA === undefined) return 1;
        if (viewedB === undefined) return -1;
        return (viewedA - viewedB) * direction;
      };

      return [...this.filteredHymns].sort((a, b) => {
        switch (state.paginate.sort) {
          case "viewed":
            return compareViewed(a.hymn_number, b.hymn_number);
          case "title":
            return compareText(a.title, b.title);
          case "author":
            return compareText(a.author, b.author);
          case "composer":
            return compareText(a.composer, b.composer);
          default:
            return (a.hymn_number - b.hymn_number) * direction;
        }
      });
    },
    renderredPages(state): Partial<HymnData> {
      return this.sortedHymns.slice(
        (state.paginate.currentPage - 1) * state.paginate.limit,
        state.paginate.currentPage * state.paginate.limit,
      );
    },
    selectedCategory(state) {
      return state.paginate.filter.category;
    },
    // stanza labels stay proportionally smaller than the text (14px at the default 16px)
    stanzaLabelFontSize(state): number {
      return state.fontSize * 0.875;
    },
    totalPages(state): number {
      return Math.ceil(this.filteredHymns.length / state.paginate.limit);
    },

    // current hymn functions
    currentHymn(state) {
      return (hymnNo: number) => {
        return state.hymns.find((hymn) => hymn.hymn_number === hymnNo);
      };
    },
    previousHymn(state) {
      return (hymnNo: number) => {
        return state.hymns.find((hymn) => hymn.hymn_number === hymnNo - 1);
      };
    },
    nextHymn(state) {
      return (hymnNo: number) => {
        return state.hymns.find((hymn) => hymn.hymn_number === hymnNo + 1);
      };
    },
  },
  actions: {
    setLimit(limit: number) {
      this.paginate.limit = limit;
    },
    nextPage() {
      if (this.paginate.currentPage < this.totalPages) {
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
    toggleFilterFlag(flag: HymnFilterFlag) {
      this.paginate.currentPage = 1;
      this.paginate.filter.flags[flag] = !this.paginate.filter.flags[flag];

      // recently viewed reads best newest first; drop the sort once its column goes
      if (flag === "recentlyViewed") {
        if (this.paginate.filter.flags.recentlyViewed) {
          this.setSort("viewed", "desc");
        } else if (this.paginate.sort === "viewed") {
          this.setSort("number", "asc");
        }
      }
    },
    toggleFavorite(hymnNo: number) {
      const index = this.favorites.indexOf(hymnNo);
      if (index === -1) this.favorites.push(hymnNo);
      else this.favorites.splice(index, 1);
    },
    addRecentlyViewed(hymnNo: number) {
      if (isNaN(hymnNo)) return;
      // keep only the 20 most recent
      const entries = Object.entries({
        ...this.recentlyViewed,
        [hymnNo]: Date.now(),
      })
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20);
      this.recentlyViewed = Object.fromEntries(entries);
    },
    setTheme(theme: Theme) {
      this.theme = theme;
    },
    setReduceMotion(value: boolean) {
      this.reduceMotion = value;
    },
    toggleVisibility(columnName: "author" | "composer" | "key") {
      if (columnName === "author") {
        this.visibility.author = !this.visibility.author;
      }

      if (columnName === "composer") {
        this.visibility.composer = !this.visibility.composer;
      }

      if (columnName === "key") {
        this.visibility.key = !this.visibility.key;
      }
    },
    setCurrentlyPlayedHymns(hymnNumber: number | null) {
      this.selectedHymn = hymnNumber;
      this.isPlaying = hymnNumber !== null;
    },
    togglePlayHymn(hymnNumber: number) {
      if (this.selectedHymn === hymnNumber) {
        this.isPlaying = !this.isPlaying;
      } else {
        this.setCurrentlyPlayedHymns(hymnNumber);
      }
    },
    setIsPlaying(value: boolean) {
      this.isPlaying = value;
    },
    setFontSize(size: number) {
      if (isNaN(size)) return;
      this.fontSize = Math.min(Math.max(Math.round(size), 12), 48);
    },
    setFontFamily(fontFamily: string) {
      this.fontFamily = fontFamily;
    },
    increaseFontSize() {
      this.setFontSize(this.fontSize + 2);
    },
    decreaseFontSize() {
      this.setFontSize(this.fontSize - 2);
    },
    setNextHymn() {
      if (this.selectedHymn !== null && this.selectedHymn < 695) {
        this.selectedHymn = this.selectedHymn + 1;
      }
    },
    setPreviousHymn() {
      if (this.selectedHymn !== null && this.selectedHymn > 1) {
        this.selectedHymn = this.selectedHymn - 1;
      }
    },
    search(query: string) {
      return getFuse().search(query);
    },
  },
});
