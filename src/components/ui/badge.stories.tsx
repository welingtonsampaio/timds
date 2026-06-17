import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckCircle2 } from 'lucide-react'

import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Compact pill for labels, counts and status. Six variants share a rounded-full shape. ' +
          'For semantic states (success / warning / info) pass the matching token classes, e.g. ' +
          '`className="bg-success text-success-foreground"`. Use `asChild` to turn it into a link.',
      },
    },
  },
  args: { children: 'Badge' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual style of the badge.',
      table: { defaultValue: { summary: 'default' } },
    },
    children: { control: 'text', description: 'Badge content.' },
    asChild: {
      control: false,
      description: 'Render onto the child element (e.g. an `<a>`).',
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** Every built-in variant. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </div>
  ),
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <CheckCircle2 />
        Completed
      </>
    ),
  },
}

/** Semantic status badges built from the custom feedback tokens. */
export const Status: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-success text-success-foreground">Completed</Badge>
      <Badge className="bg-warning text-warning-foreground">Pending</Badge>
      <Badge className="bg-info text-info-foreground">In review</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  ),
}
