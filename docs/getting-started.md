# Getting Started

`timds` is a React component library with a **built-in design system**, built on
top of [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com).
It is distributed **directly from GitHub**, with no need for an npm registry.

---

## 1. For those consuming the library

### Installation

```bash
# latest state of the default branch
npm install github:<org>/timds

# pinning a version (tag) or commit — recommended in production
npm install github:<org>/timds#v0.0.1
npm install github:<org>/timds#<commit-sha>
```

> When installing from GitHub, the `prepare` script builds the `dist/` folder
> automatically (JavaScript, `.d.ts` types and the design system CSS).
> Nothing needs to be published to a registry. See
> [ADR 0002](./adr/0002-distribution-via-github-prepare.md).

### Peer dependencies

The consumer project needs to have installed:

```bash
npm install react react-dom
```

(versions `>=18`).

### Usage

```tsx
import { Button } from 'timds'
// Import the design system CSS ONCE, in the app entrypoint:
import 'timds/styles.css'

export function Example() {
  return (
    <div>
      <Button>Confirm</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  )
}
```

The `timds/styles.css` file already brings all the tokens (colors, radius, dark
mode) and the Tailwind utilities used by the components — **the consumer project
does not need to configure Tailwind**. See
[ADR 0003](./adr/0003-tailwind-v4-tokens-css.md).

### Dark mode

The dark theme is enabled by adding the `dark` class to an ancestor element:

```html
<html class="dark">
```

---

## 2. For those developing the library

### Requirements

- Node.js >= 20
- npm (or pnpm)

### Setup

```bash
npm install
```

### Scripts

| Command                  | What it does                                               |
| ------------------------ | ---------------------------------------------------------- |
| `npm run dev`            | Local playground at `http://localhost:5173`                |
| `npm run storybook`      | Storybook (component docs/dev) at `:6006`                  |
| `npm run build-storybook`| Generates the static Storybook in `storybook-static/`      |
| `npm test`               | Runs the tests (Vitest, once)                              |
| `npm run test:watch`     | Vitest in watch mode                                       |
| `npm run coverage`       | Tests with a coverage report                               |
| `npm run typecheck`      | Type checking (`tsc --noEmit`)                             |
| `npm run check`          | Biome: lint + formatting + imports (check only)            |
| `npm run check:fix`      | Biome: applies the safe fixes                              |
| `npm run lint`           | Biome: linter only                                         |
| `npm run format`         | Biome: formats the files                                   |
| `npm run build`          | Generates `dist/` (the library)                            |

### Code quality (Biome)

Linting, formatting and import organization are handled by
[Biome](https://biomejs.dev) (`biome.json`). See
[ADR 0007](./adr/0007-biome-lint-format.md).

```bash
npm run check       # checks everything
npm run check:fix   # fixes what is safe
```

### VS Code

The project already comes with `.vscode/` configured:

- **`settings.json`** — Biome as the default formatter, **format and organize
  imports on save**, and Tailwind IntelliSense inside `cva`/`cn`.
- **`extensions.json`** — recommended extensions (Biome, Tailwind CSS
  IntelliSense, Vitest Explorer). VS Code suggests installing them when you open the project.
- **`tasks.json`** — development tasks. Run **Run Task → “dev: all”**
  to bring up the playground + Storybook + tests in watch mode all at once.

### Project structure

```
src/
├── index.ts                    # public entrypoint (what is exported)
├── styles.css                  # design system tokens + Tailwind
├── lib/
│   └── utils.ts                # cn()
├── components/
│   └── ui/                     # components (shadcn/ui)
│       ├── button.tsx
│       ├── button.stories.tsx  # documentation (Storybook)
│       └── button.test.tsx     # tests (Vitest)
└── test/
    └── setup.ts                # global test setup
dev/                            # local playground (not shipped in dist)
.storybook/                     # Storybook configuration
.vscode/                        # development settings, extensions and tasks
docs/                           # this documentation + ADRs
biome.json                      # lint + formatting + imports
```

### Adding a component

`components.json` is already configured for Tailwind v4 and the `new-york` style.

```bash
npx shadcn@latest add <component>
```

Then:

1. Export it in `src/index.ts`.
2. Create a `*.stories.tsx` next to it.
3. Create a `*.test.tsx` covering the main behavior.

See [ADR 0004](./adr/0004-shadcn-ui-as-base.md) on why we copy the
components instead of depending on the package.

---

## Architecture decisions

All relevant decisions are recorded in [docs/adr](./adr/).
