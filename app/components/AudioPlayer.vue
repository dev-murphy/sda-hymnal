<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    hymn?: HymnData[number];
    type?: "inline" | "fixed";
    hideExtraControls?: boolean;
    hideTitle?: boolean;
    manualPlay?: boolean;
  }>(),
  {
    type: "fixed",
    manualPlay: false,
    hideExtraControls: false,
    hideTitle: false,
  },
);

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

function seek(time: number) {
  const audio = audioRef.value;
  if (!audio || !duration.value) return;

  audio.currentTime = time;
  currentTime.value = time;
}

watch(volume, (value) => {
  if (value > 0) previousVolume.value = value;

  const audio = audioRef.value;
  if (audio) {
    audio.volume = value / 100;
    audio.muted = value === 0;
  }
});

function setAudioSource() {
  const audio = audioRef.value;
  if (!audio) return;

  if (!props.hymn?.filename) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    isLoading.value = false;
    currentTime.value = 0;
    duration.value = 0;
    return;
  }

  const src = new URL(AUDIO_BASE_URL + encodeURI(props.hymn.filename)).href;
  if (audio.src === src) return;

  audio.pause();
  audio.src = src;
  audio.load();

  isLoading.value = true;
  currentTime.value = 0;
  duration.value = 0;

  if (props.manualPlay) appStore.setIsPlaying(false);
  else if (appStore.isPlaying) playAudio(audio);
}

watch(() => props.hymn, setAudioSource);

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
    :class="[
      'w-[800px] max-w-[calc(100vw-90px)] rounded-2xl border border-neutral-300 bg-white p-2',
      {
        relative: type === 'inline',
        'absolute bottom-8 left-[70px] shadow-lg': type === 'fixed',
      },
    ]"
  >
    <div class="w-full space-y-1">
      <div class="flex w-full items-center gap-x-4">
        <p v-if="!hideTitle" class="shrink-0 font-[Spectral] text-sm">
          {{ hymn?.title }}
        </p>

        <XRangeSlider
          :model-value="currentTime"
          :max="duration"
          class="min-w-0 grow"
          aria-label="Seek"
          @update:model-value="seek"
        />

        <div class="flex shrink-0 items-center gap-x-1">
          <div class="relative grid shrink-0 place-items-center">
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
              <Icon v-show="volume === 0" name="tabler:volume-off" size="16" />
              <Icon
                v-show="volume > 0 && volume <= 49"
                name="tabler:volume-2"
                size="16"
              />
              <Icon v-show="volume >= 50" name="tabler:volume" size="16" />
            </button>

            <XRangeSlider
              v-model="volume"
              :min="0"
              :max="100"
              aria-label="Volume"
              class="absolute left-9 top-1/2 w-[100px] -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </div>
          <button
            v-if="!hideExtraControls"
            class="bg-black/10 disabled:text-neutral-400 grid shrink-0 place-items-center p-2 disabled:cursor-not-allowed rounded-full"
            aria-label="Previous Hymn"
            :disabled="hymn?.hymn_number === 1"
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
            v-if="!hideExtraControls"
            class="bg-black/10 grid shrink-0 place-items-center p-2 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-full"
            aria-label="Next Hymn"
            :disabled="hymn?.hymn_number === 695"
            @click="appStore.nextHymn()"
          >
            <Icon name="tabler:player-skip-forward-filled" size="14" />
          </button>

          <button
            v-if="!hideExtraControls"
            class="grid shrink-0 place-items-center rounded-full bg-black/10 p-2"
            aria-label="Expand"
          >
            <Icon name="tabler:arrows-diagonal" size="14" />
          </button>

          <button
            v-if="!hideExtraControls"
            class="w-[30px] aspect-square bg-black/10 grid shrink-0 place-items-center rounded-full"
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
