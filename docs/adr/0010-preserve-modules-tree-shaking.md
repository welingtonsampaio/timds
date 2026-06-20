# 0010 — Preserve module structure for tree-shaking

- Status: Accepted
- Date: 2026-06-19

## Context

The build (ADR 0001) emitted a **single bundle** (`dist/index.js`) concatenating
all 67 components and their dependencies (~964 KB). This defeats tree-shaking in
the consumer: importing a single `<Button />` pulled in ~492 KB and dragged along
heavy dependencies the button never touches (`recharts`, `sonner`, `vaul`).

The reason is the elimination mechanism. In a single bundle, removing unused code
requires **intra-file dead-code elimination**: the consumer's bundler must prove a
region is unreachable *and* free of side effects. Dependencies like `sonner`,
`vaul`, and `recharts` use patterns (CJS interop wrappers, module-scope
initialization, prototype `defineProperty`) that conservative DCE cannot prove
pure, so it keeps them. The package's `"sideEffects": ["**/*.css"]` hint is correct
but loses effect once everything is pre-concatenated into one `.js` — there is no
longer file-level granularity for the consumer to drop.

## Decision

Build with **`output.preserveModules`** instead of a single bundle: emit one file
per source module, mirroring the `src/` tree.

```ts
rollupOptions: {
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  output: {
    preserveModules: true,
    preserveModulesRoot: 'src',
    entryFileNames: (chunkInfo) =>
      chunkInfo.name.includes('node_modules')
        ? `${chunkInfo.name.replace(/node_modules/g, 'vendor')}.js`
        : '[name].js',
  },
},
```

Elimination becomes **module-graph reachability**: `button.js` does not import
`sonner.js`/`vaul.js`/`recharts/*`, so they never enter the consumer's bundle. This
is reliable and does not depend on purity heuristics.

Bundled external dependencies would land under `node_modules/...`; npm ignores
folders named `node_modules` when publishing, so we rename that segment to
`vendor/` via `entryFileNames` (Rollup rewrites the internal imports accordingly).

The public API is unchanged: `dist/index.js` remains a barrel re-exporting from the
per-component files. Consumers keep `import { Button } from 'timds'` and
`import 'timds/styles.css'` verbatim.

## Alternatives considered

- **Keep the single bundle** — simplest, but no effective tree-shaking (measured:
  492 KB for one button).
- **Subpath exports** (`timds/button`) — gives "pay for what you import" even
  without tree-shaking, but changes the import API and requires mapping every
  component in `package.json#exports`. Can be added later on top of this, but is
  not required.
- **Explicit multiple entry points** — works, but requires listing/globbing
  entries by hand; `preserveModules` does it automatically.

## Consequences

- **Positive:**
  - Importing a single component drops from ~492 KB to ~36 KB; `recharts`,
    `sonner`, and `vaul` no longer leak in.
  - Shared dependencies are deduplicated: code used by N components (e.g. `cn` from
    `lib/utils`, used by 34) becomes **one** file imported by all — ESM modules are
    singletons, so the consumer includes it once.
  - No change for consumers: same `from 'timds'`, same `timds/styles.css`, same
    types.
- **Negative/limitations:**
  - The `dist/` now contains many files (~678 `.js`: ~39 own + ~639 vendored deps)
    instead of one. Higher file count, no impact on the consumer (the bundler drops
    what it doesn't use).
  - External deps live under `dist/vendor/` (renamed from `node_modules` to stay
    publishable). If the rename logic is removed, npm publishing would strip them.
- **Unchanged:** the CSS is still a single `dist/timds.css`, and `.d.ts` files are
  still emitted per-file under `dist/src/` (ADR 0001) — `preserveModules` only
  affects JS and mirrors that structure.

## Related

- [0001 — Build as a library with Vite](./0001-build-with-vite-library-mode.md)
- [0002 — Distribution directly from GitHub via `prepare`](./0002-distribution-via-github-prepare.md)
- [0009 — Shared style presets in `src/lib/styles.ts`](./0009-shared-style-presets.md)
