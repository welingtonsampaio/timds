# 0006 — Vitest with two projects (jsdom unit + Storybook browser)

- Status: Accepted
- Date: 2026-06-17
- Updated: 2026-06-18 — adopted the Storybook browser project (previously listed
  as a future possibility) and documented the unit-vs-stories testing strategy.

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

- [0005 — Storybook for documentation](./0005-storybook-para-documentacao.md)
