<script lang="ts" setup>
const props = withDefaults(
  defineProps<{ min?: number; max?: number; step?: number; modelValue: number }>(),
  {
    min: 0,
    max: 100,
    step: 1,
  },
);
const emits = defineEmits<{ (e: "update:modelValue", val: number): void }>();

const trackRef = useTemplateRef("track");
const isDragging = ref(false);

function clamp(value: number) {
  return Math.min(Math.max(value, props.min), props.max);
}

const percentage = computed(() => {
  const range = props.max - props.min;
  if (range <= 0) return 0;
  return ((clamp(props.modelValue) - props.min) / range) * 100;
});

function setValue(value: number) {
  const stepped =
    Math.round((value - props.min) / props.step) * props.step + props.min;
  const nextValue = clamp(stepped);
  if (nextValue !== props.modelValue) emits("update:modelValue", nextValue);
}

function setValueFromPointer(event: PointerEvent) {
  const rect = trackRef.value?.getBoundingClientRect();
  if (!rect?.width) return;

  const ratio = (event.clientX - rect.left) / rect.width;
  setValue(props.min + ratio * (props.max - props.min));
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return;

  isDragging.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  setValueFromPointer(event);
}

function onPointerMove(event: PointerEvent) {
  if (isDragging.value) setValueFromPointer(event);
}

function onPointerUp(event: PointerEvent) {
  isDragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}

function onKeydown(event: KeyboardEvent) {
  const pageStep = (props.max - props.min) / 10;
  const offsets: Record<string, number> = {
    ArrowRight: props.step,
    ArrowUp: props.step,
    ArrowLeft: -props.step,
    ArrowDown: -props.step,
    PageUp: pageStep,
    PageDown: -pageStep,
  };

  if (event.key === "Home") setValue(props.min);
  else if (event.key === "End") setValue(props.max);
  else if (event.key in offsets) setValue(props.modelValue + offsets[event.key]!);
  else return;

  event.preventDefault();
}
</script>

<template>
  <div
    role="slider"
    tabindex="0"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="modelValue"
    class="group/slider py-1.5 touch-none cursor-pointer outline-none"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeydown"
  >
    <!-- not on the root, so callers can still position the slider (e.g. absolute) -->
    <div class="relative">
      <div
        ref="track"
        class="h-2 bg-neutral-300 border border-neutral-400 rounded-full overflow-hidden"
      >
        <div class="h-full accent-gradient" :style="{ width: percentage + '%' }"></div>
      </div>
      <div
        :class="[
          'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 bg-[#fff] border border-accent shadow rounded-full transition-transform group-focus-visible/slider:ring-2 group-focus-visible/slider:ring-accent/40',
          { 'scale-125': isDragging },
        ]"
        :style="{ left: percentage + '%' }"
      ></div>
    </div>
  </div>
</template>
