# 0008 — Ariakit (+ TanStack Virtual) for the advanced Select

- Status: Accepted
- Date: 2026-06-17

## Context

The design system needs a `Select` that goes well beyond the native `<select>`
and beyond Radix `Select`. The required feature set is: **search, custom item
render, async option loading, infinite scroll, list virtualization, groups and
full keyboard/ARIA accessibility — without using the native `<select>`**.

Radix `Select` (the primitive used elsewhere in this library, see
[0004](./0004-shadcn-ui-como-base.md)) is a static list: it has no search, no
async loading and no virtualization. The crucial blocker is virtualization: when
only a window of options is mounted in the DOM, a primitive that moves **DOM
focus** between options (roving tabindex) cannot focus an option that is not
rendered. Accessible keyboard navigation over a virtualized list requires
**virtual focus** (`aria-activedescendant`), where DOM focus stays on a single
element and the active option is referenced by id.

## Decision

Build the advanced `Select` on **Ariakit** + **@tanstack/react-virtual**, used
**surgically** — only in `src/components/ui/select.tsx`. Radix remains the base
of the rest of the library; we do **not** migrate the other components.

- **Ariakit** provides the headless combobox/select with WAI-ARIA APG
  accessibility and, critically, **virtual focus** (`aria-activedescendant`). We
  combine `useComboboxStore` + `useSelectStore` and seed both with `defaultItems`
  (the full list, with deterministic ids) so keyboard navigation works even for
  options that are **not mounted** (virtualized).
- **@tanstack/react-virtual** renders only the visible window; we sync the
  Ariakit active id with `scrollToIndex` so the virtually-focused option is kept
  mounted/visible.
- **match-sorter** is the default fuzzy filter for the synchronous, data-driven
  mode (it is disabled when an async `onSearch` is provided).

The public API is **hybrid**: a data-driven `Select` (props `options`,
`onSearch`, `onLoadMore`, `virtualized`, `groupBy`, `renderItem`, ...) built on
top of exported composable primitives (`SelectRoot`, `SelectTrigger`,
`SelectContent`, `SelectSearch`, `SelectList`, `SelectGroup`, `SelectItem`, ...).

Virtualization implies the combobox (virtual focus) even when no search field is
shown. Virtualization and groups are not combined in the same list (a large
virtualized list renders flat); this is an accepted limitation.

## Alternatives considered

- **Radix `Select`** — no search/async/virtualization; roving tabindex is
  incompatible with virtualized (unmounted) options.
- **cmdk (shadcn Combobox base)** — mounts/filters all nodes, which conflicts
  with real virtualization, async loading and infinite scroll.
- **Downshift + TanStack Virtual** — solid accessibility, but the virtual-focus
  ↔ virtualization wiring (group support, far jumps with Home/End) would have to
  be built by hand; much more boilerplate.
- **Migrate everything to Ariakit (drop Radix)** — would mean rewriting
  alert-dialog/radio-group/switch/tabs and the `asChild`/`Slot` mechanism, with
  no functional gain, and would break the `npx shadcn add` flow that assumes
  Radix.

## Consequences

- **Positive:**
  - Delivers every required feature with first-class accessibility (virtual focus
    is the key enabler for accessible virtualization).
  - Radix stays as the base; `npx shadcn add` keeps working for future
    components.
  - Hybrid API serves both the common (data-driven) and advanced (composable)
    cases.
- **Negative/limitations:**
  - A second primitives family (Ariakit) now coexists with Radix in the codebase.
  - Adds `@ariakit/react`, `@tanstack/react-virtual` and `match-sorter` as
    dependencies for consumers.
  - Virtualization and groups are not combined in the same list.

## Related

- [0004 — shadcn/ui as the base (copied components)](./0004-shadcn-ui-como-base.md)
- [0003 — Tailwind v4 with CSS-first tokens](./0003-tailwind-v4-tokens-css.md)
