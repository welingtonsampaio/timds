/**
 * Shared building blocks for the design system documentation.
 * These helpers are Storybook-only and are not exported by the library.
 */
import type { ReactNode } from 'react'

export type ColorToken = {
  /** CSS variable name without the leading `--`. */
  name: string
  /** Short human description. */
  description?: string
  /** Optional companion `*-foreground` token used to preview text on top. */
  foreground?: string
}

export type ColorGroup = {
  title: string
  description: string
  tokens: ColorToken[]
}

/** All semantic color tokens grouped the same way they live in `styles.css`. */
export const COLOR_GROUPS: ColorGroup[] = [
  {
    title: 'Base',
    description: 'Page background and default text color.',
    tokens: [
      { name: 'background', foreground: 'foreground', description: 'App canvas' },
      { name: 'foreground', description: 'Default text' },
    ],
  },
  {
    title: 'Surfaces',
    description: 'Raised containers: cards, popovers, dropdowns and tooltips.',
    tokens: [
      { name: 'card', foreground: 'card-foreground', description: 'Card surface' },
      {
        name: 'popover',
        foreground: 'popover-foreground',
        description: 'Floating surface',
      },
    ],
  },
  {
    title: 'Brand & actions',
    description: 'Primary violet plus the neutral support roles.',
    tokens: [
      {
        name: 'primary',
        foreground: 'primary-foreground',
        description: 'Brand / main CTA',
      },
      {
        name: 'secondary',
        foreground: 'secondary-foreground',
        description: 'Subtle action',
      },
      { name: 'muted', foreground: 'muted-foreground', description: 'Muted background' },
      {
        name: 'accent',
        foreground: 'accent-foreground',
        description: 'Hover / highlight',
      },
    ],
  },
  {
    title: 'Feedback',
    description:
      'Status colors. `destructive` ships with shadcn; the rest are custom tokens.',
    tokens: [
      {
        name: 'destructive',
        foreground: 'destructive-foreground',
        description: 'Errors / danger',
      },
      { name: 'success', foreground: 'success-foreground', description: 'Success' },
      { name: 'warning', foreground: 'warning-foreground', description: 'Warning' },
      { name: 'info', foreground: 'info-foreground', description: 'Information' },
    ],
  },
  {
    title: 'Borders & rings',
    description: 'Separators, input outlines and focus rings.',
    tokens: [
      { name: 'border', description: 'Default border' },
      { name: 'input', description: 'Input border' },
      { name: 'ring', description: 'Focus ring' },
    ],
  },
  {
    title: 'Charts',
    description: 'Distinct data-visualization hues: violet → cyan → blue → pink → green.',
    tokens: [
      { name: 'chart-1', description: 'Violet' },
      { name: 'chart-2', description: 'Cyan' },
      { name: 'chart-3', description: 'Blue' },
      { name: 'chart-4', description: 'Pink' },
      { name: 'chart-5', description: 'Green' },
    ],
  },
  {
    title: 'Sidebar',
    description: 'Dedicated tokens so the navigation rail can diverge from the page.',
    tokens: [
      {
        name: 'sidebar',
        foreground: 'sidebar-foreground',
        description: 'Sidebar surface',
      },
      {
        name: 'sidebar-primary',
        foreground: 'sidebar-primary-foreground',
        description: 'Active item',
      },
      {
        name: 'sidebar-accent',
        foreground: 'sidebar-accent-foreground',
        description: 'Hover item',
      },
      { name: 'sidebar-border', description: 'Sidebar border' },
    ],
  },
]

/** A single color chip showing the swatch, name and resolved value. */
export function Swatch({ token }: { token: ColorToken }) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        className="flex h-20 items-end justify-end rounded-lg border border-border p-2 shadow-sm"
        style={{ background: `var(--${token.name})` }}
      >
        {token.foreground ? (
          <span
            className="rounded px-1.5 py-0.5 text-xs font-medium"
            style={{ color: `var(--${token.foreground})` }}
          >
            Aa
          </span>
        ) : null}
      </div>
      <figcaption className="flex flex-col gap-0.5">
        <code className="text-xs font-semibold text-foreground">--{token.name}</code>
        {token.description ? (
          <span className="text-xs text-muted-foreground">{token.description}</span>
        ) : null}
      </figcaption>
    </figure>
  )
}

/** Renders one titled group of swatches in a responsive grid. */
export function SwatchGroup({ group }: { group: ColorGroup }) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h3 className="m-0 text-base font-semibold text-foreground">{group.title}</h3>
        <p className="m-0 max-w-2xl text-sm text-muted-foreground">{group.description}</p>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {group.tokens.map((token) => (
          <Swatch key={token.name} token={token} />
        ))}
      </div>
    </section>
  )
}

/** Generic labelled row used by the spacing / radius / shadow specimens. */
export function SpecimenRow({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <code className="w-24 shrink-0 text-xs font-semibold text-foreground">{label}</code>
      <code className="w-28 shrink-0 text-xs text-muted-foreground">{value}</code>
      <div className="flex-1">{children}</div>
    </div>
  )
}
