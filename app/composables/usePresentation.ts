import type { MaybeRefOrGetter } from "vue";
import type { HymnData } from "~/types";

export function usePresentation(
  hymn: MaybeRefOrGetter<HymnData[number] | undefined>,
) {
  const sequence = computed(() => buildPresentationSequence(toValue(hymn)));
  const index = ref(0);

  // a new hymn starts again from its first stanza
  watch(
    () => toValue(hymn)?.hymn_number,
    () => {
      index.value = 0;
    },
  );

  const current = computed(() => sequence.value[index.value]);
  const hasPrevious = computed(() => index.value > 0);
  const hasNext = computed(() => index.value < sequence.value.length - 1);

  function previous() {
    if (hasPrevious.value) index.value--;
  }

  function next() {
    if (hasNext.value) index.value++;
  }

  return { sequence, index, current, hasPrevious, hasNext, previous, next };
}
