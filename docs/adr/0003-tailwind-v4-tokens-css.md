# 0003 — Tailwind v4 with CSS-first tokens and pre-compiled CSS

- Status: Accepted
- Date: 2026-06-17

## Context

The library **bundles the design system**. We need to decide how the tokens
(colors, radius, typography, dark mode) and the components' styles reach the
consumer — and how much configuration effort it requires from them.

## Decision

Use **Tailwind CSS v4** with **CSS-first** configuration (no `tailwind.config.js`):

- Tokens declared in `src/styles.css` via `@theme`/CSS variables, including the
  `dark` theme (activated by the `.dark` class).
- Tailwind is integrated into the build through the `@tailwindcss/vite` plugin.
- In the library build, the CSS is **pre-compiled** into a single file
  (`dist/timds.css`), containing the tokens and exactly the utilities used by the
  components.
- The consumer imports `timds/styles.css` **once** and does not need to configure
  Tailwind in their project.

## Alternatives considered

- **Ship the source and let the consumer's Tailwind scan it** — would require every
  consumer to have Tailwind configured and add the package to `content`/`@source`.
  More fragile and coupled.
- **CSS-in-JS / styled-components** — departs from the shadcn/ui + Tailwind standard
  and adds runtime.
- **Tailwind v3 with `tailwind.config.js`** — v4 is the current version, with a
  simpler CSS-first config and better performance.

## Consequences

- **Positive:**
  - Zero Tailwind configuration on the consumer's side; just import the CSS.
  - The design system is the single source of truth for the tokens.
- **Negative/limitations:**
  - Classes generated **dynamically** (concatenated at runtime) may not make it
    into the pre-compiled CSS, since Tailwind does not see them when scanning the
    source. Rule: use **static/complete** class names in the components.
  - If the consumer also uses Tailwind, there may be duplication of utilities
    (acceptable; the cost is small and the CSS is tree-shaken by usage).

## Related

- [0004 — shadcn/ui as the base](./0004-shadcn-ui-as-base.md)
