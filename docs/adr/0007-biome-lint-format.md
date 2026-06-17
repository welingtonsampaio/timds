# 0007 — Biome for lint, formatting and import organization

- Status: Accepted
- Date: 2026-06-17

## Context

The project needs code standardization (formatting), static analysis
(linter) and import organization. The traditional combination is ESLint + Prettier
+ plugins, which involves several dependencies, overlapping configs and is relatively
slow.

## Decision

Adopt **Biome 2** as the single tool for:

- **Formatting** — style matched to the existing code: single quotes in JS/TS,
  double quotes in JSX, no semicolons (`asNeeded`), `trailingCommas: all`,
  2-space indentation, width of 90.
- **Linter** — the `recommended` preset.
- **Import organization** (the "resolver") — via `assist`
  (`source.organizeImports`), automatically sorting and grouping imports.

Configuration in `biome.json`. The CSS parser runs with `tailwindDirectives: true`
to understand `@theme`, `@apply`, `@custom-variant`, etc. from Tailwind v4. Biome
respects the `.gitignore` (`vcs.useIgnoreFile`).

Scripts: `npm run check` (lint + format + imports), `npm run check:fix`,
`npm run lint`, `npm run format`.

## Alternatives considered

- **ESLint + Prettier** — an established standard, but slower, more dependencies
  and more configuration/conflict points.
- **oxc / oxlint** — an extremely fast linter (Rust), but in 2026 the formatter
  is still less mature than Biome's and does not cover import organization in the
  same way. Biome delivers lint + formatting + imports in a single tool,
  also in Rust and fast.

## Consequences

- **Positives:**
  - A single dependency and a single config file for lint/format/imports.
  - Very fast; integrates with VS Code (formatting and import organization on save).
- **Negatives/limitations:**
  - A smaller rule ecosystem than ESLint's (fewer niche plugins).
  - React Hooks-specific rules are more limited; if needed,
    complement in the future.

## Related

- [0003 — Tailwind v4 with CSS-first tokens](./0003-tailwind-v4-tokens-css.md)
