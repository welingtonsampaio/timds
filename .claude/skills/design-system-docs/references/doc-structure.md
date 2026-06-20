# Documentation Page Structure (timds MDX)

The section-by-section spec for a component's MDX docs page
(`src/components/ui/<component-name>.mdx`). This page **is** the component's Docs entry —
it replaces the auto-generated autodocs page, so the stories meta must not carry
`tags: ['autodocs']` (see `storybook-authoring.md`). It explains and frames; the stories
demonstrate and verify. Do not restate in prose what a story already shows or a play
function already asserts; embed and reference instead.

> Doc Blocks import from **`@storybook/addon-docs/blocks`** (Storybook 10), never
> `@storybook/blocks`. Prose is **English**; code stays English; in-code comments are
> Portuguese (see `content-and-style.md`).

## Section order

Use this order. Omit a section that does not apply rather than padding it.

1. **Title, status & one-line summary** — component name as `# H1`; a status badge
   (`Stable` / `Beta` / `Deprecated`) when known; one sentence on what it does and its
   role. Place `<Meta of={Stories} />` at the top to bind the page to the stories.
2. **Overview** — 2–4 sentences: purpose, the problem it solves, where it fits. Embed
   the canonical example with `<Canvas of={Stories.Default} />` (or `Stories.Playground`).
3. **Anatomy** — the named parts (container, label, icon slot, helper text…). Use the
   same part names as the Figma component when one exists, so design and code align.
4. **Usage** — `## When to use` and `## When not to use`, as concrete, scannable bullets
   that start with a verb or a clear condition.
5. **Variants & states** — every visual variant and interactive state, each embedded as
   `<Canvas of={Stories.X} />`. Because each is a story, each is also render-tested and
   axe-checked. Interactive states link to the play-function story that drives them.
6. **Props / API** — render `<Controls of={Stories.Playground} />` (or `Stories.Default`).
   The table is generated from `argTypes` + JSDoc on the prop types, so do **not**
   hand-write a parallel table — it drifts. Make sure prop descriptions live in
   JSDoc/`argTypes`.
7. **Behavior & interaction** — briefly describe the interactive behaviors, then point
   to the stories that verify them (e.g. "Activation fires `onClick` — see the
   `ClicksOnce` story"). This section and the play-function tests must agree: every
   behavior named here has an assertion in the stories file.
8. **Code examples** — minimal, copy-pasteable snippets in fenced ```tsx blocks. Most
   common case first, then notable variations. Import from the public package, mirroring
   `Introduction.mdx`: `import { Button } from 'timds'`. Pair an example with
   `<Canvas of={…} />` to make it live, or use `<Source of={Stories.X} />` to show a
   story's code.
9. **Content & UX writing** — microcopy rules for text *inside* the component: label
   conventions, capitalization, length limits, error/empty-state tone, what to avoid.
10. **Accessibility** — **testable** criteria, not vague notes: keyboard interaction
    (e.g. Enter/Space to activate), required ARIA roles/attributes, focus management.
    Where a criterion is behavioral, it is also asserted in a play function (see
    `interaction-testing.md`); note that axe runs on every story
    (`a11y: { test: 'error' }`), so static rules are already gated.
11. **Do's and Don'ts** — paired, contrastive, prescriptive, actionable.
12. **Related components & patterns** — links to sibling components and how this one
    **composes** into common flows (forms, navigation). Explain the rationale, not just
    the list.
13. **Changelog / version notes** *(optional)* — breaking changes and migration notes.

## Formatting rules

- Correct heading hierarchy; fenced code blocks with language tags; blockquotes for
  warnings.
- **Never use Markdown pipe tables (`| Col | … |`)** — the Storybook MDX pipeline has no
  `remark-gfm`, so a pipe table renders as raw `| --- |` text, not a table. For a
  component's own props use the live `<Controls of={Stories.X} />` Doc Block. For
  **subcomponent props** (parts whose component is not `meta.component`, e.g.
  `TableGroupRow` alongside `Table`), document them as a **Markdown list**
  (`- **propName** (\`type\`, default \`x\`) — description.`), mirroring the **Anatomy**
  list and `card.mdx`. If you truly need a grid, hand-write a JSX/HTML `<table>` (always
  rendered) — but a list is preferred and matches the repo.
- Prose is concise — every sentence earns its place. Imperative for guidance, present
  tense for descriptions.
- Consistent terminology — one term per concept (see `content-and-style.md`); match the
  names the component source uses (`variant`, `size`, `shape`, `loading`…).
- Prefer a live Doc Block over static text whenever Storybook can render the thing
  (props, canvas, source).
- **Never assert visual claims the test suite cannot back** (e.g. exact pixel sizes) —
  the Storybook test project has no CSS; layout is verified by Chromatic.
- **Always use a Markdown list (or explicit line breaks) for any multi-line set** — in
  MDX, adjacent lines with no blank line and no list marker collapse into a single
  run-on paragraph. This bites the **Do's and Don'ts** and **Accessibility** sections
  most: write each `✅`/`❌`/criterion as a `- ` list item, never as bare stacked lines.
  Hard line breaks (two trailing spaces or `<br />`) also work, but a list is preferred.

## MDX skeleton (reference)

```mdx
import { Meta, Canvas, Controls, Source } from '@storybook/addon-docs/blocks'
import * as Stories from './button.stories'

<Meta of={Stories} />

# Button · `Stable`

One-sentence summary of what it does and its role.

## Overview
<Canvas of={Stories.Default} />

## Anatomy
- **Container** — the interactive surface; carries the variant styling and hit target.
- **Label** — a verb-first action.

## When to use
- Use when …

## When not to use
- Avoid when … use **<Sibling>** instead.

## Variants & states
### Default
<Canvas of={Stories.Default} />
### Loading
<Canvas of={Stories.Loading} />

## Props
<Controls of={Stories.Playground} />

## Behavior & interaction
Activation fires `onClick` (verified by `ClicksOnce`); a loading button is disabled
and ignores clicks (`Loading`).

## Accessibility
- Focusable and operable by keyboard (Tab to focus, Enter/Space to activate) — see
  `FocusesWithKeyboard`.
- Exposes role `button`; `aria-busy="true"` while loading.

## Do's and Don'ts
- ✅ Do …
- ❌ Don't …

## Related components & patterns
- **ButtonGroup** — composes related actions; keep at most one primary inside it.
```

The MDX imports the very stories that carry the interaction tests, so the documentation
and the regression suite never drift apart.
