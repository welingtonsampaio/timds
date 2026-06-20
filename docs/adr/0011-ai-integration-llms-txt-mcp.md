# 0011 — AI integration: `llms.txt` + a self-contained MCP server

- Status: Accepted
- Date: 2026-06-20

## Context

Coding agents (Claude Code, Cursor, etc.) are a primary way the design system is
consumed. Without machine-readable context, agents hallucinate prop names, invent
import paths, or reach for raw colors instead of tokens. Large React UI libraries
now ship three complementary affordances for this:

1. **`llms.txt` / `llms-full.txt`** — documentation in plain markdown at a fixed
   path, following the [llms.txt standard](https://llmstxt.org) (Mantine, Chakra).
2. **Agent skills** — installable playbooks invoked by name (Mantine).
3. **An MCP server** — live tools (`list_components`, `get_props`, …) that an agent
   queries instead of guessing from stale training data (shadcn, Mantine, Chakra).

timds differs from shadcn's registry model: it is consumed as a **compiled package**
(`import { Button } from 'timds'`), not copied source. So shadcn's registry-MCP (which
serves component source to copy) does not fit; the agent needs the **package API**
(exports, variants, props, examples) and the **tokens**.

## Decision

Generate the AI artifacts from the existing sources and serve them two ways, from a
**single generated manifest** (`ai/manifest.json`):

- **`scripts/generate-ai-docs.mjs`** parses `src/index.ts` (public API), the
  components' `.tsx` (cva variants), `.stories.tsx` (argTypes / category),
  `.mdx` (prose + code example), `src/styles.css` (tokens) and the page examples in
  `src/design-system/examples/`. It emits `ai/manifest.json`, `ai/llms.txt` and
  `ai/llms-full.txt`. No AST/extra tooling — brace/quote-aware string parsing only.
- **The MCP server** (`mcp/server.mjs`) reads `ai/manifest.json` and exposes
  `list_components`, `get_component`, `search_components`, `get_tokens`, `get_setup`,
  `list_examples`, `get_example` over stdio.

The artifacts are wired into the build (`prebuild`/`prepare`), so they are always in
sync with the code, the same way `dist/` is (see ADR 0002).

### Distribution of the MCP server

Because timds is a **UI library**, we do not want `@modelcontextprotocol/sdk` and
`zod` as runtime `dependencies` for every consumer. Mantine solves this with a
separate npm package (`npx @mantine/mcp-server`); timds is registry-less (ADR 0002),
so instead we **bundle the server with its deps inlined** via esbuild
(`scripts/build-mcp.mjs` → `mcp/timds-mcp.mjs`). The bundle runs with only Node; the
SDK and zod stay `devDependencies`. The manifest is read at runtime (not bundled), so
it can be regenerated without rebundling.

A consumer points their MCP client at the shipped bundle:

```json
{ "mcpServers": { "timds": { "command": "node", "args": ["./node_modules/timds/mcp/timds-mcp.mjs"] } } }
```

## Alternatives considered

- **shadcn registry (`registry.json`) + native MCP** — fits a copy-paste model, not
  our compiled-package distribution. Could be added later if a copy path is wanted.
- **MCP SDK as runtime `dependencies`** — simplest, but burdens every consumer of the
  UI lib with agent-tooling deps. Rejected in favor of the esbuild bundle.
- **Hand-written `llms.txt`** — drifts from the code. Rejected; we generate it.

## Consequences

- **Positive:**
  - One generator feeds both the static docs and the MCP — single source of truth.
  - The MCP runs in any consumer project with zero extra install (self-contained).
  - `ai/llms.txt` is browsable on GitHub and usable by non-MCP tools.
- **Negative/limitations:**
  - The generator relies on the repo's MDX/stories conventions; large format changes
    need generator updates.
  - The bundled server (~1 MB) is regenerated on build; it is `.gitignore`d like
    `dist/`.

## Related

- [0002 — Distribution directly from GitHub via `prepare`](./0002-distribution-via-github-prepare.md)
- [0003 — Tailwind v4 with CSS-first tokens](./0003-tailwind-v4-tokens-css.md)
- [0005 — Storybook for documentation](./0005-storybook-for-documentation.md)
