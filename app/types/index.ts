import hymns from '~/assets/json/hymns.json';

export type HymnData = typeof hymns.data;
export type SortOrder = 'asc' | 'desc';

export type Option<T> = {
  name: string;
  value: T;
  icon?: {
    name: string;
    size: string;
  }
}