import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingUp } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Badge } from './badge'
import { Button } from './button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

const meta = {
  title: 'Layout/Card',
  component: Card,
  // Sem `autodocs`: a página de docs é a MDX customizada (card.mdx), que embute
  // estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Surface container composed from slot parts: `CardHeader`, `CardTitle`, ' +
          '`CardDescription`, `CardAction` (top-right slot), `CardContent` and `CardFooter`. ' +
          'The header is a grid, so `CardAction` automatically docks to the right of the title. ' +
          'Ideal for KPIs, forms and panels.',
      },
    },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

type PlaygroundArgs = {
  title: string
  description: string
  value: string
  footer: string
}

/* --------------------------------------------------------------------------
 * Render stories — composições do Card.
 * Cada uma monta sem erro e passa pelo axe automaticamente.
 * -------------------------------------------------------------------------- */

/** Fully interactive — edit the card copy from the **Controls** panel. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    title: 'Total revenue',
    description: 'Last 30 days',
    value: '$125,830',
    footer: 'View report',
  },
  argTypes: {
    title: { control: 'text', description: 'CardTitle text.' },
    description: { control: 'text', description: 'CardDescription text.' },
    value: { control: 'text', description: 'Main metric shown in CardContent.' },
    footer: { control: 'text', description: 'Footer button label.' },
  },
  render: ({ title, description, value, footer }) => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Badge className="bg-success text-success-foreground">
            <TrendingUp />
            9.8%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {footer}
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Total revenue</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
        <CardAction>
          <Badge className="bg-success text-success-foreground">
            <TrendingUp />
            9.8%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">$125,830</p>
        <p className="text-sm text-muted-foreground">+$11,204 vs. previous period</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View report
        </Button>
      </CardFooter>
    </Card>
  ),
}

/** Minimal card — only header (title + description) and content. */
export const TitleOnly: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Open the inbox to review them.</p>
      </CardContent>
    </Card>
  ),
}

/** The header docks `CardAction` to the top-right of the title. */
export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Project Apollo</CardTitle>
        <CardDescription>Sprint 14</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">12 of 20 tasks completed.</p>
      </CardContent>
    </Card>
  ),
}

/** KPI cards laid out in a responsive grid. */
export const KpiGrid: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Total Revenue', value: '$125,830', delta: '+12.4%' },
        { label: 'New Customers', value: '3,482', delta: '+5.1%' },
        { label: 'Sales Growth', value: '9.8%', delta: '+0.6%' },
        { label: 'Avg. Order Value', value: '$210', delta: '+2.3%' },
      ].map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader>
            <CardDescription>{kpi.label}</CardDescription>
            <CardTitle className="text-2xl">{kpi.value}</CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-success">
                {kpi.delta}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Card é composição (sem callbacks próprios): asseguramos que cada slot
 * renderiza, que o CardAction marca o header como tendo ação, e que controles
 * dentro do footer/action seguem interativos. Sempre `await` em userEvent/expect.
 * -------------------------------------------------------------------------- */

/** Cada parte composta renderiza com seu `data-slot`. */
export const RendersAllSlots: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Total revenue</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <p>$125,830</p>
      </CardContent>
      <CardFooter>Footer</CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Os data-slots são hooks de estrutura; aqui validamos a composição completa.
    const card = canvas.getByText('Total revenue').closest('[data-slot="card"]')
    await expect(card).toBeInTheDocument()
    await expect(canvas.getByText('Total revenue')).toBeInTheDocument()
    await expect(canvas.getByText('Last 30 days')).toBeInTheDocument()
    await expect(canvas.getByText('$125,830')).toBeInTheDocument()
    await expect(canvas.getByText('Footer')).toBeInTheDocument()
  },
}

/** O `CardAction` marca o header (selector `has-data-[slot=card-action]`). */
export const ActionDocksInHeader: Story = {
  render: () => (
    // Header sem `CardDescription`: colapsamos o grid para uma única linha
    // (`grid-rows-[auto]`) — senão a 2ª linha vazia some, mas o `gap-2` sobra
    // como espaço extra embaixo. Título e ação ficam centralizados na linha.
    <Card className="w-80">
      <CardHeader data-testid="header" className="grid-rows-[auto] items-center">
        <CardTitle>Project Apollo</CardTitle>
        <CardAction className="row-span-1 self-center">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const header = canvas.getByTestId('header')
    // O header contém um filho com data-slot=card-action: é o gancho que o
    // CSS usa para ativar o grid de duas colunas.
    await expect(header.querySelector('[data-slot="card-action"]')).toBeInTheDocument()
  },
}

// Spy dedicado ao botão do footer: `args.onClick` do Card é tipado para `div`,
// incompatível com o handler de `button`.
const handleViewReport = fn()

/** Controles dentro do Card (footer/action) permanecem interativos. */
export const FooterButtonClicks: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Total revenue</CardTitle>
      </CardHeader>
      <CardFooter>
        <Button onClick={handleViewReport}>View report</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    handleViewReport.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'View report' }))
    await expect(handleViewReport).toHaveBeenCalledOnce()
  },
}
