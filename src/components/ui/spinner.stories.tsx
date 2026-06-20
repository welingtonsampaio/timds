import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { Spinner } from './spinner'

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  // No `autodocs`: the docs page is the custom MDX (spinner.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'Loading indicator built on the lucide `Loader2` icon with `animate-spin`. ' +
          'Inherits `currentColor` and sizes from its context, so it adapts when placed ' +
          'inside a `Button` (`loading` prop). Override size/color via `className`. ' +
          'Exposes `role="status"` with an `aria-label` for assistive technologies.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Tailwind classes to override size (`size-*`) and color.',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible name announced by screen readers. Defaults to `Loading`.',
      table: { defaultValue: { summary: 'Loading' } },
    },
  },
} satisfies Meta<typeof Spinner>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — render-tested (mount without error) and checked by axe.
 * -------------------------------------------------------------------------- */

/** Fully interactive — tweak `className` and `aria-label` from **Controls**. */
export const Playground: Story = {}

export const Default: Story = {}

/** Adjust size and color through `className`. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-primary">
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  ),
}

/** A custom `aria-label` overrides the default announced name. */
export const CustomLabel: Story = {
  args: { 'aria-label': 'Saving changes' },
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions that ARE the regression tests.
 * Spinner has no callbacks; we cover the accessibility contract (role/label).
 * -------------------------------------------------------------------------- */

/** Exposes `role="status"` with the default accessible name. */
export const ExposesStatusRole: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The status announces the loading state to assistive technologies.
    const status = canvas.getByRole('status')
    await expect(status).toBeInTheDocument()
    await expect(status).toHaveAttribute('aria-label', 'Loading')
  },
}

/** A custom `aria-label` is reflected on the status node. */
export const CustomLabelIsAnnounced: Story = {
  args: { 'aria-label': 'Saving changes' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('status', { name: 'Saving changes' })).toBeVisible()
  },
}
