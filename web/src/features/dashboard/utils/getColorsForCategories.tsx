type Color =
  | "indigo"
  | "cyan"
  | "zinc"
  | "purple"
  | "slate"
  | "gray"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "sky"
  | "blue"
  | "violet"
  | "fuchsia"
  | "pink"
  | "rose";

const predefinedColors: Color[] = [
  "indigo",
  "cyan",
  "zinc",
  "purple",
  "yellow",
  "red",
  "lime",
  "pink",
  "emerald",
  "teal",
  "fuchsia",
  "sky",
  "blue",
  "orange",
  "violet",
  "rose",
  "green",
  "amber",
  "slate",
  "gray",
  "neutral",
  "stone",
];

export function getRandomColor() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return predefinedColors[arr[0] % predefinedColors.length];
  }
  return predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
}

export function getColorsForCategories(categories: string[]): Color[] {
  if (categories.length <= predefinedColors.length) {
    return predefinedColors.slice(0, categories.length);
  }
  const colors: Color[] = predefinedColors;
  while (colors.length < categories.length) {
    colors.push(getRandomColor());
  }
  return colors;
}
