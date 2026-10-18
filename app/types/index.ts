import type { StyleValue } from "vue";
import hymns from "~/assets/json/hymns.json";

export type HymnData = typeof hymns.data;
export type SortOrder = "asc" | "desc";
export type Theme = "auto" | "light" | "dark";
export type HymnFilterFlag =
  | "recentlyAdded"
  | "recentlyViewed"
  | "favorites";

export type Option<T> = {
  name: string;
  value: T;
  icon?: {
    name: string;
    size: string;
  };
  style?: StyleValue;
};

export type HighlightChunk = { text: string; match: boolean };