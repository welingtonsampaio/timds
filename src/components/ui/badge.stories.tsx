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
          'Compact pill for labels, counts and status. Semantic states (`success` / `warning` / ' +
          '`info`) and the decorative chart palette (`chart-1`…`chart-5`) ship as first-class, ' +
          'soft/tonal variants with AA contrast in both themes. Three `size`s (`sm` / `md` / `lg`) ' +
          'are available. Use `asChild` to turn it into a link.',
      },
    },
  },
  args: { children: 'Badge' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'success',
        'warning',
        'info',
        'chart-1',
        'chart-2',
        'chart-3',
        'chart-4',
        'chart-5',
        'outline',
        'ghost',
        'link',
      ],
      description: 'Visual style of the badge.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Padding and font size of the badge.',
      table: { defaultValue: { summary: 'md' } },
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
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
}

/** Decorative palette for categorization, built on the chart tokens. */
export const ChartColors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="chart-1">Violet</Badge>
      <Badge variant="chart-2">Cyan</Badge>
      <Badge variant="chart-3">Blue</Badge>
      <Badge variant="chart-4">Pink</Badge>
      <Badge variant="chart-5">Green</Badge>
    </div>
  ),
}

/** Three sizes share the same pill shape. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
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
      <Badge variant="success">Completed</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="info">In review</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  ),
}
