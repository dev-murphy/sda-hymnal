import type { MaybeRefOrGetter } from "vue";

type LineCue = { stanza: number; line: number; start: number };

// the next stanza comes up this many seconds before its first line is sung
const STANZA_LEAD = 1;

// Follows the audio through the lyrics using hymn.timestamps: one entry per
// stanza of the presentation sequence (the `performance` order), each holding
// the start time of every line.
export function useLyricSync(
  sequence: MaybeRefOrGetter<PresentationStanza[]>,
  timestamps: MaybeRefOrGetter<number[][] | undefined>,
  time: MaybeRefOrGetter<number>,
) {
  // flattened in time order; empty when the timestamps don't line up with the lyrics
  const cues = computed<LineCue[]>(() => {
    const stanzas = toValue(sequence);
    const times = toValue(timestamps);
    if (!times?.length || times.length !== stanzas.length) return [];

    const lineTimes = stanzas.map((stanza, index) =>
      times[index]?.length === countLines(stanza.text) ? times[index] : null,
    );
    if (lineTimes.some((entry) => entry === null)) return [];

    const flat = lineTimes.flatMap((starts, stanza) =>
      starts!.map((start, line) => ({ stanza, line, start })),
    );
    const inOrder = flat.every(
      (cue, index) => index === 0 || cue.start >= flat[index - 1]!.start,
    );
    return inOrder ? flat : [];
  });

  const isSynced = computed(() => cues.value.length > 0);

  // last cue whose start has passed, -1 before the first line
  function lastCueBefore(seconds: number) {
    let low = 0;
    let high = cues.value.length - 1;
    let found = -1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (cues.value[mid]!.start <= seconds) {
        found = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return found;
  }

  // the line being sung; it stays lit through the gap before the next line
  const activeLine = computed(() => {
    if (!isSynced.value) return null;
    const cue = cues.value[lastCueBefore(toValue(time))];
    return cue ? { stanza: cue.stanza, line: cue.line } : null;
  });

  const activeStanza = computed(() => {
    if (!isSynced.value) return null;
    const seconds = toValue(time);
    const index = lastCueBefore(seconds);
    const next = cues.value[index + 1];
    if (next && next.line === 0 && next.start - seconds <= STANZA_LEAD) {
      return next.stanza;
    }
    return cues.value[index]?.stanza ?? 0;
  });

  function startOf(stanza: number, line = 0) {
    return cues.value.find(
      (cue) => cue.stanza === stanza && cue.line === line,
    )?.start;
  }

  return { isSynced, activeLine, activeStanza, startOf };
}
