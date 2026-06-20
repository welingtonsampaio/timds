# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`timds` is a React component library with a **built-in design system**, built on shadcn/ui (style `new-york`) + Tailwind CSS v4. It is distributed **directly from GitHub** (no npm registry): on install, the `prepare` script runs `vite build` to generate `dist/`. Consumers import components from `timds` and the precompiled tokens via `timds/styles.css`.

## Commands

```bash
npm run dev              # Vite playground at http://localhost:5173 (uses dev/)
npm run build            # library-mode build → dist/ (JS + .d.ts + timds.css)
npm run typecheck        # tsc --noEmit
npm run check            # Biome: lint + format + import-organize check (no writes)
npm run check:fix        # Biome: apply all fixes
npm run lint             # Biome lint only
npm run format           # Biome format --write

npm test                 # vitest run — BOTH projects (unit + storybook)
npm run test:unit        # only jsdom unit tests (*.test.tsx)
npm run test:storybook   # only Storybook stories run as browser tests
npm run test:watch       # vitest watch
npm run coverage         # v8 coverage across both projects

npm run storybook        # Storybook dev at :6006
npm run build-storybook  # static Storybook build
npm run chromatic        # visual tests (loads CHROMATIC_PROJECT_TOKEN from .env.local)
```

Run a single test file: `npx vitest run src/components/ui/button.test.tsx`. Run a single Storybook test: `npm run test:storybook -- <story-file>`.

## Architecture

**Two-project test setup (vitest.config.ts).** Tests run as two Vitest `projects`:
- `unit` — classic Testing Library tests in jsdom (`*.test.tsx`, setup in `src/test/setup.ts`).
- `storybook` — every `*.stories.tsx` is rendered in a **real browser** (Playwright/chromium) as a smoke test plus any `play` functions. Stories are treated as the primary source of truth for component behavior; prefer adding stories over isolated unit tests where it fits.

**Shared Vite config, two modes (vite.config.ts).** The same config serves both the library build and Storybook. It branches on `npm_lifecycle_event` containing `storybook`: under Storybook it loads only the base plugins (react, tailwind); otherwise it adds library mode (ESM-only, externalizes react/react-dom) and `vite-plugin-dts` for `.d.ts` generation. The `@` alias → `src/` is defined in vite, vitest, and tsconfig — keep all three in sync.

**Design system tokens are CSS-first (src/styles.css).** All theming lives in CSS custom properties using `oklch` colors, with `:root` (light) and `.dark` overrides. Dark mode is opt-in via a `dark` class on an ancestor. This file is the single source of design tokens; it compiles into `dist/timds.css`. There is no `tailwind.config` — Tailwind v4 is configured via CSS `@import`/`@theme`. `src/index.ts` imports `./styles.css` so the library carries its own styles.

**Public API (src/index.ts).** This is the only entrypoint that ships. Every component must be explicitly re-exported here (with its variants/types) to be part of the public API. Internal imports use the `@/` alias.

**AI integration (ai/ + mcp/).** `scripts/generate-ai-docs.mjs` parses the sources (index.ts, components' `.tsx`/`.stories.tsx`/`.mdx`, styles.css, examples) into `ai/manifest.json`, `ai/llms.txt` and `ai/llms-full.txt`. `mcp/server.mjs` is the MCP server source; `scripts/build-mcp.mjs` bundles it (deps inlined) into `mcp/timds-mcp.mjs` so consumers run it with only Node. Both run in `prebuild`/`prepare`. The bundle is `.gitignore`d; the manifest is read at runtime. See ADR 0011 and `docs/ai-integration.md`. Commands: `npm run ai:docs`, `npm run mcp:build`, `npm run mcp` (run source in dev).

## Conventions

- **Adding a shadcn/ui component:** `npx shadcn@latest add <component>` (config in `components.json` targets Tailwind v4, `src/styles.css`, lucide icons), then add the export to `src/index.ts`. Components are copied into `src/components/ui/`, not consumed as a dependency.
- **Formatting (biome.json):** single quotes, double quotes in JSX, no semicolons, trailing commas, 2-space indent, 90-col width. Imports are auto-organized by Biome. Run `npm run check:fix` before committing.
- **Shared style presets (`src/lib/styles.ts`):** repeated Tailwind utility combinations live here as constants — `focusRing`, `ariaInvalid`, `disabledControl`, `svgIcon`, `overlayClass`, `modalSurface`. When creating/editing a component, reuse them via `cn(...)` instead of recopying the combinations (this keeps tailwind-merge overrides working). Color/spacing tokens stay in `src/styles.css`. Internal module (not exported from `src/index.ts`). See ADR 0009.
- **Comments and code are written in Portuguese** in this repo; user-facing docs (`docs/`, `README.md`, ADRs) are in English.
- **`dev/`** is the local playground and is excluded from `dist`.

## Architecture decisions

Significant decisions are recorded as ADRs in `docs/adr/` (MADR format) — read these before changing build/distribution/testing/styling strategy. Index in `docs/adr/README.md`. When making a decision of comparable weight, add a new ADR and update the index table.
