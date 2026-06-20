# 0006 — Vitest with two projects (jsdom unit + Storybook browser)

- Status: Accepted
- Date: 2026-06-17
- Updated: 2026-06-18 — adopted the Storybook browser project (previously listed
  as a future possibility) and documented the unit-vs-stories testing strategy.
- Updated: 2026-06-18 — documented the visual-regression stories convention
  (hidden `Visual*` fixtures for overlay components, exhaustive over visual states).

## Context

The library needs automated component tests that run fast, in CI and locally,
with low friction and reusing the Vite config. Two needs coexist:

- **Behavior in a real browser** — interactions, focus, virtualization and
  accessibility that jsdom cannot reproduce faithfully.
- **Logic, error paths and edge branches** — assertions that are awkward or
  impossible to express through the UI (e.g. a hook that must `throw` when used
  outside its provider, defensive branches of pure utilities, or code that reads
  layout metrics like `scrollHeight`).

## Decision

Use **Vitest 4** as the runner, configured in `vitest.config.ts` with **two
projects** whose coverage is **aggregated** (`@vitest/coverage-v8`):

1. **`unit`** — classic tests in **jsdom**.
   - `@testing-library/react` + `@testing-library/user-event` for
     user-behavior-oriented rendering/interaction.
   - `@testing-library/jest-dom` matchers, loaded in `src/test/setup.ts`.
   - Tailwind plugin + `css: true` are enabled, so CSS is processed.
   - Files: `*.test.tsx` / `*.spec.tsx`.
2. **`storybook`** — every `*.stories.tsx` runs in a **real Chromium browser**
   (Playwright) via `@storybook/addon-vitest`: a smoke render of all stories plus
   any `play` functions as interaction tests.
   - This project does **not** load the Tailwind plugin, so it validates
     behavior/DOM, **not** visual layout (visual regression lives in Chromatic).

Both project files (`*.stories.tsx` and `*.test.tsx`) are excluded from coverage
accounting and from the bundle/types; coverage measures the component source only.

### Testing strategy (when to use which)

**Stories are the primary source of truth for component behavior.** Prefer adding
a story (with a `play` function when an interaction needs asserting) over an
isolated unit test whenever it fits. This is why most components ship with only a
`*.stories.tsx` and **no `*.test.tsx`** — the stories already cover them in the
browser project.

Add a `*.test.tsx` only for what stories cannot express cleanly:

- **Throw paths** — e.g. `useChart` / `useCheckboxGroup` throwing outside their
  provider. In a `play` function a throwing render breaks the story itself before
  the assertion runs; `expect(fn).toThrow()` in jsdom is trivial.
- **Defensive / pure-utility branches** — edge cases hard to trigger through real
  UI (e.g. a payload-parsing helper receiving a primitive).
- **Layout-metric edges** — branches that depend on faking measurements
  (`scrollHeight`/`clientHeight`/`scrollTop`), which jsdom lets us stub but a real
  browser does not.

A component with complex logic (e.g. `Select`) can have both: stories for the
real-browser behavior (virtualization, focus) and a `*.test.tsx` for the
edge/throw/branch coverage above.

### Coverage targets

Aim for **100% statements/lines/functions** on each component (across the
aggregated projects). Branch coverage is pursued as high as is clean, but is not
required to hit 100%: a few branches are genuinely unreachable defensive guards or
browser-only paths. When a branch can only be closed by removing dead defensive
code, prefer simplifying the source over contriving a test. Note also that
merging the two projects' v8 maps leaves a harmless phantom uncovered branch on
line 1 of fully-covered files.

### Visual regression stories (Chromatic)

The interactive stories cover **behavior**; they do not cover **visual layout**
(the Storybook browser project runs without Tailwind/CSS — see Consequences).
Visual regression is Chromatic's job. For most components, Chromatic snapshots
their normal stories directly: a component whose default story already shows its
full appearance needs nothing special.

The split is needed for components whose meaningful appearance is **not** visible
in their default story — chiefly **overlay/portal components** (e.g. `Select`,
`AlertDialog`), whose interactive stories start *closed* and would only snapshot
the trigger. For those:

1. **Disable snapshots by default at the meta level**
   (`parameters.chromatic.disableSnapshot: true`). The many interactive/closed
   stories are not captured: a closed trigger carries no visual signal, and
   snapshotting a popover opened inside a `play` function is flaky (portal
   positioning and entry animation).
2. **Add dedicated `Visual*` stories** that render each visual state
   deterministically — open via `defaultOpen` in a fixed-height container — and
   re-enable the snapshot individually (`chromatic: { disableSnapshot: false }`).
3. **Hide the `Visual*` stories from the sidebar and docs** with
   `tags: ['!dev', '!autodocs']`. They are regression fixtures, not documentation,
   so they must not add navigation noise. The built-in `test` tag stays applied:
   they still run as smoke tests in the browser project, and Chromatic still
   captures them (the `dev` tag only governs the sidebar, not snapshotting).
4. **Be exhaustive over the component's visual behaviors.** The `Visual*` set is
   the visual contract: it must cover every distinct visual state — each size,
   value vs placeholder, every trigger affordance (chips, `+N` summary, `N / max`
   counter, clear button, custom value, disabled) and every list state (options,
   selected, disabled option, groups, custom item render, empty, loading). When a
   visual feature is added to such a component, a matching `Visual*` story (or
   case in an existing matrix) is part of the change. Closed-trigger states may be
   grouped into matrix stories (a grid of triggers in one snapshot); open-popover
   states get one story each so portals do not overlap.

## Alternatives considered

- **Jest** — would require extra configuration for ESM/TS/Vite; Vitest integrates
  natively with Vite and is faster.
- **jsdom only (no browser project)** — lighter, but cannot exercise real focus,
  virtualization or accessibility, leaving meaningful coverage gaps. Rejected in
  favor of the two-project setup; the Playwright binary cost is acceptable.
- **Browser only (stories as the sole runner)** — would lose the cheap, reliable
  way to cover throw paths, defensive branches and layout-metric edges. Rejected
  in favor of the hybrid model.

## Consequences

- **Positives:**
  - Real-browser confidence for behavior plus fast, precise unit coverage for
    logic/edges; aggregated coverage reflects both.
  - Reuses Vite/Tailwind/the `@` alias (unit project).
- **Negatives/limitations:**
  - The Storybook project downloads Playwright binaries and is slower than jsdom.
  - The Storybook project has no Tailwind/CSS, so it does not validate layout
    (that is Chromatic's job).
  - jsdom is not a real browser: layout and some visual APIs are not faithful, so
    such behavior must be covered by stories.

## Related

- [0005 — Storybook for documentation](./0005-storybook-for-documentation.md)
