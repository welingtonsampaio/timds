---
name: add-component
description: >-
  Add a new component to the timds library following its shadcn/ui + Tailwind v4
  conventions. Use when asked to "add a component", "install a shadcn component",
  "create a new UI component", or "add <X> to the design system". Covers the full
  flow: registry check, install/build, public export, stories, tests, and validation.
---

# Add new component

Add a component to the `timds` library using shadcn/ui (`new-york` style) + Tailwind CSS v4.

This library is **distributed directly from GitHub** and its only public surface is
`src/index.ts`. A component does not exist for consumers until it is exported there.
Everything lives in `src/components/ui/` with **kebab-case** filenames (`radio-group.tsx`),
and **code + comments are written in Portuguese** (see `CLAUDE.md`).

## Workflow

### 1. Check if the component exists in shadcn

If the shadcn MCP is configured, use it to inspect the registry:

- Search: `search_items_in_registries` with the component name
- View structure/deps: `view_items_in_registries`
- Usage examples: `get_item_examples_from_registries` with `"<component>-demo"`

If the MCP is not available, browse https://ui.shadcn.com/docs/components.

**Decision:**
- Exists in shadcn → step 2 (install)
- Doesn't exist → step 3b (build custom)

**Common shadcn components:**
- **Layout:** Card, Separator, Tabs, Accordion, Collapsible
- **Forms:** Button, Input, Select, Checkbox, Radio, Switch, Textarea, Label, Form
- **Feedback:** Alert, Toast, Progress, Skeleton, Badge, Spinner
- **Overlay:** Dialog, Drawer, Popover, Tooltip, Dropdown Menu, Context Menu, Alert Dialog
- **Navigation:** Navigation Menu, Breadcrumb, Pagination, Command
- **Data:** Table, Data Table, Calendar, Chart

### 2. Install the shadcn component

Config lives in `components.json` (Tailwind v4, `src/styles.css`, lucide icons). Run:

```bash
npx shadcn@latest add <component-name>
```

The file is copied into `src/components/ui/<component-name>.tsx` (it is **copied, not a
dependency**) and already wired to the CSS variables in `src/styles.css`.

Review the generated file to understand its `cva` variants, props interface, and which
tokens it consumes. Then bring it in line with repo conventions (step 3a).

### 3a. Align with repo conventions

Generated shadcn code mostly already matches, but verify each:

- **Variants via `cva`** + `VariantProps`, with `defaultVariants`. Export the variants
  object when consumers may need it (e.g. `export { Button, buttonVariants }`).
- **`data-slot="<name>"`** attribute on the root element (used for styling/queries).
- **`asChild` via `radix-ui` `Slot.Root`** when the component should be able to render
  as a different element (e.g. an `<a>`).
- **`cn(...)`** from `@/lib/utils` to merge `className` last so consumers can override.
- **Icons** from `lucide-react`.
- **Shared style presets (`src/lib/styles.ts`).** The repo extracts repeated
  Tailwind utility combinations into reusable constants (`focusRing`,
  `ariaInvalid`, `disabledControl`, `svgIcon`, `overlayClass`, `modalSurface`).
  - **Reuse them** via `cn(...)` whenever the component has focus, an
    `aria-invalid` state, a disabled state, or embedded icons — don't recopy the
    class strings (this keeps tailwind-merge overrides working). See ADR 0009.
  - **Extract a new preset** if a class combination you're adding also appears in
    an existing component: add it to `src/lib/styles.ts` (with a Portuguese
    comment) instead of duplicating. Color/spacing tokens still belong in
    `src/styles.css`.
- **Comments in Portuguese.**

Reference shape (mirrors `src/components/ui/badge.tsx`):

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const widgetVariants = cva('base classes here', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      // Tokens semânticos vêm de src/styles.css: success / warning / info
      success: 'bg-success text-success-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Widget({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof widgetVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="widget"
      data-variant={variant}
      className={cn(widgetVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Widget, widgetVariants }
```

### 3b. Build a custom component (if not in shadcn)

Same conventions as 3a. Compose existing shadcn primitives where possible, use the
CSS-variable Tailwind classes (`bg-card`, `text-muted-foreground`, `border-border`,
`bg-success`, …) as the source of truth, and never hardcode colors.

### 4. Export from the public API (`src/index.ts`)

**Required — this is what gets published.** Add the component, its variants, and its
prop/variant types:

```ts
export { Widget, type WidgetProps, widgetVariants } from '@/components/ui/widget'
```

Keep the exports alphabetically grouped under the `// Componentes` section, matching the
existing entries.

### 5. Add Storybook stories

Create `src/components/ui/<component-name>.stories.tsx`. Stories are the **primary source
of truth for behavior** — every `*.stories.tsx` is rendered in a real browser (chromium)
as a smoke test, and `play` functions run as interaction tests.

Mirror `badge.stories.tsx` / `button.stories.tsx`:

- `title: 'UI/<ComponentName>'`, `tags: ['autodocs']`, a `docs.description.component`.
- `argTypes` for each prop (control type, description, default summary).
- A `Playground` story (`export const Playground: Story = {}`) for the Controls panel.
- A `Variants` story showing every variant side by side.
- Stories for each meaningful state (disabled, loading, with icon, etc.).
- **`play` functions** for any interactive behavior, using `storybook/test`:

```tsx
import { expect, fn, userEvent, within } from 'storybook/test'

export const ClickFires: Story = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Ação' }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
```

Note: when asserting that a disabled/`pointer-events: none` element does **not** fire a
handler, the Storybook browser runtime blocks the click — bypass it with
`userEvent.setup({ pointerEventsCheck: 0 })` while still asserting the handler wasn't called.

### 6. Add unit tests (when they add value)

Behavior must be covered (prefer `play` functions). For logic best checked in isolation,
add `src/components/ui/<component-name>.test.tsx` (jsdom + Testing Library), mirroring
`button.test.tsx`: render/role assertions, variant/prop behavior, accessibility (ARIA,
keyboard), and interactions via `@testing-library/user-event`.

### 7. Validate

Run before considering the task done:

```bash
npm run check:fix    # Biome: lint + format + organize imports
npm run typecheck    # tsc --noEmit
npm test             # both projects: unit (jsdom) + storybook (browser)
```

Optionally preview in the playground (`npm run dev`) or Storybook (`npm run storybook`).

## Directory structure

```
src/
├── index.ts                       # PUBLIC API — must export the component (step 4)
├── styles.css                     # design tokens (CSS variables) — source of truth
└── components/ui/
    ├── <component-name>.tsx        # the component (kebab-case)
    ├── <component-name>.stories.tsx # stories + play functions (step 5)
    └── <component-name>.test.tsx    # optional jsdom unit tests (step 6)
```

## Conventions checklist

- [ ] File in `src/components/ui/`, kebab-case name
- [ ] `cva` variants + `data-slot` + `cn(className)` merge + `asChild` via `Slot.Root`
- [ ] Reuse shared presets from `src/lib/styles.ts` (`focusRing`, `ariaInvalid`, `disabledControl`, `svgIcon`, …) via `cn(...)` — and extract a new preset instead of duplicating a combination already used elsewhere (ADR 0009)
- [ ] Comments and code in **Portuguese**
- [ ] Exported from `src/index.ts` (component + types + variants)
- [ ] `*.stories.tsx` with Playground, Variants, states, and `play` functions
- [ ] Behavior tested (play functions and/or `*.test.tsx`)
- [ ] `npm run check:fix && npm run typecheck && npm test` all green

## Notes

- **CSS variables in `src/styles.css` are the source of truth** (NOT `globals.css`);
  Tailwind classes reference them (`bg-primary`, `text-muted-foreground`, `bg-success`).
- **Extend, don't rebuild** — customize shadcn components rather than building from scratch.
- **There is no `tailwind.config`** — Tailwind v4 is configured via CSS `@import`/`@theme`.
- Docs/READMEs/ADRs are in English; in-repo code and comments are in Portuguese.
