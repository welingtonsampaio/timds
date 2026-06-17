# 0006 — Vitest + Testing Library (jsdom) for testing

- Status: Accepted
- Date: 2026-06-17

## Context

The library needs automated component tests that run fast, in
CI and locally, with low friction and reusing the Vite config.

## Decision

Use **Vitest 4** as the test runner, with:

- The **jsdom** environment (DOM in Node, no real browser).
- **@testing-library/react** + **@testing-library/user-event** to render and
  interact with the components in a user-behavior-oriented way.
- **@testing-library/jest-dom** for DOM matchers (e.g.: `toBeInTheDocument`),
  loaded in `src/test/setup.ts`.
- A dedicated config in `vitest.config.ts` (separate from the build `vite.config.ts`),
  with coverage via `@vitest/coverage-v8`.

Tests live alongside the components (`*.test.tsx`) and are excluded from the bundle
and from the library types.

## Alternatives considered

- **Jest** — would require extra configuration for ESM/TS/Vite; Vitest integrates
  natively with Vite and is faster.
- **Storybook Test / addon-vitest (browser mode with Playwright)** — runs the
  stories as tests in a real browser. Powerful, but it adds the download of the
  Playwright binaries and more complexity. We chose jsdom to keep the
  setup lightweight and 100% functional without browser dependencies. It can be adopted in
  the future without conflicting with this decision.

## Consequences

- **Positives:**
  - Fast tests, with no browser download; they run well in CI.
  - Reuses Vite/Tailwind/the `@` alias.
- **Negatives/limitations:**
  - jsdom is not a real browser: layout, measurements and some visual APIs are not
    faithfully reproduced. For those cases, consider browser tests
    (Playwright/Storybook) in the future.

## Related

- [0005 — Storybook for documentation](./0005-storybook-para-documentacao.md)
