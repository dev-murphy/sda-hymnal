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
