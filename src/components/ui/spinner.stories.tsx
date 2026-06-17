import type { Meta, StoryObj } from '@storybook/react-vite'

import { Spinner } from './spinner'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Loading indicator built on the lucide `Loader2` icon with `animate-spin`. ' +
          'Inherits `currentColor` and sizes from its context, so it adapts when placed ' +
          'inside a `Button` (`loading` prop). Override size/color via `className`. ' +
          'Exposes `role="status"` for assistive technologies.',
      },
    },
  },
} satisfies Meta<typeof Spinner>

export default meta

type Story = StoryObj<typeof meta>

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
