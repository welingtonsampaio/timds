# 0004 — shadcn/ui as the base (copied components)

- Status: Accepted
- Date: 2026-06-17

## Context

We need a base of accessible, well-tested components on top of which to build the
design system, without reinventing UI primitives (focus, keyboard, ARIA).

## Decision

Adopt the **shadcn/ui** model: the components are **copied into our source code**
(`src/components/ui`) and maintained by us, rather than consumed as a closed
dependency. The accessible primitives come from **Radix UI**
(e.g., `@radix-ui/react-slot`), and class composition uses
`class-variance-authority` + the `cn` utility (`clsx` + `tailwind-merge`).

The `components.json` is configured (`new-york` style, Tailwind v4, `@` alias) to
allow adding new components with `npx shadcn@latest add <component>`.

## Alternatives considered

- **Closed component library (e.g., MUI, Mantine)** — themes and styles less
  flexible for a custom design system; larger runtime and API.
- **Plain Radix UI** — would require building the entire styling/variants layer
  from scratch.
- **Depend on a `shadcn` package** — it does not exist as a dependency: the
  shadcn/ui model is precisely to copy the code (full ownership).

## Consequences

- **Positive:**
  - Full control over each component's code and styles — ideal for a design system
    that needs to diverge from the defaults.
  - Accessibility inherited from Radix.
  - Typed, predictable variants with `cva`.
- **Negative/limitations:**
  - Updates from shadcn/ui upstream do not arrive automatically; relevant changes
    need to be reapplied manually.

## Related

- [0003 — Tailwind v4 with CSS-first tokens](./0003-tailwind-v4-tokens-css.md)
