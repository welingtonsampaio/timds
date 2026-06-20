---
name: design-system-docs
description: Write documentation AND interaction (play function) tests for timds Design System components, delivered as Storybook artifacts — a `*.stories.tsx` file (autodocs-enabled) whose play functions double as behavioral regression checks, plus a co-located `*.mdx` docs page. Use this skill whenever the user wants to document a component, create or improve a component's Storybook docs page, write play-function / interaction / behavior tests, set up regression validation for UI components, or produce MDX with Doc Blocks (Meta, Canvas, Controls). Trigger even if the user only says "document this component", "write stories for X", "add interaction tests", "Storybook docs", or "validate component regression" — docs and regression tests are always produced together here.
---

# Design System Documentation & Interaction Tests (timds)

This skill documents a `timds` component **together with the interaction tests that
guard it against regression**. In Storybook these are not separate concerns: the
stories that document each state of a component are the same stories that run as tests
(in a real Chromium browser via `@storybook/addon-vitest`). A docs page that does not
also encode tested behavior is incomplete for this skill.

> This skill assumes the component already exists. To **create** a component (shadcn
> install, public export, initial stories) use the `add-component` skill first, then
> this skill to deepen its docs and behavioral coverage. The two skills share one
> idiom — keep them consistent.

## Project facts that shape every output (read before writing)

These are not negotiable defaults — they are how `timds` is wired (see `CLAUDE.md` and
`docs/adr/`):

- **Storybook 10**, framework `@storybook/react-vite`. Doc Blocks import from
  **`@storybook/addon-docs/blocks`** (NOT `@storybook/blocks` — that package is not
  installed). Test utils import from **`storybook/test`**.
- **Files are kebab-case and flat** in `src/components/ui/` — `button.tsx`,
  `button.stories.tsx`, `button.mdx`, optional `button.test.tsx`. No per-component
  folder.
- **`title: '<Category>/<ComponentName>'`** on every `meta` — the sidebar is grouped by
  **semantic category, not a flat `UI/*` namespace**. Pick the category that matches the
  component's role, matching the ordered groups in `.storybook/preview.tsx`
  (`storySort.order`):
  - **Layout** — structural surfaces (`Card`, `Separator`).
  - **Navigation** — moving between views (`Tabs`, `Sidebar`, `Pagination`).
  - **Data Entry** — controls that capture input (`Button`, `Input`, `Select`,
    `Checkbox`, `Switch`, `Slider`, `DatePicker`, …).
  - **Data Display** — present read-only data (`Table`, `Badge`, `Avatar`, `Chart`,
    `Item`).
  - **Feedback** — status/async signals (`Alert`, `Progress`, `Spinner`, `Skeleton`,
    `Toaster`).
  - **Overlays** — portaled surfaces (`Dialog`, `AlertDialog`, `Drawer`, `Popover`,
    `Tooltip`, `DropdownMenu`, `ContextMenu`).

  Foundation pages use `Design System/<Page>`. If no category fits, add a new one to
  `storySort.order` rather than falling back to `UI/*`. **`autodocs` and a custom MDX
  page are mutually exclusive** for the same component: a `*.mdx` with
  `<Meta of={Stories} />` IS the Docs entry, so keeping `tags: ['autodocs']` too makes
  Storybook index two Docs pages and **fails the build** (`MultipleIndexingError`).
  Since this skill always ships an MDX page, its stories meta **must not** carry
  `tags: ['autodocs']` — the MDX replaces it. (Components without a custom MDX keep
  `tags: ['autodocs']`; that is what `add-component` scaffolds.)
- **Stories run without Tailwind/CSS** (the Storybook Vitest project loads no
  Tailwind). So play functions assert **DOM / ARIA / behavior, never computed styles
  or layout**. Visual layout is Chromatic's job (see below).
- **a11y is enforced**: `.storybook/preview.tsx` sets `a11y: { test: 'error' }`, so an
  axe violation **fails the test**. Stories must be accessible or explicitly opt out
  (see `references/interaction-testing.md`).
- **Overlays use portals**: Radix/Ariakit append popovers/dialogs to `document.body`,
  outside the story canvas. Query them with `screen` (or `within(document.body)`), not
  `canvas`.
- **Language**: docs **prose is English**; **code comments are English**; story IDs
  and prop names are English (PascalCase stories). Story content/labels are English
  (e.g. `'Launch'`), matching existing stories.

## The two coordinated outputs

For each component, produce **both**:

1. **A stories file** — `<component-name>.stories.tsx` (CSF3). Defines one story per
   visual variant and interactive state, wires callbacks with `fn()` spies, sets rich
   `argTypes` + `meta.parameters.docs.description.component`, and attaches `play`
   functions that simulate user behavior and assert on the result. **These play
   functions are the regression tests** — they run in the Interactions panel, in the
   terminal, and in CI via the Vitest addon. The meta does **not** carry
   `tags: ['autodocs']` (the MDX is the Docs page — see above). Governed by
   `references/interaction-testing.md`.
2. **A docs page** — `<component-name>.mdx`. Explains what the component is, when and
   how to use it, and embeds the live stories via Doc Blocks (`<Canvas of={…} />`,
   `<Controls of={…} />`). It does **not** restate behavior the stories already verify
   — it points at them. Governed by `references/doc-structure.md`.

The MDX page **replaces** the auto-generated autodocs page: it is the single Docs entry
for the component, and it still renders the generated tables/canvases via Doc Blocks
(`<Controls>` reads `argTypes` + JSDoc; `<Canvas>` renders the stories). Both files pull
from the same stories and JSDoc, so they never drift. Treat the stories file as the
single source of truth and the MDX as its frame.

## When NOT to invent

Document and test only what exists. **Read the component source** (`src/components/ui/
<name>.tsx`), its `cva` variants, props/types, `data-slot`, and callbacks before
writing anything. Also read any existing `<name>.stories.tsx` / `<name>.test.tsx` and
mirror their idiom. If a prop, default, or behavior is unknown, ask the user or leave a
clearly marked `<!-- TODO: confirmar -->` / `// TODO: confirmar` rather than guessing.
A test that asserts invented behavior is worse than no test.

## Workflow

Follow these steps in order.

1. **Gather inputs.** Read: the component source and its prop/`cva`/type definitions;
   any existing `*.stories.tsx` / `*.test.tsx` / `*.mdx`; the public export in
   `src/index.ts`; design references (Figma part names, variants) if provided. Confirm
   what the component does NOT do, so you don't document a phantom API.
2. **Read the references you need.** Before writing stories/tests, read
   `references/interaction-testing.md` — the core of this skill. Before the docs page,
   read `references/doc-structure.md`. Consult `references/storybook-authoring.md` for
   CSF3 / Doc Block / autodocs / JSDoc syntax (with the project's exact import paths)
   and `references/content-and-style.md` for voice, microcopy, and language policy.
3. **Write the stories file first.** Set up `meta` (`title: '<Category>/X'`, `component`, `args`
   with `fn()` spies, rich `argTypes` descriptions, a `docs.description.component`).
   Do **not** add `tags: ['autodocs']` — the MDX is the Docs page (if the component
   already had it from `add-component`, remove it now). Add a `Playground` story, a
   `Variants` story, one
   story per state, and `play` functions covering primary behavior, each interactive
   state, edge cases, and accessibility behaviors (keyboard, focus, ARIA). For
   overlay/portal components, add the `Visual*` regression fixtures
   (`references/interaction-testing.md` → "Visual regression").
4. **Write the docs page.** Follow the section order in `references/doc-structure.md`.
   Embed stories with Doc Blocks; let `<Controls>` render the props table from
   `argTypes` + JSDoc instead of hand-writing one. Write **testable** accessibility
   criteria, not vague notes.
5. **Self-check.** Verify, in order: queries follow `ByRole` → … → `ByTestId` (test IDs
   last resort); every `userEvent` and `expect` is `await`ed; no invented API; no
   assertion depends on CSS/layout; portal content is queried via `screen`; every
   interactive behavior in the docs has an assertion in the stories; each variant/state
   has at least a render story; a11y passes (or is explicitly opted out with a reason).
6. **Validate and report.** Run the project's checks (see below), then tell the user
   which file is which and how to run the tests.

## Output structure & file placement

Co-locate, flat, kebab-case — matching the existing repo:

```
src/components/ui/
├── <component-name>.tsx            ← the component (existing)
├── <component-name>.stories.tsx    ← stories + play-function regression tests  (this skill)
├── <component-name>.mdx            ← docs page embedding the stories            (this skill)
└── <component-name>.test.tsx       ← optional jsdom unit tests (throw/branch edges only)
```

Add a `*.test.tsx` **only** for what stories can't express cleanly — throw paths,
defensive/pure-utility branches, and layout-metric edges (see ADR 0006). Most
components ship with stories only.

## Validation

Run before considering the task done:

```bash
npm run check:fix                         # Biome: lint + format + organize imports
npm run typecheck                         # tsc --noEmit
npm run test:storybook                    # stories as browser tests (play + a11y)
npm test                                  # both projects (unit jsdom + storybook browser)
```

Single story file: `npm run test:storybook -- <component-name>.stories.tsx`.
Preview live: `npm run storybook` (:6006) or `npm run dev` (playground).

## Templates & examples

- `assets/templates/component.stories.tsx.template` — stories scaffold with `meta`,
  `fn()` spies, variant stories, and play-function tests (project idiom).
- `assets/templates/component.mdx.template` — MDX docs scaffold with Doc Blocks
  imported from `@storybook/addon-docs/blocks`.
- `assets/examples/button/` — a worked example matching repo conventions:
  `button.stories.tsx` (with interaction tests) and `button.mdx`. Read it when you need
  a concrete reference for how the two files fit together.

## Reference index

| File | Read it when |
| --- | --- |
| `references/interaction-testing.md` | Writing any stories, play functions, regression tests, or `Visual*` fixtures. **The core of this skill.** |
| `references/doc-structure.md` | Writing the MDX docs page — the section-by-section spec. |
| `references/storybook-authoring.md` | You need CSF3 / Doc Block / autodocs / JSDoc syntax or the project's exact import paths. |
| `references/content-and-style.md` | Writing prose: voice/tone, microcopy rules, terminology, language policy. |
