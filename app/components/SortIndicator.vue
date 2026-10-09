<script lang="ts" setup>
import type { SortOrder } from "~/types"
defineProps<{ isSorted: boolean; order: SortOrder }>();
</script>

<template>
  <div v-if="isSorted" class="flex flex-col -space-y-1 text-neutral-400">
    <Icon name="solar:alt-arrow-up-outline" size="13" />
    <Icon name="tabler:chevron-down" size="13" />
  </div>
  <div v-else class="flex items-center">
    <Icon v-show="order === 'asc'" name="tabler:arrow-up" size="16" />
    <Icon v-show="order === 'desc'" name="tabler:arrow-down" size="16" />
  </div>
</template>
