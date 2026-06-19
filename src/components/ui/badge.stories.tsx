import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckCircle2 } from 'lucide-react'
import { expect, userEvent, within } from 'storybook/test'

import { Badge } from './badge'

const meta = {
  title: 'Data Display/Badge',
  component: Badge,
  // Sem `autodocs`: a página de docs é a MDX customizada (badge.mdx), que embute
  // estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Compact pill for labels, counts and status. Semantic states (`success` / `warning` / ' +
          '`info`) and the decorative chart palette (`chart-1`…`chart-5`) ship as first-class, ' +
          'soft/tonal variants with AA contrast in both themes. Three `size`s (`sm` / `md` / `lg`) ' +
          'are available. Use `asChild` to render the styling onto a child element (e.g. an `<a>`).',
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
      description: 'Render the styling onto the child element (e.g. an `<a>`).',
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — uma por variante / estado visual.
 * Cada uma monta sem erro e passa pelo axe automaticamente.
 * -------------------------------------------------------------------------- */

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

/** A leading icon reinforces the label. */
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

/** With `asChild`, the badge styling is applied to a real link. */
export const AsLink: Story = {
  args: {
    asChild: true,
    children: <a href="#filters">Filters</a>,
  },
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Badge é um `<span>` decorativo: sem role próprio. Quando vira link via
 * `asChild`, é navegável e clicável. Sempre `await` em userEvent/expect.
 * -------------------------------------------------------------------------- */

/** Renders the content and carries the variant/size data-attributes. */
export const RendersContent: Story = {
  args: { variant: 'success', size: 'lg', children: 'Active' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByText('Active')
    await expect(badge).toBeInTheDocument()
    // data-attributes refletem variant/size (hooks de estrutura, não de teste).
    await expect(badge).toHaveAttribute('data-slot', 'badge')
    await expect(badge).toHaveAttribute('data-variant', 'success')
    await expect(badge).toHaveAttribute('data-size', 'lg')
  },
}

/** `asChild` renders the badge styling onto a real link (role `link` + href). */
export const AsLinkIsNavigable: Story = {
  args: {
    asChild: true,
    children: <a href="#filters">Filters</a>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Com asChild o elemento renderizado é um <a>, exposto com role `link`.
    // Não clicamos: a navegação real do <a> fecharia a página do browser de teste;
    // basta validar que o link carrega o href e o data-slot herdado do Badge.
    const link = canvas.getByRole('link', { name: 'Filters' })
    await expect(link).toHaveAttribute('href', '#filters')
    await expect(link).toHaveAttribute('data-slot', 'badge')
  },
}

/** As a link, the badge is reachable by keyboard. */
export const AsLinkFocusesWithKeyboard: Story = {
  args: {
    asChild: true,
    children: <a href="#filters">Filters</a>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Filters' })).toHaveFocus()
  },
}
