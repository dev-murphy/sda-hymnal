import type { MaybeRefOrGetter, Ref } from "vue";

type FitOptions = {
  // the area the lyrics must fit inside (its padding is excluded)
  stage: Ref<HTMLElement | null>;
  // a hidden copy of the lyrics markup, sized in em so font-size scales all of it
  measure: Ref<HTMLElement | null>;
  stanzas: MaybeRefOrGetter<PresentationStanza[]>;
  fontFamily: MaybeRefOrGetter<string>;
  // fraction (0-1) of the stage's height the lyrics fill; width is always the full stage
  heightScale?: MaybeRefOrGetter<number>;
  min: number;
  max: number;
};

// Largest font size at which every stanza fits the stage. The stanza with the
// most explicit lines is measured first and sets the starting bound; the rest
// are measured too, since a long line can wrap into a taller stanza.
export function useFitFontSize(options: FitOptions) {
  const { stage, measure, min, max } = options;

  const fittedSize = ref<number | null>(null);
  // the stanza rendered into the measure element
  const measuredStanza = shallowRef<PresentationStanza | null>(null);

  let runId = 0;
  let lastSize = { width: 0, height: 0 };

  function availableSize(element: HTMLElement) {
    const style = getComputedStyle(element);
    return {
      width:
        element.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight),
      height:
        element.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom),
    };
  }

  function largestFittingSize(
    element: HTMLElement,
    width: number,
    height: number,
    upper: number,
  ) {
    const fits = (size: number) => {
      element.style.fontSize = `${size}px`;
      return element.scrollHeight <= height && element.scrollWidth <= width;
    };

    if (!fits(min)) return min;
    let low = min;
    let high = upper;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (fits(mid)) low = mid;
      else high = mid - 1;
    }
    return low;
  }

  async function fit() {
    const run = ++runId;
    const family = toValue(options.fontFamily);

    // measuring before the font loads would fit the fallback font
    try {
      await document.fonts?.load(`32px "${family}"`);
    } catch {
      // measure with whatever font is available
    }
    if (run !== runId) return;

    const stageEl = stage.value;
    const measureEl = measure.value;
    if (!stageEl || !measureEl) return;

    const available = availableSize(stageEl);
    if (available.width <= 0 || available.height <= 0) return;
    lastSize = available;
    // whole pixels: scrollWidth/scrollHeight are rounded, so a fractional box
    // (e.g. 496.8px) would never fit and every stanza would fall to min
    const width = Math.floor(available.width);
    const height = Math.floor(
      available.height * (toValue(options.heightScale) ?? 1),
    );

    // repeated refrains are the same text, so measure each source stanza once
    const unique = [
      ...new Map(
        toValue(options.stanzas).map((stanza) => [stanza.stanzaIndex, stanza]),
      ).values(),
    ].sort((a, b) => countLines(b.text) - countLines(a.text));

    if (!unique.length) {
      fittedSize.value = max;
      return;
    }

    measureEl.style.width = `${width}px`;
    let best = max;
    for (const stanza of unique) {
      measuredStanza.value = stanza;
      await nextTick();
      if (run !== runId) return;

      best = largestFittingSize(measureEl, width, height, best);
      if (best === min) break;
    }

    measuredStanza.value = null;
    fittedSize.value = best;
  }

  watch(
    () => [
      toValue(options.stanzas),
      toValue(options.fontFamily),
      toValue(options.heightScale),
    ],
    () => fit(),
  );

  // window resizes, orientation changes, and the toolbar wrapping all resize the stage
  const refitOnResize = useDebounceFn(() => {
    const stageEl = stage.value;
    if (!stageEl) return;
    const { width, height } = availableSize(stageEl);
    if (
      Math.abs(width - lastSize.width) < 1 &&
      Math.abs(height - lastSize.height) < 1
    )
      return;
    fit();
  }, 150);
  useResizeObserver(stage, refitOnResize);

  onMounted(fit);
  onScopeDispose(() => {
    // drops any fit still waiting on fonts or a render
    runId++;
  });

  return { fittedSize, measuredStanza, fit };
}
