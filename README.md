# timds

React component library with a **built-in design system**, built on top of
[shadcn/ui](https://ui.shadcn.com) (style `new-york`) + [Tailwind CSS v4](https://tailwindcss.com).

It can be installed **directly from GitHub**, with no need for an npm registry, and
ships **AI context** (an MCP server + `llms.txt`) so coding agents use the real API
instead of guessing.

📖 Full docs in [`docs/`](./docs/getting-started.md) · AI integration in
[`docs/ai-integration.md`](./docs/ai-integration.md) · architecture decisions in
[`docs/adr/`](./docs/adr/).

## Installation (directly from GitHub)

```bash
npm install github:welingtonsampaio/timds
# or pin a branch/tag/commit:
npm install github:welingtonsampaio/timds#v0.0.1
```

> On install, the `prepare` script builds `dist/` automatically (JS, `.d.ts` types,
> the design system CSS and the AI artifacts). Nothing is published to a registry.

### Peer dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `react`, `react-dom` | yes (`>=18`) | |
| `recharts` | optional (`>=3`) | only if you use `Chart` / `ChartContainer`. Run `npm i recharts`. |

## Usage

```tsx
// Import the design system CSS once, in your app entrypoint (e.g. main.tsx):
import 'timds/styles.css'
import { Button } from 'timds'

export function Example() {
  return <Button variant="outline">Hello</Button>
}
```

The components ship their own compiled styles in `timds/styles.css` (tokens, dark
mode and the Tailwind utilities the components use) — **no Tailwind setup is required**
just to render them.

### Loading the font

The design system uses **Inter** (`--font-sans`) but does not bundle the font. Load it
in your app — e.g. in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

Without it, text falls back to `system-ui`.

### Using the token utilities in your own markup (optional)

If you want to use semantic token utilities (`bg-primary`, `text-muted-foreground`,
`bg-sidebar-primary`, …) in **your own** elements, set up Tailwind v4 in your app and
bridge the tokens. Ask the MCP for the full snippet (`get_setup` → `setup.tailwindBridge`),
which maps every token:

```css
@import "tailwindcss";

@theme inline {
  --radius-lg: var(--radius);
  --font-sans: var(--font-sans);
  --color-primary: var(--primary);
  --color-muted-foreground: var(--muted-foreground);
  /* …every token; see get_setup for the complete list */
}
```

The values come from `timds/styles.css` (imported via JS), so light/dark resolve
automatically.

### Dark mode

Add the `dark` class to an ancestor (e.g. `<html class="dark">`). It is opt-in.

## AI integration (Claude Code, Cursor, …)

timds ships machine-readable context so agents use the correct imports, props,
variants and tokens. See [`docs/ai-integration.md`](./docs/ai-integration.md) for the
full guide.

### MCP server (recommended)

The MCP server is **self-contained** (the MCP SDK is bundled in) — it runs with only
Node, nothing extra to install. From your project root, after installing timds:

**Claude Code**

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

Cursor, Windsurf and Claude Desktop take the same `command` + `args`.

**Tools exposed**

| Tool | Purpose |
| --- | --- |
| `get_setup` | Install, style import, font, Tailwind bridge and dark-mode instructions. Call first. |
| `list_components` | All components by category, with exports and a one-line description. |
| `get_component` | Full detail for one component (import, exports, variants, props, example). Accepts a component or any export name. |
| `search_components` | Keyword search across name, description, category and exports. |
| `get_tokens` | Semantic color utilities (light/dark), radius, font and usage rules. |
| `list_examples` / `get_example` | Full page compositions (login, dashboard, settings, …) to adapt. |

**Using it in the agent**

Once configured, just ask in natural language — the agent calls the tools as needed:

> *Using the timds MCP, build an analytics dashboard.*

> *Add a settings form with timds — call `get_component` for the inputs you need.*

The agent should call `get_setup` first (it covers loading the font and, if you use
charts, installing `recharts`).

### `llms.txt`

For tools that follow the [llms.txt](https://llmstxt.org) convention, point them at
`node_modules/timds/ai/llms.txt`. `ai/llms-full.txt` is the entire reference in one
file (handy for a one-shot paste).

## Development

```bash
npm install        # installs deps (and runs the build via prepare)
npm run dev        # playground at http://localhost:5173
npm run build      # generates dist/ + ai/ + the MCP bundle
npm run typecheck  # type checking
npm test           # unit + Storybook browser tests
npm run ai:docs    # regenerate ai/ (manifest, llms.txt, llms-full.txt)
npm run mcp:build  # rebuild the self-contained MCP bundle
```

### Structure

```
src/
├── index.ts              # public entrypoint (exports)
├── styles.css            # design system tokens + Tailwind
├── lib/utils.ts          # cn()
└── components/ui/        # components (shadcn/ui)
scripts/
├── generate-ai-docs.mjs  # builds ai/manifest.json + llms.txt + llms-full.txt
└── build-mcp.mjs         # bundles the MCP server (deps inlined)
mcp/
└── server.mjs            # MCP server source (bundled → mcp/timds-mcp.mjs)
dev/                      # local playground (not shipped in dist)
```

### Adding shadcn/ui components

The project already has `components.json` configured for Tailwind v4:

```bash
npx shadcn@latest add <component>
```

Then export it in `src/index.ts`. (Adding/changing components automatically refreshes
the AI artifacts on the next build.)
