/**
 * Modos do Chromatic: cada modo define os globals que controla. Aqui só o
 * `theme`, lido pelo decorator em `preview.tsx`. Aplicados em
 * `parameters.chromatic.modes`, fazem o Chromatic snapshotar cada story duas
 * vezes (light e dark), com baselines independentes.
 */
export const allModes = {
  light: { theme: 'light' },
  dark: { theme: 'dark' },
} as const
