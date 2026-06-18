# Interaction Testing — play functions as regression checks (timds)

The core reference of the skill. Interaction tests turn documentation stories into a
**behavioral regression suite**: every interactive behavior a component is documented to
have gets an assertion, those assertions run on every PR (Chromium via
`@storybook/addon-vitest`), and a broken behavior fails the build.

## Table of contents
- [Mental model](#mental-model)
- [Project constraints that change how you write tests](#project-constraints)
- [The two test levels](#the-two-test-levels)
- [The play function — project idiom](#the-play-function)
- [The `storybook/test` module](#the-storybooktest-module)
- [Querying: priority order](#querying-priority-order)
- [Querying portals (overlays)](#querying-portals)
- [Simulating behavior with userEvent](#simulating-behavior-with-userevent)
- [Asserting with expect](#asserting-with-expect)
- [Spying on callbacks with fn](#spying-on-callbacks-with-fn)
- [Accessibility: enforced, plus behavioral checks](#accessibility)
- [Coverage policy for regression](#coverage-policy-for-regression)
- [Visual regression — `Visual*` fixtures (Chromatic)](#visual-regression)
- [When to add a `*.test.tsx` instead](#when-to-add-a-testtsx)
- [Running the tests](#running-the-tests)
- [Common mistakes](#common-mistakes)

## Mental model

In Storybook, an interaction test **is a story**. The story renders the component in an
initial state; a `play` function drives user behavior (clicks, typing, keyboard) and
asserts on the outcome. Because it runs in a real browser, it exercises real event
handling, focus management, virtualization and ARIA — not a jsdom approximation.

For regression: the value is **coverage of every documented behavior plus a CI gate**.
If the docs claim "loading disables the button and ignores clicks", there must be a
story whose play function asserts exactly that. A refactor that breaks it fails CI
before merge.

<a id="project-constraints"></a>
## Project constraints that change how you write tests

These are specific to `timds` (ADR 0006, `.storybook/preview.tsx`) and override generic
Storybook advice:

- **No Tailwind/CSS in the Storybook test project.** Assert **DOM, ARIA, roles,
  attributes, focus, and callbacks** — never computed styles, geometry, colors, or
  layout (`getComputedStyle`, `offsetWidth`, "is it 44px"). Those belong to Chromatic.
- **a11y is enforced** (`a11y: { test: 'error' }`). Every story is axe-checked and a
  violation fails the run. Opt a story out only with a documented reason
  (`parameters: { a11y: { test: 'off' } }`) — see [Accessibility](#accessibility).
- **Overlays are portaled** to `document.body`. The `canvas` (story root) does NOT
  contain them. Use `screen` / `within(document.body)` — see
  [Querying portals](#querying-portals).
- **Disabled / `pointer-events: none` elements**: the browser runtime blocks the click,
  so a plain `userEvent.click` throws instead of proving the no-op. Use
  `userEvent.setup({ pointerEventsCheck: 0 })` to force the click and then assert the
  handler did NOT fire — see [Simulating behavior](#simulating-behavior-with-userevent).

## The two test levels

1. **Render test** — the baseline. *Any* story without a `play` function is already a
   render test: it mounts the component in that state and is axe-checked. Every variant
   and state should at minimum exist as a story.
2. **Interaction test** — a story *with* a `play` function. Use it for anything
   behavioral: clicks, form entry, toggling, async updates, keyboard navigation,
   callback firing, ARIA state flips.

Rule of thumb: a variant that only changes appearance needs a render story; a state
reached through interaction, or any callback/behavior, needs a play function.

<a id="the-play-function"></a>
## The play function — project idiom

`timds` stories use the `canvasElement` + `within` shape consistently (mirror it):

```tsx
import { expect, fn, userEvent, within } from 'storybook/test'

export const ClicksOnce: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Button' })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
```

- `canvasElement` — the DOM root of the story; wrap it with `within(canvasElement)` to
  get a scoped query (`canvas`).
- `args` — the story's args, including any `fn()` spies, so you can assert on callbacks.
- `step(label, fn)` — available; use it to group a multi-phase flow into labelled
  sections shown nested in the Interactions panel.

> The newer `{ canvas, userEvent }` destructure also works in SB10, but the repo
> standardizes on `canvasElement` + `within`. Stay consistent so the suite reads
> uniformly and matches the `add-component` skill.

## The `storybook/test` module

Import test utilities from **`storybook/test`** (Storybook 10). Never from
`@storybook/test`, `@storybook/jest`, or `@storybook/testing-library`.

```tsx
import { expect, fn, userEvent, within, screen, waitFor } from 'storybook/test'
```

- `expect` — Vitest's `expect` plus jest-dom matchers (`toBeInTheDocument`,
  `toBeVisible`, `toHaveAttribute`, `toBeDisabled`, …).
- `fn` — spy for callback args.
- `userEvent`, `within`, `screen` — instrumented Testing Library. `screen` queries the
  whole document (needed for portals); `within(el)` scopes to a subtree.
- `waitFor` — retry an assertion until it passes or times out, for async UI.

## Querying: priority order

Query the way a real person perceives the UI. This ordering makes tests robust *and*
nudges the component toward accessibility. Prefer earlier entries:

1. `ByRole` (optionally `{ name }`) — accessible role + name. **Default choice.**
2. `ByLabelText` — form fields by their label.
3. `ByPlaceholderText`
4. `ByText`
5. `ByDisplayValue`
6. `ByAltText`
7. `ByTitle`
8. `ByTestId` (`data-testid`) — **last resort**.

> Note: components expose a `data-slot="<name>"` attribute (repo convention), but it is
> a styling/structure hook, **not** a test handle — keep querying by role/label first.

Query variants:

| Variant | 0 matches | 1 match | >1 | Async |
| --- | --- | --- | --- | --- |
| `getBy…` | throws | element | throws | no |
| `queryBy…` | `null` | element | throws | no — use to assert **absence** |
| `findBy…` | throws | element | throws | **yes** — awaits appearance |
| `getAllBy` / `queryAllBy` / `findAllBy` | varies | array | array | findAll awaits |

Use `getBy` when present; `findBy` (awaited) when it appears asynchronously; `queryBy`
only to assert something is **not** there
(`expect(canvas.queryByText('Erro')).not.toBeInTheDocument()`).

<a id="querying-portals"></a>
## Querying portals (overlays)

Radix and Ariakit render popovers, listboxes, dialogs and tooltips into a portal on
`document.body` — **outside** `canvasElement`. Querying them via `canvas` returns
nothing. Use `screen` (or `within(document.body)`):

```tsx
import { expect, screen, userEvent, within } from 'storybook/test'

export const OpensListbox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // trigger lives in the canvas
    await userEvent.click(canvas.getByRole('combobox'))
    // listbox is portaled to body → query with screen
    const listbox = await screen.findByRole('listbox')
    await expect(listbox).toBeVisible()
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }))
  },
}
```

The preview decorator mirrors the `dark`/`light` class onto `<html>` so portaled
content inherits the theme — relevant for Chromatic, not for behavior assertions.

## Simulating behavior with userEvent

Always `await` every `userEvent` call (required for Interactions-panel logging and to
avoid flaky races). Common methods: `click`, `dblClick`, `hover`, `unhover`, `tab`,
`type`, `keyboard`, `selectOptions`, `clear`.

```tsx
await userEvent.click(canvas.getByRole('button', { name: 'Enviar' }))
await userEvent.type(canvas.getByLabelText('Nome'), 'Ada Lovelace')
await userEvent.keyboard('{Enter}')
await userEvent.tab()
```

**Disabled / `pointer-events: none` no-op** — to prove a click does nothing, bypass the
pointer-events guard so the click is delivered, then assert the handler did not fire:

```tsx
// Em loading/disabled o elemento tem pointer-events:none; forçamos o clique
// (pointerEventsCheck: 0) para provar que onClick não dispara mesmo assim.
const user = userEvent.setup({ pointerEventsCheck: 0 })
await user.click(button)
await expect(args.onClick).not.toHaveBeenCalled()
```

## Asserting with expect

Always `await` every `expect` (same logging reason). Frequently used:

```tsx
await expect(el).toBeInTheDocument()
await expect(el).toBeVisible()
await expect(el).toBeDisabled()
await expect(el).toHaveAttribute('aria-busy', 'true')
await expect(el).toHaveFocus()
await expect(args.onClick).toHaveBeenCalledOnce()
await expect(args.onChange).toHaveBeenCalledWith('next-value')
```

Do **not** assert on classes or computed styles as a behavior check (no Tailwind in the
test project). Assert structure/role/attributes instead.

## Spying on callbacks with fn

Pass a spy as the arg and assert on it. Set spies in `meta.args` so every story inherits
them and they auto-reset between stories:

```tsx
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { onClick: fn() },          // 👈 spy shared by all stories, auto-reset
} satisfies Meta<typeof Button>
```

For a spy used inside a `render` (e.g. a form `onSubmit` defined at module scope), reset
it manually at the start of the play function (`handleSubmit.mockClear()`), as
`button.stories.tsx` does.

<a id="accessibility"></a>
## Accessibility: enforced, plus behavioral checks

`.storybook/preview.tsx` sets `a11y: { test: 'error' }` — **axe runs on every story and
a violation fails the test**. This is static coverage you get for free; keep stories
accessible (label controls, give icon-only buttons an `aria-label`, etc.).

Complement axe with **behavioral** a11y in play functions (axe cannot see interaction):

```tsx
export const FocusesWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Button' })).toHaveFocus()
  },
}
```

Cover: focus reaching/leaving the control, Enter/Space activation, Escape closing
overlays, focus trap in dialogs, and `aria-*` state flips (`aria-expanded`,
`aria-checked`, `aria-busy`, `aria-disabled`).

**Opting out** — only when a story deliberately renders an a11y-incomplete state for a
*visual* snapshot (e.g. an empty `role="listbox"` with no options, which violates
`aria-required-children`). Disable axe for that single story and document why:

```tsx
// a11y da lista já é coberta pelas histórias interativas (com opções); aqui só
// queremos o snapshot visual do estado vazio, então desligamos o teste de a11y.
parameters: { a11y: { test: 'off' } },
```

Never disable axe to silence a real violation on a shipping state — fix the component.

## Coverage policy for regression

A component's stories form its regression contract. Aim to cover:

- **Each variant** — at least a render story (mounts + passes axe).
- **Each interactive state** — default, focus, disabled, loading, error,
  selected/checked, expanded/collapsed, etc. States reached by interaction get a play
  function that drives them and asserts the resulting DOM/ARIA.
- **Primary behavior** — the component's main job (a button fires `onClick`; a select
  emits `onChange` with the chosen value; a form submits with valid data).
- **Negative behavior** — disabled/loading does *not* fire; a maxed-out multi-select
  blocks further selection; required validation shows an error.
- **Edge cases** — empty state, long content/overflow, async loading→loaded,
  virtualization (large lists), error→retry.
- **Accessibility behaviors** — keyboard activation, focus order/trap, ARIA state flips.

Keep **one clear behavior per story** where practical, named for the behavior it checks
(`ClicksOnce`, `DisabledDoesNotFire`, `FocusesWithKeyboard`) so a failure is legible in
CI. Use `step()` when a single behavior genuinely needs several phases.

<a id="visual-regression"></a>
## Visual regression — `Visual*` fixtures (Chromatic)

The interactive stories cover **behavior**; they do **not** cover **visual layout** (no
Tailwind in the test project). Visual regression is Chromatic's job, snapshotting each
story in **light and dark** (`.storybook/modes.ts`). For most components Chromatic
snapshots the normal stories directly — nothing special needed.

The split (ADR 0006) is required for components whose meaningful appearance is **not**
visible in their default story — chiefly **overlay/portal components** (`Select`,
`AlertDialog`), whose interactive stories start *closed* and would only snapshot the
trigger. For those:

1. **Disable snapshots at the meta level**: `parameters.chromatic.disableSnapshot: true`
   (closed triggers carry no visual signal; snapshotting a popover opened inside a
   `play` is flaky — portal positioning + entry animation).
2. **Add dedicated `Visual*` stories** that render each visual state deterministically —
   open via `defaultOpen` inside a fixed-height container — and re-enable the snapshot
   individually: `parameters: { chromatic: { disableSnapshot: false } }`.
3. **Hide them from sidebar and docs** with `tags: ['!dev', '!autodocs']`. They are
   regression fixtures, not documentation. The built-in `test` tag stays applied (they
   still run as smoke tests and Chromatic still captures them — `dev` only governs the
   sidebar).
4. **Be exhaustive over visual states.** The `Visual*` set is the visual contract: every
   size, value vs placeholder, every trigger affordance (chips, `+N` summary,
   `N / max` counter, clear button, custom value, disabled) and every list state
   (options, selected, disabled option, groups, custom item render, empty, loading).
   Group closed-trigger states into matrix stories (a grid in one snapshot); give each
   open-popover state its own story so portals don't overlap.

A small helper keeps the fixtures terse (from `select.stories.tsx`):

```tsx
// Fixtures de regressão visual: ocultas do sidebar/autodocs (`!dev`/`!autodocs`),
// mas seguem rodando como smoke test (tag `test`) e capturadas pelo Chromatic.
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

export const VisualSizes: Story = {
  ...visual,
  render: () => (/* grid de triggers nos três tamanhos */),
}
```

<a id="when-to-add-a-testtsx"></a>
## When to add a `*.test.tsx` instead

Prefer stories. Add a jsdom `*.test.tsx` (mirroring `button.test.tsx`) **only** for what
stories can't express cleanly (ADR 0006):

- **Throw paths** — a hook that must `throw` outside its provider (`useChart`,
  `useCheckboxGroup`). In a play function a throwing render breaks the story before the
  assertion; `expect(fn).toThrow()` in jsdom is trivial.
- **Defensive / pure-utility branches** — edge cases hard to trigger through real UI.
- **Layout-metric edges** — branches reading `scrollHeight`/`clientHeight`/`scrollTop`,
  which jsdom lets you stub but a real browser does not.

## Running the tests

- **Interactions panel (Storybook UI)** — run a story and step through each action;
  the debugging surface. `npm run storybook`.
- **Vitest addon** — runs stories as tests in headless Chromium, from the terminal or
  CI. `npm run test:storybook` (all) or
  `npm run test:storybook -- <component-name>.stories.tsx` (one file).
- **Full suite** — `npm test` runs both projects (jsdom unit + storybook browser);
  `npm run coverage` aggregates coverage across both.
- **Visual** — `npm run chromatic` (needs `CHROMATIC_PROJECT_TOKEN` in `.env.local`).

## Common mistakes

- Importing Doc Blocks from `@storybook/blocks` — use `@storybook/addon-docs/blocks`.
- Importing test utils from `@storybook/test`/`@storybook/jest` — use `storybook/test`.
- Querying a portaled popover/listbox/dialog via `canvas` — use `screen`.
- Asserting on classes, colors, or geometry — no Tailwind in the test project; assert
  role/attribute/structure instead.
- Forgetting `await` on `userEvent`/`expect` — breaks logging and flakes.
- A plain `userEvent.click` on a disabled/`pointer-events:none` element (throws) — use
  `userEvent.setup({ pointerEventsCheck: 0 })`.
- Reaching for `getByTestId` first — query by role/label first.
- One giant play function covering many behaviors — split into focused stories.
- Asserting absence with `getBy` (throws) — use `queryBy(...).not.toBeInTheDocument()`.
- Disabling axe to hide a real violation — fix the component instead.
- Documenting a behavior in the MDX with no matching assertion in the stories.
