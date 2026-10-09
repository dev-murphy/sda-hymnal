import hymns from '~/assets/json/hymns.json';

export type HymnData = typeof hymns.data;
export type SortOrder = 'asc' | 'desc';