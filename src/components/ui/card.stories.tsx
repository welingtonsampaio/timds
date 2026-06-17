import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingUp } from 'lucide-react'

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
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Surface container composed from slot parts: `CardHeader`, `CardTitle`, `CardDescription`, ' +
          '`CardAction` (top-right slot), `CardContent` and `CardFooter`. The header is a grid, so ' +
          '`CardAction` automatically docks to the right of the title. Ideal for KPIs, forms and panels.',
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
