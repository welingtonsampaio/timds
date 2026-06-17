import type { Meta, StoryObj } from '@storybook/react-vite'

import { COLOR_GROUPS, SwatchGroup } from './tokens'

/**
 * Color tokens are defined as CSS variables in `src/styles.css` and exposed to
 * Tailwind through `@theme inline`. Toggle the **Theme** toolbar to compare the
 * light and dark palettes — every swatch reads straight from the live variable.
 */
const meta = {
  title: 'Design System/Colors',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Palette: Story = {
  render: () => (
    <div className="flex flex-col gap-10 p-6">
      {COLOR_GROUPS.map((group) => (
        <SwatchGroup key={group.title} group={group} />
      ))}
    </div>
  ),
}
