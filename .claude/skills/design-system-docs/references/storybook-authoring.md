# Storybook Authoring — CSF3, autodocs, Doc Blocks, JSDoc (timds)

Syntax and conventions for the Storybook-native pieces. Pair this with
`interaction-testing.md` (for `play`) and `doc-structure.md` (for the MDX page).

## Version & module notes (read first)

- **Storybook 10**, framework **`@storybook/react-vite`**. Import `Meta`/`StoryObj`
  types from `@storybook/react-vite`.
- **Doc Blocks** import from **`@storybook/addon-docs/blocks`** (the installed addon is
  `@storybook/addon-docs`; `@storybook/blocks` is NOT a dependency).
- **Test utilities** import from **`storybook/test`** (not `@storybook/test`).
- Stories are globbed by `.storybook/main.ts`:
  `['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)']`. Co-locate in
  `src/components/ui/` with kebab-case names.
- The Storybook Vitest project loads **no Tailwind/CSS**, and `a11y: { test: 'error' }`
  is global — see `interaction-testing.md`.

## Component Story Format 3 (CSF3)

A stories file exports a default `meta` object and named story objects. Mirror the
existing files (`button.stories.tsx`, `checkbox.stories.tsx`, `select.stories.tsx`):

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from './button'

const meta = {
  title: 'Data Entry/Button',          // '<Category>/<ComponentName>' — never 'UI/*'
  component: Button,
  tags: ['autodocs'],                  // generate the autodocs page
  parameters: {
    docs: {
      description: {
        component:
          'One-paragraph English description of the component for autodocs. ' +
          'Markdown is allowed: **variants**, `props`, etc.',
      },
    },
  },
  args: {
    children: 'Button',
    onClick: fn(),                     // default args + spies, inherited by all stories
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual style / emphasis of the button.',
      table: { defaultValue: { summary: 'default' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show a spinner in place of the icon and disable the button.',
    },
    icon: { control: false, description: 'Icon node shown alongside the content.' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }
```

- `satisfies Meta<typeof Component>` gives type-safety and arg autocompletion.
- Story `args` merge over `meta.args`.
- A **JSDoc `/** … */` comment above a story** becomes its description on the docs page —
  the repo uses this heavily instead of `parameters.docs.description.story` (both work;
  prefer the JSDoc form to match existing files).
- Component-level prose goes in `meta.parameters.docs.description.component`.
- Provide a `Playground` story (empty `{}`) for the Controls panel and a `Variants` (or
  `Sizes`, `States`) story that lays out every variant side by side via `render`.

## Autodocs vs. a custom MDX page (mutually exclusive)

- `tags: ['autodocs']` generates a Docs page from the stories + metadata. `add-component`
  scaffolds it, so most components that have **no** custom MDX use it.
- A custom `<component-name>.mdx` with `<Meta of={Stories} />` **is** the component's
  Docs page. Having **both** `autodocs` and such an MDX makes Storybook index two Docs
  entries for the same component and **fails with `MultipleIndexingError`**.
- Therefore: when you add an MDX page (this skill always does), **remove
  `tags: ['autodocs']` from the stories meta**. The MDX replaces it and still renders the
  generated tables/canvases via Doc Blocks. The CSF3 example above shows `tags:
  ['autodocs']` for the no-MDX case — drop it once the MDX exists.

## JSDoc → Controls table

`<Controls>` renders the props table automatically from `argTypes` and from **JSDoc** on
the component's prop types. Rich JSDoc means a rich, accurate, self-updating table — so
write it on the props and do not hand-maintain a duplicate table.

```tsx
type ButtonProps = {
  /** Button label or content. */
  children: React.ReactNode
  /**
   * Visual style / emphasis of the button.
   * @default 'default'
   */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  /**
   * Show a spinner in place of the icon and disable the button.
   * @default false
   */
  loading?: boolean
}
```

Union types become the control's options; `@default` populates the default column; the
description line becomes the prop description. Use `argTypes` in `meta` to override or
enrich what JSDoc can't express (control type, `table.defaultValue.summary`, hiding a
prop with `control: false`).

## Doc Blocks (in MDX)

Import from `@storybook/addon-docs/blocks`. The ones you'll use most:

- `<Meta of={Stories} />` — binds the MDX page to a stories file.
- `<Canvas of={Stories.Default} />` — renders a story live, with a toolbar.
- `<Controls of={Stories.Playground} />` — the auto-generated, interactive props table.
- `<Story of={Stories.Default} />` — embed just the rendered story.
- `<Source of={Stories.Default} />` — show a story's source code.
- `<ColorPalette>` / `<ColorItem>` and `<Typeset>` — for token/foundation pages.

For a standalone foundation page (no stories file) use `<Meta title="..." />`, as
`src/design-system/Introduction.mdx` does.

Prefer these over pasting static screenshots or hand-written prop tables: they stay in
sync with the code and the tests.

## Naming & placement

- `title: '<Category>/<ComponentName>'` controls the sidebar hierarchy — group by
  **semantic category, not a flat `UI/*` namespace** (`Data Entry/Button`,
  `Data Entry/Select`, `Data Display/Table`). The category must be one of the ordered
  groups in `.storybook/preview.tsx` → `storySort.order` (Layout, Navigation, Data Entry,
  Data Display, Feedback, Overlays); add a new one there if none fits. Foundation pages
  use `Design System/<Page>`. See the category guide in `SKILL.md`.
- Co-locate `<component-name>.stories.tsx` and `<component-name>.mdx` with the component
  in `src/components/ui/`, kebab-case.
- Hide regression-only fixtures from the sidebar/docs with `tags: ['!dev', '!autodocs']`
  (see `interaction-testing.md` → Visual regression).
