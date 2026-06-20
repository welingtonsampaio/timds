# 0009 — Shared style presets in `src/lib/styles.ts`

- Status: Accepted
- Date: 2026-06-18

## Context

Several components were repeating the same combinations of Tailwind utilities:
the focus ring (`focus-visible:*`), the invalid state (`aria-invalid:*`), the
disabled state (`disabled:*`), the embedded-icon guard (`[&_svg]:*`), and the
modal overlay/surface. Because each component carried its own copy of these
class strings, they drifted out of sync over time — for example,
`AlertDialogContent` was missing the `outline-none` utility that
`DialogContent` already had.

These are not design tokens (colors, spacing, radius); those live in
`src/styles.css` and remain the single source of values. What was duplicated
were **combinations of utilities** that express a shared behavior/state.

## Decision

Extract the repeated utility combinations into named constants in
**`src/lib/styles.ts`**, consumed via `cn(...)`:

- `focusRing` — default control focus ring.
- `ariaInvalid` — destructive border/ring for `aria-invalid`.
- `disabledControl` — `cursor-not-allowed` + reduced opacity when disabled.
- `svgIcon` — guards for embedded SVG icons (no pointer, no shrink, default size).
- `overlayClass` — darkened backdrop for modal overlays (Dialog/AlertDialog).
- `modalSurface` — centered modal surface (position, border/shadow, animation, size).

They are plain class strings concatenated through `cn(...)` (tailwind-merge), so
consumers can still override any utility via `className`, and the order between
presets does not affect the result. The module is **internal**: it is not
re-exported from `src/index.ts`. Color/spacing tokens stay in `src/styles.css`.

## Alternatives considered

- **Keep duplicating (status quo)** — no new indirection, but the drift problem
  remains: each fix has to be applied in every copy, and they keep diverging.
- **Component classes in CSS via `@apply`/`@utility`** — rejected. The resulting
  class would be opaque to tailwind-merge, so consumer overrides through
  `className` would no longer win against the bundled utilities, and we would
  lose TypeScript typing/IntelliSense on the shared strings.
- **JS constants/`cva` presets consumed via `cn(...)`** — chosen. Keeps
  tailwind-merge working (overrides resolve correctly), keeps typing and editor
  support, and gives a single source for each combination.

## Consequences

- **Positive:**
  - Single source for each shared utility combination — no more drift.
  - tailwind-merge override semantics are preserved (consumers can still
    override via `className`).
  - Typed strings with IntelliSense.
- **Negative/limitations:**
  - One extra layer of indirection: the combination lives away from the
    component that uses it.
  - Authors must remember to check `src/lib/styles.ts` when creating a new
    component (reuse an existing preset, or extract a new one instead of
    copying), rather than inlining the classes.

## Related

- [0003 — Tailwind v4 with CSS-first tokens](./0003-tailwind-v4-tokens-css.md)
- [0004 — shadcn/ui as the base](./0004-shadcn-ui-as-base.md)
