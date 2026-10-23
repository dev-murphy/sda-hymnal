import type { HymnData } from "~/types";

type Hymn = HymnData[number];

export type PresentationStanza = {
  kind: "verse" | "refrain";
  // stored stanza type, e.g. "VERSE_2" or "REFRAIN"
  type: string;
  text: string;
  // index into hymn.stanzas, so repeated refrains share one source stanza
  stanzaIndex: number;
};

export const PRESENTATION_FONT_SIZE = { min: 16, max: 160, step: 4 };
// percent of the stage's height auto-fitted lyrics fill
export const PRESENTATION_FIT_SCALE = { min: 45, max: 85, step: 5 };

export function normalizeLineBreaks(text: string) {
  return text.replace(/\r\n?/g, "\n");
}

// explicit lines only; wrapping is measured in the DOM by useFitFontSize
export function countLines(text: string) {
  return normalizeLineBreaks(text).split("\n").length;
}

function toPresentationStanza(hymn: Hymn, stanzaIndex: number) {
  const stanza = hymn.stanzas[stanzaIndex];
  if (!stanza?.text.trim()) return null;

  return {
    kind: stanza.type === "REFRAIN" ? "refrain" : "verse",
    type: stanza.type,
    text: normalizeLineBreaks(stanza.text),
    stanzaIndex,
  } satisfies PresentationStanza;
}

// Verse 1, Refrain, Verse 2, Refrain, ... built on the fly from the stored stanzas.
// A refrain stored first is sung first; a refrain stored right after a verse
// belongs to that verse (#140 ends on a different refrain), and every other
// verse gets the hymn's first refrain.
export function buildPresentationSequence(hymn: Hymn | undefined) {
  if (!hymn?.stanzas.length) return [];

  // recorded order from the hymn data takes precedence when it is valid
  if (hymn.performance?.length) {
    const performed = hymn.performance
      .map((index) => toPresentationStanza(hymn, index))
      .filter((stanza) => stanza !== null);
    if (performed.length) return performed;
  }

  const stanzas = hymn.stanzas;
  const defaultRefrain = stanzas.findIndex((s) => s.type === "REFRAIN");
  const hasVerses = stanzas.some((s) => s.type !== "REFRAIN");

  const indices: number[] = [];
  if (!hasVerses) {
    if (defaultRefrain !== -1) indices.push(defaultRefrain);
  } else {
    if (defaultRefrain === 0) indices.push(0);

    stanzas.forEach((stanza, index) => {
      // an empty verse takes its refrain with it, so two refrains never run together
      if (stanza.type === "REFRAIN" || !stanza.text.trim()) return;
      indices.push(index);
      if (defaultRefrain === -1) return;
      indices.push(
        stanzas[index + 1]?.type === "REFRAIN" ? index + 1 : defaultRefrain,
      );
    });
  }

  return indices
    .map((index) => toPresentationStanza(hymn, index))
    .filter((stanza) => stanza !== null);
}

// the stanza the default font size is fitted to: the most explicit lines wins
export function findTallestStanza(sequence: PresentationStanza[]) {
  return sequence.reduce<PresentationStanza | undefined>(
    (tallest, stanza) =>
      !tallest || countLines(stanza.text) > countLines(tallest.text)
        ? stanza
        : tallest,
    undefined,
  );
}
