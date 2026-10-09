<script lang="ts" setup>
import { data } from "~/assets/json/hymns.json";

const hymns = data;
const currentList = ref("all");
</script>

<template>
  <div class="min-h-screen flex flex-col pb-10">
    <div class="w-full max-w-[1240px] mt-auto mb-2 mx-auto">
      <h1 class="text-4xl font-black font-[Epilogue] pb-2">Seventh-day Adventist Hymnals</h1>
      <p class="w-2/3 text-sm font-[Spectral] mb-10">Make a joyful noise unto the LORD, all ye lands. Serve the LORD with gladness: Come before his presence with singing. Know ye that the LORD he is God: It is he that hath made us, and not we ourselves; We are his people, and the sheep of his pasture. Enter into his gates with thanksgiving, And into his courts with praise: Be thankful unto him, and bless his name. For the LORD is good; his mercy is everlasting; And his truth endureth to all generations.</p>
      
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
          <Icon name="solar:heart-bold" size="15"/>Favourites
        </button>
        <button
          class="relative flex items-center gap-x-1 py-3 px-3 text-neutral-300 cursor-not-allowed"
        >
          <Icon name="solar:pen-new-square-bold" size="15" />Edited
        </button>
      </div>
    </div>

    <HymnTable :hymns="hymns" />
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
