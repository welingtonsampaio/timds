# Architecture Decision Records (ADR)

This directory records the architecture decisions of the `timds` project.

Each ADR describes a relevant decision, its context, the alternatives considered
and the consequences. We use a format based on
[MADR](https://adr.github.io/madr/).

## Possible statuses

- **Proposed** — under discussion.
- **Accepted** — decision in effect.
- **Superseded** — replaced by another ADR (with a link).
- **Deprecated** — no longer applies.

## Index

| #    | Decision                                                                                  | Status   |
| ---- | ----------------------------------------------------------------------------------------- | -------- |
| 0001 | [Library mode build with Vite](./0001-build-com-vite-library-mode.md)                     | Accepted |
| 0002 | [Distribution directly from GitHub via `prepare`](./0002-distribuicao-via-github-prepare.md) | Accepted |
| 0003 | [Tailwind v4 with CSS-first tokens and precompiled CSS](./0003-tailwind-v4-tokens-css.md) | Accepted |
| 0004 | [shadcn/ui as the base (copied components)](./0004-shadcn-ui-como-base.md)                 | Accepted |
| 0005 | [Storybook for documentation and development](./0005-storybook-para-documentacao.md)      | Accepted |
| 0006 | [Vitest + Testing Library (jsdom) for testing](./0006-vitest-testing-library.md)          | Accepted |
| 0007 | [Biome for lint, formatting and imports](./0007-biome-lint-format.md)                     | Accepted |
| 0008 | [Ariakit (+ TanStack Virtual) for the advanced Select](./0008-ariakit-para-select-avancado.md) | Accepted |

## Creating a new ADR

Copy an existing file, increment the number and fill in the sections. Update the
table above.
