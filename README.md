# timds

React component library with a **built-in design system**, built on top of
[shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com).

It can be installed **directly from GitHub**, with no need for an npm registry.

📖 Full documentation in [`docs/`](./docs/getting-started.md) · architecture
decisions in [`docs/adr/`](./docs/adr/).

## Installation (directly from GitHub)

```bash
npm install github:<org>/timds
# or a specific branch/tag/commit:
npm install github:<org>/timds#v0.0.1
```

> When installing from GitHub, the `prepare` script builds `dist/` automatically
> (generating the JS, the `.d.ts` types and the design system CSS). There is no
> need to publish anything to a registry.

### peer dependencies

The consumer needs to have `react` and `react-dom` (>=18) installed.

## Usage

```tsx
import { Button } from 'timds'
// Import the design system CSS once (e.g., in the app entrypoint):
import 'timds/styles.css'

export function Example() {
  return <Button variant="outline">Hello</Button>
}
```

The `timds/styles.css` file already ships with all the tokens (colors, radius,
dark mode) and the Tailwind utilities used by the components — there is no need
to configure Tailwind in the consumer project.

### Dark mode

The dark theme is enabled by adding the `dark` class to an ancestor (e.g., `<html class="dark">`).

## Development

```bash
npm install        # installs dependencies (and runs the build via prepare)
npm run dev        # playground at http://localhost:5173
npm run build      # generates dist/
npm run typecheck  # type checking
```

### Structure

```
src/
├── index.ts              # public entrypoint (exports)
├── styles.css            # design system tokens + Tailwind
├── lib/
│   └── utils.ts          # cn()
└── components/
    └── ui/               # components (shadcn/ui)
        └── button.tsx
dev/                      # local playground (not shipped in dist)
```

### Adding shadcn/ui components

The project already has `components.json` configured for Tailwind v4. To add a
new component:

```bash
npx shadcn@latest add <component>
```

Then export it in `src/index.ts`.
