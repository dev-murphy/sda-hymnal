<script lang="ts" setup>
const appStore = useAppStore();

const AUDIO_BASE_URL =
  "https://cdn.jsdelivr.net/gh/dev-murphy/hymn-resources@main/mp3/";

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = computed(() => appStore.isPlaying);
const isLoading = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const volume = ref(50);
const previousVolume = ref(50);

const progress = computed(() => {
  return duration.value
    ? (currentTime.value / duration.value) * 100
    : 0;
});

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";

  const m = Math.floor(s / 60);

  return `${m}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;
}

function playAudio(audio: HTMLAudioElement) {
  audio.play().catch((error: DOMException) => {
    if (error.name === "AbortError") return;
    console.error(error);
    appStore.setIsPlaying(false);
  });
}

function togglePlay() {
  appStore.setIsPlaying(!appStore.isPlaying);
}

function toggleMute() {
  if (volume.value === 0) {
    volume.value = previousVolume.value || 50;
  } else {
    previousVolume.value = volume.value;
    volume.value = 0;
  }
}

function seek(event: MouseEvent) {
  const audio = audioRef.value;
  if (!audio || !duration.value) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

  audio.currentTime =
    Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) *
    duration.value;
}

function updateVolume(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  if (!rect.width) return;

  volume.value = Math.round(
    Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) *
      100,
  );
}

watch(volume, (value) => {
  if (value > 0) previousVolume.value = value;

  const audio = audioRef.value;
  if (audio) {
    audio.volume = value / 100;
    audio.muted = value === 0;
  }
});

const hymn = computed(() => {
  return appStore.getSelectedHymn;
});

function setAudioSource() {
  const audio = audioRef.value;
  if (!audio) return;

  const selectedHymn = hymn.value;

  if (!selectedHymn?.filename) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    isLoading.value = false;
    currentTime.value = 0;
    duration.value = 0;
    return;
  }

  const src = new URL(AUDIO_BASE_URL + encodeURI(selectedHymn.filename)).href;
  if (audio.src === src) return;

  audio.pause();
  audio.src = src;
  audio.load();

  isLoading.value = true;
  currentTime.value = 0;
  duration.value = 0;

  if (appStore.isPlaying) playAudio(audio);
}

watch(hymn, setAudioSource);

watch(
  () => appStore.isPlaying,
  (shouldPlay) => {
    const audio = audioRef.value;
    if (!audio || !audio.src) return;

    if (shouldPlay && audio.paused) {
      playAudio(audio);
    } else if (!shouldPlay && !audio.paused) {
      audio.pause();
    }
  },
);

onMounted(() => {
  const audio = new Audio();
  audio.volume = volume.value / 100;
  audioRef.value = audio;

  audio.addEventListener("play", () => {
    if (!audio.paused) appStore.setIsPlaying(true);
  });

  audio.addEventListener("pause", () => {
    if (audio.paused) appStore.setIsPlaying(false);
  });

  audio.addEventListener("ended", () => {
    appStore.setIsPlaying(false);
    currentTime.value = 0;
  });

  audio.addEventListener("timeupdate", () => {
    currentTime.value = audio.currentTime;
  });

  audio.addEventListener("loadedmetadata", () => {
    duration.value = audio.duration;
  });

  audio.addEventListener("waiting", () => {
    isLoading.value = true;
  });

  audio.addEventListener("canplay", () => {
    isLoading.value = false;
  });

  audio.addEventListener("playing", () => {
    isLoading.value = false;
  });

  audio.addEventListener("error", () => {
    isLoading.value = false;
    appStore.setIsPlaying(false);
  });

  setAudioSource();
});

onUnmounted(() => {
  const audio = audioRef.value;

  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audioRef.value = null;
  }
});
</script>

<template>
  <div
    v-if="hymn"
    class="absolute bottom-8 left-[70px] mx-auto w-[800px] max-w-[calc(100vw-90px)] rounded-2xl border border-neutral-300 bg-white p-2 shadow-lg"
  >
    <div class="w-full space-y-1">
      <div class="flex w-full items-center gap-x-4">
        <p class="shrink-0 font-[Spectral] text-sm">
          {{ hymn.title}}
        </p>

        <XRangeSlider
          v-model="progress"
          @trigger-event="seek"
          class="min-w-0 grow"
        />

        <!-- Controls: shrink-wrap content instead of filling remaining space -->
        <div class="flex shrink-0 items-center gap-x-1">
          <div class="relative grid shrink-0 place-items-center">
            <!-- Spinning ring around the play button while audio loads -->
            <CircleLoader
              v-if="isLoading"
              class="pointer-events-none absolute -inset-1"
              aria-hidden="true"
            />
            <button
              class="grid shrink-0 place-items-center rounded-full bg-black/10 p-2"
              @click="togglePlay"
              :disabled="isLoading"
              :aria-busy="isLoading"
            >
              <Icon
                v-show="!isPlaying"
                name="tabler:player-play-filled"
                size="14"
              />
              <Icon
                v-show="isPlaying"
                name="tabler:player-pause-filled"
                size="14"
              />
            </button>
          </div>

          <!-- Volume control expands on hover -->
          <div
            class="group relative flex h-[30px] w-[30px] shrink-0 items-center overflow-hidden rounded-full bg-black/10 px-2 transition-[width] duration-300 ease-in-out hover:w-[145px] focus-within:w-[145px]"
          >
            <button
              type="button"
              class="absolute left-2 top-1/2 z-10 grid -translate-y-1/2 shrink-0 place-items-center"
              @click="toggleMute"
              :aria-label="volume === 0 ? 'Unmute' : 'Mute'"
            >
              <Icon
                v-show="volume === 0"
                name="tabler:volume-off"
                size="16"
              />
              <Icon
                v-show="volume > 0 && volume <= 49"
                name="tabler:volume-2"
                size="16"
              />
              <Icon
                v-show="volume >= 50"
                name="tabler:volume"
                size="16"
              />
            </button>

            <XRangeSlider
              v-model="volume"
              class="absolute left-9 top-1/2 w-[100px] -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
              @trigger-event="updateVolume"
            />
          </div>
          <button
            class="bg-black/10 disabled:text-neutral-400 grid shrink-0 place-items-center p-2 disabled:cursor-not-allowed rounded-full"
            aria-label="Previous Hymn"
            :disabled="hymn.hymn_number === 1"
            @click="appStore.prevHymn()"
          >
            <Icon name="tabler:player-skip-back-filled" size="14" />
          </button>
          <p
            class="relative w-fit shrink-0 overflow-hidden rounded-full bg-black/10 px-3 py-2 font-[Archivo] text-xs tabular-nums"
          >
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            <LineLoader
              v-if="isLoading"
              class="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] w-full text-[hsl(228,97%,42%)]"
              aria-hidden="true"
            />
          </p>
          <button
            class="bg-black/10 grid shrink-0 place-items-center p-2 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-full"
            aria-label="Next Hymn"
            :disabled="hymn.hymn_number === 695"
            @click="appStore.nextHymn()"
          >
            <Icon name="tabler:player-skip-forward-filled" size="14" />
          </button>

          <button
            class="grid shrink-0 place-items-center rounded-full bg-black/10 p-2"
            aria-label="Expand"
          >
            <Icon name="tabler:arrows-diagonal" size="14" />
          </button>
          
          <button
            class="w-[30px] aspect-square bg-black/10 grid shrink-0 place-items-center rounded-full "
            aria-label="Close Player"
            @click="appStore.setCurrentlyPlayedHymns(null)"
          >
            <Icon name="tabler:x" size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
