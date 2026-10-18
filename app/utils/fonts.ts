export type FontCategory = 'serif' | 'sans-serif';

export type Font = {
  name: string;
  category: FontCategory;
  weights?: string[];
};

// Shared by nuxt.config.ts (to load the fonts) and the hymn font selector
export const FONTS: Font[] = [
  { name: 'Archivo', category: 'sans-serif', weights: ['100 900'] },
  { name: 'Spectral', category: 'serif' },
  { name: 'Epilogue', category: 'sans-serif', weights: ['400', '700'] },
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Poppins', category: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif' },
  { name: 'Raleway', category: 'sans-serif' },
  { name: 'Source Sans 3', category: 'sans-serif' },
  { name: 'Work Sans', category: 'sans-serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'PT Serif', category: 'serif' },
  { name: 'Noto Serif', category: 'serif' },
  { name: 'EB Garamond', category: 'serif' },
  { name: 'Libre Baskerville', category: 'serif' },
  { name: 'Crimson Text', category: 'serif' },
];

export function toFontFamily(font: Font) {
  return `'${font.name}', ${font.category}`;
}
