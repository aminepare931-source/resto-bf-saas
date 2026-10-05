import type { StdPalette } from "./tpl-std-base";

/* ---------- Palettes des 4 templates standard ---------- */

/** Soleil — or solaire, fond chaud sombre */
export const PALETTE_SOLEIL: StdPalette = {
  bg: "#131315",
  surface: "#1b1b1d",
  surfaceHigh: "#2a2a2c",
  text: "#e5e1e4",
  textMuted: "#d4c4b0",
  primary: "#ffc665",
  primaryInk: "#432c00",
  container: "#e5a93c",
  containerInk: "#5e4000",
  positive: "#49eb7b",
  border: "rgba(255,198,101,0.18)",
  scrim: "14,14,16",
};

/** Savane — terre d'ocre, brun chaud */
export const PALETTE_SAVANE: StdPalette = {
  bg: "#17110c",
  surface: "#211912",
  surfaceHigh: "#2e231a",
  text: "#f3e9dc",
  textMuted: "#cdb79c",
  primary: "#e0a458",
  primaryInk: "#3a2200",
  container: "#b85f27",
  containerInk: "#fff4e6",
  positive: "#9bd16b",
  border: "rgba(224,164,88,0.2)",
  scrim: "23,17,12",
};

/** Vert — émeraude, produits frais */
export const PALETTE_VERT: StdPalette = {
  bg: "#0c1a12",
  surface: "#12241a",
  surfaceHigh: "#1b3326",
  text: "#e8f3ec",
  textMuted: "#a9c4b3",
  primary: "#49eb7b",
  primaryInk: "#003915",
  container: "#1ace62",
  containerInk: "#00391a",
  positive: "#49eb7b",
  border: "rgba(73,235,123,0.2)",
  scrim: "8,20,13",
};

/** Épuré — clair, minimal, encre noire */
export const PALETTE_EPURE: StdPalette = {
  bg: "#faf8f5",
  surface: "#ffffff",
  surfaceHigh: "#f0ece6",
  text: "#1c1b1a",
  textMuted: "#6b645b",
  primary: "#7e5700",
  primaryInk: "#ffffff",
  container: "#1c1b1a",
  containerInk: "#faf8f5",
  positive: "#1a9d4f",
  border: "rgba(28,27,26,0.1)",
  scrim: "20,18,16",
  light: true,
};
