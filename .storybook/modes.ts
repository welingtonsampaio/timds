/**
 * Chromatic modes: each mode defines the globals it controls. Here only the
 * `theme`, read by the decorator in `preview.tsx`. Applied in
 * `parameters.chromatic.modes`, they make Chromatic snapshot each story twice
 * (light and dark), with independent baselines.
 */
export const allModes = {
  light: { theme: 'light' },
  dark: { theme: 'dark' },
} as const
