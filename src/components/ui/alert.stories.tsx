import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircle, Rocket } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from './alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Contextual feedback banner. Compose with `AlertTitle` and `AlertDescription`; an optional ' +
          'leading icon (any `lucide-react` icon as a direct child) is laid out automatically via the ' +
          'CSS grid. Two variants: `default` (neutral) and `destructive` (error).',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Neutral informational style or destructive (error) style.',
      table: { defaultValue: { summary: 'default' } },
    },
  },
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — switch the `variant` from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <Rocket />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Use the Controls panel to switch the variant.</AlertDescription>
    </Alert>
  ),
}

export const Default: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <Rocket />
      <AlertTitle>Deploy scheduled</AlertTitle>
      <AlertDescription>
        Your changes go live in the next release window.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <AlertCircle />
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>
        We could not process your last invoice. Try again.
      </AlertDescription>
    </Alert>
  ),
}
