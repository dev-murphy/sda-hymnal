import type { FuseResultMatch, RangeTuple } from "fuse.js";

export function slugify(text: string | undefined): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function formatVerseType(verseType: string) {
  return verseType.replaceAll('_', ' ');
}

export function highlightMatches(
  text: string,
  indices: readonly RangeTuple[] = [],
): HighlightChunk[] {
  const chunks: HighlightChunk[] = [];
  let lastIndex = 0;

  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  for (const [start, end] of sorted) {
    if (end < lastIndex) continue; // overlaps a range already highlighted
    if (start > lastIndex) {
      chunks.push({ text: text.slice(lastIndex, start), match: false });
    }
    chunks.push({ text: text.slice(Math.max(start, lastIndex), end + 1), match: true });
    lastIndex = end + 1;
  }

  if (lastIndex < text.length) {
    chunks.push({ text: text.slice(lastIndex), match: false });
  }

  return chunks;
}

export function getLyricSnippet(match: FuseResultMatch) {
  const text = match.value ?? "";
  if (!match.indices.length) return null;

  const [start] = match.indices.reduce((best, range) =>
    range[1] - range[0] > best[1] - best[0] ? range : best,
  );

  const lineStart = text.lastIndexOf("\n", start) + 1;
  const newline = text.indexOf("\n", start);
  const lineEnd = newline === -1 ? text.length : newline;

  const indices = match.indices
    .filter(([s, e]) => s >= lineStart && e < lineEnd)
    .map(([s, e]): RangeTuple => [s - lineStart, e - lineStart]);

  return { text: text.slice(lineStart, lineEnd), indices };
}
