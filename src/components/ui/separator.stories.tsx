import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { Separator } from './separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Thin visual divider between content, built on Radix Separator. Lay it out ' +
          '`horizontal` or `vertical`. It is `decorative` by default (hidden from the ' +
          'accessibility tree); set `decorative={false}` to expose the `separator` role ' +
          'and its `aria-orientation`.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Direction the divider runs in.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    decorative: {
      control: 'boolean',
      description:
        'When true (default) the separator is purely visual and hidden from assistive tech.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  args: { orientation: 'horizontal', decorative: true },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak `orientation` and `decorative` from **Controls**. */
export const Playground: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2 w-64">
      <p className="text-sm text-muted-foreground">Above</p>
      <Separator {...args} className="my-3" />
      <p className="text-sm text-muted-foreground">Below</p>
    </div>
  ),
}

/** The default: a full-width horizontal rule. */
export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <h4 className="text-sm font-medium">Section title</h4>
      <Separator className="my-3" />
      <p className="text-sm text-muted-foreground">Section content.</p>
    </div>
  ),
}

/** Vertical divider — needs a sized container to stretch within. */
export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3 text-sm">
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
    </div>
  ),
}

/** Canonical showcase: a horizontal rule plus an inline nav of vertical dividers. */
export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Timds</h4>
        <p className="text-sm text-muted-foreground">
          A React component library with a built-in design system.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Blog</span>
        <Separator orientation="vertical" />
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  ),
}

/** Non-decorative separators expose the `separator` role to assistive tech. */
export const Semantic: Story = {
  args: { decorative: false },
  render: (args) => (
    <div className="w-64">
      <p className="text-sm text-muted-foreground">Group A</p>
      <Separator {...args} className="my-3" />
      <p className="text-sm text-muted-foreground">Group B</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Sem `decorative`, o divisor passa a expor o papel `separator`.
    await expect(canvas.getByRole('separator')).toBeInTheDocument()
  },
}
