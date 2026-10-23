// Each stop is [light theme, dark theme]: darker on white, lighter on dark.
// A solid accent's two stops are the same hue, so its gradients stay subtle.
export type Accent = {
  value: string;
  name: string;
  kind: "solid" | "gradient";
  from: [light: string, dark: string];
  to: [light: string, dark: string];
};

export const ACCENTS: Accent[] = [
  { value: "amber", name: "Amber", kind: "solid", from: ["#d97706", "#fbbf24"], to: ["#f59e0b", "#fcd34d"] },
  { value: "rose", name: "Rose", kind: "solid", from: ["#e11d48", "#fb7185"], to: ["#f43f5e", "#fda4af"] },
  { value: "violet", name: "Violet", kind: "solid", from: ["#7c3aed", "#a78bfa"], to: ["#8b5cf6", "#c4b5fd"] },
  { value: "blue", name: "Blue", kind: "solid", from: ["#2563eb", "#60a5fa"], to: ["#3b82f6", "#93c5fd"] },
  { value: "teal", name: "Teal", kind: "solid", from: ["#0d9488", "#2dd4bf"], to: ["#14b8a6", "#5eead4"] },
  { value: "emerald", name: "Emerald", kind: "solid", from: ["#059669", "#34d399"], to: ["#10b981", "#6ee7b7"] },
  { value: "gold", name: "Gold", kind: "gradient", from: ["#ca8a04", "#fde047"], to: ["#ea580c", "#f59e0b"] },
  { value: "sunset", name: "Sunset", kind: "gradient", from: ["#ea580c", "#fb923c"], to: ["#db2777", "#f472b6"] },
  { value: "royal", name: "Royal", kind: "gradient", from: ["#7c3aed", "#a78bfa"], to: ["#db2777", "#f472b6"] },
  { value: "ocean", name: "Ocean", kind: "gradient", from: ["#0284c7", "#38bdf8"], to: ["#4f46e5", "#818cf8"] },
  { value: "aurora", name: "Aurora", kind: "gradient", from: ["#0d9488", "#2dd4bf"], to: ["#7c3aed", "#a78bfa"] },
];

export const DEFAULT_ACCENT = "amber";

export function findAccent(value: string | undefined) {
  return (
    ACCENTS.find((accent) => accent.value === value) ??
    ACCENTS.find((accent) => accent.value === DEFAULT_ACCENT)!
  );
}

// the CSS variables main.css builds the accent tokens from
export function accentStyle(accent: Accent) {
  const pick = ([light, dark]: [string, string]) =>
    `light-dark(${light}, ${dark})`;
  return `--accent: ${pick(accent.from)}; --accent-to: ${pick(accent.to)};`;
}
