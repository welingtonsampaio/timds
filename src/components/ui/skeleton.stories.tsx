import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { Skeleton } from './skeleton'

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  // Sem `autodocs`: a página de docs é a MDX customizada (skeleton.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Loading placeholder: a pulsing block that reserves space while content loads. ' +
          'Size and shape come entirely from `className` (e.g. `size-10 rounded-full` for an ' +
          'avatar, `h-4 w-32` for a line of text). Purely decorative — keep it out of the ' +
          'accessibility tree and announce loading elsewhere (e.g. an `aria-busy` region).',
      },
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

/** A single line of text loading. */
export const Default: Story = {
  args: { className: 'h-4 w-48' },
}

/** Shape and size are driven by `className` only. */
export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  ),
}

/** A common card placeholder: media block above two text lines. */
export const Card: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction test — Skeleton é não-interativo; validamos apenas que monta e
 * carrega o data-slot de estilo (hook de estrutura, não de teste).
 * -------------------------------------------------------------------------- */

/** Renders a decorative placeholder element. */
export const RendersPlaceholder: Story = {
  args: { className: 'h-4 w-48' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const skeleton = canvas.getByTestId('skeleton-probe')
    await expect(skeleton).toBeInTheDocument()
    await expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
  },
  // `data-testid` aqui é o único handle: o Skeleton não expõe role nem texto
  // (é decorativo), então não há query semântica possível.
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  render: (args) => <Skeleton {...args} data-testid="skeleton-probe" />,
}
