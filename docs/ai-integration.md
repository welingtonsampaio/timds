# AI integration (Claude Code, Cursor, …)

timds ships machine-readable context so coding agents use the **real** API — correct
imports, prop names, variants and design tokens — instead of guessing.

There are two layers, both generated from the source on every build (see
[ADR 0011](./adr/0011-ai-integration-llms-txt-mcp.md)):

| Artifact | What it is | Best for |
| --- | --- | --- |
| `ai/llms.txt` | Compact index ([llms.txt standard](https://llmstxt.org)) | Quick context, any LLM tool |
| `ai/llms-full.txt` | Full reference: every component (variants, props, example), all tokens, all page examples | Pasting whole context |
| `mcp/timds-mcp.mjs` | Self-contained **MCP server** (no extra deps) | Live tool calls in an agent |

## Option A — MCP server (recommended)

The MCP server gives the agent live tools so it never has to hold the whole reference
in context. It is **self-contained** (the MCP SDK and zod are bundled in), so it runs
in your project with only Node — nothing extra to install.

### Claude Code

From your project root (where timds is installed):

```bash
claude mcp add timds -- node ./node_modules/timds/mcp/timds-mcp.mjs
```

…or commit a project-scoped `.mcp.json` so your team shares it:

```json
{
  "mcpServers": {
    "timds": {
      "command": "node",
      "args": ["./node_modules/timds/mcp/timds-mcp.mjs"]
    }
  }
}
```

Other MCP clients (Cursor, Windsurf, Claude Desktop) take the same `command` + `args`.

### Tools exposed

| Tool | Purpose |
| --- | --- |
| `get_setup` | Install, style import and dark-mode instructions. Call first. |
| `list_components` | All components by category, with exports and a one-line description. |
| `get_component` | Full detail for one component: import, exports, variants, props, example. Accepts a component **or any export** name. |
| `search_components` | Keyword search across name, description, category and exports. |
| `get_tokens` | Semantic color utilities (light/dark), radius, font and usage rules. |
| `list_examples` / `get_example` | Full page compositions (login, dashboard, settings, …) to adapt. |

Then prompt naturally, e.g. *"Using the timds MCP, build an analytics dashboard"*.

## Option B — `llms.txt`

If your tool follows the llms.txt convention, point it at `node_modules/timds/ai/llms.txt`
(or the raw GitHub URL). For a one-shot paste, `ai/llms-full.txt` contains the entire
reference.

## Consumer setup notes

- **Import styles via JS** in your entrypoint (`import 'timds/styles.css'` in
  `main.tsx`), not via a CSS `@import`.
- **Load the Inter font yourself** — the DS declares the family but does not ship the
  font (so its CSS carries no remote `@import`). Add a `<link>` or `@font-face` in your
  app; otherwise text falls back to `system-ui`.
- **To use token utilities** (`bg-primary`, `text-muted-foreground`, …) in your own
  markup, add the `@theme` bridge from `mcp__timds__get_setup` (field
  `setup.tailwindBridge`) to your global CSS (requires Tailwind v4 in the app).
  Components themselves are styled without it.

## Regenerating

Both layers are produced by the build (`prebuild` / `prepare`). To refresh manually:

```bash
npm run ai:docs    # → ai/manifest.json, ai/llms.txt, ai/llms-full.txt
npm run mcp:build  # → mcp/timds-mcp.mjs (bundled server)
```
