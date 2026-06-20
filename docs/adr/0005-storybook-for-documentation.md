# 0005 — Storybook for documentation and development

- Status: Accepted
- Date: 2026-06-17

## Context

A design system needs an environment to develop, preview and document
components in isolation, covering variants, states and the light/dark themes.

## Decision

Adopt **Storybook 10** with the **`@storybook/react-vite`** framework (reuses
the project's own Vite/Tailwind):

- Stories in **CSF3** format (`*.stories.tsx`) alongside each component.
- `@storybook/addon-docs` with `autodocs` for documentation generated from the stories.
- `@storybook/addon-a11y` for accessibility checks.
- A global **theme** toolbar (light/dark) in `.storybook/preview.tsx`, which
  applies the `.dark` class and imports `src/styles.css`.

To avoid interfering with the library build, `vite.config.ts` disables
`build.lib` and the types plugin when running under Storybook.

## Alternatives considered

- **Ladle** — lighter, but a smaller addon ecosystem (docs, a11y).
- **Just the playground (`dev/`)** — good for a quick test, but it does not document
  variants nor generate browsable docs.
- **Docusaurus/custom site** — high effort and redundant with Storybook.

## Consequences

- **Positives:**
  - Isolated per-component development, with interactive controls.
  - Living documentation (autodocs) and accessibility verification.
  - `build-storybook` generates a publishable static site.
- **Negatives/limitations:**
  - More development dependencies and Storybook build time.
  - Stories must be kept in sync with the components.

## Related

- [0006 — Vitest + Testing Library for testing](./0006-vitest-testing-library.md)
