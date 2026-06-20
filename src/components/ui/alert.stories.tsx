import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AlertCircle,
  CheckCircle2,
  Info as InfoIcon,
  Rocket,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { expect, within } from 'storybook/test'

import { Alert, AlertDescription, AlertTitle } from './alert'

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  // Without `autodocs`: the docs page is the custom MDX (alert.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Contextual feedback banner. Compose with `AlertTitle` and `AlertDescription`; an optional ' +
          'leading icon (any `lucide-react` icon as a direct child) is laid out automatically via the ' +
          'CSS grid. Variants: `default` (neutral), `destructive` (error), and the soft semantic styles ' +
          '`success`, `warning`, `info` and `accent` (brand) — tinted background with a colored icon, ' +
          'keeping body text at AA contrast in both light and dark themes. Renders with `role="alert"`.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning', 'info', 'accent'],
      description:
        'Neutral, destructive (error) or one of the soft semantic styles (success, warning, info, accent).',
      table: { defaultValue: { summary: 'default' } },
    },
    children: {
      control: false,
      description:
        'Composed content — typically an icon, `AlertTitle` and `AlertDescription`.',
    },
  },
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — one per variant / composition.
 * Each one is render-tested (mounts without error) and passes axe automatically.
 * -------------------------------------------------------------------------- */

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

export const Success: Story = {
  args: { variant: 'success' },
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <CheckCircle2 />
      <AlertTitle>Changes saved</AlertTitle>
      <AlertDescription>Your settings were updated successfully.</AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  args: { variant: 'warning' },
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <TriangleAlert />
      <AlertTitle>Storage almost full</AlertTitle>
      <AlertDescription>
        You are using 92% of your quota. Consider upgrading your plan.
      </AlertDescription>
    </Alert>
  ),
}

export const Info: Story = {
  args: { variant: 'info' },
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <InfoIcon />
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription>
        The dashboard will be briefly unavailable on Sunday at 2 AM UTC.
      </AlertDescription>
    </Alert>
  ),
}

export const Accent: Story = {
  args: { variant: 'accent' },
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <Sparkles />
      <AlertTitle>New feature available</AlertTitle>
      <AlertDescription>
        Try the redesigned analytics report, now in beta.
      </AlertDescription>
    </Alert>
  ),
}

/** Title-only — the description is optional; the grid stays aligned. */
export const TitleOnly: Story = {
  args: { variant: 'info' },
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <InfoIcon />
      <AlertTitle>Sync complete</AlertTitle>
    </Alert>
  ),
}

/** Without an icon the leading column collapses to zero width. */
export const NoIcon: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <AlertTitle>Plain banner</AlertTitle>
      <AlertDescription>No leading icon — text aligns to the edge.</AlertDescription>
    </Alert>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction / behavior tests — play functions that ARE the regression tests.
 * Alert is static (no callbacks): we cover structure, role and composition.
 * -------------------------------------------------------------------------- */

/** Exposes `role="alert"` so assistive tech announces it on render. */
export const HasAlertRole: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <Rocket />
      <AlertTitle>Deploy scheduled</AlertTitle>
      <AlertDescription>Going live soon.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByRole('alert')
    await expect(alert).toBeVisible()
    // The title and description make up the accessible name announced by the alert role.
    await expect(alert).toHaveTextContent('Deploy scheduled')
    await expect(alert).toHaveTextContent('Going live soon.')
  },
}

/** Every variant stacked, so visual diffs catch any token regression. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Alert>
        <Rocket />
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>Neutral informational banner.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle2 />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Operation completed.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Proceed with caution.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <InfoIcon />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Just so you know.</AlertDescription>
      </Alert>
      <Alert variant="accent">
        <Sparkles />
        <AlertTitle>Accent</AlertTitle>
        <AlertDescription>Highlight something on-brand.</AlertDescription>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Every variant must render with role="alert" and expose its title.
    const alerts = canvas.getAllByRole('alert')
    await expect(alerts).toHaveLength(6)
    await expect(canvas.getByText('Success')).toBeVisible()
    await expect(canvas.getByText('Warning')).toBeVisible()
    await expect(canvas.getByText('Info')).toBeVisible()
    await expect(canvas.getByText('Accent')).toBeVisible()
  },
}
